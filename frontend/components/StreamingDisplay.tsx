// components/StreamingDisplay.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface StreamingDisplayProps {
  thoughts: string[];
  content: string;
  streaming: boolean;
  completed: boolean;
}

export default function StreamingDisplay({
  thoughts,
  content,
  streaming,
  completed,
}: StreamingDisplayProps) {
  return (
    <div className="space-y-6">
      {/* Chain of Thought */}
      {thoughts.length > 0 && (
        <Card className="bg-gradient-to-br from-violet-950/50 to-fuchsia-950/50 border-violet-500/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-white">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/50">
                <Brain className="h-5 w-5 text-white animate-pulse" />
              </div>
              AI Thinking Process
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <AnimatePresence>
              {thoughts.map((thought, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-start gap-3 p-3 bg-violet-500/10 rounded-lg border border-violet-500/20"
                >
                  <div className="mt-0.5">
                    {index === thoughts.length - 1 && streaming ? (
                      <Sparkles className="h-4 w-4 text-violet-400 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                    )}
                  </div>
                  <p className="text-sm flex-1 text-gray-300">{thought}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </CardContent>
        </Card>
      )}

      {/* Streaming Content */}
      {content && (
        <Card className="bg-gradient-to-br from-violet-950/50 to-fuchsia-950/50 border-violet-500/20 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-white">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-fuchsia-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-fuchsia-500/50">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                Your Personalized Itinerary
              </CardTitle>
              {completed && (
                <Badge className="gap-1 bg-green-500/20 text-green-400 border-green-500/30">
                  <CheckCircle2 className="h-3 w-3" />
                  Complete
                </Badge>
              )}
              {streaming && (
                <Badge className="gap-1 animate-pulse bg-violet-500/20 text-violet-400 border-violet-500/30">
                  <Sparkles className="h-3 w-3" />
                  Generating...
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="prose prose-invert prose-sm max-w-none
                prose-headings:text-white 
                prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-4 prose-h1:bg-gradient-to-r prose-h1:from-violet-400 prose-h1:to-fuchsia-400 prose-h1:bg-clip-text prose-h1:text-transparent
                prose-h2:text-2xl prose-h2:font-bold prose-h2:text-white prose-h2:mt-8 prose-h2:mb-4 prose-h2:border-b prose-h2:border-violet-500/30 prose-h2:pb-2
                prose-h3:text-xl prose-h3:font-semibold prose-h3:text-cyan-400 prose-h3:mt-6 prose-h3:mb-3
                prose-h4:text-lg prose-h4:font-semibold prose-h4:text-violet-400 prose-h4:mt-4 prose-h4:mb-2
                prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-4
                prose-strong:text-white prose-strong:font-semibold
                prose-ul:text-gray-300 prose-ul:space-y-2
                prose-ol:text-gray-300 prose-ol:space-y-2
                prose-li:text-gray-300
                prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:text-cyan-300
                prose-code:text-fuchsia-400 prose-code:bg-violet-500/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                prose-blockquote:border-l-violet-500 prose-blockquote:text-gray-400 prose-blockquote:italic
                prose-hr:border-violet-500/30
              "
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>

              {/* Typing indicator */}
              {streaming && (
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="inline-block w-2 h-4 bg-violet-500 ml-1 rounded"
                />
              )}
            </motion.div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!streaming && !content && thoughts.length === 0 && (
        <Card className="border-dashed border-violet-500/30 bg-gradient-to-br from-violet-950/30 to-fuchsia-950/30 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center mb-4 border border-violet-500/30">
              <Brain className="h-8 w-8 text-violet-400" />
            </div>
            <p className="text-gray-400 text-lg">
              Your AI-generated itinerary will appear here
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Fill in your preferences and let AI create your perfect trip
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}