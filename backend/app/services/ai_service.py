from openai import AsyncOpenAI
from app.config import settings
from app.models.itinerary_model import ItineraryRequest, StreamChunk
from typing import AsyncGenerator, List, Dict, Optional
import logging
import asyncio
import json

logger = logging.getLogger(__name__)


class AIService:
    """Service for AI-powered itinerary and suggestion generation using Llama via OpenRouter"""
    
    def __init__(self):
        self.provider = settings.AI_PROVIDER.lower()
        
        if self.provider == "llama" and settings.LLAMA_API_KEY:
            # OpenRouter uses OpenAI-compatible API
            self.client = AsyncOpenAI(
                base_url=settings.LLAMA_BASE_URL,
                api_key=settings.LLAMA_API_KEY
            )
            self.model_name = settings.LLAMA_MODEL
            logger.info(f"✅ Llama AI initialized with model: {self.model_name}")
        else:
            logger.warning("⚠️ No AI provider configured")
            raise ValueError("LLAMA_API_KEY is required")
    
    def _create_prompt(self, request: ItineraryRequest) -> str:
        """Create detailed prompt for AI"""
        prompt = f"""Create a detailed {request.days}-day travel itinerary for {request.destination}.

Trip Details:
- Destination: {request.destination}
- Duration: {request.days} days
- Number of travelers: {request.travelers}
- Budget: {request.budget}
- Interests: {', '.join(request.interests)}
"""
        
        if request.start_date:
            prompt += f"- Start date: {request.start_date}\n"
        
        if request.additional_preferences:
            prompt += f"- Additional preferences: {request.additional_preferences}\n"
        
        prompt += """
Please provide:
1. Day-by-day itinerary with morning, afternoon, and evening activities
2. Specific recommendations for restaurants, attractions, and experiences
3. Estimated costs for each day
4. Travel tips and local insights
5. Best transportation options
6. Cultural etiquette and important notes

Format the response in clean markdown with clear sections for each day.
Include practical details like opening hours, booking requirements, and insider tips.
"""
        return prompt
    
    async def generate_itinerary(self, request: ItineraryRequest) -> str:
        """Generate complete itinerary (non-streaming)"""
        try:
            prompt = self._create_prompt(request)
            
            response = await self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {
                        "role": "system", 
                        "content": "You are an expert travel planner with extensive knowledge of destinations worldwide. Provide detailed, practical, and personalized travel itineraries."
                    },
                    {
                        "role": "user", 
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=4000
            )
            return response.choices[0].message.content
                
        except Exception as e:
            logger.error(f"❌ AI generation error: {e}")
            raise
    
    async def generate_itinerary_stream(
        self, 
        request: ItineraryRequest
    ) -> AsyncGenerator[StreamChunk, None]:
        """Generate itinerary with streaming (Chain of Thought)"""
        try:
            # Chain of Thought steps
            thoughts = [
                f"🌍 Analyzing destination: {request.destination}...",
                f"📅 Planning {request.days}-day itinerary...",
                f"💰 Optimizing for {request.budget} budget...",
                f"🎯 Considering interests: {', '.join(request.interests)}...",
                f"✨ Generating personalized recommendations..."
            ]
            
            # Emit thought process
            for thought in thoughts:
                yield StreamChunk(
                    type="thought",
                    content=thought,
                    metadata={"step": thoughts.index(thought) + 1}
                )
                await asyncio.sleep(0.5)
            
            # Generate actual itinerary with streaming
            prompt = self._create_prompt(request)
            
            stream = await self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {
                        "role": "system", 
                        "content": "You are an expert travel planner with extensive knowledge of destinations worldwide. Provide detailed, practical, and personalized travel itineraries."
                    },
                    {
                        "role": "user", 
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=4000,
                stream=True
            )
            
            async for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield StreamChunk(
                        type="content",
                        content=chunk.choices[0].delta.content
                    )
            
            # Completion signal
            yield StreamChunk(
                type="complete",
                content="Itinerary generation complete!",
                metadata={"success": True}
            )
            
        except Exception as e:
            logger.error(f"❌ Streaming error: {e}")
            yield StreamChunk(
                type="error",
                content=f"Error generating itinerary: {str(e)}",
                metadata={"error": str(e)}
            )
    
    async def generate_travel_tips(self, destination: str) -> list[str]:
        """Generate quick travel tips for a destination"""
        try:
            prompt = f"Provide 5 essential travel tips for visiting {destination}. Be concise and practical. Format as a numbered list."
            
            response = await self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a travel expert providing practical tips."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=500
            )
            tips_text = response.choices[0].message.content
            
            # Parse tips (assuming numbered list)
            tips = [
                line.strip() 
                for line in tips_text.split('\n') 
                if line.strip() and any(char.isdigit() for char in line[:3])
            ]
            return tips[:5]
            
        except Exception as e:
            logger.error(f"❌ Error generating tips: {e}")
            return [
                "Research local customs and etiquette",
                "Learn basic phrases in the local language",
                "Check visa requirements in advance",
                "Get travel insurance",
                "Keep digital and physical copies of important documents"
            ]
    
    async def generate_suggestions(
        self, 
        category: Optional[str] = None,
        budget: Optional[str] = None,
        continent: Optional[str] = None,
        count: int = 6
    ) -> List[Dict]:
        """
        Generate AI-powered travel suggestions based on filters
        
        Args:
            category: Type of trip (adventure, culture, beach, etc.)
            budget: Budget level (budget, moderate, luxury)
            continent: Continent filter (Asia, Europe, etc.)
            count: Number of suggestions to generate
        
        Returns:
            List of suggestion dictionaries matching the SuggestedTrip model
        """
        try:
            # Build prompt based on filters
            prompt = f"Generate {count} unique travel destination suggestions"
            
            filters = []
            if category:
                filters.append(f"category: {category}")
            if budget:
                filters.append(f"budget level: {budget}")
            if continent:
                filters.append(f"continent: {continent}")
            
            if filters:
                prompt += f" matching these criteria: {', '.join(filters)}"
            
            prompt += """

For each destination, provide:
1. destination (city/place name)
2. country
3. continent (Asia, Europe, Africa, North America, South America, Oceania)
4. title (catchy trip title)
5. description (2-3 sentences about the destination)
6. duration (e.g., "5-7 days")
7. duration_days (numeric, average days)
8. highlights (list of 5 main attractions)
9. best_time_to_visit (brief description)
10. best_months (list of 3-letter month abbreviations)
11. category (list, choose from: adventure, culture, beach, mountains, city, nature, food, romantic, hiking, photography, luxury)
12. budget (budget, moderate, or high/luxury)
13. estimated_cost (price range as string, e.g., "$1000-$2000")
14. rating (float between 4.5-5.0)
15. popular_activities (list of 5 activities)
16. travel_tips (list of 5 practical tips)

Return ONLY a valid JSON array of objects. No additional text or markdown.
"""
            
            response = await self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a travel expert who generates destination recommendations. Always respond with valid JSON only."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.8,  # Higher creativity for varied suggestions
                max_tokens=3000
            )
            
            # Parse AI response
            content = response.choices[0].message.content.strip()
            
            # Remove markdown code blocks if present
            if content.startswith("```"):
                content = content.split("```")[1]
                if content.startswith("json"):
                    content = content[4:]
                content = content.strip()
            
            suggestions = json.loads(content)
            
            # Validate and add missing fields
            for suggestion in suggestions:
                suggestion['is_featured'] = False
                suggestion['created_at'] = None  # Will be set when saved to DB
                suggestion['updated_at'] = None
                
                # Ensure all required fields exist
                if 'rating' not in suggestion:
                    suggestion['rating'] = 4.7
                if 'duration_days' not in suggestion:
                    # Try to parse from duration string
                    duration_str = suggestion.get('duration', '7 days')
                    try:
                        suggestion['duration_days'] = int(duration_str.split('-')[0].split()[0])
                    except:
                        suggestion['duration_days'] = 7
            
            logger.info(f"✅ Generated {len(suggestions)} AI suggestions")
            return suggestions
            
        except json.JSONDecodeError as e:
            logger.error(f"❌ JSON parsing error: {e}")
            logger.error(f"Response content: {content}")
            raise ValueError(f"AI returned invalid JSON: {str(e)}")
        except Exception as e:
            logger.error(f"❌ Error generating suggestions: {e}")
            raise
    
    async def generate_single_suggestion(self, destination: str) -> Dict:
        """
        Generate a detailed suggestion for a specific destination
        
        Args:
            destination: Name of the destination
        
        Returns:
            Suggestion dictionary matching the SuggestedTrip model
        """
        try:
            prompt = f"""Generate a detailed travel suggestion for {destination}.

Provide complete information including:
- destination, country, continent
- title (catchy trip title)
- description (2-3 engaging sentences)
- duration and duration_days
- highlights (5 main attractions)
- best_time_to_visit and best_months
- category (list of applicable categories)
- budget level and estimated_cost
- rating (4.5-5.0)
- popular_activities (5 activities)
- travel_tips (5 practical tips)

Return ONLY a valid JSON object. No additional text or markdown.
"""
            
            response = await self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a travel expert who generates detailed destination information. Always respond with valid JSON only."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=1500
            )
            
            content = response.choices[0].message.content.strip()
            
            # Remove markdown code blocks if present
            if content.startswith("```"):
                content = content.split("```")[1]
                if content.startswith("json"):
                    content = content[4:]
                content = content.strip()
            
            suggestion = json.loads(content)
            suggestion['is_featured'] = False
            
            logger.info(f"✅ Generated suggestion for {destination}")
            return suggestion
            
        except Exception as e:
            logger.error(f"❌ Error generating single suggestion: {e}")
            raise


# Global instance
ai_service = AIService()