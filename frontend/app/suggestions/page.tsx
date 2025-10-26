// app/suggestions/page.tsx
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import SuggestionCard from '@/components/SuggestionCard';
import FilterBar from '@/components/FilterBar';
import { useSuggestions } from '@/hooks/useSuggestions';
import { useSuggestionFilters } from '@/hooks/useSuggestions';
import { ArrowLeft, ChevronLeft, ChevronRight, Map, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SuggestionsPage() {
  const { suggestions, total, loading, fetchSuggestions } = useSuggestions();
  const { filters, updateFilter, updateFilters, clearFilters, nextPage, prevPage } = useSuggestionFilters();

  useEffect(() => {
    fetchSuggestions(filters);
  }, [filters, fetchSuggestions]);

  const currentPage = Math.floor((filters.skip || 0) / (filters.limit || 12)) + 1;
  const totalPages = Math.ceil(total / (filters.limit || 12));

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
                <Map className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  Explore <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">Destinations</span>
                </h1>
                <p className="text-gray-400 text-lg">
                  Discover amazing places and plan your next adventure
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <FilterBar
            filters={filters}
            onFilterChange={updateFilter}
            onClearFilters={clearFilters}
            totalResults={total}
          />
        </motion.div>

        {/* Suggestions Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="h-[500px] rounded-2xl bg-gradient-to-br from-violet-950/30 to-fuchsia-950/30 animate-pulse border border-violet-500/10"
              />
            ))}
          </div>
        ) : suggestions.length > 0 ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {suggestions.map((suggestion, index) => (
                <motion.div
                  key={suggestion._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <SuggestionCard suggestion={suggestion} />
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-center gap-4 mt-12"
              >
                <Button
                  variant="outline"
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className="border-violet-500/30 bg-black/40 backdrop-blur-sm hover:bg-violet-500/10 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <div className="px-6 py-2 rounded-full bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30">
                  <span className="text-sm text-white font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                </div>
                <Button
                  variant="outline"
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className="border-violet-500/30 bg-black/40 backdrop-blur-sm hover:bg-violet-500/10 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </motion.div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 mb-6 border border-violet-500/30">
              <Map className="h-10 w-10 text-violet-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              No destinations found
            </h3>
            <p className="text-gray-400 text-lg mb-6">
              Try adjusting your filters to see more results
            </p>
            <Button 
              onClick={clearFilters} 
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white border-0 shadow-lg shadow-violet-500/30"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}