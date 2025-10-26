// hooks/useItinerary.ts
'use client';

import { useState, useCallback } from 'react';
import { ItineraryRequest } from '../types/itinerary';
import { itineraryApi } from '../lib/api';

// Define the Itinerary type based on your data structure
export interface Itinerary {
  _id: string;
  destination: string;
  days: number;
  interests: string[];
  budget_estimate?: string;
  weather_info?: any;
  travel_tips?: string[];
  content: string;
  created_at: string;
  updated_at?: string;
}

interface StreamState {
  streaming: boolean;
  thoughts: string[]; // ✅ Changed from string to string[]
  content: string;
  error: string | null;
  completed: boolean;
}

export function useItineraryStream() {
  const [state, setState] = useState<StreamState>({
    streaming: false,
    thoughts: [], // ✅ Changed from '' to []
    content: '',
    error: null,
    completed: false,
  });

  const generateStream = useCallback(async (data: ItineraryRequest) => {
    setState({
      streaming: true,
      thoughts: [], // ✅ Changed from '' to []
      content: '',
      error: null,
      completed: false,
    });

    try {
      const response = await itineraryApi.generateStream(data);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No reader available');
      }

      let buffer = '';
      let currentContent = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonData = JSON.parse(line.slice(6));
              
              if (jsonData.type === 'thought') {
                // ✅ Add new thought to array instead of replacing
                setState(prev => ({
                  ...prev,
                  thoughts: [...prev.thoughts, jsonData.content],
                }));
              } else if (jsonData.type === 'content') {
                currentContent += jsonData.content;
                setState(prev => ({
                  ...prev,
                  content: currentContent,
                }));
              } else if (jsonData.type === 'error') {
                setState(prev => ({
                  ...prev,
                  streaming: false,
                  error: jsonData.content,
                }));
              } else if (jsonData.type === 'complete') {
                setState(prev => ({
                  ...prev,
                  streaming: false,
                  completed: true,
                }));
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }
      }

      // Mark as completed if not already done
      setState(prev => ({
        ...prev,
        streaming: false,
        completed: true,
      }));

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate itinerary';
      setState(prev => ({
        ...prev,
        streaming: false,
        error: message,
      }));
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      streaming: false,
      thoughts: [], // ✅ Changed from '' to []
      content: '',
      error: null,
      completed: false,
    });
  }, []);

  return {
    ...state,
    generateStream,
    reset,
  };
}

// Hook for managing individual itinerary (fetch, delete)
export function useItinerary() {
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getItinerary = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await itineraryApi.getById(id) as Itinerary;
      setItinerary(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch itinerary';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteItinerary = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await itineraryApi.delete(id);
      setItinerary(null);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete itinerary';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    itinerary,
    loading,
    error,
    getItinerary,
    deleteItinerary,
  };
}

// Hook for managing list of itineraries
export function useItineraries() {
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItineraries = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await itineraryApi.getAll() as Itinerary[];
      setItineraries(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch itineraries';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    itineraries,
    loading,
    error,
    fetchItineraries,
  };
}