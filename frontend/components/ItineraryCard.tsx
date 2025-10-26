// components/ItineraryCard.tsx
'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Trash2, Eye, Clock, FileText } from 'lucide-react';
import { Itinerary } from '@/types/itinerary';
import { formatDate } from '@/lib/utils';

interface ItineraryCardProps {
  itinerary: Itinerary;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

export default function ItineraryCard({ 
  itinerary, 
  onDelete,
  showActions = true 
}: ItineraryCardProps) {
  return (
    <Card className="group h-full bg-gradient-to-br from-violet-950/50 to-fuchsia-950/50 border-violet-500/20 hover:border-violet-500/40 transition-all duration-300 backdrop-blur-sm hover:shadow-2xl hover:shadow-violet-500/20 overflow-hidden">
      <CardContent className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-5 w-5 text-violet-400" />
              <h3 className="text-xl font-bold text-white line-clamp-1 group-hover:text-violet-400 transition-colors">
                {itinerary.destination}
              </h3>
            </div>
            <p className="text-sm text-gray-400 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Created {formatDate(itinerary.created_at)}
            </p>
          </div>
          <div className="flex-shrink-0">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/50 group-hover:scale-110 transition-transform duration-300">
              <FileText className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-violet-500/20">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-fuchsia-400" />
            <div>
              <p className="text-xs text-gray-500">Duration</p>
              <p className="text-sm font-semibold text-white">{itinerary.days} days</p>
            </div>
          </div>
          
          {itinerary.budget_estimate && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Budget</p>
              <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-xs">
                {itinerary.budget_estimate}
              </Badge>
            </div>
          )}
        </div>

        {/* Interests */}
        {itinerary.interests && itinerary.interests.length > 0 && (
          <div className="pt-2">
            <p className="text-xs text-gray-500 mb-2">Interests</p>
            <div className="flex flex-wrap gap-1.5">
              {itinerary.interests.slice(0, 3).map((interest) => (
                <Badge 
                  key={interest} 
                  variant="outline" 
                  className="text-xs border-violet-500/30 text-gray-400"
                >
                  {interest}
                </Badge>
              ))}
              {itinerary.interests.length > 3 && (
                <Badge variant="outline" className="text-xs border-violet-500/30 text-gray-400">
                  +{itinerary.interests.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Weather Info Preview */}
        {itinerary.weather_info && (
          <div className="flex items-center justify-between p-3 bg-violet-500/10 rounded-lg border border-violet-500/20">
            <span className="text-xs text-gray-400">Current Weather</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">
                {itinerary.weather_info.temperature}°C
              </span>
              <span className="text-xs text-gray-400 capitalize">
                {itinerary.weather_info.description}
              </span>
            </div>
          </div>
        )}

        {/* Content Preview */}
        <p className="text-sm text-gray-400 line-clamp-2 pt-2 border-t border-violet-500/20">
          {itinerary.content.substring(0, 120)}...
        </p>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 pt-3 border-t border-violet-500/20">
            <Link href={`/itinerary/${itinerary._id}`} className="flex-1">
              <Button 
                className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white border-0"
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Button>
            </Link>
            {onDelete && itinerary._id && (
              <Button
                variant="outline"
                size="icon"
                onClick={(e) => {
                  e.preventDefault();
                  if (confirm('Are you sure you want to delete this itinerary?')) {
                    onDelete(itinerary._id!);
                  }
                }}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}