// // components/dashboard/UsageStatsCard.tsx - COMPLETE UPDATE
// 'use client';

// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Progress } from '@/components/ui/progress';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { 
//   Sparkles, 
//   FileText, 
//   Trophy, 
//   Crown,
//   ArrowRight,
//   Info,
//   Zap
// } from 'lucide-react';

// interface UsageStats {
//   freestyleStories: {
//     used: number;
//     limit: number;
//     remaining: number;
//     canUse: boolean;
//   };
//   assessmentRequests: {
//     used: number;
//     limit: number;
//     remaining: number;
//     canUse: boolean;
//   };
//   competitionEntries: {
//     used: number;
//     limit: number;
//     remaining: number;
//     canUse: boolean;
//   };
//   publications: {
//     used: number;
//     limit: number;
//     remaining: number;
//     canUse: boolean;
//   };
//   resetDate: string;
//   subscriptionTier: 'FREE' | 'STORY_PACK';
// }

// interface UsageStatsCardProps {
//   usageStats: UsageStats;
//   onUpgrade?: () => void;
//   loading?: boolean;
// }

// export default function UsageStatsCard({ usageStats, onUpgrade, loading = false }: UsageStatsCardProps) {
//   const getProgressColor = (used: number, limit: number) => {
//     const percentage = (used / limit) * 100;
//     if (percentage >= 90) return 'bg-red-500';
//     if (percentage >= 70) return 'bg-yellow-500';
//     return 'bg-green-500';
//   };

//   const formatResetDate = (dateString: string) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', { 
//       month: 'long', 
//       day: 'numeric' 
//     });
//   };

//   if (loading) {
//     return (
//       <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
//         <CardHeader>
//           <div className="animate-pulse">
//             <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
//             <div className="h-4 bg-gray-200 rounded w-24"></div>
//           </div>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-4 animate-pulse">
//             {[1, 2, 3].map((i) => (
//               <div key={i} className="space-y-2">
//                 <div className="h-4 bg-gray-200 rounded w-3/4"></div>
//                 <div className="h-2 bg-gray-200 rounded"></div>
//                 <div className="h-3 bg-gray-200 rounded w-1/2"></div>
//               </div>
//             ))}
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200 shadow-lg">
//       <CardHeader className="pb-4">
//         <div className="flex items-center justify-between">
//           <CardTitle className="flex items-center gap-2 text-purple-800">
//             <FileText className="w-5 h-5" />
//             Monthly Usage
//           </CardTitle>
//           <Badge 
//             variant={usageStats.subscriptionTier === 'STORY_PACK' ? 'default' : 'secondary'}
//             className={usageStats.subscriptionTier === 'STORY_PACK' 
//               ? 'bg-purple-600 text-white shadow-md' 
//               : 'bg-gray-100 text-gray-600'
//             }
//           >
//             {usageStats.subscriptionTier === 'STORY_PACK' ? (
//               <Crown className="w-3 h-3 mr-1" />
//             ) : null}
//             {usageStats.subscriptionTier === 'STORY_PACK' ? 'Story Pack' : 'Free Tier'}
//           </Badge>
//         </div>
//         <p className="text-sm text-purple-600">
//           Resets on {formatResetDate(usageStats.resetDate)}
//         </p>
//       </CardHeader>

//       <CardContent className="space-y-6">
//         {/* Freestyle Stories */}
//         <div className="space-y-2">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               <Sparkles className="w-4 h-4 text-green-600" />
//               <span className="font-medium text-gray-700">Freestyle Stories</span>
//             </div>
//             <span className="text-sm font-semibold text-gray-600">
//               {usageStats.freestyleStories.used}/{usageStats.freestyleStories.limit}
//             </span>
//           </div>
//           <Progress 
//             value={(usageStats.freestyleStories.used / usageStats.freestyleStories.limit) * 100}
//             className="h-2"
//           />
//           <p className="text-xs text-gray-500">
//             Collaborative AI stories • {usageStats.freestyleStories.remaining} remaining
//           </p>
//         </div>

