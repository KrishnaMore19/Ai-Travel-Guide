from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo.errors import ConnectionFailure
from app.config import settings
import logging

logger = logging.getLogger(__name__)

class Database:
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None

db = Database()

async def connect_to_mongo():
    """Connect to MongoDB"""
    try:
        db.client = AsyncIOMotorClient(settings.MONGODB_URL)
        db.db = db.client[settings.DATABASE_NAME]
        
        # Test connection
        await db.client.admin.command('ping')
        logger.info(f"✅ Connected to MongoDB: {settings.DATABASE_NAME}")
        
        # Create indexes
        await create_indexes()
        
    except ConnectionFailure as e:
        logger.error(f"❌ Failed to connect to MongoDB: {e}")
        raise

async def close_mongo_connection():
    """Close MongoDB connection"""
    if db.client:
        db.client.close()
        logger.info("✅ MongoDB connection closed")

async def create_indexes():
    """Create database indexes for better performance"""
    try:
        # Itineraries indexes
        await db.db[settings.ITINERARY_COLLECTION].create_index("destination")
        await db.db[settings.ITINERARY_COLLECTION].create_index("created_at")
        
        # Suggestions indexes
        await db.db[settings.SUGGESTIONS_COLLECTION].create_index("destination")
        await db.db[settings.SUGGESTIONS_COLLECTION].create_index("category")
        
        logger.info("✅ Database indexes created")
    except Exception as e:
        logger.warning(f"⚠️ Could not create indexes: {e}")

def get_database() -> AsyncIOMotorDatabase:
    """Get database instance"""
    return db.db