// components/WeatherCard.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  Sun, 
  Wind, 
  Droplets, 
  Eye,
  Thermometer
} from 'lucide-react';
import { WeatherInfo } from '@/types/itinerary';
import { motion } from 'framer-motion';

interface WeatherCardProps {
  weather: WeatherInfo;
  compact?: boolean;
}

export default function WeatherCard({ weather, compact = false }: WeatherCardProps) {
  // Get weather icon based on description
  const getWeatherIcon = () => {
    const desc = weather.description.toLowerCase();
    if (desc.includes('rain')) return <CloudRain className="h-8 w-8 text-cyan-400" />;
    if (desc.includes('snow')) return <CloudSnow className="h-8 w-8 text-blue-300" />;
    if (desc.includes('cloud')) return <Cloud className="h-8 w-8 text-gray-400" />;
    return <Sun className="h-8 w-8 text-yellow-400" />;
  };

  // Get temperature color
  const getTempColor = (temp: number) => {
    if (temp < 0) return 'text-blue-400';
    if (temp < 15) return 'text-cyan-400';
    if (temp < 25) return 'text-green-400';
    if (temp < 35) return 'text-orange-400';
    return 'text-red-400';
  };

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-cyan-950/50 to-blue-950/50 border-cyan-500/20 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getWeatherIcon()}
                <div>
                  <p className="text-sm text-gray-400">
                    {weather.city}, {weather.country}
                  </p>
                  <p className={`text-2xl font-bold ${getTempColor(weather.temperature)}`}>
                    {weather.temperature}°C
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium capitalize text-white">{weather.description}</p>
                <p className="text-xs text-gray-400">
                  Feels like {weather.feels_like}°C
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-cyan-950/50 via-blue-950/50 to-cyan-900/50 border-cyan-500/20 backdrop-blur-sm hover:border-cyan-500/40 transition-all duration-300 group">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-white">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/50 group-hover:scale-110 transition-transform duration-300">
                <Thermometer className="h-5 w-5 text-white" />
              </div>
              Current Weather
            </span>
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
              {weather.city}, {weather.country}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Weather */}
          <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-cyan-500/20">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/30">
                {getWeatherIcon()}
              </div>
              <div>
                <p className={`text-5xl font-bold ${getTempColor(weather.temperature)}`}>
                  {weather.temperature}°C
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Feels like {weather.feels_like}°C
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-medium capitalize text-white mb-1">{weather.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <span className="text-red-400">↑</span> {weather.temp_max}°C
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-blue-400">↓</span> {weather.temp_min}°C
                </span>
              </div>
            </div>
          </div>

          {/* Weather Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Humidity */}
            <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-950/50 to-cyan-950/50 rounded-xl border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300">
              <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Droplets className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Humidity</p>
                <p className="text-lg font-semibold text-white">{weather.humidity}%</p>
              </div>
            </div>

            {/* Wind Speed */}
            <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-cyan-950/50 to-blue-950/50 rounded-xl border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300">
              <div className="h-10 w-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <Wind className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Wind</p>
                <p className="text-lg font-semibold text-white">{weather.wind_speed} m/s</p>
              </div>
            </div>

            {/* Visibility */}
            <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-950/50 to-blue-950/50 rounded-xl border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300">
              <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Eye className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Visibility</p>
                <p className="text-lg font-semibold text-white">{weather.visibility} km</p>
              </div>
            </div>

            {/* Clouds */}
            <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-gray-950/50 to-blue-950/50 rounded-xl border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300">
              <div className="h-10 w-10 rounded-lg bg-gray-500/20 flex items-center justify-center">
                <Cloud className="h-5 w-5 text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Clouds</p>
                <p className="text-lg font-semibold text-white">{weather.clouds}%</p>
              </div>
            </div>
          </div>

          {/* Timestamp */}
          <div className="flex items-center justify-center pt-4 border-t border-cyan-500/20">
            <p className="text-xs text-gray-500">
              Updated: {new Date(weather.timestamp).toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}