//         {/* Assessment Requests - UPDATED */}
//         <div className="space-y-2">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               <FileText className="w-4 h-4 text-blue-600" />
//               <span className="font-medium text-gray-700">Assessment Requests</span>
//             </div>
//             <span className="text-sm font-semibold text-gray-600">
//               {usageStats.assessmentRequests.used}/{usageStats.assessmentRequests.limit}
//             </span>
//           </div>
//           <Progress 
//             value={(usageStats.assessmentRequests.used / usageStats.assessmentRequests.limit) * 100}
//             className="h-2"
//           />
//           <p className="text-xs text-gray-500">
//             Upload stories + re-assessments • {usageStats.assessmentRequests.remaining} remaining
//           </p>
//         </div>

//         {/* Competition Entries */}
//         <div className="space-y-2">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               <Trophy className="w-4 h-4 text-purple-600" />
//               <span className="font-medium text-gray-700">Competition Entries</span>
//             </div>
//             <span className="text-sm font-semibold text-gray-600">
//               {usageStats.competitionEntries.used}/{usageStats.competitionEntries.limit}
//             </span>
//           </div>
//           <Progress 
//             value={(usageStats.competitionEntries.used / usageStats.competitionEntries.limit) * 100}
//             className="h-2"
//           />
//           <p className="text-xs text-gray-500">
//             Monthly competition submissions • {usageStats.competitionEntries.remaining} remaining
//           </p>
//         </div>

//         {/* Story Pack Upgrade */}
//         {usageStats.subscriptionTier === 'FREE' && onUpgrade && (
//           <div className="mt-6 p-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg border border-purple-200">
//             <div className="flex items-start gap-3">
//               <Crown className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
//               <div className="flex-1">
//                 <h4 className="font-semibold text-purple-800 mb-1">
//                   Unlock More Stories
//                 </h4>
//                 <p className="text-sm text-purple-700 mb-3">
//                   Get 5 more freestyle stories and 15 more assessment requests with Story Pack!
//                 </p>
//                 <Button 
//                   onClick={onUpgrade}
//                   size="sm"
//                   className="bg-purple-600 hover:bg-purple-700 text-white"
//                 >
//                   Upgrade Now
//                   <ArrowRight className="w-4 h-4 ml-1" />
//                 </Button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Usage Tips - UPDATED */}
//         <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
//           <div className="flex items-start gap-2">
//             <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
//             <div className="text-xs text-blue-700">
//               <p className="font-medium mb-1">Usage Tips:</p>
//               <ul className="space-y-1">
//                 <li>• Assessment requests count uploads AND re-assessments</li>
//                 <li>• Competition entries don't require Story Pack</li>
//                 <li>• All limits reset monthly</li>
//               </ul>
//             </div>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }


// components/dashboard/UsageStatsCard.tsx - ENHANCED WITH 30-DAY STORY PACK STATUS
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  FileText, 
  Trophy, 
  Crown,
  ArrowRight,
  Info,
  Zap,
  Clock,
  CheckCircle
} from 'lucide-react';

interface UsageStats {
  freestyleStories: {
    used: number;
    limit: number;
    remaining: number;
    canUse: boolean;
  };
  assessmentRequests: {
    used: number;
    limit: number;
    remaining: number;
    canUse: boolean;
  };
  competitionEntries: {
    used: number;
    limit: number;
    remaining: number;
    canUse: boolean;
  };
  publications: {
    used: number;
    limit: number;
    remaining: number;
    canUse: boolean;
  };
  resetDate: string;
  subscriptionTier: 'FREE' | 'STORY_PACK';
  storyPackExpiry?: string; // NEW: When current story pack expires
  daysRemaining?: number; // NEW: Days left on story pack
}

interface UsageStatsCardProps {
  usageStats: UsageStats;
  onUpgrade?: () => void;
  loading?: boolean;
}

