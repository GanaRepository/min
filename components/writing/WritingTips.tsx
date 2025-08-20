// components/writing/WritingTips.tsx
'use client';

import { motion } from 'framer-motion';
import { Lightbulb, Sparkles } from 'lucide-react';

interface WritingTipsProps {
  turnNumber: number;
  elements: any;
  className?: string;
}

const writingTips = {
  1: [
    'Start with an exciting action or interesting scene',
    'Introduce your main character in a memorable way',
    'Set the scene with vivid descriptions',
  ],
  2: [
    'Add dialogue to make characters come alive',
    "Show, don't tell - use actions and details",
    'Build on what happened in your first turn',
  ],
  3: [
    'Introduce a challenge or problem for your character',
    'Use your five senses - what does your character see, hear, feel?',
    'Add more details about the setting',
  ],
  4: [
    'Raise the stakes - make things more exciting!',
    "Show how your character feels about what's happening",
    'Use strong action words to create excitement',
  ],
  5: [
    'This is your climax - the most exciting part!',
    'Have your character face their biggest challenge',
    'Use dramatic language to build tension',
  ],
  6: [
    'Wrap up your story with a satisfying ending',
    'Show how your character has changed or grown',
    'Leave readers feeling good about your story',
  ],
};

// components/writing/WritingTips.tsx (continued)
export default function WritingTips({
  turnNumber,
  elements,
  className,
}: WritingTipsProps) {
  const tips =
    writingTips[turnNumber as keyof typeof writingTips] || writingTips[6];
  const randomTip = tips[Math.floor(Math.random() * tips.length)];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-4 ${className}`}
    >
      <div className="flex items-start space-x-3">
        <Lightbulb className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="text-yellow-300  text-sm mb-1">
            💡 Writing Tip for Turn {turnNumber}
          </h4>
          <p className="text-gray-200 text-sm leading-relaxed">{randomTip}</p>
        </div>
      </div>
    </motion.div>
  );
}
