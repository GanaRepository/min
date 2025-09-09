// // app/creative-contests/[id]/page.tsx - CREATE THIS FILE
// 'use client';

// import { useState, useEffect } from 'react';
// import { useSession } from 'next-auth/react';
// import { useRouter } from 'next/navigation';
// import { useParams } from 'next/navigation';
// import Link from 'next/link';
// import {
//   Trophy,
//   Calendar,
//   Clock,
//   ArrowLeft,
//   Upload,
//   FileText,
//   Image,
//   Camera,
//   Video,
//   Star,
//   Award,
//   AlertCircle,
// } from 'lucide-react';

// interface Contest {
//   _id: string;
//   title: string;
//   description: string;
//   type: 'art' | 'photography' | 'video';
//   status: 'active' | 'ended' | 'results_published';
//   startDate: string;
//   endDate: string;
//   resultsDate: string;
//   rules: string;
//   acceptedFormats: string[];
//   maxFileSize: number;
//   maxSubmissionsPerUser: number;
//   showPrizes: boolean;
//   prizes?: Array<{
//     position: number;
//     title: string;
//     description?: string;
//   }>;
//   winners?: Array<{
//     position: number;
//     participantName: string;
//     submissionTitle: string;
//     fileId: string;
//   }>;
//   userStats?: {
//     hasSubmitted: boolean;
//     submissionCount: number;
//     canSubmit: boolean;
//     submittedEntries: Array<{
//       submissionId: string;
//       title: string;
//       submittedAt: string;
//       isWinner: boolean;
//       position?: number;
//     }>;
//   };
// }

// const typeIcons = {
//   art: Image,
//   photography: Camera,
//   video: Video,
// };

// const typeLabels = {
//   art: 'Art & Design',
//   photography: 'Photography',
//   video: 'Video',
// };

// export default function ContestDetailPage() {
//   const { data: session } = useSession();
//   const router = useRouter();
//   const params = useParams();
//   const contestId = params.id as string;

//   const [contest, setContest] = useState<Contest | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (contestId) {
//       fetchContestDetails();
//     }
//   }, [contestId]);

//   const fetchContestDetails = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch(`/api/creative-contests/${contestId}`);
//       const data = await response.json();

//       if (data.success) {
//         setContest(data.contest);
//       } else {
//         setError('Contest not found');
//       }
//     } catch (error) {
//       console.error('Error fetching contest:', error);
//       setError('Failed to load contest');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getDaysRemaining = () => {
//     if (!contest) return 0;
//     const now = new Date();
//     const end = new Date(contest.endDate);
//     const diffTime = end.getTime() - now.getTime();
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//     return Math.max(0, diffDays);
//   };

//   const handleSubmit = () => {
//     // Navigate to submission page or open submission modal
//     router.push(`/creative-contests/${contestId}/submit`);
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-900 flex items-center justify-center">
//         <div className="text-white">Loading contest details...</div>
//       </div>
//     );
//   }

//   if (error || !contest) {
//     return (
//       <div className="min-h-screen bg-gray-900 flex items-center justify-center">
//         <div className="text-center">
//           <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
//           <h2 className="text-xl font-semibold text-white mb-2">Contest Not Found</h2>
//           <p className="text-gray-400 mb-6">{error || 'The contest you are looking for does not exist.'}</p>
//           <Link
//             href="/creative-contests"
//             className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
//           >
//             View All Contests
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   const TypeIcon = typeIcons[contest.type];

//   return (
//     <div className="min-h-screen bg-gray-900">
//       <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20">
//         {/* Header */}
//         <Link
//           href="/creative-contests"
//           className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6 transition-colors"
//         >
//           <ArrowLeft size={20} className="mr-2" />
//           Back to Contests
//         </Link>

