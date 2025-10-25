from fastapi import APIRouter, HTTPException, status, Query
from app.models.suggestion_model import (
    SuggestedTrip,
    SuggestionsResponse,
    CreateSuggestionRequest,
    SuggestedTripDB
)
from app.services.ai_service import ai_service
from app.db import get_database
from app.config import settings
from typing import List, Optional
import logging
from datetime import datetime
from bson import ObjectId

logger = logging.getLogger(__name__)
router = APIRouter()


def normalize_suggestion_data(suggestion: dict) -> dict:
    """
    Normalize suggestion data to match Pydantic model expectations.
    Converts string fields to arrays where needed.
    """
    # Fields that should be arrays
    array_fields = ['category', 'highlights', 'best_months', 'popular_activities', 'travel_tips']
    
    for field in array_fields:
        if field in suggestion:
            value = suggestion[field]
            
            # Convert string to array
            if isinstance(value, str):
                if ',' in value:
                    # Split comma-separated string
                    suggestion[field] = [item.strip() for item in value.split(',') if item.strip()]
                else:
                    # Single value string -> array with one item
                    suggestion[field] = [value.strip()] if value.strip() else []
            
            # Ensure it's a list
            elif not isinstance(value, list):
                suggestion[field] = []
    
    # Ensure required list fields exist
    for field in array_fields:
        if field not in suggestion:
            suggestion[field] = []
    
    return suggestion


