// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import SuggestionCard from '@/components/SuggestionCard';
import { Sparkles, Map, Brain, TrendingUp, ArrowRight, Compass, Globe, Heart, Zap, Users, Mail, Phone, MapPin, Send } from 'lucide-react';
import { useSuggestions } from '@/hooks/useSuggestions';
import { useToast } from '@/components/ui/toast';
import { motion } from 'framer-motion';

export default function HomePage() {
  const { suggestions, loading, fetchFeatured, fetchSuggestions } = useSuggestions();
  const { toast } = useToast();
  const [showingFallback, setShowingFallback] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [contactLoading, setContactLoading] = useState(false);

  useEffect(() => {
    const loadSuggestions = async () => {
      await fetchFeatured(6);
    };
    
    loadSuggestions();
  }, []);

  useEffect(() => {
    if (!loading && suggestions.length === 0 && !showingFallback) {
      setShowingFallback(true);
      fetchSuggestions({ limit: 6, skip: 0 });
    }
  }, [loading, suggestions.length, showingFallback]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactLoading(true);

    setTimeout(() => {
      toast({
        title: 'Message Sent!',
        description: 'Thank you for contacting us. We\'ll get back to you soon.',
        variant: 'success',
      });
      setContactForm({ name: '', email: '', subject: '', message: '' });
      setContactLoading(false);
    }, 1500);
  };

  const aboutFeatures = [
    {
      icon: Brain,
      title: 'AI-Powered Intelligence',
      description: 'Advanced AI algorithms analyze millions of travel data points to create the perfect itinerary.',
      color: 'from-violet-500 to-violet-600',
    },
    {
      icon: Globe,
      title: 'Global Coverage',
      description: 'Explore destinations worldwide with comprehensive information about attractions and activities.',
      color: 'from-cyan-500 to-cyan-600',
    },
    {
      icon: Heart,
      title: 'Personalized Experience',
      description: 'Every itinerary is unique, crafted based on your interests, budget, and travel style.',
      color: 'from-fuchsia-500 to-fuchsia-600',
    },
    {
      icon: Zap,
      title: 'Instant Planning',
      description: 'Generate comprehensive travel plans in minutes. Save time and start exploring sooner.',
      color: 'from-yellow-500 to-yellow-600',
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Benefit from insights from thousands of travelers who have explored these destinations.',
      color: 'from-green-500 to-green-600',
    },
    {
      icon: Sparkles,
      title: 'Continuous Innovation',
      description: 'We constantly update our AI models with the latest travel trends and data.',
      color: 'from-pink-500 to-pink-600',
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section with Gradient */}
      <section className="relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-fuchsia-500/20 to-cyan-500/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(0,0,0,0))]" />
        
        <div className="relative container mx-auto px-4 py-24 md:py-36">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl mx-auto text-center space-y-8"
          >
            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 backdrop-blur-sm"
            >
              <Sparkles className="h-4 w-4 text-violet-400" />
              <span className="text-sm text-violet-300 font-medium">Powered by Advanced AI</span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                Your AI Travel
              </span>
              <br />
              <span className="text-white">Companion</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Create personalized itineraries powered by AI. Discover amazing destinations
              and plan your perfect trip in <span className="text-violet-400 font-semibold">minutes</span>.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button 
                asChild 
                size="lg" 
                className="text-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 border-0 shadow-lg shadow-violet-500/50"
              >
                <Link href="/itinerary">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Create Itinerary
                </Link>
              </Button>
              <Button 
                asChild 
                size="lg" 
                variant="outline" 
                className="text-lg border-violet-500/30 bg-black/40 backdrop-blur-sm hover:bg-violet-500/10 text-white"
              >
                <Link href="/suggestions">
                  <Compass className="mr-2 h-5 w-5" />
                  Explore Destinations
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
      </section>

      {/* Features Section */}
      <section className="py-24 md:py-32 bg-black relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Why Choose <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">AI Travel Guide</span>?
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Powerful features to make your travel planning effortless
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-gradient-to-br from-violet-950/50 to-black border-violet-500/20 hover:border-violet-500/40 transition-all duration-300 backdrop-blur-sm group hover:shadow-2xl hover:shadow-violet-500/20">
                <CardHeader>
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-violet-500/50">
                    <Brain className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-white text-2xl">AI-Powered Planning</CardTitle>
                  <CardDescription className="text-gray-400 text-base">
                    Advanced AI creates personalized itineraries based on your preferences,
                    budget, and interests.
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-gradient-to-br from-fuchsia-950/50 to-black border-fuchsia-500/20 hover:border-fuchsia-500/40 transition-all duration-300 backdrop-blur-sm group hover:shadow-2xl hover:shadow-fuchsia-500/20">
                <CardHeader>
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-fuchsia-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-fuchsia-500/50">
                    <Map className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-white text-2xl">Curated Destinations</CardTitle>
                  <CardDescription className="text-gray-400 text-base">
                    Explore handpicked destinations with detailed information about
                    highlights, activities, and best times to visit.
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-gradient-to-br from-cyan-950/50 to-black border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 backdrop-blur-sm group hover:shadow-2xl hover:shadow-cyan-500/20">
                <CardHeader>
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-cyan-500/50">
                    <TrendingUp className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-white text-2xl">Real-Time Weather</CardTitle>
                  <CardDescription className="text-gray-400 text-base">
                    Get current weather information and forecasts for your destination
                    to plan your trip better.
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 md:py-32 bg-gradient-to-b from-black via-violet-950/10 to-black relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-violet-500/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 backdrop-blur-sm mb-6">
              <Sparkles className="h-4 w-4 text-violet-400" />
              <span className="text-sm text-violet-300 font-medium">About Us</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Revolutionizing <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Travel Planning</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto">
              We combine the power of artificial intelligence with deep travel expertise to help you create unforgettable journeys around the world
            </p>
          </motion.div>

          {/* Mission Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto mb-16"
          >
            <Card className="bg-gradient-to-br from-violet-950/50 to-fuchsia-950/50 border-violet-500/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-3xl text-center text-white">Our Mission</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-lg text-gray-300 leading-relaxed">
                  At AI Travel Guide, we believe everyone deserves to experience the world without the hassle of complex planning. Our mission is to democratize travel planning by making it accessible, personalized, and effortless.
                </p>
                <p className="text-lg text-gray-300 leading-relaxed">
                  We leverage cutting-edge AI technology to understand your unique preferences and transform them into perfectly crafted itineraries.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto mb-16">
            {aboutFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full bg-gradient-to-br from-violet-950/30 to-black border-violet-500/20 hover:border-violet-500/40 transition-all duration-300 backdrop-blur-sm group">
                    <CardHeader>
                      <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-white text-lg mb-2">{feature.title}</CardTitle>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </CardHeader>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { number: '10K+', label: 'Itineraries Created' },
              { number: '150+', label: 'Countries Covered' },
              { number: '5K+', label: 'Happy Travelers' },
              { number: '4.9/5', label: 'User Rating' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-400 text-sm md:text-base">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="py-24 md:py-32 bg-black">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-16"
          >
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-3 text-white">
                {showingFallback ? (
                  <>Popular <span className="bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">Destinations</span></>
                ) : (
                  <>Featured <span className="bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">Destinations</span></>
                )}
              </h2>
              <p className="text-gray-400 text-lg">
                {showingFallback ? 'Discover amazing places to visit' : 'Popular trips curated just for you'}
              </p>
            </div>
            <Button 
              asChild 
              variant="ghost" 
              className="hidden md:flex items-center text-violet-400 hover:text-violet-300 hover:bg-violet-500/10"
            >
              <Link href="/suggestions">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div 
                  key={i} 
                  className="h-[500px] rounded-2xl bg-gradient-to-br from-violet-950/30 to-fuchsia-950/30 animate-pulse border border-violet-500/10" 
                />
              ))}
            </div>
          ) : suggestions.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {suggestions.map((suggestion, index) => (
                <motion.div
                  key={suggestion._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <SuggestionCard suggestion={suggestion} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 mb-4">
                <Map className="h-8 w-8 text-violet-400" />
              </div>
              <p className="text-gray-400 text-lg mb-6">
                No featured destinations available at the moment
              </p>
              <Button 
                asChild 
                variant="outline"
                className="border-violet-500/30 bg-black/40 backdrop-blur-sm hover:bg-violet-500/10 text-white"
              >
                <Link href="/suggestions">
                  Browse All Destinations
                </Link>
              </Button>
            </div>
          )}

          <div className="mt-12 text-center md:hidden">
            <Button 
              asChild
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700"
            >
              <Link href="/suggestions">
                View All Destinations
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 md:py-32 bg-gradient-to-b from-black via-violet-950/10 to-black relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-fuchsia-500/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-fuchsia-500/10 to-cyan-500/10 border border-fuchsia-500/20 backdrop-blur-sm mb-6">
              <Mail className="h-4 w-4 text-fuchsia-400" />
              <span className="text-sm text-fuchsia-300 font-medium">Get in Touch</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Contact <span className="bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">Our Team</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Have questions or feedback? We'd love to hear from you
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              <Card className="bg-gradient-to-br from-violet-950/50 to-fuchsia-950/50 border-violet-500/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl text-white">Send us a Message</CardTitle>
                  <CardDescription className="text-gray-400">
                    Fill out the form and we'll get back to you within 24 hours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Full Name</label>
                        <Input
                          placeholder="John Doe"
                          value={contactForm.name}
                          onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                          required
                          className="bg-black/50 border-violet-500/30 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Email</label>
                        <Input
                          type="email"
                          placeholder="john@example.com"
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                          required
                          className="bg-black/50 border-violet-500/30 text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">Subject</label>
                      <Input
                        placeholder="How can we help?"
                        value={contactForm.subject}
                        onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                        required
                        className="bg-black/50 border-violet-500/30 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">Message</label>
                      <textarea
                        placeholder="Tell us more..."
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        required
                        rows={4}
                        className="flex w-full rounded-md border border-violet-500/30 bg-black/50 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={contactLoading}
                      className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700"
                    >
                      {contactLoading ? 'Sending...' : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <Card className="bg-gradient-to-br from-cyan-950/50 to-cyan-900/50 border-cyan-500/20 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-lg">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Email</h3>
                      <a href="mailto:krishna.more8200@gmail.com" className="text-cyan-400 text-sm">
                        krishna.more8200@gmail.com
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-fuchsia-950/50 to-fuchsia-900/50 border-fuchsia-500/20 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-fuchsia-500 to-fuchsia-600 flex items-center justify-center shadow-lg">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Phone</h3>
                      <a href="tel:+919876543210" className="text-fuchsia-400 text-sm">
                        +91 98765 43210
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-violet-950/50 to-violet-900/50 border-violet-500/20 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Location</h3>
                      <p className="text-violet-400 text-sm">
                        Ahemdabad, Gujarat<br />India
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-cyan-600" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center space-y-8"
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight">
              Ready to Plan Your Next
              <br />
              <span className="inline-block mt-2">Adventure?</span>
            </h2>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
              Let AI create a personalized itinerary tailored to your preferences
            </p>
            <Button 
              asChild 
              size="lg" 
              className="text-lg bg-black hover:bg-black/80 text-white shadow-2xl shadow-black/50"
            >
              <Link href="/itinerary">
                <Sparkles className="mr-2 h-5 w-5" />
                Start Planning Now
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}