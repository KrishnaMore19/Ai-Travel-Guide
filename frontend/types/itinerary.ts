// types/itinerary.ts

export interface ItineraryRequest {
  destination: string;
  days: number;
  interests: string[];
  budget: 'low' | 'moderate' | 'high' | 'luxury';
  travelers: number;
  start_date?: string;
  additional_preferences?: string;
}

export interface DayPlan {
  day_number: number;
  title: string;
  morning?: string;
  afternoon?: string;
  evening?: string;
  activities: string[];
  estimated_cost?: string;
  tips?: string[];
}

export interface WeatherInfo {
  city: string;
  country: string;
  temperature: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  humidity: number;
  pressure: number;
  description: string;
  icon: string;
  wind_speed: number;
  clouds: number;
  visibility: number;
  timestamp: string;
}

export interface Itinerary {
  _id?: string;
  destination: string;
  days: number;
  content: string;
  day_plans?: DayPlan[];
  weather_info?: WeatherInfo;
  budget_estimate?: string;
  travel_tips?: string[];
  created_at: string;
  interests: string[];
}

export interface StreamChunk {
  type: 'thought' | 'content' | 'complete' | 'error';
  content: string;
  metadata?: {
    step?: number;
    success?: boolean;
    error?: string;
  };
}

export interface ForecastDay {
  date: string;
  day_name: string;
  temp_min: number;
  temp_max: number;
  temp_avg: number;
  description: string;
  icon: string;
  humidity: number;
  wind_speed: number;
  pop: number; // Probability of precipitation
}

export interface WeatherForecast {
  city: string;
  country: string;
  forecasts: ForecastDay[];
  timestamp: string;
}