@router.get("/", response_model=SuggestionsResponse)
async def get_suggestions(
    category: Optional[str] = Query(None, description="Filter by category (adventure, culture, beach, etc.)"),
    budget: Optional[str] = Query(None, description="Filter by budget (budget, moderate, luxury)"),
    duration_min: Optional[int] = Query(None, description="Minimum duration in days"),
    duration_max: Optional[int] = Query(None, description="Maximum duration in days"),
    continent: Optional[str] = Query(None, description="Filter by continent"),
    featured: bool = Query(False, description="Get only featured suggestions"),
    limit: int = Query(10, ge=1, le=50, description="Results per page"),
    skip: int = Query(0, ge=0, description="Number of results to skip"),
    suggestion_id: Optional[str] = Query(None, description="Get specific suggestion by ID")
):
    """
    🎯 ROUTE 1: Get travel suggestions (pre-curated or AI-generated)
    
    Display travel suggestions with brief details:
    - Destination name
    - Key highlights
    - Best time to visit
    - Duration, budget, activities
    
    Features:
    - Filter by category, budget, continent, duration
    - Get featured/top-rated suggestions
    - Get specific suggestion by ID
    - Auto-generates AI suggestions if database is empty
    """
    try:
        db = get_database()
        
        # If specific ID requested, return that suggestion
        if suggestion_id:
            if not ObjectId.is_valid(suggestion_id):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid suggestion ID format"
                )
            
            suggestion = await db[settings.SUGGESTIONS_COLLECTION].find_one(
                {"_id": ObjectId(suggestion_id)}
            )
            
            if not suggestion:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Suggestion not found"
                )
            
            # Normalize data before returning
            suggestion = normalize_suggestion_data(suggestion)
            suggestion['_id'] = str(suggestion['_id'])
            
            return SuggestionsResponse(
                total=1,
                suggestions=[SuggestedTrip(**suggestion)],
                filters_applied={"_id": suggestion_id}
            )
        
        # Build query filter
        query = {}
        has_filters = False
        
        if featured:
            query["is_featured"] = True
            has_filters = True
        
        if category:
            query["category"] = {"$in": [category.lower()]}
            has_filters = True
        
        if budget:
            query["budget"] = budget.lower()
            has_filters = True
        
        if continent:
            query["continent"] = continent
            has_filters = True
        
        if duration_min is not None or duration_max is not None:
            duration_query = {}
            if duration_min is not None:
                duration_query["$gte"] = duration_min
            if duration_max is not None:
                duration_query["$lte"] = duration_max
            query["duration_days"] = duration_query
            has_filters = True
        
        effective_limit = min(limit, 10) if has_filters else limit
        
        # Auto-generate if database is empty
        total_in_db = await db[settings.SUGGESTIONS_COLLECTION].count_documents({})
        if total_in_db == 0:
            logger.info("🤖 Database empty, generating initial AI suggestions...")
            try:
                ai_suggestions = await ai_service.generate_suggestions(count=12)
                
                for i, suggestion in enumerate(ai_suggestions):
                    suggestion['created_at'] = datetime.utcnow()
                    suggestion['updated_at'] = datetime.utcnow()
                    suggestion['is_featured'] = i < 6
                
                if ai_suggestions:
                    await db[settings.SUGGESTIONS_COLLECTION].insert_many(ai_suggestions)
                    logger.info(f"✅ Seeded {len(ai_suggestions)} initial suggestions")
            except Exception as e:
                logger.error(f"❌ Failed to generate initial suggestions: {e}")
        
        # Query with filters
        cursor = db[settings.SUGGESTIONS_COLLECTION].find(query).sort("rating", -1).skip(skip).limit(effective_limit)
        suggestions = await cursor.to_list(length=effective_limit)
        total = await db[settings.SUGGESTIONS_COLLECTION].count_documents(query)
        
        # Generate AI suggestions if no matches for filters
        if total == 0 and has_filters and not suggestion_id:
            logger.info(f"🤖 No matches for filters, generating AI suggestions...")
            try:
                ai_suggestions = await ai_service.generate_suggestions(
                    category=category,
                    budget=budget,
                    continent=continent,
                    count=min(effective_limit, 6)
                )
                
                for suggestion in ai_suggestions:
                    suggestion['created_at'] = datetime.utcnow()
                    suggestion['updated_at'] = datetime.utcnow()
                    suggestion['is_featured'] = False
                
                if ai_suggestions:
                    await db[settings.SUGGESTIONS_COLLECTION].insert_many(ai_suggestions)
                    logger.info(f"✅ Generated {len(ai_suggestions)} filtered suggestions")
                    
                    cursor = db[settings.SUGGESTIONS_COLLECTION].find(query).sort("rating", -1).limit(effective_limit)
                    suggestions = await cursor.to_list(length=effective_limit)
                    total = len(suggestions)
            except Exception as e:
                logger.error(f"❌ Failed to generate filtered suggestions: {e}")
        
        # Normalize all suggestions and convert to response models
        normalized_suggestions = []
        for s in suggestions:
            s = normalize_suggestion_data(s)
            s['_id'] = str(s['_id'])
            normalized_suggestions.append(s)
        
        result = [SuggestedTrip(**s) for s in normalized_suggestions]
        
        logger.info(f"📋 Retrieved {len(result)} suggestions (total: {total})")
        
        return SuggestionsResponse(
            total=total,
            suggestions=result,
            filters_applied=query
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error fetching suggestions: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/ai-generate", response_model=List[SuggestedTrip])
async def generate_ai_suggestions(
    category: Optional[str] = Query(None, description="Generate for specific category"),
    budget: Optional[str] = Query(None, description="Generate for specific budget"),
    continent: Optional[str] = Query(None, description="Generate for specific continent"),
    destination: Optional[str] = Query(None, description="Generate for specific destination"),
    count: int = Query(6, ge=1, le=10, description="Number of suggestions"),
    save_to_db: bool = Query(True, description="Save to database")
):
    """
    🎯 ROUTE 2: Generate NEW AI-powered travel suggestions
    
    Creates fresh, AI-generated travel suggestions:
    - Generate multiple suggestions with filters
    - Generate specific destination suggestion
    - Optionally save to database
    
    Each suggestion includes:
    - Destination and country
    - Key highlights
    - Best time to visit
    - Duration, budget, activities
    """
    try:
        logger.info(f"🤖 Generating AI suggestions")
        
        # Generate for specific destination
        if destination:
            logger.info(f"🤖 Generating AI suggestion for: {destination}")
            ai_suggestion = await ai_service.generate_single_suggestion(destination)
            
            if save_to_db:
                db = get_database()
                ai_suggestion['created_at'] = datetime.utcnow()
                ai_suggestion['updated_at'] = datetime.utcnow()
                ai_suggestion['is_featured'] = False
                
                result = await db[settings.SUGGESTIONS_COLLECTION].insert_one(ai_suggestion)
                ai_suggestion['_id'] = str(result.inserted_id)
                logger.info(f"💾 Saved AI suggestion for {destination}")
            else:
                ai_suggestion['_id'] = None
            
            ai_suggestion = normalize_suggestion_data(ai_suggestion)
            return [SuggestedTrip(**ai_suggestion)]
        
        # Generate multiple suggestions with filters
        ai_suggestions = await ai_service.generate_suggestions(
            category=category,
            budget=budget,
            continent=continent,
            count=count
        )
        
        if save_to_db:
            db = get_database()
            for suggestion in ai_suggestions:
                suggestion['created_at'] = datetime.utcnow()
                suggestion['updated_at'] = datetime.utcnow()
                suggestion['is_featured'] = False
            
            result = await db[settings.SUGGESTIONS_COLLECTION].insert_many(ai_suggestions)
            logger.info(f"💾 Saved {len(result.inserted_ids)} AI suggestions")
            
            for i, inserted_id in enumerate(result.inserted_ids):
                ai_suggestions[i]['_id'] = str(inserted_id)
        
        # Normalize all suggestions
        normalized = [normalize_suggestion_data(s) for s in ai_suggestions]
        result = [SuggestedTrip(**s) for s in normalized]
        
        logger.info(f"✅ Generated {len(result)} AI suggestions")
        return result
        
    except ValueError as e:
        logger.error(f"❌ Validation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"❌ Error generating AI suggestions: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/", response_model=SuggestedTrip, status_code=status.HTTP_201_CREATED)
async def create_or_update_suggestion(
    request: CreateSuggestionRequest,
    suggestion_id: Optional[str] = Query(None, description="Update existing suggestion")
):
    """
    🎯 ROUTE 3: Create new or update existing suggestion (Admin)
    
    If suggestion_id provided: Updates existing suggestion
    Otherwise: Creates new suggestion
    """
    try:
        db = get_database()
        
        # Update existing suggestion
        if suggestion_id:
            if not ObjectId.is_valid(suggestion_id):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid suggestion ID format"
                )
            
            update_data = request.model_dump()
            update_data['updated_at'] = datetime.utcnow()
            
            result = await db[settings.SUGGESTIONS_COLLECTION].update_one(
                {"_id": ObjectId(suggestion_id)},
                {"$set": update_data}
            )
            
            if result.matched_count == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Suggestion not found"
                )
            
            updated = await db[settings.SUGGESTIONS_COLLECTION].find_one(
                {"_id": ObjectId(suggestion_id)}
            )
            
            updated = normalize_suggestion_data(updated)
            updated['_id'] = str(updated['_id'])
            logger.info(f"✅ Suggestion updated: {suggestion_id}")
            
            return SuggestedTrip(**updated)
        
        # Create new suggestion
        suggestion_data = SuggestedTripDB(
            **request.model_dump(),
            is_featured=False,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        result = await db[settings.SUGGESTIONS_COLLECTION].insert_one(
            suggestion_data.model_dump()
        )
        
        created = await db[settings.SUGGESTIONS_COLLECTION].find_one(
            {"_id": result.inserted_id}
        )
        
        created = normalize_suggestion_data(created)
        created['_id'] = str(created['_id'])
        logger.info(f"✅ Suggestion created: {result.inserted_id}")
        
        return SuggestedTrip(**created)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error creating/updating suggestion: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.delete("/{suggestion_id}")
async def delete_suggestion(
    suggestion_id: str,
    clear_all: bool = Query(False, description="Clear all suggestions (Admin)")
):
    """
    🎯 ROUTE 4: Delete suggestion(s)
    
    If clear_all=True: Deletes all suggestions (Admin operation)
    Otherwise: Deletes specific suggestion by ID
    """
    try:
        db = get_database()
        
        # Clear all suggestions (Admin)
        if clear_all:
            result = await db[settings.SUGGESTIONS_COLLECTION].delete_many({})
            logger.info(f"🗑️ Cleared {result.deleted_count} suggestions")
            
            return {
                "message": "All suggestions cleared",
                "deleted_count": result.deleted_count
            }
        
        # Delete specific suggestion
        if not ObjectId.is_valid(suggestion_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid suggestion ID format"
            )
        
        result = await db[settings.SUGGESTIONS_COLLECTION].delete_one(
            {"_id": ObjectId(suggestion_id)}
        )
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Suggestion not found"
            )
        
        logger.info(f"🗑️ Deleted suggestion: {suggestion_id}")
        return {"message": "Suggestion deleted successfully", "id": suggestion_id}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error deleting suggestion: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/migrate")
