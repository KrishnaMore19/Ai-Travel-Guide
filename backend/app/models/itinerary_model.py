from pydantic import BaseModel, Field
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
class ItineraryRequest(BaseModel):
    """User request to generate itinerary"""
    destination: str = Field(..., min_length=2, max_length=100)
    days: int = Field(..., ge=1, le=30)
    interests: List[str] = Field(default=["sightseeing"])
    budget: str = Field(default="moderate")  # low, moderate, high, luxury
    travelers: int = Field(default=1, ge=1, le=20)
    start_date: Optional[str] = None
    additional_preferences: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "destination": "Paris, France",
                "days": 5,
                "interests": ["culture", "food", "museums"],
                "budget": "moderate",
                "travelers": 2,
                "start_date": "2025-11-01",
                "additional_preferences": "Prefer walking tours"
            }
        }


class DayPlan(BaseModel):
    """Single day plan in itinerary"""
    day_number: int
    title: str
    morning: Optional[str] = None
    afternoon: Optional[str] = None
    evening: Optional[str] = None
    activities: List[str] = []
    estimated_cost: Optional[str] = None
    tips: Optional[List[str]] = []


# Response Models
class ItineraryResponse(BaseModel):
    """Generated itinerary response"""
    id: Optional[str] = Field(default=None, alias="_id")
    destination: str
    days: int
    content: str  # Full markdown content
    day_plans: Optional[List[DayPlan]] = []
    weather_info: Optional[Dict[str, Any]] = None
    budget_estimate: Optional[str] = None
    travel_tips: Optional[List[str]] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    interests: List[str] = []
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class StreamChunk(BaseModel):
    """Streaming response chunk"""
    type: str  # "thought", "content", "complete", "error"
    content: str
    metadata: Optional[Dict[str, Any]] = None


# Database Models
class ItineraryDB(BaseModel):
    """Itinerary document in database"""
    destination: str
    days: int
    interests: List[str]
    budget: str
    travelers: int
    content: str
    day_plans: List[Dict[str, Any]] = []
    weather_info: Optional[Dict[str, Any]] = None
    budget_estimate: Optional[str] = None
    travel_tips: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    user_preferences: Optional[str] = None
    
    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}