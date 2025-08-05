// export interface StoryElements {
//   genre: string;
//   character: string;
//   setting: string;
//   theme: string;
//   mood: string;
//   tone: string;
// }

// export const STORY_ELEMENTS = {
//   genre: [
//     { name: 'Adventure', emoji: '🗡️', description: 'Exciting journeys and quests' },
//     { name: 'Fantasy', emoji: '🐉', description: 'Magical worlds and creatures' },
//     { name: 'Mystery', emoji: '🔍', description: 'Puzzles and secrets to solve' },
//     { name: 'Science Fiction', emoji: '🚀', description: 'Future technology and space' },
//     { name: 'Comedy', emoji: '😄', description: 'Funny and lighthearted stories' },
//   ],
//   character: [
//     { name: 'Brave Knight', emoji: '⚔️', description: 'Noble warrior with honor' },
//     { name: 'Clever Detective', emoji: '🕵️', description: 'Sharp-minded investigator' },
//     { name: 'Young Wizard', emoji: '🧙', description: 'Learning magical powers' },
//     { name: 'Space Explorer', emoji: '👨‍🚀', description: 'Adventurer among the stars' },
//     { name: 'Animal Friend', emoji: '🐺', description: 'Companion of creatures' },
//   ],
//   setting: [
//     { name: 'Enchanted Forest', emoji: '🌲', description: 'Magical woodland realm' },
//     { name: 'Ancient Castle', emoji: '🏰', description: 'Mysterious old fortress' },
//     { name: 'Busy City', emoji: '🏙️', description: 'Modern urban environment' },
//     { name: 'Space Station', emoji: '🛰️', description: 'Floating home among stars' },
//     { name: 'Underwater Kingdom', emoji: '🌊', description: 'Realm beneath the waves' },
//   ],
//   theme: [
//     { name: 'Friendship', emoji: '🤝', description: 'The power of companionship' },
//     { name: 'Courage', emoji: '💪', description: 'Being brave when scared' },
//     { name: 'Discovery', emoji: '🔬', description: 'Finding something new' },
//     { name: 'Family', emoji: '👨‍👩‍👧‍👦', description: 'Love and belonging' },
//     { name: 'Adventure', emoji: '🗺️', description: 'Exciting journeys and exploration' },
//   ],
//   mood: [
//     { name: 'Exciting', emoji: '⚡', description: 'Fast-paced and thrilling' },
//     { name: 'Mysterious', emoji: '🌙', description: 'Full of secrets and wonder' },
//     { name: 'Happy', emoji: '☀️', description: 'Cheerful and uplifting' },
//     { name: 'Adventurous', emoji: '🏔️', description: 'Bold and daring' },
//     { name: 'Magical', emoji: '✨', description: 'Enchanted and wonderful' },
//   ],
//   tone: [
//     { name: 'Brave', emoji: '🦁', description: 'Courageous and fearless' },
//     { name: 'Curious', emoji: '🤔', description: 'Questioning and exploring' },
//     { name: 'Playful', emoji: '🎭', description: 'Fun and lighthearted' },
//     { name: 'Wise', emoji: '🦉', description: 'Thoughtful and intelligent' },
//     { name: 'Determined', emoji: '🎯', description: 'Focused and persistent' },
//   ],
// };


export interface StoryElements {
  genre: string;
  character: string;
  setting: string;
  theme: string;
  mood: string;
  tone: string;
}