async def migrate_database(
    operation: str = Query("string-to-array", description="Migration operation type")
):
    """
    🎯 ROUTE 5: Database maintenance and migrations
    
    Supported operations:
    - string-to-array: Convert string fields to arrays
    - seed-ai: Seed database with AI suggestions
    """
    try:
        db = get_database()
        
        if operation == "string-to-array":
            # Convert string fields to arrays
            cursor = db[settings.SUGGESTIONS_COLLECTION].find({})
            suggestions = await cursor.to_list(length=None)
            
            updated_count = 0
            
            for suggestion in suggestions:
                # Use the normalize function
                normalized = normalize_suggestion_data(suggestion.copy())
                
                # Check if any fields were changed
                needs_update = False
                updates = {}
                
                array_fields = ['category', 'highlights', 'best_months', 'popular_activities', 'travel_tips']
                for field in array_fields:
                    if field in normalized and field in suggestion:
                        if normalized[field] != suggestion[field]:
                            updates[field] = normalized[field]
                            needs_update = True
                
                if needs_update:
                    await db[settings.SUGGESTIONS_COLLECTION].update_one(
                        {"_id": suggestion['_id']},
                        {"$set": updates}
                    )
                    updated_count += 1
            
            logger.info(f"✅ Migration complete: Updated {updated_count} documents")
            
            return {
                "message": "Migration completed successfully",
                "operation": operation,
                "updated_count": updated_count,
                "total_documents": len(suggestions)
            }
        
        elif operation == "seed-ai":
            # Seed database with AI suggestions
            logger.info("🤖 Seeding database with AI suggestions...")
            
            ai_suggestions = await ai_service.generate_suggestions(count=10)
            
            for i, suggestion in enumerate(ai_suggestions):
                suggestion['created_at'] = datetime.utcnow()
                suggestion['updated_at'] = datetime.utcnow()
                suggestion['is_featured'] = i < 3
            
            result = await db[settings.SUGGESTIONS_COLLECTION].insert_many(ai_suggestions)
            
            logger.info(f"✅ Seeded {len(result.inserted_ids)} AI suggestions")
            
            return {
                "message": "Successfully seeded AI suggestions",
                "operation": operation,
                "count": len(result.inserted_ids)
            }
        
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unknown operation: {operation}"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error during migration: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )