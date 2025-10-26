// components/FilterBar.tsx
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Filter, X } from 'lucide-react';
import { SuggestionFilters } from '@/types/suggestion';

interface FilterBarProps {
  filters: SuggestionFilters;
  onFilterChange: (key: keyof SuggestionFilters, value: any) => void;
  onClearFilters: () => void;
  totalResults?: number;
}

const categories = [
  'adventure',
  'culture',
  'beach',
  'mountains',
  'city',
  'food',
  'nature',
  'romantic',
  'hiking',
  'luxury',
];

const budgets = [
  { value: 'budget', label: 'Budget' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'luxury', label: 'Luxury' },
];

const continents = [
  'Africa',
  'Asia',
  'Europe',
  'North America',
  'South America',
  'Oceania',
];

export default function FilterBar({
  filters,
  onFilterChange,
  onClearFilters,
  totalResults,
}: FilterBarProps) {
  const hasActiveFilters =
    filters.category ||
    filters.budget ||
    filters.continent ||
    filters.duration_min ||
    filters.duration_max;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Filters</h3>
              {totalResults !== undefined && (
                <Badge variant="secondary">{totalResults} results</Badge>
              )}
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-muted-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select
                value={filters.category || 'all'}
                onValueChange={(value) => onFilterChange('category', value === 'all' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Budget */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Budget</label>
              <Select
                value={filters.budget || 'all'}
                onValueChange={(value) => onFilterChange('budget', value === 'all' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Budgets" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Budgets</SelectItem>
                  {budgets.map((budget) => (
                    <SelectItem key={budget.value} value={budget.value}>
                      {budget.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Continent */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Continent</label>
              <Select
                value={filters.continent || 'all'}
                onValueChange={(value) => onFilterChange('continent', value === 'all' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Continents" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Continents</SelectItem>
                  {continents.map((continent) => (
                    <SelectItem key={continent} value={continent}>
                      {continent}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Duration (days)</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  min="1"
                  value={filters.duration_min || ''}
                  onChange={(e) =>
                    onFilterChange('duration_min', e.target.value ? parseInt(e.target.value) : undefined)
                  }
                />
                <Input
                  type="number"
                  placeholder="Max"
                  min="1"
                  value={filters.duration_max || ''}
                  onChange={(e) =>
                    onFilterChange('duration_max', e.target.value ? parseInt(e.target.value) : undefined)
                  }
                />
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <span className="text-sm text-muted-foreground">Active:</span>
              {filters.category && (
                <Badge variant="secondary" className="gap-1">
                  {filters.category}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => onFilterChange('category', undefined)}
                  />
                </Badge>
              )}
              {filters.budget && (
                <Badge variant="secondary" className="gap-1">
                  {filters.budget}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => onFilterChange('budget', undefined)}
                  />
                </Badge>
              )}
              {filters.continent && (
                <Badge variant="secondary" className="gap-1">
                  {filters.continent}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => onFilterChange('continent', undefined)}
                  />
                </Badge>
              )}
              {(filters.duration_min || filters.duration_max) && (
                <Badge variant="secondary" className="gap-1">
                  {filters.duration_min || 0}-{filters.duration_max || '∞'} days
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => {
                      onFilterChange('duration_min', undefined);
                      onFilterChange('duration_max', undefined);
                    }}
                  />
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}