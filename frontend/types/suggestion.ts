// types/suggestion.ts

export interface SuggestedTrip {
  _id?: string;
  destination: string;
  country: string;
  continent?: string;
  title: string;
  description: string;
  duration: string; // e.g., "5-7 days"
  duration_days: number;
  highlights: string[];
  best_time_to_visit: string;
  best_months: string[];
  category: string[]; // adventure, culture, beach, etc.
  budget: 'budget' | 'moderate' | 'luxury';
  estimated_cost: string; // e.g., "$1000-$1500"
  image_url?: string;
  rating?: number;
  popular_activities: string[];
  travel_tips: string[];
  weather_info?: string;
  created_at: string;
}

export interface SuggestionsResponse {
  total: number;
  suggestions: SuggestedTrip[];
  filters_applied?: Record<string, any>;
}

export interface SuggestionFilters {
  category?: string;
  budget?: string;
  duration_min?: number;
  duration_max?: number;
  continent?: string;
  limit?: number;
  skip?: number;
}