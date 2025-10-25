import httpx
from app.config import settings
from typing import Dict, Any, Optional
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class WeatherService:
    """Service for fetching weather data from OpenWeatherMap API"""
    
    BASE_URL = "https://api.openweathermap.org/data/2.5/weather?units=metric&q="
    
    def __init__(self):
        self.api_key = settings.OPENWEATHER_API_KEY
        
        if not self.api_key:
            logger.warning("⚠️ OpenWeather API key not configured")
        else:
            logger.info("✅ Weather service initialized")
        
        self.cache = {}  # Simple in-memory cache
        self.cache_duration = timedelta(hours=1)
    
    def _get_cache_key(self, city: str, weather_type: str) -> str:
        """Generate cache key"""
        return f"{city.lower().strip()}_{weather_type}"
    
    def _is_cache_valid(self, timestamp: datetime) -> bool:
        """Check if cache is still valid"""
        return datetime.utcnow() - timestamp < self.cache_duration
    
    async def get_current_weather(self, city: str) -> Optional[Dict[str, Any]]:
        """
        Get current weather for a city
        
        Args:
            city: City name (e.g., "Paris", "New York", "Tokyo")
            
        Returns:
            Dictionary with weather data or None if failed
        """
        if not self.api_key:
            logger.error("❌ Weather API key not configured")
            return None
        
        cache_key = self._get_cache_key(city, "current")
        
        # Check cache
        if cache_key in self.cache:
            cached_data, timestamp = self.cache[cache_key]
            if self._is_cache_valid(timestamp):
                logger.info(f"📦 Weather cache hit for {city}")
                return cached_data
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.BASE_URL}/weather",
                    params={
                        "q": city,
                        "appid": self.api_key,
                        "units": "metric"
                    },
                    timeout=10.0
                )
                response.raise_for_status()
                data = response.json()
                
                # Format response
                weather_data = {
                    "city": data["name"],
                    "country": data["sys"]["country"],
                    "temperature": round(data["main"]["temp"], 1),
                    "feels_like": round(data["main"]["feels_like"], 1),
                    "temp_min": round(data["main"]["temp_min"], 1),
                    "temp_max": round(data["main"]["temp_max"], 1),
                    "humidity": data["main"]["humidity"],
                    "pressure": data["main"]["pressure"],
                    "description": data["weather"][0]["description"].capitalize(),
                    "icon": data["weather"][0]["icon"],
                    "wind_speed": round(data["wind"]["speed"], 1),
                    "clouds": data["clouds"]["all"],
                    "visibility": data.get("visibility", 0) // 1000,  # Convert to km
                    "timestamp": datetime.utcnow().isoformat()
                }
                
                # Cache the result
                self.cache[cache_key] = (weather_data, datetime.utcnow())
                logger.info(f"✅ Weather fetched for {city}")
                
                return weather_data
                
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                logger.error(f"❌ City not found: {city}")
            elif e.response.status_code == 401:
                logger.error(f"❌ Invalid API key")
            else:
                logger.error(f"❌ Weather API error for {city}: {e.response.status_code}")
            return None
            
        except httpx.TimeoutException:
            logger.error(f"❌ Weather API timeout for {city}")
            return None
            
        except Exception as e:
            logger.error(f"❌ Weather fetch error for {city}: {str(e)}")
            return None
    
    async def get_forecast(self, city: str, days: int = 5) -> Optional[Dict[str, Any]]:
        """
        Get weather forecast for a city
        
        Args:
            city: City name
            days: Number of days (1-5, default 5)
            
        Returns:
            Dictionary with forecast data or None if failed
        """
        if not self.api_key:
            logger.error("❌ Weather API key not configured")
            return None
        
        # Limit days to 1-5
        days = max(1, min(days, 5))
        
        cache_key = self._get_cache_key(city, f"forecast_{days}")
        
        # Check cache
        if cache_key in self.cache:
            cached_data, timestamp = self.cache[cache_key]
            if self._is_cache_valid(timestamp):
                logger.info(f"📦 Forecast cache hit for {city}")
                return cached_data
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.BASE_URL}/forecast",
                    params={
                        "q": city,
                        "appid": self.api_key,
                        "units": "metric",
                        "cnt": days * 8  # 8 forecasts per day (3-hour intervals)
                    },
                    timeout=10.0
                )
                response.raise_for_status()
                data = response.json()
                
                # Group forecasts by day
                daily_forecasts = []
                current_day = None
                day_data = []
                
                for item in data["list"]:
                    forecast_date = datetime.fromtimestamp(item["dt"]).date()
                    
                    if current_day != forecast_date:
                        if day_data:
                            daily_forecasts.append(self._aggregate_day_forecast(day_data))
                        current_day = forecast_date
                        day_data = [item]
                    else:
                        day_data.append(item)
                
                # Add last day
                if day_data:
                    daily_forecasts.append(self._aggregate_day_forecast(day_data))
                
                forecast_data = {
                    "city": data["city"]["name"],
                    "country": data["city"]["country"],
                    "forecasts": daily_forecasts[:days],
                    "timestamp": datetime.utcnow().isoformat()
                }
                
                # Cache the result
                self.cache[cache_key] = (forecast_data, datetime.utcnow())
                logger.info(f"✅ Forecast fetched for {city} ({days} days)")
                
                return forecast_data
                
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                logger.error(f"❌ City not found: {city}")
            elif e.response.status_code == 401:
                logger.error(f"❌ Invalid API key")
            else:
                logger.error(f"❌ Forecast API error for {city}: {e.response.status_code}")
            return None
            
        except httpx.TimeoutException:
            logger.error(f"❌ Forecast API timeout for {city}")
            return None
            
        except Exception as e:
            logger.error(f"❌ Forecast fetch error for {city}: {str(e)}")
            return None
    
    def _aggregate_day_forecast(self, day_data: list) -> Dict[str, Any]:
        """Aggregate 3-hour forecasts into daily summary"""
        if not day_data:
            return {}
        
        temps = [item["main"]["temp"] for item in day_data]
        descriptions = [item["weather"][0]["description"] for item in day_data]
        
        # Most common weather description
        description = max(set(descriptions), key=descriptions.count)
        
        return {
            "date": datetime.fromtimestamp(day_data[0]["dt"]).strftime("%Y-%m-%d"),
            "day_name": datetime.fromtimestamp(day_data[0]["dt"]).strftime("%A"),
            "temp_min": round(min(temps), 1),
            "temp_max": round(max(temps), 1),
            "temp_avg": round(sum(temps) / len(temps), 1),
            "description": description.capitalize(),
            "icon": day_data[len(day_data)//2]["weather"][0]["icon"],  # Midday icon
            "humidity": round(sum(item["main"]["humidity"] for item in day_data) / len(day_data)),
            "wind_speed": round(sum(item["wind"]["speed"] for item in day_data) / len(day_data), 1),
            "pop": round(max(item.get("pop", 0) for item in day_data) * 100)  # Probability of precipitation
        }
    
    async def get_weather_summary(self, city: str) -> str:
        """
        Get human-readable weather summary
        
        Args:
            city: City name
            
        Returns:
            Formatted weather summary string
        """
        current = await self.get_current_weather(city)
        if not current:
            return f"Weather information not available for {city}"
        
        return (
            f"Current weather in {current['city']}, {current['country']}: "
            f"{current['temperature']}°C (feels like {current['feels_like']}°C), "
            f"{current['description']}. "
            f"Humidity: {current['humidity']}%, "
            f"Wind: {current['wind_speed']} m/s"
        )
    
    def clear_cache(self) -> None:
        """Clear all cached weather data"""
        self.cache.clear()
        logger.info("🗑️ Weather cache cleared")
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        valid_entries = sum(
            1 for _, (_, timestamp) in self.cache.items()
            if self._is_cache_valid(timestamp)
        )
        
        return {
            "total_entries": len(self.cache),
            "valid_entries": valid_entries,
            "expired_entries": len(self.cache) - valid_entries
        }


# Global instance
weather_service = WeatherService()