//         {/* Contest Info */}
//         <div className="bg-gray-800 rounded-lg p-6 mb-8">
//           <div className="flex items-start justify-between mb-6">
//             <div className="flex-1">
//               <div className="flex items-center mb-3">
//                 <TypeIcon className="text-blue-400 mr-3" size={32} />
//                 <span className="text-blue-400 font-medium">{typeLabels[contest.type]} Contest</span>
//               </div>
//               <h1 className="text-3xl font-bold text-white mb-4">{contest.title}</h1>
//               <div className="flex items-center space-x-4">
//                 <span className={`px-3 py-1 rounded-full text-sm text-white ${
//                   contest.status === 'active' ? 'bg-green-500' :
//                   contest.status === 'ended' ? 'bg-yellow-500' :
//                   'bg-purple-500'
//                 }`}>
//                   {contest.status === 'active' ? 'Open for Submissions' :
//                    contest.status === 'ended' ? 'Submissions Closed' :
//                    'Results Published'}
//                 </span>
//                 {contest.status === 'active' && (
//                   <span className="text-green-400 text-sm flex items-center">
//                     <Clock size={16} className="mr-1" />
//                     {getDaysRemaining()} days remaining
//                   </span>
//                 )}
//               </div>
//             </div>
//           </div>

//           <p className="text-gray-300 mb-6">{contest.description}</p>

//           {/* Timeline */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//             <div className="bg-gray-700 rounded-lg p-4">
//               <p className="text-gray-400 text-sm mb-1">Starts</p>
//               <p className="text-white font-medium">{new Date(contest.startDate).toLocaleDateString()}</p>
//             </div>
//             <div className="bg-gray-700 rounded-lg p-4">
//               <p className="text-gray-400 text-sm mb-1">Ends</p>
//               <p className="text-white font-medium">{new Date(contest.endDate).toLocaleDateString()}</p>
//             </div>
//             <div className="bg-gray-700 rounded-lg p-4">
//               <p className="text-gray-400 text-sm mb-1">Results</p>
//               <p className="text-white font-medium">{new Date(contest.resultsDate).toLocaleDateString()}</p>
//             </div>
//           </div>

//           {/* User Submission Status */}
//           {session && contest.userStats && (
//             <div className="bg-blue-900 bg-opacity-30 border border-blue-500 rounded-lg p-4 mb-6">
//               {contest.userStats.hasSubmitted ? (
//                 <div>
//                   <p className="text-green-400 font-medium mb-2">
//                     ✓ You have submitted {contest.userStats.submissionCount} entr{contest.userStats.submissionCount === 1 ? 'y' : 'ies'}
//                   </p>
//                   <div className="space-y-2">
//                     {contest.userStats.submittedEntries.map((entry) => (
//                       <div key={entry.submissionId} className="text-gray-300 text-sm">
//                         • "{entry.title}" - Submitted on {new Date(entry.submittedAt).toLocaleDateString()}
//                         {entry.isWinner && (
//                           <span className="ml-2 text-yellow-400">🏆 Winner - Position {entry.position}</span>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                   {contest.userStats.canSubmit && (
//                     <p className="text-blue-300 text-sm mt-2">
//                       You can still submit {contest.maxSubmissionsPerUser - contest.userStats.submissionCount} more entr{contest.maxSubmissionsPerUser - contest.userStats.submissionCount === 1 ? 'y' : 'ies'}
//                     </p>
//                   )}
//                 </div>
//               ) : contest.userStats.canSubmit ? (
//                 <div>
//                   <p className="text-blue-300 font-medium">
//                     📝 You can submit up to {contest.maxSubmissionsPerUser} entr{contest.maxSubmissionsPerUser === 1 ? 'y' : 'ies'}
//                   </p>
//                 </div>
//               ) : (
//                 <p className="text-gray-400">
//                   Submissions are closed for this contest
//                 </p>
//               )}
//             </div>
//           )}

//           {/* Submit Button */}
//           {session && contest.status === 'active' && contest.userStats?.canSubmit && (
//             <button
//               onClick={handleSubmit}
//               className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
//             >
//               <Upload size={20} />
//               <span>Submit Your Entry</span>
//             </button>
//           )}

//           {!session && contest.status === 'active' && (
//             <div className="bg-gray-700 rounded-lg p-4">
//               <p className="text-gray-300 mb-3">Sign in to participate in this contest</p>
//               <Link
//                 href="/login"
//                 className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg inline-block transition-colors"
//               >
//                 Sign In to Submit
//               </Link>
//             </div>
//           )}
//         </div>

