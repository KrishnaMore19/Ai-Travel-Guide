// app/itinerary/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ItineraryForm from '@/components/ItineraryForm';
import StreamingDisplay from '@/components/StreamingDisplay';
import WeatherCard from '@/components/WeatherCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useItineraryStream } from '@/hooks/useItinerary';
import { ItineraryRequest } from '@/types/itinerary';
import { useToast } from '@/components/ui/toast';
import { ArrowLeft, Sparkles, Wand2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { itineraryApi } from '@/lib/api';

export default function ItineraryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { streaming, thoughts, content, error, completed, generateStream, reset } = useItineraryStream();
  const [showForm, setShowForm] = useState(true);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [currentDestination, setCurrentDestination] = useState<string>('');

  const fetchWeather = async (destination: string) => {
    setLoadingWeather(true);
    try {
      const weather = await itineraryApi.getWeather(destination);
      setWeatherData(weather);
    } catch (err) {
      console.error('Failed to fetch weather:', err);
      setWeatherData(null);
    } finally {
      setLoadingWeather(false);
    }
  };

  const handleSubmit = async (data: ItineraryRequest) => {
    setShowForm(false);
    reset();
    setCurrentDestination(data.destination);
    
    // Fetch weather for the destination
    fetchWeather(data.destination);
    
    try {
      await generateStream(data);
      
      if (!error) {
        toast({
          title: 'Success!',
          description: 'Your itinerary has been generated.',
          variant: 'success',
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to generate itinerary. Please try again.',
        variant: 'destructive',
      });
      setShowForm(true);
    }
  };

  const handleReset = () => {
    reset();
    setShowForm(true);
    setWeatherData(null);
    setCurrentDestination('');
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Header Section */}
      <section className="relative overflow-hidden border-b border-violet-500/20">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-fuchsia-500/10 to-cyan-500/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.2),rgba(0,0,0,0))]" />
        
        <div className="relative container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Button 
              asChild 
              variant="ghost" 
              className="mb-6 text-gray-400 hover:text-white hover:bg-violet-500/10"
            >
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/50">
                <Wand2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  Create Your <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">Itinerary</span>
                </h1>
                <p className="text-gray-400 text-lg">
                  Fill in your travel preferences and let AI create a personalized plan
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {showForm ? (
              <ItineraryForm onSubmit={handleSubmit} loading={streaming} />
            ) : (
              <div className="space-y-6">
                {/* Loading Card */}
                <Card className="bg-gradient-to-br from-violet-950/50 to-fuchsia-950/50 border-violet-500/20 backdrop-blur-sm">
                  <CardContent className="pt-8">
                    <div className="space-y-6 text-center">
                      {/* Loading Animation */}
                      <div className="flex justify-center">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 blur-2xl opacity-50 animate-pulse" />
                          <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/50 animate-pulse">
                            <Sparkles className="h-10 w-10 text-white" />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2">
                          Creating Your Perfect Trip
                        </h3>
                        <p className="text-gray-400">
                          Our AI is crafting a personalized itinerary just for you...
                        </p>
                      </div>

                      {/* Progress Indicators */}
                      {streaming && (
                        <div className="flex justify-center gap-2">
                          {[...Array(3)].map((_, i) => (
                            <div
                              key={i}
                              className="h-2 w-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                              style={{
                                animation: `pulse 1.5s ease-in-out ${i * 0.2}s infinite`,
                              }}
                            />
                          ))}
                        </div>
                      )}
                      
                      {(completed || error) && (
                        <Button 
                          onClick={handleReset}
                          className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white border-0 shadow-lg shadow-violet-500/30"
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Create Another Itinerary
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Weather Card */}
                {weatherData && !loadingWeather && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <WeatherCard weather={weatherData} />
                  </motion.div>
                )}

                {/* Loading Weather */}
                {loadingWeather && (
                  <Card className="bg-gradient-to-br from-cyan-950/50 to-blue-950/50 border-cyan-500/20 backdrop-blur-sm">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-center gap-3 py-8">
                        <div className="h-5 w-5 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
                        <p className="text-gray-400">Loading weather information...</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </motion.div>

          {/* Streaming Display */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <StreamingDisplay
              thoughts={thoughts}
              content={content}
              streaming={streaming}
              completed={completed}
            />
            
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="mt-4 bg-gradient-to-br from-red-950/50 to-red-900/50 border-red-500/30 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/30 mb-2">
                        <svg
                          className="h-8 w-8 text-red-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-red-400 mb-2">
                          Something went wrong
                        </h3>
                        <p className="text-red-300/80">{error}</p>
                      </div>
                      <Button 
                        onClick={handleReset}
                        className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-0 shadow-lg shadow-red-500/30"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Try Again
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}