from typing import Dict, Any, Optional
import re
from datetime import datetime, timedelta


def extract_city_from_destination(destination: str) -> str:
    """
    Extract city name from destination string
    
    Example: "Paris, France" -> "Paris"
    """
    return destination.split(',')[0].strip()


def format_currency(amount: float, currency: str = "USD") -> str:
    """
    Format currency amount
    
    Args:
        amount: Amount to format
        currency: Currency code (default USD)
    
    Returns:
        Formatted currency string
    """
    symbols = {
        "USD": "$",
        "EUR": "€",
        "GBP": "£",
        "JPY": "¥",
        "INR": "₹"
    }
    
    symbol = symbols.get(currency, "$")
    return f"{symbol}{amount:,.2f}"


def calculate_date_range(start_date: str, days: int) -> Dict[str, str]:
    """
    Calculate end date from start date and duration
    
    Args:
        start_date: Start date in YYYY-MM-DD format
        days: Number of days
        
    Returns:
        Dictionary with start_date and end_date
    """
    try:
        start = datetime.strptime(start_date, "%Y-%m-%d")
        end = start + timedelta(days=days - 1)
        
        return {
            "start_date": start.strftime("%Y-%m-%d"),
            "end_date": end.strftime("%Y-%m-%d"),
            "start_date_formatted": start.strftime("%B %d, %Y"),
            "end_date_formatted": end.strftime("%B %d, %Y")
        }
    except ValueError:
        return {}


def parse_budget_level(budget: str) -> Dict[str, Any]:
    """
    Get budget information based on level
    
    Args:
        budget: Budget level (low, moderate, high, luxury)
        
    Returns:
        Dictionary with budget details
    """
    budget_info = {
        "low": {
            "daily_range": "$30-$70",
            "accommodation": "Hostels, budget hotels",
            "food": "Street food, local eateries",
            "transport": "Public transport"
        },
        "moderate": {
            "daily_range": "$70-$150",
            "accommodation": "3-star hotels, Airbnb",
            "food": "Mid-range restaurants",
            "transport": "Mix of public and private"
        },
        "high": {
            "daily_range": "$150-$300",
            "accommodation": "4-star hotels, nice Airbnb",
            "food": "Good restaurants, occasional fine dining",
            "transport": "Private transport, some taxis"
        },
        "luxury": {
            "daily_range": "$300+",
            "accommodation": "5-star hotels, luxury resorts",
            "food": "Fine dining, michelin restaurants",
            "transport": "Private cars, first class"
        }
    }
    
    return budget_info.get(budget.lower(), budget_info["moderate"])


def validate_email(email: str) -> bool:
    """
    Validate email format
    
    Args:
        email: Email address to validate
        
    Returns:
        True if valid, False otherwise
    """
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def sanitize_destination_name(destination: str) -> str:
    """
    Sanitize and format destination name
    
    Args:
        destination: Raw destination name
        
    Returns:
        Cleaned destination name
    """
    # Remove extra spaces
    destination = " ".join(destination.split())
    
    # Capitalize each word
    destination = destination.title()
    
    return destination


def get_season_from_month(month: int) -> str:
    """
    Get season from month number
    
    Args:
        month: Month number (1-12)
        
    Returns:
        Season name
    """
    seasons = {
        (12, 1, 2): "Winter",
        (3, 4, 5): "Spring",
        (6, 7, 8): "Summer",
        (9, 10, 11): "Fall"
    }
    
    for months, season in seasons.items():
        if month in months:
            return season
    
    return "Unknown"


def format_duration(days: int) -> str:
    """
    Format duration in human-readable format
    
    Args:
        days: Number of days
        
    Returns:
        Formatted duration string
    """
    if days == 1:
        return "1 day"
    elif days < 7:
        return f"{days} days"
    elif days == 7:
        return "1 week"
    elif days < 14:
        return f"{days} days (1+ week)"
    elif days == 14:
        return "2 weeks"
    else:
        weeks = days // 7
        remaining_days = days % 7
        if remaining_days == 0:
            return f"{weeks} weeks"
        else:
            return f"{weeks} weeks and {remaining_days} days"


def truncate_text(text: str, max_length: int = 100, suffix: str = "...") -> str:
    """
    Truncate text to maximum length
    
    Args:
        text: Text to truncate
        max_length: Maximum length
        suffix: Suffix to add if truncated
        
    Returns:
        Truncated text
    """
    if len(text) <= max_length:
        return text
    
    return text[:max_length - len(suffix)].strip() + suffix


def parse_interests_tags(interests: list) -> Dict[str, list]:
    """
    Categorize interests into groups
    
    Args:
        interests: List of interest tags
        
    Returns:
        Dictionary with categorized interests
    """
    categories = {
        "adventure": ["hiking", "trekking", "climbing", "adventure", "outdoor", "safari", "camping"],
        "culture": ["culture", "history", "museums", "art", "architecture", "heritage", "temples"],
        "food": ["food", "cuisine", "dining", "culinary", "wine", "gastronomy"],
        "beach": ["beach", "coastal", "ocean", "seaside", "tropical", "island"],
        "nature": ["nature", "wildlife", "scenery", "landscapes", "parks", "mountains"],
        "city": ["city", "urban", "shopping", "nightlife", "entertainment", "modern"],
        "relaxation": ["relaxation", "spa", "wellness", "yoga", "meditation", "retreat"]
    }
    
    result = {category: [] for category in categories.keys()}
    result["other"] = []
    
    for interest in interests:
        interest_lower = interest.lower()
        categorized = False
        
        for category, keywords in categories.items():
            if interest_lower in keywords:
                result[category].append(interest)
                categorized = True
                break
        
        if not categorized:
            result["other"].append(interest)
    
    # Remove empty categories
    return {k: v for k, v in result.items() if v}


def calculate_estimated_cost(days: int, budget: str, travelers: int = 1) -> str:
    """
    Calculate estimated total cost for trip
    
    Args:
        days: Number of days
        budget: Budget level
        travelers: Number of travelers
        
    Returns:
        Estimated cost range as string
    """
    daily_costs = {
        "low": (30, 70),
        "moderate": (70, 150),
        "high": (150, 300),
        "luxury": (300, 500)
    }
    
    min_daily, max_daily = daily_costs.get(budget.lower(), (70, 150))
    
    min_cost = min_daily * days * travelers
    max_cost = max_daily * days * travelers
    
    return f"${min_cost:,} - ${max_cost:,}"


def get_current_timestamp() -> str:
    """
    Get current timestamp in ISO format
    
    Returns:
        ISO formatted timestamp string
    """
    return datetime.utcnow().isoformat()


def days_until_date(target_date: str) -> Optional[int]:
    """
    Calculate days until target date
    
    Args:
        target_date: Date in YYYY-MM-DD format
        
    Returns:
        Number of days until date, or None if invalid
    """
    try:
        target = datetime.strptime(target_date, "%Y-%m-%d")
        today = datetime.now()
        delta = target - today
        return delta.days
    except ValueError:
        return None