export const STORY_ELEMENTS = {
  genre: [
    { name: 'Adventure', emoji: '🗡️', description: 'Exciting journeys and quests' },
    { name: 'Fantasy', emoji: '🐉', description: 'Magical worlds and creatures' },
    { name: 'Mystery', emoji: '🔍', description: 'Puzzles and secrets to solve' },
    { name: 'Science Fiction', emoji: '🚀', description: 'Future technology and space' },
    { name: 'Comedy', emoji: '😄', description: 'Funny and lighthearted stories' },
    { name: 'Horror', emoji: '👻', description: 'Spooky and thrilling tales' },
    { name: 'Romance', emoji: '💕', description: 'Love and heartwarming relationships' },
    { name: 'Historical', emoji: '📜', description: 'Stories from the past' },
    { name: 'Western', emoji: '🤠', description: 'Cowboys and frontier adventures' },
    { name: 'Superhero', emoji: '🦸', description: 'Heroes with special powers' },
    { name: 'Fairy Tale', emoji: '🧚', description: 'Classic magical stories' },
    { name: 'Thriller', emoji: '⚡', description: 'Heart-pounding suspense' },
    { name: 'Drama', emoji: '🎭', description: 'Emotional and meaningful stories' },
    { name: 'Sports', emoji: '⚽', description: 'Athletic competition and teamwork' },
    { name: 'Musical', emoji: '🎵', description: 'Stories filled with song and dance' },
  ],
  character: [
    { name: 'Brave Knight', emoji: '⚔️', description: 'Noble warrior with honor' },
    { name: 'Clever Detective', emoji: '🕵️', description: 'Sharp-minded investigator' },
    { name: 'Young Wizard', emoji: '🧙', description: 'Learning magical powers' },
    { name: 'Space Explorer', emoji: '👨‍🚀', description: 'Adventurer among the stars' },
    { name: 'Animal Friend', emoji: '🐺', description: 'Companion of creatures' },
    { name: 'Pirate Captain', emoji: '🏴‍☠️', description: 'Seafaring treasure hunter' },
    { name: 'Robot Helper', emoji: '🤖', description: 'Mechanical companion' },
    { name: 'Forest Ranger', emoji: '🌳', description: 'Protector of nature' },
    { name: 'Time Traveler', emoji: '⏰', description: 'Journeyer through time' },
    { name: 'Dragon Tamer', emoji: '🐲', description: 'Befriender of mighty beasts' },
    { name: 'Ocean Explorer', emoji: '🐙', description: 'Deep sea adventurer' },
    { name: 'Sky Pilot', emoji: '✈️', description: 'Master of the airways' },
    { name: 'Mountain Climber', emoji: '🧗', description: 'Conqueror of peaks' },
    { name: 'Inventor Genius', emoji: '🔬', description: 'Creator of amazing devices' },
    { name: 'Guardian Angel', emoji: '👼', description: 'Heavenly protector' },
  ],
  setting: [
    { name: 'Enchanted Forest', emoji: '🌲', description: 'Magical woodland realm' },
    { name: 'Ancient Castle', emoji: '🏰', description: 'Mysterious old fortress' },
    { name: 'Busy City', emoji: '🏙️', description: 'Modern urban environment' },
    { name: 'Space Station', emoji: '🛰️', description: 'Floating home among stars' },
    { name: 'Underwater Kingdom', emoji: '🌊', description: 'Realm beneath the waves' },
    { name: 'Desert Oasis', emoji: '🏜️', description: 'Hidden paradise in the sand' },
    { name: 'Floating Island', emoji: '☁️', description: 'Magical island in the sky' },
    { name: 'Haunted Mansion', emoji: '🏚️', description: 'Spooky old house with secrets' },
    { name: 'Pirate Ship', emoji: '⛵', description: 'Vessel sailing the seven seas' },
    { name: 'Secret Laboratory', emoji: '⚗️', description: 'Hidden place of experiments' },
    { name: 'Jungle Temple', emoji: '🗿', description: 'Ancient ruins in the wilderness' },
    { name: 'Ice Palace', emoji: '🧊', description: 'Crystalline fortress of frost' },
    { name: 'Carnival Grounds', emoji: '🎪', description: 'Colorful world of entertainment' },
    { name: 'Mountain Peak', emoji: '⛰️', description: 'Towering summit touching the sky' },
    { name: 'Magic School', emoji: '🎓', description: 'Academy for learning spells' },
  ],
  theme: [
    { name: 'Friendship', emoji: '🤝', description: 'The power of companionship' },
    { name: 'Courage', emoji: '💪', description: 'Being brave when scared' },
    { name: 'Discovery', emoji: '🔭', description: 'Finding something new' },
    { name: 'Family', emoji: '👨‍👩‍👧‍👦', description: 'Love and belonging' },
    { name: 'Adventure', emoji: '🗺️', description: 'Exciting journeys and exploration' },
    { name: 'Justice', emoji: '⚖️', description: 'Fighting for what is right' },
    { name: 'Perseverance', emoji: '🏃', description: 'Never giving up on dreams' },
    { name: 'Kindness', emoji: '❤️', description: 'Spreading love and compassion' },
    { name: 'Wisdom', emoji: '📚', description: 'Learning and growing wiser' },
    { name: 'Freedom', emoji: '🕊️', description: 'Breaking free from limitations' },
    { name: 'Responsibility', emoji: '🛡️', description: 'Taking care of others' },
    { name: 'Honesty', emoji: '💎', description: 'Always telling the truth' },
    { name: 'Creativity', emoji: '🎨', description: 'Using imagination to solve problems' },
    { name: 'Teamwork', emoji: '👥', description: 'Working together for success' },
    { name: 'Self-Belief', emoji: '🌟', description: 'Having confidence in yourself' },
  ],
  mood: [
    { name: 'Exciting', emoji: '🎢', description: 'Fast-paced and thrilling' },
    { name: 'Mysterious', emoji: '🌙', description: 'Full of secrets and wonder' },
    { name: 'Happy', emoji: '☀️', description: 'Cheerful and uplifting' },
    { name: 'Adventurous', emoji: '🏔️', description: 'Bold and daring' },
    { name: 'Magical', emoji: '✨', description: 'Enchanted and wonderful' },
    { name: 'Suspenseful', emoji: '😱', description: 'Edge-of-your-seat tension' },
    { name: 'Peaceful', emoji: '🌺', description: 'Calm and serene' },
    { name: 'Energetic', emoji: '⚡', description: 'Full of action and movement' },
    { name: 'Dreamy', emoji: '💭', description: 'Soft and imaginative' },
    { name: 'Intense', emoji: '🔥', description: 'Powerful and dramatic' },
    { name: 'Whimsical', emoji: '🎈', description: 'Playful and fanciful' },
    { name: 'Epic', emoji: '⚔️', description: 'Grand and heroic' },
    { name: 'Cozy', emoji: '🏠', description: 'Warm and comfortable' },
    { name: 'Dynamic', emoji: '🌪️', description: 'Constantly changing and moving' },
    { name: 'Inspiring', emoji: '🌈', description: 'Uplifting and motivational' },
  ],
  tone: [
    { name: 'Brave', emoji: '🦁', description: 'Courageous and fearless' },
    { name: 'Curious', emoji: '🤔', description: 'Questioning and exploring' },
    { name: 'Playful', emoji: '🎲', description: 'Fun and lighthearted' },
    { name: 'Wise', emoji: '🦉', description: 'Thoughtful and intelligent' },
    { name: 'Determined', emoji: '🎯', description: 'Focused and persistent' },
    { name: 'Gentle', emoji: '🌸', description: 'Soft and caring' },
    { name: 'Bold', emoji: '🔱', description: 'Confident and daring' },
    { name: 'Witty', emoji: '🎭', description: 'Clever and humorous' },
    { name: 'Sincere', emoji: '💝', description: 'Honest and heartfelt' },
    { name: 'Adventurous', emoji: '🧭', description: 'Ready for new experiences' },
    { name: 'Mysterious', emoji: '🔮', description: 'Secretive and intriguing' },
    { name: 'Optimistic', emoji: '🌅', description: 'Hopeful and positive' },
    { name: 'Fierce', emoji: '🔥', description: 'Intense and powerful' },
    { name: 'Compassionate', emoji: '🤗', description: 'Understanding and empathetic' },
    { name: 'Mischievous', emoji: '😈', description: 'Playfully troublesome' },
  ],
};
