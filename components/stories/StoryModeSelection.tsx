'use client';

import { motion } from 'framer-motion';
import {
  Wand2,
  PenTool,
  ArrowRight,
  Sparkles,
  Users,
  BookOpen,
} from 'lucide-react';

interface StoryModeSelectionProps {
  onModeSelect: (mode: 'guided' | 'freeform') => void;
}

export default function StoryModeSelection({
  onModeSelect,
}: StoryModeSelectionProps) {
  const handleGuidedClick = () => {
    console.log('Guided mode clicked');
    onModeSelect('guided');
  };

  const handleFreeformClick = () => {
    console.log('Freeform mode clicked');
    onModeSelect('freeform');
  };

  return (
    <div className="max-w-6xl mx-auto px-6 ">
      <div className="text-center mb-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl  text-white mb-6"
        >
          How would you like to create your story?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-400 text-xl"
        >
          Choose your adventure path and let your creativity flow
        </motion.p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Guided Story Builder */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="cursor-pointer"
        >
          <div
            onClick={handleGuidedClick}
            onTouchEnd={handleGuidedClick}
            className="bg-gradient-to-br from-purple-500/20 to-blue-600/20 border border-purple-500/30  p-10 hover:border-purple-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] transform"
          >
            <div className="text-center">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full blur-lg opacity-30"></div>
                <div className="relative bg-gradient-to-r from-purple-400 to-blue-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                  <Wand2 className="w-10 h-10 text-white" />
                </div>
              </div>

              <h3 className="text-2xl  text-white mb-6">
                Guided Story Builder
              </h3>
              <p className="text-gray-300 text-md mb-8 leading-relaxed">
                Choose story elements like genre, character, and setting. Our AI
                will create a magical opening scene for you to continue writing.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Freeform Writing - FIXED CLICK HANDLING */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="cursor-pointer"
        >
          <div
            onClick={handleFreeformClick}
            onTouchEnd={handleFreeformClick} // Add touch support
            className="bg-gradient-to-br from-green-500/20 to-teal-600/20 border border-green-500/30  p-10 hover:border-green-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/20 hover:scale-[1.02] active:scale-[0.98] transform"
          >
            <div className="text-center">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-teal-500 rounded-full blur-lg opacity-30"></div>
                <div className="relative bg-gradient-to-r from-green-400 to-teal-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                  <PenTool className="w-10 h-10 text-white" />
                </div>
              </div>

              <h3 className="text-2xl  text-white mb-6">Write My Own Story</h3>
              <p className="text-gray-300 text-md mb-8 leading-relaxed">
                Start with your own creative opening (60+ words). Perfect for
                young writers who have their own amazing ideas to explore.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center mt-12"
      >
        <p className="text-gray-500 text-sm">
          Don't worry - you can always try the other mode in your next story! 🌟
        </p>
      </motion.div>
    </div>
  );
}
