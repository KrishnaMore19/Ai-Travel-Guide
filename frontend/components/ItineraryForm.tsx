// components/ItineraryForm.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Users, DollarSign, Heart, X } from 'lucide-react';
import { ItineraryRequest } from '@/types/itinerary';

interface ItineraryFormProps {
  onSubmit: (data: ItineraryRequest) => void;
  loading?: boolean;
}

const interestsOptions = [
  'Culture', 'Food', 'Adventure', 'Beach', 'Nature',
  'History', 'Shopping', 'Nightlife', 'Photography', 'Museums'
];

const budgetOptions = [
  { value: 'low', label: 'Budget ($)' },
  { value: 'moderate', label: 'Moderate ($$)' },
  { value: 'high', label: 'Premium ($$$)' },
  { value: 'luxury', label: 'Luxury ($$$$)' },
];

export default function ItineraryForm({ onSubmit, loading }: ItineraryFormProps) {
  const [formData, setFormData] = useState<ItineraryRequest>({
    destination: '',
    days: 5,
    interests: [],
    budget: 'moderate',
    travelers: 2,
    start_date: '',
    additional_preferences: '',
  });

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests(prev => {
      if (prev.includes(interest)) {
        return prev.filter(i => i !== interest);
      }
      return [...prev, interest];
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      interests: selectedInterests.length > 0 ? selectedInterests : ['sightseeing'],
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Plan Your Perfect Trip</CardTitle>
        <CardDescription>
          Tell us about your travel preferences and let AI create a personalized itinerary
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Destination */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Destination
            </label>
            <Input
              placeholder="e.g., Paris, France"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              required
            />
          </div>

          {/* Days & Travelers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Number of Days
              </label>
              <Input
                type="number"
                min="1"
                max="30"
                value={formData.days || ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? '' : parseInt(e.target.value);
                  if (value === '' || (value >= 1 && value <= 30)) {
                    setFormData({ ...formData, days: value as number });
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value === '' || parseInt(e.target.value) < 1) {
                    alert('Number of days must be at least 1');
                    setFormData({ ...formData, days: 1 });
                  }
                }}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Number of Travelers
              </label>
              <Input
                type="number"
                min="1"
                max="20"
                value={formData.travelers || ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? '' : parseInt(e.target.value);
                  if (value === '' || (value >= 1 && value <= 20)) {
                    setFormData({ ...formData, travelers: value as number });
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value === '' || parseInt(e.target.value) < 1) {
                    alert('Number of travelers must be at least 1');
                    setFormData({ ...formData, travelers: 1 });
                  }
                }}
                required
              />
            </div>
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Budget Level
            </label>
            <Select
              value={formData.budget}
              onValueChange={(value: any) => setFormData({ ...formData, budget: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {budgetOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Interests */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" />
              Interests (Select at least one)
            </label>
            <div className="flex flex-wrap gap-2">
              {interestsOptions.map((interest) => {
                const isSelected = selectedInterests.includes(interest);
                return (
                  <Badge
                    key={interest}
                    variant={isSelected ? 'default' : 'outline'}
                    className="cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => handleInterestToggle(interest)}
                  >
                    {interest}
                    {isSelected && <X className="ml-1 h-3 w-3" />}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Start Date (Optional) */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Start Date (Optional)
            </label>
            <Input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            />
          </div>

          {/* Additional Preferences */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Additional Preferences (Optional)
            </label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="e.g., Prefer walking tours, avoid spicy food, interested in local markets..."
              value={formData.additional_preferences}
              onChange={(e) => setFormData({ ...formData, additional_preferences: e.target.value })}
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={loading || !formData.destination}
          >
            {loading ? 'Generating Your Itinerary...' : 'Generate Itinerary ✨'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}