//         {/* Contest Details Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//           {/* Rules & Guidelines */}
//           <div className="bg-gray-800 rounded-lg p-6">
//             <h2 className="text-xl font-bold text-white mb-4 flex items-center">
//               <FileText className="mr-2 text-blue-400" size={24} />
//               Rules & Guidelines
//             </h2>
//             <div className="text-gray-300 whitespace-pre-line">
//               {contest.rules}
//             </div>
//           </div>

//           {/* Technical Requirements */}
//           <div className="bg-gray-800 rounded-lg p-6">
//             <h2 className="text-xl font-bold text-white mb-4">Technical Requirements</h2>
//             <div className="space-y-3">
//               <div>
//                 <p className="text-gray-400 text-sm mb-1">Accepted Formats</p>
//                 <p className="text-white">{contest.acceptedFormats.map(f => f.toUpperCase()).join(', ')}</p>
//               </div>
//               <div>
//                 <p className="text-gray-400 text-sm mb-1">Maximum File Size</p>
//                 <p className="text-white">{contest.maxFileSize} MB</p>
//               </div>
//               <div>
//                 <p className="text-gray-400 text-sm mb-1">Max Submissions per User</p>
//                 <p className="text-white">{contest.maxSubmissionsPerUser}</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Prizes Section */}
//         {contest.showPrizes && contest.prizes && contest.prizes.length > 0 && (
//           <div className="bg-gray-800 rounded-lg p-6 mt-8">
//             <h2 className="text-xl font-bold text-white mb-4 flex items-center">
//               <Trophy className="mr-2 text-yellow-400" size={24} />
//               Prizes
//             </h2>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               {contest.prizes.map((prize) => (
//                 <div key={prize.position} className="bg-gray-700 rounded-lg p-4">
//                   <div className="flex items-center mb-2">
//                     <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-3 ${
//                       prize.position === 1 ? 'bg-yellow-500' :
//                       prize.position === 2 ? 'bg-gray-400' :
//                       'bg-yellow-600'
//                     }`}>
//                       {prize.position}
//                     </div>
//                     <h3 className="text-white font-semibold">{prize.title}</h3>
//                   </div>
//                   {prize.description && (
//                     <p className="text-gray-400 text-sm">{prize.description}</p>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Winners Section */}
//         {contest.status === 'results_published' && contest.winners && contest.winners.length > 0 && (
//           <div className="bg-gradient-to-r from-yellow-900 to-yellow-700 rounded-lg p-6 mt-8">
//             <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
//               <Award className="mr-3 text-yellow-300" size={28} />
//               Contest Winners
//             </h2>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               {contest.winners.map((winner) => (
//                 <div key={winner.position} className="bg-black bg-opacity-30 rounded-lg p-4">
//                   <div className="flex items-center mb-3">
//                     <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-3 ${
//                       winner.position === 1 ? 'bg-yellow-500' :
//                       winner.position === 2 ? 'bg-gray-400' :
//                       'bg-yellow-600'
//                     }`}>
//                       {winner.position}
//                     </div>
//                     <div>
//                       <p className="text-white font-semibold">
//                         {winner.position === 1 ? '1st Place' :
//                          winner.position === 2 ? '2nd Place' :
//                          '3rd Place'}
//                       </p>
//                     </div>
//                   </div>
//                   <p className="text-yellow-100 font-medium">{winner.participantName}</p>
//                   <p className="text-yellow-200 text-sm">"{winner.submissionTitle}"</p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// app/creative-contests/[id]/page.tsx - COMPACT VERSION
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Trophy,
  Calendar,
  Clock,
  ArrowLeft,
  Upload,
  FileText,
  Image,
  Camera,
  Video,
  Award,
  AlertCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Contest {
  _id: string;
  title: string;
  description: string;
  type: 'art' | 'photography' | 'video';
  status: 'active' | 'ended' | 'results_published';
  startDate: string;
  endDate: string;
  resultsDate: string;
  rules: string;
  acceptedFormats: string[];
  maxFileSize: number;
  maxSubmissionsPerUser: number;
  showPrizes: boolean;
  prizes?: Array<{
    position: number;
    title: string;
    description?: string;
  }>;
  winners?: Array<{
    position: number;
    participantName: string;
    submissionTitle: string;
    fileId: string;
  }>;
  userStats?: {
    hasSubmitted: boolean;
    submissionCount: number;
    canSubmit: boolean;
    submittedEntries: Array<{
      submissionId: string;
      title: string;
      submittedAt: string;
      isWinner: boolean;
      position?: number;
    }>;
  };
}

