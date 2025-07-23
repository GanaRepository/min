// config/story-elements.ts
import { 
  Wand2, Compass, Rocket, Search, Heart, Zap, Crown, Scroll, Building, Skull,
  Smile, Drama, Eye, Sword, Shield, MessageSquare, Lightbulb, Clock,
  Sparkles, Ship, Atom, Palette, BookOpen, Trophy, Music, TreePine, Castle,
  Waves, Globe, Mountain, Home, Factory, Tent, Snowflake, Award,
  Target, Users, Star, Brain, HandHeart, Gamepad2, Sun, Flame, Gift
} from 'lucide-react';

export const STORY_ELEMENTS = {
  genre: [
    { name: 'Fantasy', emoji: '🧙‍♂️', icon: Wand2, color: 'from-purple-500 to-pink-500' },
    { name: 'Adventure', emoji: '🗺️', icon: Compass, color: 'from-green-500 to-blue-500' },
    { name: 'Science Fiction', emoji: '🚀', icon: Rocket, color: 'from-blue-500 to-cyan-500' },
    { name: 'Mystery', emoji: '🔍', icon: Search, color: 'from-gray-600 to-purple-600' },
    { name: 'Animals', emoji: '🐾', icon: Heart, color: 'from-orange-500 to-yellow-500' },
    { name: 'Superhero', emoji: '⚡', icon: Zap, color: 'from-red-500 to-yellow-500' },
    { name: 'Fairy Tale', emoji: '👑', icon: Crown, color: 'from-pink-500 to-purple-500' },
    { name: 'Historical', emoji: '📜', icon: Scroll, color: 'from-amber-600 to-orange-600' },
    { name: 'Modern Day', emoji: '🏙️', icon: Building, color: 'from-blue-500 to-gray-500' },
    { name: 'Post-Apocalyptic', emoji: '💀', icon: Skull, color: 'from-gray-700 to-red-600' },
    { name: 'Comedy', emoji: '😄', icon: Smile, color: 'from-yellow-400 to-orange-500' },
    { name: 'Drama', emoji: '🎭', icon: Drama, color: 'from-purple-600 to-red-600' },
    { name: 'Horror', emoji: '👻', icon: Eye, color: 'from-gray-600 to-purple-800' },
    { name: 'Western', emoji: '🤠', icon: Sword, color: 'from-amber-700 to-red-700' }
  ],
  character: [
    { name: 'Brave Explorer', emoji: '🧭', icon: Compass, color: 'from-green-500 to-teal-500' },
    { name: 'Wise Wizard', emoji: '🧙‍♂️', icon: Wand2, color: 'from-purple-500 to-indigo-500' },
    { name: 'Friendly Robot', emoji: '🤖', icon: Shield, color: 'from-gray-500 to-blue-500' },
    { name: 'Talking Animal', emoji: '🐱', icon: MessageSquare, color: 'from-orange-500 to-pink-500' },
    { name: 'Young Detective', emoji: '🕵️', icon: Search, color: 'from-blue-600 to-purple-600' },
    { name: 'Kind Princess', emoji: '👸', icon: Crown, color: 'from-pink-400 to-purple-500' },
    { name: 'Clever Inventor', emoji: '💡', icon: Lightbulb, color: 'from-yellow-500 to-orange-500' },
    { name: 'Space Captain', emoji: '👨‍🚀', icon: Rocket, color: 'from-blue-500 to-cyan-500' },
    { name: 'Time Traveler', emoji: '⏰', icon: Clock, color: 'from-indigo-500 to-purple-600' },
    { name: 'Magical Creature', emoji: '🦄', icon: Sparkles, color: 'from-purple-400 to-pink-500' },
    { name: 'Superhero Kid', emoji: '🦸‍♀️', icon: Zap, color: 'from-red-500 to-yellow-500' },
    { name: 'Pirate Captain', emoji: '🏴‍☠️', icon: Ship, color: 'from-gray-700 to-blue-700' },
    { name: 'Knight', emoji: '⚔️', icon: Shield, color: 'from-gray-600 to-blue-600' },
    { name: 'Scientist', emoji: '🔬', icon: Atom, color: 'from-green-600 to-blue-600' },
    { name: 'Artist', emoji: '🎨', icon: Palette, color: 'from-purple-500 to-pink-500' },
    { name: 'Chef', emoji: '👨‍🍳', icon: Award, color: 'from-orange-500 to-red-500' },
    { name: 'Teacher', emoji: '👩‍🏫', icon: BookOpen, color: 'from-blue-500 to-green-500' },
    { name: 'Doctor', emoji: '👨‍⚕️', icon: Heart, color: 'from-red-500 to-pink-500' },
    { name: 'Athlete', emoji: '🏃‍♀️', icon: Trophy, color: 'from-yellow-500 to-orange-500' },
    { name: 'Musician', emoji: '🎵', icon: Music, color: 'from-purple-500 to-blue-500' }
  ],
  setting: [
    { name: 'Enchanted Forest', emoji: '🌲', icon: TreePine, color: 'from-green-600 to-emerald-600' },
    { name: 'Magical Castle', emoji: '🏰', icon: Castle, color: 'from-purple-500 to-pink-500' },
    { name: 'Space Station', emoji: '🛰️', icon: Rocket, color: 'from-blue-500 to-cyan-500' },
    { name: 'Underwater City', emoji: '🐠', icon: Waves, color: 'from-blue-400 to-teal-500' },
    { name: 'Sky Kingdom', emoji: '☁️', icon: Globe, color: 'from-sky-400 to-blue-500' },
    { name: 'Time Portal', emoji: '⏳', icon: Clock, color: 'from-indigo-500 to-purple-600' },
    { name: 'Alien Planet', emoji: '👽', icon: Globe, color: 'from-green-500 to-purple-500' },
    { name: 'Ancient Egypt', emoji: '🏜️', icon: Mountain, color: 'from-yellow-600 to-orange-600' },
    { name: 'Wild West', emoji: '🤠', icon: Mountain, color: 'from-amber-700 to-red-700' },
    { name: 'Modern School', emoji: '🏫', icon: Building, color: 'from-blue-500 to-gray-500' },
    { name: 'Secret Laboratory', emoji: '🧪', icon: Atom, color: 'from-green-600 to-blue-600' },
    { name: 'Floating Island', emoji: '🏝️', icon: Globe, color: 'from-cyan-500 to-blue-500' },
    { name: 'Underground Cave', emoji: '🕳️', icon: Mountain, color: 'from-gray-600 to-stone-600' },
    { name: 'Abandoned City', emoji: '🏚️', icon: Building, color: 'from-gray-700 to-gray-500' },
    { name: 'Jungle Temple', emoji: '🛕', icon: TreePine, color: 'from-green-700 to-yellow-600' },
    { name: 'Arctic Base', emoji: '🧊', icon: Snowflake, color: 'from-cyan-400 to-blue-600' },
    { name: 'Desert Oasis', emoji: '🏜️', icon: Sun, color: 'from-yellow-500 to-orange-600' },
    { name: 'Mountain Peak', emoji: '🏔️', icon: Mountain, color: 'from-gray-600 to-blue-600' },
    { name: 'Cyberpunk City', emoji: '🌃', icon: Building, color: 'from-purple-600 to-cyan-500' },
    { name: 'Medieval Village', emoji: '🏘️', icon: Home, color: 'from-amber-600 to-green-600' },
    { name: 'Pirate Ship', emoji: '🚢', icon: Ship, color: 'from-blue-700 to-gray-700' },
    { name: 'Space Colony', emoji: '🛸', icon: Rocket, color: 'from-purple-500 to-cyan-500' },
    { name: 'Magic Academy', emoji: '🏫', icon: Wand2, color: 'from-purple-500 to-indigo-500' },
    { name: 'Robot Factory', emoji: '🏭', icon: Factory, color: 'from-gray-600 to-blue-500' },
    { name: 'Dinosaur World', emoji: '🦕', icon: TreePine, color: 'from-green-700 to-orange-600' }
  ],
  theme: [
    { name: 'Courage', emoji: '💪', icon: Shield, color: 'from-red-500 to-orange-500' },
    { name: 'Friendship', emoji: '🤝', icon: Users, color: 'from-blue-500 to-green-500' },
    { name: 'Discovery', emoji: '🔍', icon: Search, color: 'from-purple-500 to-blue-500' },
    { name: 'Magic', emoji: '✨', icon: Wand2, color: 'from-purple-500 to-pink-500' },
    { name: 'Family', emoji: '👨‍👩‍👧‍👦', icon: Heart, color: 'from-pink-500 to-red-500' },
    { name: 'Kindness', emoji: '😊', icon: HandHeart, color: 'from-green-400 to-blue-400' },
    { name: 'Justice', emoji: '⚖️', icon: Shield, color: 'from-blue-600 to-purple-600' },
    { name: 'Growth', emoji: '🌱', icon: TreePine, color: 'from-green-500 to-emerald-500' },
    { name: 'Perseverance', emoji: '🏃‍♂️', icon: Target, color: 'from-orange-500 to-red-500' },
    { name: 'Teamwork', emoji: '🤜🤛', icon: Users, color: 'from-blue-500 to-cyan-500' },
    { name: 'Innovation', emoji: '💡', icon: Lightbulb, color: 'from-yellow-500 to-orange-500' },
    { name: 'Wisdom', emoji: '🦉', icon: BookOpen, color: 'from-indigo-500 to-purple-500' },
    { name: 'Compassion', emoji: '❤️', icon: Heart, color: 'from-pink-400 to-red-400' },
    { name: 'Adventure', emoji: '🗺️', icon: Compass, color: 'from-green-500 to-blue-500' },
    { name: 'Learning', emoji: '📚', icon: BookOpen, color: 'from-blue-500 to-indigo-500' },
    { name: 'Creativity', emoji: '🎨', icon: Palette, color: 'from-purple-500 to-pink-500' },
    { name: 'Hope', emoji: '🌟', icon: Star, color: 'from-yellow-400 to-orange-400' },
    { name: 'Trust', emoji: '🤝', icon: HandHeart, color: 'from-green-500 to-blue-500' },
    { name: 'Responsibility', emoji: '🛡️', icon: Shield, color: 'from-gray-600 to-blue-600' },
    { name: 'Wonder', emoji: '🌈', icon: Sparkles, color: 'from-purple-400 to-cyan-400' }
  ],
  mood: [
    { name: 'Exciting', emoji: '⚡', icon: Zap, color: 'from-yellow-500 to-red-500' },
    { name: 'Mysterious', emoji: '🔮', icon: Eye, color: 'from-purple-600 to-indigo-600' },
    { name: 'Playful', emoji: '🎈', icon: Gamepad2, color: 'from-pink-500 to-yellow-500' },
    { name: 'Magical', emoji: '✨', icon: Sparkles, color: 'from-purple-500 to-pink-500' },
    { name: 'Peaceful', emoji: '🕊️', icon: Heart, color: 'from-green-400 to-blue-400' },
    { name: 'Funny', emoji: '😄', icon: Smile, color: 'from-yellow-400 to-orange-400' },
    { name: 'Thrilling', emoji: '🎢', icon: Zap, color: 'from-red-500 to-purple-500' },
    { name: 'Inspiring', emoji: '🌟', icon: Star, color: 'from-yellow-500 to-orange-500' },
    { name: 'Whimsical', emoji: '🦋', icon: Sparkles, color: 'from-purple-400 to-pink-400' },
    { name: 'Epic', emoji: '🏔️', icon: Mountain, color: 'from-gray-600 to-blue-600' },
    { name: 'Cozy', emoji: '🏠', icon: Home, color: 'from-orange-400 to-red-400' },
    { name: 'Dramatic', emoji: '🎭', icon: Drama, color: 'from-red-600 to-purple-600' },
    { name: 'Adventurous', emoji: '🗺️', icon: Compass, color: 'from-green-500 to-blue-500' },
    { name: 'Heartwarming', emoji: '💕', icon: Heart, color: 'from-pink-400 to-red-400' },
    { name: 'Suspenseful', emoji: '😰', icon: Eye, color: 'from-gray-600 to-purple-600' }
  ],
  tone: [
    { name: 'Adventurous', emoji: '🧭', icon: Compass, color: 'from-green-500 to-blue-500' },
    { name: 'Caring', emoji: '🤗', icon: Heart, color: 'from-pink-400 to-red-400' },
    { name: 'Brave', emoji: '🦸‍♀️', icon: Shield, color: 'from-red-500 to-orange-500' },
    { name: 'Curious', emoji: '🤔', icon: Search, color: 'from-blue-500 to-purple-500' },
    { name: 'Wise', emoji: '🦉', icon: BookOpen, color: 'from-indigo-500 to-purple-500' },
    { name: 'Playful', emoji: '🎪', icon: Gamepad2, color: 'from-pink-500 to-yellow-500' },
    { name: 'Heroic', emoji: '⚔️', icon: Sword, color: 'from-blue-600 to-purple-600' },
    { name: 'Gentle', emoji: '🌸', icon: Heart, color: 'from-pink-300 to-purple-300' },
    { name: 'Bold', emoji: '💪', icon: Flame, color: 'from-red-500 to-yellow-500' },
    { name: 'Thoughtful', emoji: '💭', icon: Brain, color: 'from-blue-500 to-indigo-500' },
    { name: 'Energetic', emoji: '⚡', icon: Zap, color: 'from-yellow-500 to-orange-500' },
    { name: 'Calm', emoji: '🧘‍♀️', icon: Heart, color: 'from-green-400 to-blue-400' },
    { name: 'Determined', emoji: '🎯', icon: Target, color: 'from-red-500 to-purple-500' },
    { name: 'Optimistic', emoji: '🌞', icon: Sun, color: 'from-yellow-400 to-orange-400' },
    { name: 'Creative', emoji: '🎨', icon: Palette, color: 'from-purple-500 to-pink-500' }
  ]
};

export interface StoryElements {
  genre: string;
  character: string;
  setting: string;
  theme: string;
  mood: string;
  tone: string;
}