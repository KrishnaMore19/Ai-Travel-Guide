// app/suggestions/[id]/page.tsx
'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSuggestion } from '@/hooks/useSuggestions';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  DollarSign, 
  Star,
  Calendar,
  Sparkles,
  Lightbulb,
  TrendingUp
} from 'lucide-react';
import { getBudgetLabel, getBudgetColor, getCategoryIcon, formatDuration } from '@/lib/utils';

export default function SuggestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { suggestion, loading, error, fetchSuggestion } = useSuggestion();

  useEffect(() => {
    if (params.id) {
      fetchSuggestion(params.id as string);
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="space-y-6">
            <div className="h-10 w-32 bg-muted animate-shimmer rounded" />
            <div className="h-64 bg-muted animate-shimmer rounded" />
            <div className="h-96 bg-muted animate-shimmer rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !suggestion) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <Card className="border-destructive">
            <CardContent className="pt-6 text-center">
              <p className="text-destructive mb-4">
                {error || 'Destination not found'}
              </p>
              <Button asChild>
                <Link href="/suggestions">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Suggestions
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/suggestions">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Suggestions
            </Link>
          </Button>
        </div>

        {/* Hero Section */}
        <div className="relative h-96 rounded-2xl overflow-hidden mb-8 bg-gradient-to-br from-primary/20 via-purple-500/20 to-pink-500/20">
          <div className="absolute inset-0 bg-black/20" />
          
          <div className="absolute inset-0 flex flex-col justify-end p-8">
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="secondary" className="backdrop-blur-sm bg-white/90">
                {suggestion.continent}
              </Badge>
              {suggestion.rating && (
                <Badge variant="default" className="backdrop-blur-sm gap-1">
                  <Star className="h-3 w-3 fill-current" />
                  {suggestion.rating}
                </Badge>
              )}
              <Badge className={`${getBudgetColor(suggestion.budget)} backdrop-blur-sm`}>
                {getBudgetLabel(suggestion.budget)}
              </Badge>
            </div>
            
            <h1 className="text-5xl font-bold text-white drop-shadow-lg mb-2">
              {suggestion.destination}
            </h1>
            <p className="text-2xl text-white/90 drop-shadow-lg mb-2">
              {suggestion.country}
            </p>
            <p className="text-xl text-white/80 drop-shadow-lg">
              {suggestion.title}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About This Destination</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {suggestion.description}
                </p>
              </CardContent>
            </Card>

            {/* Highlights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                  Highlights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {suggestion.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <span className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span className="text-sm">{highlight}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Popular Activities */}
            {suggestion.popular_activities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Popular Activities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {suggestion.popular_activities.map((activity, index) => (
                      <Badge key={index} variant="outline">
                        {activity}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Travel Tips */}
            {suggestion.travel_tips.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    Travel Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {suggestion.travel_tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Trip Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-semibold">{suggestion.duration}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Estimated Cost</p>
                    <p className="font-semibold">{suggestion.estimated_cost}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Best Time</p>
                    <p className="font-semibold text-sm">{suggestion.best_time_to_visit}</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Best Months</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestion.best_months.map((month) => (
                      <Badge key={month} variant="secondary" className="text-xs">
                        {month}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Categories</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestion.category.map((cat) => (
                      <Badge key={cat} variant="outline" className="text-xs">
                        {getCategoryIcon(cat)} {cat}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button asChild className="w-full mt-6" size="lg">
                  <Link href="/itinerary">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Plan This Trip
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}