from fastapi import APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse
from app.models.itinerary_model import (
    ItineraryRequest, 
    ItineraryResponse, 
    ItineraryDB,
    StreamChunk
)
from app.services.ai_service import ai_service
from app.services.weather_service import weather_service
from app.db import get_database
from app.config import settings
from app.utils.helpers import (
    extract_city_from_destination,
    calculate_estimated_cost,
    calculate_date_range,
    sanitize_destination_name
)
from typing import List
import logging
import json
from datetime import datetime
from bson import ObjectId

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/generate", response_model=ItineraryResponse, status_code=status.HTTP_201_CREATED)
async def generate_itinerary(request: ItineraryRequest):
    """
    🎯 ROUTE 1: Generate AI-powered travel itinerary
    
    Ask questions from user (destination, dates, interests) and automatically 
    generate a day-wise or activity-based travel plan using AI.
    
    Includes:
    - AI-generated itinerary content
    - Weather information for destination
    - Travel tips
    - Budget estimates
    """
    try:
        logger.info(f"📍 Generating itinerary for {request.destination}")
        
        destination = sanitize_destination_name(request.destination)
        
        # Generate itinerary using AI
        content = await ai_service.generate_itinerary(request)
        
        # Get weather information (OpenWeatherMap API integration)
        weather_info = None
        try:
            city = extract_city_from_destination(destination)
            weather_info = await weather_service.get_current_weather(city)
        except Exception as e:
            logger.warning(f"⚠️ Could not fetch weather: {e}")
        
        # Generate travel tips
        travel_tips = await ai_service.generate_travel_tips(destination)
        
        # Calculate estimated cost
        budget_estimate = calculate_estimated_cost(request.days, request.budget, request.travelers)
        
        # Save to database
        db = get_database()
        itinerary_data = ItineraryDB(
            destination=destination,
            days=request.days,
            interests=request.interests,
            budget=request.budget,
            travelers=request.travelers,
            content=content,
            weather_info=weather_info,
            travel_tips=travel_tips,
            budget_estimate=budget_estimate,
            user_preferences=request.additional_preferences
        )
        
        result = await db[settings.ITINERARY_COLLECTION].insert_one(
            itinerary_data.model_dump(exclude={'id'})
        )
        
        response = ItineraryResponse(
            _id=str(result.inserted_id),
            destination=destination,
            days=request.days,
            content=content,
            weather_info=weather_info,
            travel_tips=travel_tips,
            budget_estimate=budget_estimate,
            interests=request.interests,
            created_at=datetime.utcnow()
        )
        
        logger.info(f"✅ Itinerary created with ID: {result.inserted_id}")
        return response
        
    except Exception as e:
        logger.error(f"❌ Error generating itinerary: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate itinerary: {str(e)}"
        )


@router.post("/generate-stream")
async def generate_itinerary_stream(request: ItineraryRequest):
    """
    🎯 ROUTE 2: Generate itinerary with streaming (Chain of Thought)
    
    Returns Server-Sent Events (SSE) stream showing AI thinking process
    in real-time. Shows how AI is generating or refining itinerary ideas.
    """
    async def event_generator():
        try:
            logger.info(f"🌊 Streaming itinerary for {request.destination}")
            
            async for chunk in ai_service.generate_itinerary_stream(request):
                data = json.dumps(chunk.model_dump())
                yield f"data: {data}\n\n"
            
        except Exception as e:
            logger.error(f"❌ Streaming error: {e}")
            error_chunk = StreamChunk(
                type="error",
                content=str(e),
                metadata={"error": str(e)}
            )
            yield f"data: {json.dumps(error_chunk.model_dump())}\n\n"
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream"
    )


@router.get("/", response_model=List[ItineraryResponse])
async def get_itineraries(limit: int = 10, skip: int = 0, itinerary_id: str = None):
    """
    🎯 ROUTE 3: Get all itineraries or specific itinerary by ID
    
    If itinerary_id provided: Returns specific itinerary
    Otherwise: Returns all saved itineraries with pagination
    """
    try:
        db = get_database()
        
        # If ID provided, return specific itinerary
        if itinerary_id:
            if not ObjectId.is_valid(itinerary_id):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid itinerary ID format"
                )
            
            itinerary = await db[settings.ITINERARY_COLLECTION].find_one(
                {"_id": ObjectId(itinerary_id)}
            )
            
            if not itinerary:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Itinerary not found"
                )
            
            itinerary['_id'] = str(itinerary['_id'])
            return [ItineraryResponse(**itinerary)]
        
        # Otherwise return all with pagination
        cursor = db[settings.ITINERARY_COLLECTION].find().sort("created_at", -1).skip(skip).limit(limit)
        itineraries = await cursor.to_list(length=limit)
        
        result = []
        for itinerary in itineraries:
            itinerary['_id'] = str(itinerary['_id'])
            result.append(ItineraryResponse(**itinerary))
        
        logger.info(f"📋 Retrieved {len(result)} itineraries")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error fetching itineraries: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/weather/{destination}")
async def get_weather_info(destination: str, forecast_days: int = None):
    """
    🎯 ROUTE 4: Get weather information for destination
    
    Weather API Integration (OpenWeatherMap):
    - If forecast_days provided: Returns weather forecast (1-5 days)
    - Otherwise: Returns current weather
    
    Displays current or forecasted weather for selected destinations.
    """
    try:
        # If forecast requested
        if forecast_days:
            days = max(1, min(forecast_days, 5))  # Limit 1-5 days
            forecast = await weather_service.get_forecast(destination, days)
            
            if not forecast:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Forecast data not available for {destination}"
                )
            
            return forecast
        
        # Otherwise return current weather
        weather = await weather_service.get_current_weather(destination)
        
        if not weather:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Weather data not available for {destination}"
            )
        
        return weather
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Weather error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.delete("/{itinerary_id}")
async def delete_itinerary(itinerary_id: str):
    """
    🎯 ROUTE 5: Delete an itinerary by ID
    
    Remove saved itinerary from database
    """
    try:
        if not ObjectId.is_valid(itinerary_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid itinerary ID format"
            )
        
        db = get_database()
        result = await db[settings.ITINERARY_COLLECTION].delete_one(
            {"_id": ObjectId(itinerary_id)}
        )
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Itinerary not found"
            )
        
        logger.info(f"🗑️ Deleted itinerary: {itinerary_id}")
        return {"message": "Itinerary deleted successfully", "id": itinerary_id}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error deleting itinerary: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )