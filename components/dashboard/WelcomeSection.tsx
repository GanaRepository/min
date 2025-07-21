// components/dashboard/WelcomeSection.tsx
'use client';

import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { Sparkles, Sun, Moon, Coffee } from 'lucide-react';

export default function WelcomeSection() {
  const { data: session } = useSession();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good morning', icon: Sun };
    if (hour < 17) return { text: 'Good afternoon', icon: Coffee };
    return { text: 'Good evening', icon: Moon };
  };

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-8"
    >
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-6 sm:p-8">
        <div className="flex items-start justify-between">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center space-x-2 text-purple-300 mb-2"
            >
              <GreetingIcon className="w-5 h-5" />
              <span className="text-sm font-medium">{greeting.text}</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-3xl sm:text-4xl font-bold text-white mb-2"
            >
              🌟 Welcome back, {session?.user?.firstName || 'Writer'}!
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-gray-300 text-lg"
            >
              Ready for another amazing adventure?
            </motion.p>
          </div>
          
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3
            }}
            className="text-4xl"
          >
            ✨
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}