const typeIcons = {
  art: Image,
  photography: Camera,
  video: Video,
};

const typeLabels = {
  art: 'Art & Design',
  photography: 'Photography',
  video: 'Video',
};

export default function ContestDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const contestId = params.id as string;

  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'rules' | 'prizes'>('rules');

  const fetchContestDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/creative-contests/${contestId}`);
      const data = await response.json();

      if (data.success) {
        setContest(data.contest);
      }
    } catch (error) {
      console.error('Error fetching contest:', error);
    } finally {
      setLoading(false);
    }
  }, [contestId]);

  useEffect(() => {
    if (contestId) {
      fetchContestDetails();
    }
  }, [contestId, fetchContestDetails]);

  const getDaysRemaining = () => {
    if (!contest) return 0;
    const now = new Date();
    const end = new Date(contest.endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const handleSubmit = () => {
    router.push(`/creative-contests/${contestId}/submit`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading contest details...</div>
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-xl font-semibold text-white mb-2">
            Contest Not Found
          </h2>
          <Link
            href="/creative-contests"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            View All Contests
          </Link>
        </div>
      </div>
    );
  }

  const TypeIcon = typeIcons[contest.type];

  return (
    <div className="min-h-screen bg-gray-900 py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Floating Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute w-96 h-96 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 -full blur-3xl"
            animate={{ x: [0, 100, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            style={{ top: '10%', left: '10%' }}
          />
          <motion.div
            className="absolute w-80 h-80 bg-gradient-to-r from-violet-500/10 to-blue-500/10 -full blur-3xl"
            animate={{ x: [0, -80, 0], y: [0, 60, 0], scale: [1, 0.8, 1] }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 2,
            }}
            style={{ top: '60%', right: '10%' }}
          />
        </div>
        {/* Header */}
        <Link
          href="/creative-contests"
          className="mt-16 inline-flex items-center text-blue-400 hover:text-blue-300 mb-4 transition-colors"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Contests
        </Link>

        {/* Main Content Card */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          {/* Title Section */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <TypeIcon className="text-blue-400" size={24} />
                <span className="text-blue-400 text-sm">
                  {typeLabels[contest.type]} Contest
                </span>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs text-white ${
                  contest.status === 'active'
                    ? 'bg-green-500'
                    : contest.status === 'ended'
                      ? 'bg-yellow-500'
                      : 'bg-purple-500'
                }`}
              >
                {contest.status === 'active'
                  ? 'Open for Submissions'
                  : contest.status === 'ended'
                    ? 'Submissions Closed'
                    : 'Results Published'}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">
              {contest.title}
            </h1>
            <p className="text-gray-300 text-sm">{contest.description}</p>
          </div>

          {/* Timeline Bar */}
          <div className="grid grid-cols-3 gap-3 mb-4 bg-gray-700 rounded-lg p-3">
            <div className="text-center">
              <p className="text-gray-400 text-xs">Starts</p>
              <p className="text-white text-sm font-medium">
                {new Date(contest.startDate).toLocaleDateString()}
              </p>
            </div>
            <div className="text-center border-l border-r border-gray-600">
              <p className="text-gray-400 text-xs">Ends</p>
              <p className="text-white text-sm font-medium">
                {new Date(contest.endDate).toLocaleDateString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-xs">Results</p>
              <p className="text-white text-sm font-medium">
                {new Date(contest.resultsDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Status Bar */}
          {contest.status === 'active' && (
            <div className="flex items-center justify-between bg-blue-900 bg-opacity-30 border border-blue-500 rounded-lg p-3 mb-4">
              <div className="flex items-center">
                <Clock size={16} className="text-green-400 mr-2" />
                <span className="text-green-400 text-sm font-medium">
                  {getDaysRemaining()} days remaining
                </span>
              </div>
              {session && contest.userStats && (
                <span className="text-blue-300 text-sm">
                  📝 You can submit up to {contest.maxSubmissionsPerUser}{' '}
                  entries
                </span>
              )}
            </div>
          )}

          {/* User Submission Info */}
          {session && contest.userStats?.hasSubmitted && (
            <div className="bg-gray-700 rounded-lg p-3 mb-4">
              <p className="text-green-400 text-sm font-medium mb-1">
                ✓ You have submitted {contest.userStats.submissionCount} entr
                {contest.userStats.submissionCount === 1 ? 'y' : 'ies'}
              </p>
              {contest.userStats.canSubmit && (
                <p className="text-gray-400 text-xs">
                  You can submit{' '}
                  {contest.maxSubmissionsPerUser -
                    contest.userStats.submissionCount}{' '}
                  more
                </p>
              )}
            </div>
          )}

          {/* Submit Button */}
          {session &&
            contest.status === 'active' &&
            contest.userStats?.canSubmit && (
              <button
                onClick={handleSubmit}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg flex items-center justify-center space-x-2 transition-colors"
              >
                <Upload size={18} />
                <span>Submit Your Entry</span>
              </button>
            )}

          {!session && contest.status === 'active' && (
            <Link
              href="/login"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2.5 rounded-lg transition-colors"
            >
              Sign In to Submit
            </Link>
          )}
        </div>

        {/* Tabs Section */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab('rules')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'rules'
                  ? 'bg-gray-700 text-white border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FileText size={16} className="inline mr-2" />
              Rules & Requirements
            </button>
            {contest.showPrizes &&
              contest.prizes &&
              contest.prizes.length > 0 && (
                <button
                  onClick={() => setActiveTab('prizes')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'prizes'
                      ? 'bg-gray-700 text-white border-b-2 border-blue-500'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Trophy size={16} className="inline mr-2" />
                  Prizes
                </button>
              )}
          </div>

          {/* Tab Content */}
          <div className="p-4">
            {activeTab === 'rules' ? (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-white font-medium mb-2">
                    📋 Contest Rules
                  </h3>
                  <div className="text-gray-300 text-sm space-y-1 whitespace-pre-line">
                    {contest.rules}
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-medium mb-2">
                    ⚙️ Technical Requirements
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-400">Accepted Formats:</span>
                      <span className="text-white ml-2">
                        {contest.acceptedFormats
                          .map((f) => f.toUpperCase())
                          .join(', ')}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Maximum File Size:</span>
                      <span className="text-white ml-2">
                        {contest.maxFileSize} MB
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Max Submissions:</span>
                      <span className="text-white ml-2">
                        {contest.maxSubmissionsPerUser} per user
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {contest.prizes?.map((prize) => (
                  <div
                    key={prize.position}
                    className="bg-gray-700 rounded-lg p-4 text-center"
                  >
                    <div
                      className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold ${
                        prize.position === 1
                          ? 'bg-yellow-500'
                          : prize.position === 2
                            ? 'bg-gray-400'
                            : 'bg-yellow-600'
                      }`}
                    >
                      {prize.position}
                    </div>
                    <h3 className="text-white font-semibold">{prize.title}</h3>
                    {prize.description && (
                      <p className="text-gray-400 text-sm mt-1">
                        {prize.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Winners Section - Only for completed contests */}
        {contest.status === 'results_published' &&
          contest.winners &&
          contest.winners.length > 0 && (
            <div className="bg-gradient-to-r from-yellow-900 to-yellow-700 rounded-lg p-4 mt-6">
              <h2 className="text-xl font-bold text-white mb-3 flex items-center">
                <Award className="mr-2" size={20} />
                Contest Winners
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {contest.winners.map((winner) => (
                  <div
                    key={winner.position}
                    className="bg-black bg-opacity-30 rounded-lg p-3"
                  >
                    <div className="flex items-center mb-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm mr-2 ${
                          winner.position === 1
                            ? 'bg-yellow-500'
                            : winner.position === 2
                              ? 'bg-gray-400'
                              : 'bg-yellow-600'
                        }`}
                      >
                        {winner.position}
                      </div>
                      <span className="text-white text-sm font-semibold">
                        {winner.position === 1
                          ? '1st Place'
                          : winner.position === 2
                            ? '2nd Place'
                            : '3rd Place'}
                      </span>
                    </div>
                    <p className="text-yellow-100 font-medium text-sm">
                      {winner.participantName}
                    </p>
                    <p className="text-yellow-200 text-xs">
                      &quot;{winner.submissionTitle}&quot;
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
