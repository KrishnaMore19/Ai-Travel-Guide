// hooks/useSuggestions.ts
'use client';

import { useState, useCallback } from 'react';
import { suggestionsApi } from '@/lib/api';
import { SuggestedTrip, SuggestionsResponse, SuggestionFilters } from '../types/suggestion';

export function useSuggestions() {
  const [suggestions, setSuggestions] = useState<SuggestedTrip[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = useCallback(async (filters?: SuggestionFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const result: SuggestionsResponse = await suggestionsApi.getAll(filters);
      setSuggestions(result.suggestions);
      setTotal(result.total);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch suggestions';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFeatured = useCallback(async (limit = 6) => {
    setLoading(true);
    setError(null);
    
    try {
      const result: SuggestedTrip[] = await suggestionsApi.getFeatured(limit);
      setSuggestions(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch featured suggestions';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    suggestions,
    total,
    loading,
    error,
    fetchSuggestions,
    fetchFeatured,
  };
}

export function useSuggestion() {
  const [suggestion, setSuggestion] = useState<SuggestedTrip | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestion = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await suggestionsApi.getById(id);
      setSuggestion(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch suggestion';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    suggestion,
    loading,
    error,
    fetchSuggestion,
  };
}

// Hook for managing suggestion filters
export function useSuggestionFilters() {
  const [filters, setFilters] = useState<SuggestionFilters>({
    limit: 12,
    skip: 0,
  });

  const updateFilter = (key: keyof SuggestionFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      skip: 0, // Reset pagination when filter changes
    }));
  };

  const updateFilters = (newFilters: Partial<SuggestionFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      skip: 0,
    }));
  };

  const clearFilters = () => {
    setFilters({
      limit: 12,
      skip: 0,
    });
  };

  const nextPage = () => {
    setFilters(prev => ({
      ...prev,
      skip: (prev.skip || 0) + (prev.limit || 12),
    }));
  };

  const prevPage = () => {
    setFilters(prev => ({
      ...prev,
      skip: Math.max(0, (prev.skip || 0) - (prev.limit || 12)),
    }));
  };

  return {
    filters,
    updateFilter,
    updateFilters,
    clearFilters,
    nextPage,
    prevPage,
  };
}