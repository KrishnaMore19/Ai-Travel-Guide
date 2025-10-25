from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional, Dict, Any
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
    """Custom ObjectId type for Pydantic"""
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")


# Request Models
class SuggestionFilterRequest(BaseModel):
    """Filter parameters for suggested trips"""
    category: Optional[str] = None  # adventure, culture, beach, mountains, city
    duration_min: Optional[int] = None
    duration_max: Optional[int] = None
    budget: Optional[str] = None  # budget, moderate, luxury
    season: Optional[str] = None  # spring, summer, fall, winter
    continent: Optional[str] = None
    limit: int = Field(default=10, ge=1, le=50)


# Response Models
class SuggestedTrip(BaseModel):
    """Single suggested trip"""
    id: Optional[str] = Field(default=None, alias="_id")
    destination: str
    country: str
    continent: Optional[str] = None
    title: str
    description: str
    duration: str  # e.g., "5-7 days"
    duration_days: int
    highlights: List[str]
    best_time_to_visit: str
    best_months: List[str] = []
    category: List[str]  # adventure, culture, beach, etc.
    budget: str  # budget, moderate, luxury
    estimated_cost: str  # e.g., "$1000-$1500"
    image_url: Optional[str] = None
    rating: Optional[float] = Field(default=None, ge=0, le=5)
    popular_activities: List[str] = []
    travel_tips: List[str] = []
    weather_info: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        json_schema_extra = {
            "example": {
                "destination": "Bali",
                "country": "Indonesia",
                "continent": "Asia",
                "title": "Tropical Paradise Adventure",
                "description": "Experience beaches, temples, and culture",
                "duration": "7-10 days",
                "duration_days": 7,
                "highlights": ["Beaches", "Temples", "Rice Terraces"],
                "best_time_to_visit": "April to October",
                "best_months": ["Apr", "May", "Jun", "Jul", "Aug", "Sep"],
                "category": ["beach", "culture", "adventure"],
                "budget": "moderate",
                "estimated_cost": "$800-$1500",
                "rating": 4.8
            }
        }


class SuggestionsResponse(BaseModel):
    """List of suggested trips"""
    total: int
    suggestions: List[SuggestedTrip]
    filters_applied: Optional[Dict[str, Any]] = None


# Database Models
class SuggestedTripDB(BaseModel):
    """Suggested trip document in database"""
    destination: str
    country: str
    continent: str
    title: str
    description: str
    duration: str
    duration_days: int
    highlights: List[str]
    best_time_to_visit: str
    best_months: List[str]
    category: List[str]
    budget: str
    estimated_cost: str
    image_url: Optional[str] = None
    rating: Optional[float] = None
    popular_activities: List[str] = []
    travel_tips: List[str] = []
    weather_info: Optional[str] = None
    is_featured: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


# Create Suggestion Request (for admin/seeding)
class CreateSuggestionRequest(BaseModel):
    """Request to create a new suggested trip"""
    destination: str
    country: str
    continent: str
    title: str
    description: str
    duration: str
    duration_days: int
    highlights: List[str]
    best_time_to_visit: str
    best_months: List[str]
    category: List[str]
    budget: str
    estimated_cost: str
    image_url: Optional[str] = None
    rating: Optional[float] = None
    popular_activities: List[str] = []
    travel_tips: List[str] = []