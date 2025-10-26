// lib/api.ts - COMPLETE FILE WITH WEATHER SUPPORT
import { Itinerary } from '@/types/itinerary';
import { SuggestedTrip, SuggestionsResponse } from '@/types/suggestion';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Simple API call with better error handling
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log('🔍 API Call:', url);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    console.log('📊 Response Status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      
      let errorDetail = `Request failed with status ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorDetail = errorJson.detail || errorDetail;
      } catch {
        errorDetail = errorText || errorDetail;
      }
      
      throw new Error(errorDetail);
    }

    const data = await response.json();
    console.log('✅ API Response:', data);
    return data;
  } catch (error) {
    console.error('❌ API Error:', error);
    throw error;
  }
}

// Itinerary API calls
export const itineraryApi = {
  generate: async (data: any): Promise<Itinerary> => {
    return apiCall<Itinerary>('/api/itinerary/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getAll: async (limit = 10, skip = 0): Promise<Itinerary[]> => {
    return apiCall<Itinerary[]>(`/api/itinerary?limit=${limit}&skip=${skip}`);
  },

  getById: async (id: string): Promise<Itinerary> => {
    return apiCall<Itinerary>(`/api/itinerary/${id}`);
  },

  delete: async (id: string): Promise<{ message: string; id: string }> => {
    return apiCall<{ message: string; id: string }>(`/api/itinerary/${id}`, {
      method: 'DELETE',
    });
  },

  // ✅ GET CURRENT WEATHER
  getWeather: async (destination: string): Promise<any> => {
    return apiCall<any>(`/api/itinerary/weather/${encodeURIComponent(destination)}`);
  },

  // ✅ GET WEATHER FORECAST
  getForecast: async (destination: string, days = 5): Promise<any> => {
    return apiCall<any>(`/api/itinerary/weather/${encodeURIComponent(destination)}?forecast_days=${days}`);
  },

  generateStream: async (data: any): Promise<Response> => {
    const url = `${API_BASE_URL}/api/itinerary/generate-stream`;
    console.log('🔍 Stream API Call:', url);
    
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  },
};

// Suggestions API calls
export const suggestionsApi = {
  getAll: async (filters?: {
    category?: string | string[];
    budget?: string;
    duration_min?: number;
    duration_max?: number;
    continent?: string;
    featured?: boolean;
    limit?: number;
    skip?: number;
  }): Promise<SuggestionsResponse> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }
    
    const queryString = params.toString();
    const endpoint = `/api/suggestions${queryString ? '?' + queryString : ''}`;
    
    console.log('🔍 Calling suggestions endpoint:', endpoint);
    return apiCall<SuggestionsResponse>(endpoint);
  },

  getFeatured: async (limit = 6): Promise<SuggestedTrip[]> => {
    console.log('🌟 Fetching featured suggestions, limit:', limit);
    
    try {
      const response = await apiCall<SuggestionsResponse>(
        `/api/suggestions?featured=true&limit=${limit}`
      );
      
      console.log('✅ Featured suggestions response:', response);
      return response.suggestions || [];
    } catch (error) {
      console.error('❌ Error fetching featured suggestions:', error);
      return [];
    }
  },

  getById: async (id: string): Promise<SuggestedTrip> => {
    console.log('🔍 Fetching suggestion by ID:', id);
    
    const response = await apiCall<SuggestionsResponse>(
      `/api/suggestions?suggestion_id=${id}`
    );
    
    if (response.suggestions && response.suggestions.length > 0) {
      return response.suggestions[0];
    }
    
    throw new Error('Suggestion not found');
  },

  generateAI: async (params?: {
    category?: string;
    budget?: string;
    continent?: string;
    destination?: string;
    count?: number;
    save_to_db?: boolean;
  }): Promise<SuggestedTrip[]> => {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    const endpoint = `/api/suggestions/ai-generate${queryString ? '?' + queryString : ''}`;
    
    return apiCall<SuggestedTrip[]>(endpoint, {
      method: 'POST',
    });
  },

  createOrUpdate: async (
    data: Partial<SuggestedTrip>,
    suggestionId?: string
  ): Promise<SuggestedTrip> => {
    const endpoint = suggestionId 
      ? `/api/suggestions?suggestion_id=${suggestionId}`
      : '/api/suggestions';
    
    return apiCall<SuggestedTrip>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  delete: async (suggestionId: string): Promise<{ message: string; id: string }> => {
    return apiCall<{ message: string; id: string }>(
      `/api/suggestions/${suggestionId}`,
      {
        method: 'DELETE',
      }
    );
  },

  clearAll: async (): Promise<{ message: string; deleted_count: number }> => {
    return apiCall<{ message: string; deleted_count: number }>(
      '/api/suggestions/clear?clear_all=true',
      {
        method: 'DELETE',
      }
    );
  },
};

export default {
  itinerary: itineraryApi,
  suggestions: suggestionsApi,
};