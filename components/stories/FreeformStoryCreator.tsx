'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Send,
  Target,
  Lightbulb,
  BookOpen,
  Sparkles,
} from 'lucide-react';

interface FreeformStoryCreatorProps {
  onComplete: (openingText: string) => void;
  onBack: () => void;
}

export default function FreeformStoryCreator({
  onComplete,
  onBack,
}: FreeformStoryCreatorProps) {
  const [openingText, setOpeningText] = useState('');
  const [wordCount, setWordCount] = useState(0);

  const handleInputChange = (text: string) => {
    setOpeningText(text);
    const words = text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
    setWordCount(words);
  };

  const isValid = wordCount >= 60 && wordCount <= 150;

  const writingPrompts = [
    'What if you discovered a hidden door in your bedroom?',
    'Imagine you could talk to animals for one day...',
    'You find a magical object in your backyard...',
    'What would happen if gravity stopped working?',
    'You wake up in a world made entirely of your favorite food...',
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 ">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <button
          onClick={onBack}
          className="flex items-center text-gray-800 hover:text-gray-900 transition-colors mb-8 bg-gray-300 p-2 rounded-lg m-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Mode Selection
        </button>

        <div className="text-center mb-12">
          <h2 className="text-4xl  text-white mb-4 flex items-center justify-center">
            <BookOpen className="w-10 h-10 mr-4 text-green-400" />
            Write Your Story Opening
          </h2>
          <p className="text-gray-400 text-lg">
            Start your adventure with your own creative opening. Write 60-150
            words to set the scene and let your imagination soar!
          </p>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-6">
            <div className="mb-4">
              <h3 className="text-white  text-lg mb-2 flex items-center">
                ✍️ Your Story Beginning
              </h3>
              <p className="text-gray-400 text-sm">
                Let your creativity flow! Write the opening scene of your story.
              </p>
            </div>

            <textarea
              value={openingText}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Once upon a time... or however you'd like to start your amazing story! Remember, every great adventure begins with a single word."
              className="w-full h-72 p-4 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            />

            <div className="flex justify-between items-center mt-4">
              <div className="text-sm">
                <span
                  className={` ${
                    wordCount < 60
                      ? 'text-red-400'
                      : wordCount > 150
                        ? 'text-yellow-400'
                        : 'text-green-400'
                  }`}
                >
                  {wordCount} words
                </span>
                <span className="text-gray-500 ml-2">(60-150 required)</span>
              </div>

              <div className="text-xs text-gray-500">
                {wordCount < 60
                  ? `${60 - wordCount} more needed`
                  : wordCount > 150
                    ? `${wordCount - 150} over limit`
                    : 'Perfect length! ✨'}
              </div>
            </div>

            {!isValid && openingText.trim() && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg"
              >
                <p className="text-yellow-300 text-sm flex items-center">
                  <Target className="w-4 h-4 mr-2" />
                  {wordCount < 60
                    ? `Keep writing! You need ${60 - wordCount} more words to create a good opening.`
                    : 'Your opening is getting long! Try to keep it under 150 words for the best start.'}
                </p>
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: isValid ? 1.02 : 1 }}
              whileTap={{ scale: isValid ? 0.98 : 1 }}
              onClick={() => isValid && onComplete(openingText.trim())}
              disabled={!isValid}
              className={`w-full mt-6 flex items-center justify-center space-x-2 py-4 px-6 rounded-lg  text-lg transition-all ${
                isValid
                  ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white hover:from-green-600 hover:to-blue-700 shadow-lg hover:shadow-xl'
                  : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-5 h-5" />
              <span>Create My Story</span>
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1"
        >
          <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-6">
            <h4 className="text-white  text-lg mb-4 flex items-center">
              <Lightbulb className="w-5 h-5 mr-2 text-yellow-400" />
              Writing Tips
            </h4>

            <div className="space-y-4 text-sm">
              <div className="p-3 bg-gray-700/30 rounded-lg">
                <h5 className="text-green-400  mb-1">Start Strong</h5>
                <p className="text-gray-300">
                  Begin with action, dialogue, or an interesting situation to
                  hook your readers.
                </p>
              </div>

              <div className="p-3 bg-gray-700/30 rounded-lg">
                <h5 className="text-blue-400  mb-1">Show, Don&apos;t Tell</h5>
                <p className="text-gray-300">
                  Instead of &quot;I was scared,&quot; try &quot;My hands
                  trembled as I reached for the door.&quot;
                </p>
              </div>

              <div className="p-3 bg-gray-700/30 rounded-lg">
                <h5 className="text-purple-400  mb-1">Use Your Senses</h5>
                <p className="text-gray-300">
                  Describe what you see, hear, smell, feel, or taste to bring
                  your story to life.
                </p>
              </div>
              <div className="p-3 bg-gray-700/30 rounded-lg">
                <h5 className="text-purple-400  mb-1">Use Your Senses</h5>
                <p className="text-gray-300">
                  Describe what you see, hear, smell, feel, or taste to bring
                  your story to life.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
