from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
import time

from app.config import settings
from app.db import connect_to_mongo, close_mongo_connection
from app.utils.logger import setup_logging
from app.utils.helpers import get_current_timestamp
from app.routes import itinerary, suggestions

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    logger.info("🚀 Starting AI Travel Guide API...")
    logger.info(f"📊 Configuration: Provider={settings.AI_PROVIDER}, Model={settings.LLAMA_MODEL}")
    
    try:
        await connect_to_mongo()
        logger.info("✅ Application started successfully")
    except Exception as e:
        logger.error(f"❌ Failed to start application: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down...")
    await close_mongo_connection()
    logger.info("✅ Application shutdown complete")


# Create FastAPI app
app = FastAPI(
    title="AI Travel Guide API",
    description="Personalized travel itinerary generator powered by AI",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS middleware - FIXED VERSION
# Parse ALLOWED_ORIGINS from settings (handles both string and list)
allowed_origins = []
if isinstance(settings.ALLOWED_ORIGINS, str):
    # Split comma-separated string and strip whitespace
    allowed_origins = [origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",")]
elif isinstance(settings.ALLOWED_ORIGINS, list):
    allowed_origins = settings.ALLOWED_ORIGINS
else:
    # Default fallback origins
    allowed_origins = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:5173",
    ]

logger.info(f"🌐 CORS enabled for origins: {allowed_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Process-Time"],
)


# Request timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """Add processing time to response headers"""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(round(process_time, 3))
    return response


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle all unhandled exceptions"""
    logger.error(f"❌ Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error occurred",
            "timestamp": get_current_timestamp()
        }
    )


# Include routers
app.include_router(
    itinerary.router, 
    prefix="/api/itinerary", 
    tags=["Itinerary"]
)
app.include_router(
    suggestions.router, 
    prefix="/api/suggestions", 
    tags=["Suggestions"]
)


# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint - API information
    """
    return {
        "message": "🌍 AI Travel Guide API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "docs": "/docs",
            "redoc": "/redoc",
            "health": "/health",
            "itinerary": "/api/itinerary",
            "suggestions": "/api/suggestions"
        },
        "features": [
            "AI-powered itinerary generation",
            "Real-time streaming responses",
            "Weather integration",
            "Suggested travel destinations",
            "MongoDB storage"
        ]
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint
    
    Returns system status and configuration
    """
    from app.db import db
    
    # Check database connection
    db_status = "disconnected"
    try:
        if db.client is not None:
            await db.client.admin.command('ping')
            db_status = "connected"
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
    
    return {
        "status": "healthy",
        "timestamp": get_current_timestamp(),
        "database": {
            "status": db_status,
            "name": settings.DATABASE_NAME
        },
        "ai": {
            "provider": settings.AI_PROVIDER,
            "model": settings.LLAMA_MODEL
        },
        "weather": {
            "enabled": bool(settings.OPENWEATHER_API_KEY)
        },
        "server": {
            "host": settings.HOST,
            "port": settings.PORT,
            "debug": settings.DEBUG
        },
        "cors": {
            "allowed_origins": allowed_origins
        }
    }


@app.get("/api/info", tags=["Info"])
async def api_info():
    """
    Get API information and statistics
    """
    from app.db import get_database
    
    try:
        db = get_database()
        
        # Get collection statistics
        itinerary_count = await db[settings.ITINERARY_COLLECTION].count_documents({})
        suggestion_count = await db[settings.SUGGESTIONS_COLLECTION].count_documents({})
        
        return {
            "api_version": "1.0.0",
            "ai_model": settings.LLAMA_MODEL,
            "statistics": {
                "total_itineraries": itinerary_count,
                "total_suggestions": suggestion_count
            },
            "capabilities": {
                "itinerary_generation": True,
                "streaming_responses": True,
                "weather_data": bool(settings.OPENWEATHER_API_KEY),
                "travel_suggestions": True
            }
        }
    except Exception as e:
        logger.error(f"Error fetching API info: {e}")
        return {
            "api_version": "1.0.0",
            "ai_model": settings.LLAMA_MODEL,
            "error": "Could not fetch statistics"
        }


# Startup message
@app.on_event("startup")
async def startup_message():
    """Display startup message"""
    logger.info("=" * 60)
    logger.info("🌟 AI TRAVEL GUIDE API")
    logger.info("=" * 60)
    logger.info(f"📍 Server: http://{settings.HOST}:{settings.PORT}")
    logger.info(f"📚 Docs: http://{settings.HOST}:{settings.PORT}/docs")
    logger.info(f"🤖 AI Model: {settings.LLAMA_MODEL}")
    logger.info(f"🗄️  Database: {settings.DATABASE_NAME}")
    logger.info(f"🐛 Debug Mode: {settings.DEBUG}")
    logger.info(f"🌐 CORS Origins: {', '.join(allowed_origins)}")
    logger.info("=" * 60)


if __name__ == "__main__":
    import uvicorn
    
    logger.info(f"🌟 Starting server on {settings.HOST}:{settings.PORT}")
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info" if settings.DEBUG else "warning"
    )