export default function UsageStatsCard({ usageStats, onUpgrade, loading = false }: UsageStatsCardProps) {
  const isStoryPackActive = usageStats.subscriptionTier === 'STORY_PACK' && usageStats.daysRemaining && usageStats.daysRemaining > 0;

  const getProgressColor = (used: number, limit: number) => {
    const percentage = (used / limit) * 100;
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const formatResetDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <FileText className="w-5 h-5" />
            Monthly Usage
          </CardTitle>
          <Badge 
            variant={usageStats.subscriptionTier === 'STORY_PACK' ? 'default' : 'secondary'}
            className={usageStats.subscriptionTier === 'STORY_PACK' 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-200 text-gray-700'
            }
          >
            {usageStats.subscriptionTier === 'STORY_PACK' ? '✨ Story Pack' : '🆓 Free Tier'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        
        {/* Story Pack Status Banner */}
        {isStoryPackActive && (
          <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div className="flex-1">
                <h4 className="font-semibold text-purple-800">Story Pack Active!</h4>
                <div className="flex items-center gap-2 text-sm text-purple-700">
                  <Clock className="w-4 h-4" />
                  <span>{usageStats.daysRemaining} days remaining</span>
                </div>
                {usageStats.storyPackExpiry && (
                  <p className="text-xs text-purple-600 mt-1">
                    Expires: {new Date(usageStats.storyPackExpiry).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Freestyle Stories */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Freestyle Stories</span>
            <span className="text-sm font-semibold text-gray-600">
              {usageStats.freestyleStories.used}/{usageStats.freestyleStories.limit}
            </span>
          </div>
          <Progress 
            value={(usageStats.freestyleStories.used / usageStats.freestyleStories.limit) * 100}
            className="h-2"
          />
          <p className="text-xs text-gray-500">
            Monthly collaborative stories • {usageStats.freestyleStories.remaining} remaining
          </p>
        </div>

        {/* Assessment Requests */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">AI Assessments</span>
            <span className="text-sm font-semibold text-gray-600">
              {usageStats.assessmentRequests.used}/{usageStats.assessmentRequests.limit}
            </span>
          </div>
          <Progress 
            value={(usageStats.assessmentRequests.used / usageStats.assessmentRequests.limit) * 100}
            className="h-2"
          />
          <p className="text-xs text-gray-500">
            Monthly assessment requests • {usageStats.assessmentRequests.remaining} remaining
          </p>
        </div>

        {/* Competition Entries */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Competition Entries</span>
            <span className="text-sm font-semibold text-gray-600">
              {usageStats.competitionEntries.used}/{usageStats.competitionEntries.limit}
            </span>
          </div>
          <Progress 
            value={(usageStats.competitionEntries.used / usageStats.competitionEntries.limit) * 100}
            className="h-2"
          />
          <p className="text-xs text-gray-500">
            Monthly competition submissions • {usageStats.competitionEntries.remaining} remaining
          </p>
        </div>

        {/* Story Pack Upgrade (only show if not active) */}
        {!isStoryPackActive && onUpgrade && (
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg border border-purple-200">
            <div className="flex items-start gap-3">
              <Crown className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-purple-800 mb-1">
                  Unlock More Stories
                </h4>
                <p className="text-sm text-purple-700 mb-3">
                  Get 5 more freestyle stories and 15 more assessment requests for 30 days!
                </p>
                <Button 
                  onClick={onUpgrade}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Upgrade to Story Pack
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Usage Tips */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-700">
              <p className="font-medium mb-1">Usage Tips:</p>
              <ul className="space-y-1">
                <li>• FREE limits reset monthly on the 1st</li>
                <li>• Story Pack lasts exactly 30 days from purchase</li>
                <li>• Competition entries are always FREE (no upgrades)</li>
                {isStoryPackActive && (
                  <li>• Your Story Pack benefits expire in {usageStats.daysRemaining} days</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}