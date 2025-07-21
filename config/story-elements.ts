// config/story-elements.ts
import { IStoryElement } from '@/types/story';

export const STORY_ELEMENTS: Record<string, IStoryElement[]> = {
  genre: [
    {
      id: 'fantasy',
      type: 'genre',
      name: 'Fantasy',
      description: 'Magical worlds with wizards, dragons, and enchanted creatures',
      emoji: '🧙‍♀️',
      color: 'from-purple-500 to-pink-600'
    },
    {
      id: 'adventure',
      type: 'genre', 
      name: 'Adventure',
      description: 'Exciting journeys and thrilling discoveries',
      emoji: '🗺️',
      color: 'from-teal-500 to-cyan-600'
    },
    {
      id: 'space',
      type: 'genre',
      name: 'Space',
      description: 'Cosmic adventures among stars and planets',
      emoji: '🚀',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'animals',
      type: 'genre',
      name: 'Animals',
      description: 'Stories featuring amazing animal characters',
      emoji: '🐾',
      color: 'from-orange-500 to-red-600'
    },
    {
      id: 'mystery',
      type: 'genre',
      name: 'Mystery',
      description: 'Puzzles to solve and secrets to uncover',
      emoji: '🔍',
      color: 'from-gray-500 to-blue-600'
    },
    {
      id: 'friendship',
      type: 'genre',
      name: 'Friendship',
      description: 'Heartwarming tales about special bonds',
      emoji: '👥',
      color: 'from-pink-500 to-orange-600'
    }
  ],
  
  character: [
    {
      id: 'brave-explorer',
      type: 'character',
      name: 'Brave Explorer',
      description: 'Fearless adventurer seeking new discoveries',
      emoji: '🧭',
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'wise-wizard',
      type: 'character',
      name: 'Wise Wizard',
      description: 'Powerful magic user with ancient knowledge',
      emoji: '🧙‍♂️',
      color: 'from-purple-500 to-blue-600'
    },
    {
      id: 'friendly-robot',
      type: 'character',
      name: 'Friendly Robot',
      description: 'Helpful mechanical companion',
      emoji: '🤖',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'talking-animal',
      type: 'character',
      name: 'Talking Animal',
      description: 'Clever creature with special abilities',
      emoji: '🦊',
      color: 'from-orange-500 to-red-600'
    },
    {
      id: 'young-detective',
      type: 'character',
      name: 'Young Detective',
      description: 'Smart investigator solving mysteries',
      emoji: '🕵️',
      color: 'from-gray-500 to-purple-600'
    },
    {
      id: 'kind-princess',
      type: 'character',
      name: 'Kind Princess',
      description: 'Royal character with a caring heart',
      emoji: '👸',
      color: 'from-pink-500 to-purple-600'
    }
  ],

  setting: [
    {
      id: 'enchanted-forest',
      type: 'setting',
      name: 'Enchanted Forest',
      description: 'Magical woodland filled with wonder',
      emoji: '🌲',
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'magical-castle',
      type: 'setting',
      name: 'Magical Castle',
      description: 'Ancient fortress with hidden secrets',
      emoji: '🏰',
      color: 'from-purple-500 to-blue-600'
    },
    {
      id: 'space-station',
      type: 'setting',
      name: 'Space Station',
      description: 'High-tech home among the stars',
      emoji: '🛸',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'underwater-city',
      type: 'setting',
      name: 'Underwater City',
      description: 'Mysterious civilization beneath the waves',
      emoji: '🌊',
      color: 'from-cyan-500 to-blue-600'
    },
    {
      id: 'sky-kingdom',
      type: 'setting',
      name: 'Sky Kingdom',
      description: 'Floating realm above the clouds',
      emoji: '☁️',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'time-portal',
      type: 'setting',
      name: 'Time Portal',
      description: 'Gateway to different eras',
      emoji: '⏰',
      color: 'from-yellow-500 to-orange-600'
    }
  ],

  theme: [
    {
      id: 'courage',
      type: 'theme',
      name: 'Courage',
      description: 'Being brave in the face of challenges',
      emoji: '💪',
      color: 'from-red-500 to-orange-600'
    },
    {
      id: 'friendship',
      type: 'theme',
      name: 'Friendship',
      description: 'The power of caring relationships',
      emoji: '🤝',
      color: 'from-pink-500 to-purple-600'
    },
    {
      id: 'discovery',
      type: 'theme',
      name: 'Discovery',
      description: 'Finding new and amazing things',
      emoji: '🔍',
      color: 'from-blue-500 to-teal-600'
    },
    {
      id: 'magic',
      type: 'theme',
      name: 'Magic',
      description: 'Supernatural powers and wonder',
      emoji: '✨',
      color: 'from-purple-500 to-pink-600'
    },
    {
      id: 'family',
      type: 'theme',
      name: 'Family',
      description: 'Love and bonds between relatives',
      emoji: '👨‍👩‍👧‍👦',
      color: 'from-green-500 to-blue-600'
    },
    {
      id: 'kindness',
      type: 'theme',
      name: 'Kindness',
      description: 'Helping others and showing care',
      emoji: '💝',
      color: 'from-pink-500 to-red-600'
    }
  ],

  mood: [
    {
      id: 'exciting',
      type: 'mood',
      name: 'Exciting',
      description: 'Full of thrills and adventure',
      emoji: '⚡',
      color: 'from-yellow-500 to-orange-600'
    },
    {
      id: 'mysterious',
      type: 'mood',
      name: 'Mysterious',
      description: 'Full of secrets and puzzles',
      emoji: '🌙',
      color: 'from-indigo-500 to-purple-600'
    },
    {
      id: 'cheerful',
      type: 'mood',
      name: 'Cheerful',
      description: 'Happy and uplifting',
      emoji: '😊',
      color: 'from-yellow-500 to-pink-600'
    },
    {
      id: 'magical',
      type: 'mood',
      name: 'Magical',
      description: 'Filled with wonder and enchantment',
      emoji: '🪄',
      color: 'from-purple-500 to-blue-600'
    },
    {
      id: 'peaceful',
      type: 'mood',
      name: 'Peaceful',
      description: 'Calm and serene',
      emoji: '🕊️',
      color: 'from-blue-500 to-green-600'
    },
    {
      id: 'funny',
      type: 'mood',
      name: 'Funny',
      description: 'Full of humor and laughter',
      emoji: '😄',
      color: 'from-orange-500 to-yellow-600'
    }
  ],

  tone: [
    {
      id: 'adventurous',
      type: 'tone',
      name: 'Adventurous',
      description: 'Bold and daring spirit',
      emoji: '🎯',
      color: 'from-red-500 to-orange-600'
    },
    {
      id: 'playful',
      type: 'tone',
      name: 'Playful',
      description: 'Light-hearted and fun',
      emoji: '🎈',
      color: 'from-pink-500 to-purple-600'
    },
    {
      id: 'wise',
      type: 'tone',
      name: 'Wise',
      description: 'Thoughtful and insightful',
      emoji: '🦉',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'caring',
      type: 'tone',
      name: 'Caring',
      description: 'Gentle and compassionate',
      emoji: '💙',
      color: 'from-green-500 to-blue-600'
    },
    {
      id: 'brave',
      type: 'tone',
      name: 'Brave',
      description: 'Courageous and fearless',
      emoji: '🦸',
      color: 'from-red-500 to-blue-600'
    },
    {
      id: 'curious',
      type: 'tone',
      name: 'Curious',
      description: 'Eager to learn and explore',
      emoji: '🔬',
      color: 'from-yellow-500 to-green-600'
    }
  ]
};