// components/SuggestionCard.tsx
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, DollarSign, Star, Calendar, ArrowRight } from 'lucide-react';
import { SuggestedTrip } from '@/types/suggestion';
import { getBudgetLabel, getBudgetColor, getCategoryIcon, truncateText } from '@/lib/utils';
import Link from 'next/link';

interface SuggestionCardProps {
  suggestion: SuggestedTrip;
}

export default function SuggestionCard({ suggestion }: SuggestionCardProps) {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col">
      {/* Image Placeholder with Gradient */}
      <div className="relative h-48 bg-gradient-to-br from-primary/20 via-purple-500/20 to-pink-500/20 overflow-hidden">
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
        
        {/* Destination Overlay */}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
          <Badge variant="secondary" className="backdrop-blur-sm bg-white/90">
            {suggestion.continent || 'World'}
          </Badge>
          {suggestion.rating && (
            <Badge variant="default" className="backdrop-blur-sm gap-1">
              <Star className="h-3 w-3 fill-current" />
              {suggestion.rating}
            </Badge>
          )}
        </div>

        {/* Country Badge */}
        <div className="absolute bottom-4 left-4">
          <div className="flex items-center gap-2 text-white font-semibold text-lg drop-shadow-lg">
            <MapPin className="h-5 w-5" />
            {suggestion.destination}
          </div>
          <p className="text-white/90 text-sm mt-1">{suggestion.country}</p>
        </div>
      </div>

      <CardHeader className="flex-none">
        <CardTitle className="line-clamp-1">{suggestion.title}</CardTitle>
        <CardDescription className="line-clamp-2">
          {truncateText(suggestion.description, 100)}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 flex-grow">
        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{suggestion.duration}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span>{suggestion.estimated_cost}</span>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {suggestion.category.slice(0, 3).map((cat) => (
            <Badge key={cat} variant="outline" className="text-xs">
              {getCategoryIcon(cat)} {cat}
            </Badge>
          ))}
          {suggestion.category.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{suggestion.category.length - 3}
            </Badge>
          )}
        </div>

        {/* Budget Badge */}
        <Badge className={getBudgetColor(suggestion.budget)}>
          {getBudgetLabel(suggestion.budget)}
        </Badge>

        {/* Best Time */}
        <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
          <Calendar className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-foreground mb-1">Best Time to Visit</p>
            <p>{suggestion.best_time_to_visit}</p>
          </div>
        </div>

        {/* Highlights */}
        {suggestion.highlights.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Highlights:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              {suggestion.highlights.slice(0, 3).map((highlight, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex-none">
        <Button asChild className="w-full group/btn">
          <Link href={`/suggestions/${suggestion._id}`}>
            Explore This Trip
            <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}