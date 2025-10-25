import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Application settings"""
    
    # MongoDB Configuration
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "travel_guide_db")
    
    # Collection names
    ITINERARY_COLLECTION: str = "itineraries"
    SUGGESTIONS_COLLECTION: str = "suggested_trips"
    
    # AI Model Configuration (Llama via OpenRouter)
    AI_PROVIDER: str = "llama"
    LLAMA_MODEL: str = os.getenv("LLAMA_MODEL", "meta-llama/llama-3.2-3b-instruct:free")
    LLAMA_API_KEY: str = os.getenv("LLAMA_API_KEY", "")
    LLAMA_BASE_URL: str = "https://openrouter.ai/api/v1"  # OpenRouter API endpoint
    
    # Weather API Configuration
    OPENWEATHER_API_KEY: str = os.getenv("OPENWEATHER_API_KEY", "")
    
    # Server Configuration
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", 8000))
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # CORS Configuration
    ALLOWED_ORIGINS: list = [
        origin.strip() 
        for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
        if origin.strip()
    ]
    
    # Validation
    def validate(self) -> bool:
        """Validate required settings"""
        errors = []
        
        if not self.MONGODB_URL:
            errors.append("MONGODB_URL is required")
        
        if not self.LLAMA_API_KEY:
            errors.append("LLAMA_API_KEY is required")
        
        if errors:
            raise ValueError(f"Configuration errors: {', '.join(errors)}")
        
        return True


# Create global settings instance
settings = Settings()