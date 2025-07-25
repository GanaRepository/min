// // app/create-stories/page.tsx
// 'use client';

// import { useState, useEffect } from 'react';
// import { useSession } from 'next-auth/react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { motion, AnimatePresence } from 'framer-motion';
// import Image from 'next/image';
// import {
//   Sparkles,
//   BookOpen,
//   Users,
//   Target,
//   Palette,
//   Star,
//   Compass,
//   Wand2,
//   HelpCircle,
//   Rocket,
//   Smile,
//   Heart,
//   Castle,
//   Baby,
//   TreePine,
//   Waves,
//   Building,
//   Home,
//   Mountain,
//   Sun,
//   Eye,
//   Gamepad2,
//   Crown,
//   Shield,
//   Flame,
//   Zap,
//   Gift,
//   Sword,
//   Trophy,
//   HandHeart,
//   Award,
//   TrendingUp,
//   UserCheck,
//   Play,
//   ArrowRight,
//   Check,
//   ChevronRight,
//   PenTool,
//   MessageSquare,
//   Lightbulb,
//   Brain,
//   Globe,
//   Clock,
//   CheckCircle,
//   Feather,
//   Share2,
//   ArrowLeft,
// } from 'lucide-react';
// import { useToast } from '@/hooks/use-toast';
// import { STORY_ELEMENTS } from '@/config/story-elements';
// import Link from 'next/link';

// import {
//   ToastProvider,
//   Toast,
//   ToastTitle,
//   ToastDescription,
//   ToastClose,
//   ToastViewport,
// } from '@/components/ui/toast';

// interface SelectedElements {
//   genre: string;
//   character: string;
//   setting: string;
//   theme: string;
//   mood: string;
//   tone: string;
//   [key: string]: string;
// }

// const steps = [
//   {
//     id: 'genre',
//     title: 'Choose Your Genre',
//     description: 'What type of story excites you?',
//   },
//   {
//     id: 'character',
//     title: 'Pick Your Hero',
//     description: 'Who will be the star of your adventure?',
//   },
//   {
//     id: 'setting',
//     title: 'Select Your World',
//     description: 'Where will your story take place?',
//   },
//   {
//     id: 'theme',
//     title: 'Choose Your Theme',
//     description: 'What will your story be about?',
//   },
//   {
//     id: 'mood',
//     title: 'Set the Mood',
//     description: 'How should your story feel?',
//   },
//   {
//     id: 'tone',
//     title: 'Pick Your Tone',
//     description: 'What style fits your story?',
//   },
// ];

// export default function CreateStoriesPage() {
//   const { data: session, status } = useSession();
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const { toast } = useToast();

//   const [currentStep, setCurrentStep] = useState(0);
//   const [selectedElements, setSelectedElements] = useState<SelectedElements>({
//     genre: '',
//     character: '',
//     setting: '',
//     theme: '',
//     mood: '',
//     tone: '',
//   });
//   const [isCreating, setIsCreating] = useState(false);
//   const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState(false);
//   const [isProcessingPendingToken, setIsProcessingPendingToken] =
//     useState(false);
//   const [turns, setTurns] = useState<{ content: string }[]>([
//     { content: 'Welcome to your magical adventure!' },
//     { content: 'What happens next in your story?' },
//   ]);
//   const [currentTurn, setCurrentTurn] = useState<number>(0);
//   const [toastMessage, setToastMessage] = useState<string | null>(null);
//   const [toastType, setToastType] = useState<'default' | 'destructive'>(
//     'default'
//   );

//   // Helper functions must be inside the component to access state
//   function isCurrentStepComplete(stepIndex: number) {
//     const stepId = steps[stepIndex]?.id;
//     return stepId ? selectedElements[stepId] !== '' : false;
//   }

//   function scrollToStoryElements() {
//     const storyElementsSection = document.getElementById('story-elements');
//     if (storyElementsSection) {
//       storyElementsSection.scrollIntoView({
//         behavior: 'smooth',
//         block: 'start',
//       });
//     }
//   }

//   // FIXED: Handle pending token processing
//   useEffect(() => {
//     const pendingToken = searchParams?.get('pendingToken');

//     // FIXED: Only process when user is authenticated and we haven't processed yet
//     if (
//       pendingToken &&
//       status === 'authenticated' &&
//       session?.user?.role === 'child' &&
//       !hasLoadedFromStorage &&
//       !isProcessingPendingToken
//     ) {
//       console.log(
//         '🔄 Found pending token after authentication, auto-creating story...'
//       );
//       // Do NOT automatically load and create story from pending token. Only do this after explicit user action.
//     } else if (
//       !pendingToken &&
//       typeof window !== 'undefined' &&
//       !hasLoadedFromStorage &&
//       status !== 'loading'
//     ) {
//       // Fallback: load from localStorage if no backend token
//       const pendingElements = localStorage.getItem('pendingStoryElements');
//       if (pendingElements) {
//         try {
//           const parsed = JSON.parse(pendingElements);
//           setSelectedElements(parsed);

//           const completedSteps = Object.values(parsed).filter(
//             (v) => v !== ''
//           ).length;
//           if (completedSteps > 0) {
//             setCurrentStep(Math.min(completedSteps, steps.length - 1));
//           }

//           localStorage.removeItem('pendingStoryElements');

//           toast({
//             title: '✨ Welcome back!',
//             description: 'Your story elements have been restored.',
//           });
//         } catch (error) {
//           console.error('Error loading pending elements:', error);
//           localStorage.removeItem('pendingStoryElements');
//         }
//       }
//       setHasLoadedFromStorage(true);
//     }
//   }, [
//     searchParams,
//     session,
//     status,
//     hasLoadedFromStorage,
//     isProcessingPendingToken,
//     toast,
//     router,
//   ]);

//   const currentStepData = steps[currentStep];
//   const elementType = currentStepData.id as keyof typeof STORY_ELEMENTS;
//   const currentElements = STORY_ELEMENTS[elementType] || [];

//   const handleElementSelect = (elementName: string) => {
//     setSelectedElements((prev) => ({
//       ...prev,
//       [elementType]: elementName,
//     }));
//   };

//   const handleNext = () => {
//     if (currentStep < steps.length - 1) {
//       setCurrentStep(currentStep + 1);
//     } else {
//       // Only call handleCreateStory() after user clicks 'Create My Story'.
//     }
//   };

//   const handleBack = () => {
//     if (currentStep > 0) {
//       setCurrentStep(currentStep - 1);
//     }
//   };

//   // FIXED: Handle pending token processing after authentication
//   useEffect(() => {
//     const pendingToken = searchParams?.get('pendingToken');
//     // Only process when user is authenticated and we haven't processed yet
//     if (
//       pendingToken &&
//       status === 'authenticated' &&
//       session?.user?.role === 'child' &&
//       !hasLoadedFromStorage &&
//       !isProcessingPendingToken
//     ) {
//       createStoryFromPendingToken(pendingToken);
//     }
//   }, [
//     searchParams,
//     session,
//     status,
//     hasLoadedFromStorage,
//     isProcessingPendingToken,
//   ]);

//   // FIXED: Create story from pending token
//   // FIXED: Create story from pending token
//   const createStoryFromPendingToken = async (token: string) => {
//     try {
//       setIsProcessingPendingToken(true);
//       toast({
//         title: '🔄 Restoring Your Progress',
//         description: 'Creating your story from saved elements...',
//       });

//       // Use the same API but with pendingToken
//       const response = await fetch('/api/stories/create-session', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ pendingToken: token }),
//       });

//       const data = await response.json();

//       if (!response.ok || !data.success) {
//         console.error('Create-from-token error:', data.error);
//         toast({
//           title: '❌ Error',
//           description:
//             data.error ||
//             'Failed to create story from saved elements. Please try again.',
//           variant: 'destructive',
//         });
//         router.replace('/create-stories');
//         return;
//       }

//       toast({
//         title: '🎉 Story Created!',
//         description: 'Your magical adventure begins now!',
//       });
//       router.replace(`/children-dashboard/story/${data.session.id}`);
//     } catch (error) {
//       console.error('❌ Error processing pending token:', error);
//       toast({
//         title: '❌ Error',
//         description:
//           error instanceof Error
//             ? error.message
//             : 'Please select your story elements again.',
//         variant: 'destructive',
//       });
//       router.replace('/create-stories');
//     } finally {
//       setIsProcessingPendingToken(false);
//       setHasLoadedFromStorage(true);
//     }
//   };

//   // Make allStepsComplete available in component scope
//   const allStepsComplete = Object.values(selectedElements).every(
//     (value) => value !== ''
//   );

//   // FIXED: Handle authentication flow properly
//   // FIXED: Handle authentication flow properly
//   const handleCreateStory = async () => {
//     setIsCreating(true);

//     try {
//       // Validate that all elements are selected
//       const incompleteElements = Object.entries(selectedElements).filter(
//         ([_, value]) => !value
//       );
//       if (incompleteElements.length > 0) {
//         toast({
//           title: '❌ Incomplete Selection',
//           description: 'Please select all story elements first!',
//           variant: 'destructive',
//         });
//         setIsCreating(false);
//         return;
//       }

//       toast({
//         title: '✨ Creating Your Story',
//         description: 'Getting everything ready for your creative adventure...',
//       });

//       // Always call the same API with elements
//       const response = await fetch('/api/stories/create-session', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ elements: selectedElements }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         console.error('Create-session error:', data.error);
//         toast({
//           title: '❌ Error',
//           description: data.error || 'Failed to create story session',
//           variant: 'destructive',
//         });
//         setIsCreating(false);
//         return;
//       }

//       // Case 1: Need authentication (unauthenticated user)
//       if (data.requiresAuth) {
//         toast({
//           title: '🔒 Login Required',
//           description:
//             "Please log in to create your story. We'll save your progress!",
//         });

//         const callbackUrl = `/create-stories?pendingToken=${data.token}`;
//         router.push(
//           `/login/child?callbackUrl=${encodeURIComponent(callbackUrl)}`
//         );
//         return;
//       }

//       // Case 2: Story created successfully (authenticated user)
//       if (data.success) {
//         toast({
//           title: '🎉 Story Created!',
//           description: 'Your magical adventure begins now!',
//         });

//         // Clear any localStorage
//         if (typeof window !== 'undefined') {
//           localStorage.removeItem('pendingStoryElements');
//         }

//         router.push(`/children-dashboard/story/${data.session.id}`);
//         return;
//       }

//       // Unexpected response
//       toast({
//         title: '❌ Unexpected Error',
//         description: 'Something went wrong. Please try again.',
//         variant: 'destructive',
//       });
//     } catch (error) {
//       console.error('❌ Error creating story:', error);
//       toast({
//         title: '❌ Error',
//         description:
//           error instanceof Error
//             ? error.message
//             : 'Something went wrong. Please try again.',
//         variant: 'destructive',
//       });
//     } finally {
//       setIsCreating(false);
//     }
//   };
//   return (
//     <ToastProvider>
//       <div className="text-white min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 relative overflow-hidden">
//         {/* Toast notifications */}
//         {toastMessage && (
//           <Toast
//             variant={toastType}
//             className="fixed top-4 right-4 z-50 w-auto max-w-md bg-gray-900/90 border border-gray-700/60 shadow-lg"
//           >
//             <div className="flex">
//               <div className="flex-1">
//                 <ToastTitle
//                   className={
//                     toastType === 'default' ? 'text-green-400' : 'text-red-300'
//                   }
//                 >
//                   {toastType === 'default' ? 'Success' : 'Error'}
//                 </ToastTitle>
//                 <ToastDescription className="text-white">
//                   {toastMessage}
//                 </ToastDescription>
//               </div>
//               <ToastClose
//                 onClick={() => setToastMessage(null)}
//                 className="opacity-100 text-white hover:text-gray-500"
//               />
//             </div>
//           </Toast>
//         )}
//         <ToastViewport />
//         <div className="absolute inset-0 opacity-5">
//           <svg width="100%" height="100%" className="absolute inset-0">
//             <defs>
//               <pattern
//                 id="grid"
//                 width="40"
//                 height="40"
//                 patternUnits="userSpaceOnUse"
//               >
//                 <path
//                   d="M 40 0 L 0 0 0 40"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="1"
//                 />
//               </pattern>
//             </defs>
//             <rect width="100%" height="100%" fill="url(#grid)" />
//           </svg>
//         </div>

//         {/* Animated Floating Elements */}
//         <div className="absolute inset-0 overflow-hidden pointer-events-none">
//           {/* Large Floating Orbs */}
//           <motion.div
//             className="absolute w-96 h-96 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-full blur-3xl"
//             animate={{
//               x: [0, 100, 0],
//               y: [0, -50, 0],
//               scale: [1, 1.2, 1],
//             }}
//             transition={{
//               duration: 20,
//               repeat: Infinity,
//               ease: 'easeInOut',
//             }}
//             style={{
//               top: '10%',
//               left: '10%',
//             }}
//           />

//           <motion.div
//             className="absolute w-80 h-80 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-full blur-3xl"
//             animate={{
//               x: [0, -80, 0],
//               y: [0, 60, 0],
//               scale: [1, 0.8, 1],
//             }}
//             transition={{
//               duration: 25,
//               repeat: Infinity,
//               ease: 'easeInOut',
//               delay: 2,
//             }}
//             style={{
//               top: '60%',
//               right: '10%',
//             }}
//           />

//           {/* Floating Particles */}
//           {[...Array(20)].map((_, i) => (
//             <motion.div
//               key={i}
//               className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
//               animate={{
//                 y: [0, -100, 0],
//                 x: [0, Math.random() * 50 - 25, 0],
//                 opacity: [0, 1, 0],
//                 scale: [0, 1, 0],
//               }}
//               transition={{
//                 duration: Math.random() * 10 + 5,
//                 repeat: Infinity,
//                 delay: Math.random() * 5,
//                 ease: 'easeInOut',
//               }}
//               style={{
//                 left: `${Math.random() * 100}%`,
//                 top: `${Math.random() * 100}%`,
//               }}
//             />
//           ))}
//         </div>

//         {/* Enhanced Hero Section */}
//         <div className="relative min-h-screen flex items-center px-4 sm:px-6 lg:px-8 py-16">
//           <div className="max-w-7xl mx-auto w-full">
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
//               {/* Left Content */}
//               <motion.div
//                 className="space-y-8"
//                 initial={{ opacity: 0, x: -100 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ duration: 1, delay: 0.2 }}
//               >
//                 <motion.div
//                   className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-400/30 backdrop-blur-xl"
//                   initial={{ opacity: 0, scale: 0.8 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   transition={{ delay: 0.4, duration: 0.8 }}
//                   whileHover={{ scale: 1.05 }}
//                 >
//                   <motion.div
//                     animate={{ rotate: [0, 360] }}
//                     transition={{
//                       duration: 3,
//                       repeat: Infinity,
//                       ease: 'linear',
//                     }}
//                   >
//                     <Sparkles className="w-4 h-4 text-purple-400 mr-2" />
//                   </motion.div>
//                   <span className="text-purple-200 font-medium text-sm">
//                     Start Your Creative Journey
//                   </span>
//                 </motion.div>

//                 <motion.div
//                   initial={{ opacity: 0, y: 30 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: 0.6, duration: 0.8 }}
//                 >
//                   <h1 className="font-bold text-4xl sm:text-5xl lg:text-6xl leading-tight tracking-tight">
//                     <motion.span
//                       className="block text-white"
//                       initial={{ opacity: 0, x: -20 }}
//                       animate={{ opacity: 1, x: 0 }}
//                       transition={{ delay: 0.8, duration: 0.6 }}
//                     >
//                       How to Create
//                     </motion.span>
//                     <motion.span
//                       className="block bg-gradient-to-r from-purple-400 via-pink-300 to-cyan-400 bg-clip-text text-transparent"
//                       initial={{ opacity: 0, x: 20 }}
//                       animate={{ opacity: 1, x: 0 }}
//                       transition={{ delay: 1.0, duration: 0.6 }}
//                     >
//                       Amazing Stories
//                     </motion.span>
//                   </h1>
//                 </motion.div>

//                 <motion.p
//                   className="text-xl text-gray-300 leading-relaxed"
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: 1.2, duration: 0.8 }}
//                 >
//                   Follow our simple 6-step process to transform your imagination
//                   into incredible stories with AI collaboration and teacher
//                   mentorship.
//                 </motion.p>

//                 <motion.div
//                   className="flex flex-col sm:flex-row gap-4"
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: 1.4, duration: 0.8 }}
//                 >
//                   <Link href="/contact-us">
//                     <motion.button
//                       className="group relative px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl font-semibold text-lg text-white shadow-lg shadow-purple-500/25 overflow-hidden"
//                       whileHover={{
//                         scale: 1.05,
//                         boxShadow: '0 20px 40px -10px rgba(147, 51, 234, 0.6)',
//                       }}
//                       whileTap={{ scale: 0.95 }}
//                     >
//                       <span className="relative z-10 flex items-center">
//                         <motion.div
//                           animate={{ x: [0, 5, 0] }}
//                           transition={{ duration: 1.5, repeat: Infinity }}
//                         >
//                           <Play className="w-5 h-5 mr-2" />
//                         </motion.div>
//                         Know More →
//                       </span>
//                       <motion.div
//                         className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-500"
//                         initial={{ x: '-100%' }}
//                         whileHover={{ x: '0%' }}
//                         transition={{ duration: 0.3 }}
//                       />
//                     </motion.button>
//                   </Link>
//                 </motion.div>
//               </motion.div>

//               {/* Right Side - Enhanced 3D Animated Scene */}
//               <motion.div
//                 className="relative flex justify-center items-center h-[600px]"
//                 initial={{ opacity: 0, x: 100 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ duration: 1, delay: 0.8 }}
//               >
//                 <motion.div
//                   className="relative z-20"
//                   animate={{
//                     y: [0, -20, 0],
//                     rotateY: [0, 5, 0, -5, 0],
//                   }}
//                   transition={{
//                     duration: 6,
//                     repeat: Infinity,
//                     ease: 'easeInOut',
//                   }}
//                 >
//                   <motion.div
//                     className="relative w-[32rem] h-96 bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-2xl rounded-3xl border border-cyan-400/30 shadow-2xl overflow-hidden"
//                     whileHover={{
//                       scale: 1.05,
//                       rotateY: 10,
//                       boxShadow: '0 30px 60px -10px rgba(34, 211, 238, 0.4)',
//                     }}
//                     style={{
//                       transformStyle: 'preserve-3d',
//                     }}
//                   >
//                     <div className="absolute inset-0">
//                       <Image
//                         src="/kid7.jpg"
//                         alt="Creative young writer"
//                         fill
//                         className="object-cover"
//                         sizes="32rem"
//                       />
//                       <div className="absolute inset-0 bg-gray-900/70" />
//                     </div>

//                     <div className="absolute inset-0">
//                       <motion.div
//                         className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-cyan-500/20"
//                         animate={{
//                           background: [
//                             'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(34, 211, 238, 0.2) 100%)',
//                             'linear-gradient(135deg, rgba(34, 211, 238, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)',
//                             'linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
//                           ],
//                         }}
//                         transition={{
//                           duration: 8,
//                           repeat: Infinity,
//                           ease: 'easeInOut',
//                         }}
//                       />
//                     </div>

//                     <div className="relative z-10 p-8 h-full flex flex-col justify-between">
//                       <div className="text-center">
//                         <motion.div
//                           className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
//                           animate={{
//                             rotate: [0, 360],
//                             scale: [1, 1.1, 1],
//                           }}
//                           transition={{
//                             duration: 4,
//                             repeat: Infinity,
//                             ease: 'linear',
//                           }}
//                         >
//                           <span className="text-white font-bold text-xl">
//                             M
//                           </span>
//                         </motion.div>

//                         <motion.h3
//                           className="text-2xl font-bold text-white mb-2"
//                           animate={{
//                             opacity: [0.8, 1, 0.8],
//                           }}
//                           transition={{
//                             duration: 3,
//                             repeat: Infinity,
//                           }}
//                         >
//                           Mintoons
//                         </motion.h3>

//                         <p className="text-cyan-300 text-sm font-medium">
//                           "How to Create Amazing Stories"
//                         </p>
//                       </div>

//                       <div className="space-y-3">
//                         {[...Array(6)].map((_, i) => (
//                           <motion.div
//                             key={i}
//                             className="h-2 bg-gradient-to-r from-gray-600/50 to-transparent rounded-full"
//                             initial={{ width: 0 }}
//                             animate={{
//                               width: `${Math.random() * 40 + 60}%`,
//                               opacity: [0.3, 0.8, 0.3],
//                             }}
//                             transition={{
//                               duration: 2,
//                               repeat: Infinity,
//                               delay: i * 0.3,
//                               ease: 'easeInOut',
//                             }}
//                           />
//                         ))}
//                       </div>

//                       <div className="flex justify-center space-x-8">
//                         {[Feather, Palette, Sparkles, BookOpen].map(
//                           (Icon, i) => (
//                             <motion.div
//                               key={i}
//                               className="w-8 h-8 bg-gray-700/50 rounded-lg flex items-center justify-center"
//                               animate={{
//                                 scale: [1, 1.2, 1],
//                                 opacity: [0.5, 1, 0.5],
//                               }}
//                               transition={{
//                                 duration: 2,
//                                 repeat: Infinity,
//                                 delay: i * 0.4,
//                               }}
//                             >
//                               <Icon className="w-4 h-4 text-cyan-400" />
//                             </motion.div>
//                           )
//                         )}
//                       </div>
//                     </div>

//                     <motion.div
//                       className="absolute inset-0 rounded-3xl border-2 border-transparent"
//                       animate={{
//                         borderColor: [
//                           'rgba(34, 211, 238, 0.5)',
//                           'rgba(168, 85, 247, 0.5)',
//                           'rgba(236, 72, 153, 0.5)',
//                           'rgba(34, 211, 238, 0.5)',
//                         ],
//                       }}
//                       transition={{
//                         duration: 4,
//                         repeat: Infinity,
//                       }}
//                     />
//                   </motion.div>
//                 </motion.div>

//                 <motion.div
//                   className="absolute w-full h-full"
//                   animate={{ rotate: [0, 360] }}
//                   transition={{
//                     duration: 30,
//                     repeat: Infinity,
//                     ease: 'linear',
//                   }}
//                 >
//                   {[
//                     {
//                       icon: Target,
//                       color: 'from-purple-500 to-indigo-600',
//                       position:
//                         'top-0 left-1/2 -translate-x-1/2 -translate-y-8',
//                     },
//                     {
//                       icon: PenTool,
//                       color: 'from-blue-500 to-cyan-600',
//                       position:
//                         'right-0 top-1/2 -translate-y-1/2 translate-x-8',
//                     },
//                     {
//                       icon: MessageSquare,
//                       color: 'from-orange-500 to-red-600',
//                       position:
//                         'bottom-0 left-1/2 -translate-x-1/2 translate-y-8',
//                     },
//                     {
//                       icon: Share2,
//                       color: 'from-pink-500 to-purple-600',
//                       position:
//                         'left-0 top-1/2 -translate-y-1/2 -translate-x-8',
//                     },
//                   ].map((item, i) => (
//                     <motion.div
//                       key={i}
//                       className={`absolute ${item.position} w-16 h-16 bg-gradient-to-r ${item.color} rounded-full flex items-center justify-center shadow-lg opacity-80`}
//                       animate={{
//                         rotate: [0, -360],
//                         scale: [1, 1.2, 1],
//                       }}
//                       transition={{
//                         rotate: {
//                           duration: 30,
//                           repeat: Infinity,
//                           ease: 'linear',
//                         },
//                         scale: {
//                           duration: 3,
//                           repeat: Infinity,
//                           delay: i * 0.5,
//                         },
//                       }}
//                       whileHover={{ scale: 1.3, opacity: 1 }}
//                     >
//                       <item.icon className="w-8 h-8 text-white" />
//                     </motion.div>
//                   ))}
//                 </motion.div>

//                 <motion.div
//                   className="absolute -top-20 -left-20 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-sm text-white border border-white/20"
//                   animate={{
//                     y: [0, -10, 0],
//                     opacity: [0.7, 1, 0.7],
//                   }}
//                   transition={{
//                     duration: 3,
//                     repeat: Infinity,
//                     delay: 1,
//                   }}
//                 >
//                   ✨ Choose Elements
//                 </motion.div>

//                 <motion.div
//                   className="absolute -bottom-20 -right-20 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-sm text-white border border-white/20"
//                   animate={{
//                     y: [0, 10, 0],
//                     opacity: [0.7, 1, 0.7],
//                   }}
//                   transition={{
//                     duration: 3,
//                     repeat: Infinity,
//                     delay: 2,
//                   }}
//                 >
//                   📚 Publish Stories
//                 </motion.div>

//                 <motion.div
//                   className="absolute top-1/2 -right-32 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-sm text-white border border-white/20"
//                   animate={{
//                     x: [0, 10, 0],
//                     opacity: [0.7, 1, 0.7],
//                   }}
//                   transition={{
//                     duration: 3,
//                     repeat: Infinity,
//                     delay: 0.5,
//                   }}
//                 >
//                   🤖 AI Collaboration
//                 </motion.div>
//               </motion.div>
//             </div>
//           </div>
//         </div>

//         {/* How It Works Section */}
//         <div className="relative px-4 sm:px-6 lg:px-8 py-20 bg-gray-900/50">
//           <div className="max-w-6xl mx-auto">
//             <motion.div
//               initial={{ opacity: 0, y: 30 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.8 }}
//               viewport={{ once: true }}
//               className="text-center mb-16"
//             >
//               <h2 className="text-4xl font-bold mb-6">
//                 How{' '}
//                 <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
//                   It Works
//                 </span>
//               </h2>
//               <p className="text-xl text-gray-300 max-w-3xl mx-auto">
//                 Our AI-powered platform makes story creation fun and educational
//                 through collaborative writing
//               </p>
//             </motion.div>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//               {[
//                 {
//                   step: '01',
//                   title: 'Choose Elements',
//                   description:
//                     'Select your favorite story elements from our curated collection',
//                   icon: Target,
//                   color: 'from-blue-500 to-cyan-500',
//                 },
//                 {
//                   step: '02',
//                   title: 'AI Collaboration',
//                   description:
//                     'Our AI creates story prompts based on your choices and guides your writing',
//                   icon: Brain,
//                   color: 'from-purple-500 to-pink-500',
//                 },
//                 {
//                   step: '03',
//                   title: 'Create Together',
//                   description:
//                     'Write your story with AI assistance, getting real-time feedback and suggestions',
//                   icon: PenTool,
//                   color: 'from-green-500 to-emerald-500',
//                 },
//               ].map((item, index) => (
//                 <motion.div
//                   key={index}
//                   initial={{ opacity: 0, y: 30 }}
//                   whileInView={{ opacity: 1, y: 0 }}
//                   transition={{ duration: 0.6, delay: index * 0.2 }}
//                   viewport={{ once: true }}
//                   className="relative"
//                 >
//                   <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 h-full">
//                     <div
//                       className={`w-16 h-16 bg-gradient-to-r ${item.color} rounded-xl flex items-center justify-center mb-6`}
//                     >
//                       <item.icon className="w-8 h-8 text-white" />
//                     </div>

//                     <div className="mb-4">
//                       <span className="text-sm font-mono text-gray-400 block mb-2">
//                         STEP {item.step}
//                       </span>
//                       <h3 className="text-2xl font-bold text-white mb-3">
//                         {item.title}
//                       </h3>
//                     </div>

//                     <p className="text-gray-300 leading-relaxed">
//                       {item.description}
//                     </p>
//                   </div>

//                   {index < 2 && (
//                     <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-cyan-400 to-transparent transform -translate-y-1/2" />
//                   )}
//                 </motion.div>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* CTA Section */}
//         <div className="relative px-4 sm:px-6 lg:px-8 py-20 bg-gradient-to-r from-purple-900/50 to-cyan-900/50">
//           <div className="max-w-4xl mx-auto text-center">
//             <motion.div
//               initial={{ opacity: 0, y: 30 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.8 }}
//               viewport={{ once: true }}
//             >
//               <h2 className="text-4xl font-bold mb-6">
//                 Ready to Start Your
//                 <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
//                   {' '}
//                   Story Adventure?
//                 </span>
//               </h2>
//               <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
//                 Join thousands of young writers who are already creating amazing
//                 stories with AI assistance
//               </p>

//               <motion.button
//                 onClick={scrollToStoryElements}
//                 className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl text-white font-semibold text-lg shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/40 transition-all duration-300"
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//               >
//                 <Play className="w-5 h-5 mr-2" />
//                 Start Creating Now
//                 <ArrowRight className="w-5 h-5 ml-2" />
//               </motion.button>

//               <div className="mt-8 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-sm text-gray-400">
//                 <div className="flex items-center">
//                   <Check className="w-4 h-4 text-green-400 mr-2" />
//                   <span>Free to start</span>
//                 </div>
//                 <div className="flex items-center">
//                   <Check className="w-4 h-4 text-green-400 mr-2" />
//                   <span>No credit card required</span>
//                 </div>
//                 <div className="flex items-center">
//                   <Check className="w-4 h-4 text-green-400 mr-2" />
//                   <span>Safe for children</span>
//                 </div>
//               </div>
//             </motion.div>
//           </div>
//         </div>

//         {/* Features Section */}
//         <div className="relative px-4 sm:px-6 lg:px-8 py-20">
//           <div className="max-w-6xl mx-auto">
//             <motion.div
//               initial={{ opacity: 0, y: 30 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.8 }}
//               viewport={{ once: true }}
//               className="text-center mb-16"
//             >
//               <h2 className="text-4xl font-bold mb-6">
//                 Why Choose{' '}
//                 <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
//                   Mintoons
//                 </span>
//               </h2>
//               <p className="text-xl text-gray-300 max-w-3xl mx-auto">
//                 Advanced features designed to make story writing engaging,
//                 educational, and fun for children
//               </p>
//             </motion.div>

//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//               {[
//                 {
//                   title: 'AI-Powered Assistance',
//                   description:
//                     "Smart AI that adapts to your child's writing level and provides helpful suggestions",
//                   icon: Brain,
//                   color: 'from-purple-500 to-indigo-500',
//                 },
//                 {
//                   title: 'Age-Appropriate Content',
//                   description:
//                     'All content is filtered and optimized for different age groups and learning levels',
//                   icon: Shield,
//                   color: 'from-green-500 to-teal-500',
//                 },
//                 {
//                   title: 'Real-time Feedback',
//                   description:
//                     'Instant feedback on grammar, creativity, and story structure as you write',
//                   icon: MessageSquare,
//                   color: 'from-blue-500 to-cyan-500',
//                 },
//                 {
//                   title: 'Progress Tracking',
//                   description:
//                     'Monitor writing improvement with detailed analytics and achievement systems',
//                   icon: TrendingUp,
//                   color: 'from-orange-500 to-red-500',
//                 },
//                 {
//                   title: 'Creative Elements',
//                   description:
//                     'Hundreds of story elements to choose from for endless creative possibilities',
//                   icon: Lightbulb,
//                   color: 'from-yellow-500 to-orange-500',
//                 },
//                 {
//                   title: 'Safe Environment',
//                   description:
//                     'Secure platform with parental controls and content moderation',
//                   icon: Shield,
//                   color: 'from-pink-500 to-purple-500',
//                 },
//                 {
//                   title: 'Export Stories',
//                   description:
//                     'Download completed stories as PDF or Word documents to share and print',
//                   icon: BookOpen,
//                   color: 'from-indigo-500 to-purple-500',
//                 },
//                 {
//                   title: '24/7 Support',
//                   description:
//                     'Round-the-clock support for both children and parents',
//                   icon: Clock,
//                   color: 'from-teal-500 to-green-500',
//                 },
//               ].map((feature, index) => (
//                 <motion.div
//                   key={index}
//                   initial={{ opacity: 0, y: 30 }}
//                   whileInView={{ opacity: 1, y: 0 }}
//                   transition={{ duration: 0.6, delay: index * 0.1 }}
//                   viewport={{ once: true }}
//                   className="group"
//                 >
//                   <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 h-full">
//                     <div
//                       className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
//                     >
//                       <feature.icon className="w-6 h-6 text-white" />
//                     </div>

//                     <h3 className="text-lg font-semibold text-white mb-3">
//                       {feature.title}
//                     </h3>

//                     <p className="text-sm text-gray-300 leading-relaxed">
//                       {feature.description}
//                     </p>
//                   </div>
//                 </motion.div>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* STORY ELEMENTS SELECTION SECTION */}
//         <div
//           className="relative z-10 min-h-screen flex flex-col"
//           id="story-elements"
//         >
//           <div className="sticky top-0 z-30 bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50">
//             <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//               <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-2xl font-bold text-white">
//                   Step {currentStep + 1} of {steps.length}
//                 </h2>
//               </div>

//               <div className="mb-4">
//                 <h3 className="text-xl text-cyan-400 font-semibold mb-2">
//                   {currentStepData.title}
//                 </h3>
//                 <p className="text-gray-300">{currentStepData.description}</p>
//               </div>

//               <div className="w-full bg-gray-700/50 rounded-full h-2">
//                 <motion.div
//                   className="h-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
//                   initial={{ width: 0 }}
//                   animate={{
//                     width: `${((currentStep + (isCurrentStepComplete(currentStep) ? 1 : 0)) / steps.length) * 100}%`,
//                   }}
//                   transition={{ duration: 0.5, ease: 'easeInOut' }}
//                 />
//               </div>

//               <div className="flex justify-between mt-4 text-xs">
//                 {steps.map((step, index) => {
//                   const isCompleted =
//                     selectedElements[step.id as keyof SelectedElements] !== '';
//                   const isCurrent = index === currentStep;

//                   return (
//                     <div
//                       key={step.id}
//                       className={`flex flex-col items-center space-y-1 ${
//                         isCurrent
//                           ? 'text-cyan-400'
//                           : isCompleted
//                             ? 'text-green-400'
//                             : 'text-gray-500'
//                       }`}
//                     >
//                       <div
//                         className={`w-3 h-3 rounded-full ${
//                           isCurrent
//                             ? 'bg-cyan-400 animate-pulse'
//                             : isCompleted
//                               ? 'bg-green-400'
//                               : 'bg-gray-600'
//                         }`}
//                       />
//                       <span className="hidden sm:block text-center max-w-16">
//                         {step.title.split(' ')[0]}
//                       </span>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>

//           <main className="flex-1 p-4 sm:p-6 mt-8 mb-8">
//             <div className="max-w-7xl mx-auto">
//               <AnimatePresence mode="wait">
//                 <motion.div
//                   key={currentStep}
//                   initial={{ opacity: 0, y: 40 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0, y: -40 }}
//                   transition={{ duration: 0.4 }}
//                   className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8"
//                 >
//                   {currentElements.map((element: any, index: number) => {
//                     const isSelected =
//                       selectedElements[elementType as string] === element.name;
//                     const IconComponent = element.icon;

//                     return (
//                       <motion.button
//                         key={`${String(elementType)}-${element.name}-${index}`}
//                         initial={{ opacity: 0, y: 20 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{ delay: 0.1 + index * 0.05 }}
//                         whileHover={{
//                           y: -8,
//                           scale: 1.02,
//                           transition: { duration: 0.2 },
//                         }}
//                         whileTap={{ scale: 0.98 }}
//                         onClick={() => handleElementSelect(element.name)}
//                         className={`relative p-6 rounded-2xl border-2 transition-all duration-300 group overflow-hidden ${
//                           isSelected
//                             ? `bg-gradient-to-br ${element.color} border-white/30 text-white shadow-2xl shadow-black/20`
//                             : 'bg-gray-800/60 border-gray-600/40 text-gray-300 hover:border-gray-500/60 hover:bg-gray-700/60'
//                         }`}
//                       >
//                         <div className="absolute inset-0 opacity-10">
//                           <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
//                         </div>

//                         {isSelected && (
//                           <motion.div
//                             initial={{ scale: 0, rotate: -180 }}
//                             animate={{ scale: 1, rotate: 0 }}
//                             transition={{ type: 'spring', duration: 0.6 }}
//                             className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30"
//                           >
//                             <Check className="w-4 h-4 text-white" />
//                           </motion.div>
//                         )}

//                         <div className="relative z-10 flex items-center justify-between mb-4">
//                           <div className="text-4xl">{element.emoji}</div>
//                           <motion.div
//                             className={`p-3 rounded-xl ${isSelected ? 'bg-white/20' : 'bg-gray-700/50 group-hover:bg-gray-600/50'} transition-colors`}
//                             whileHover={{ rotate: 15, scale: 1.1 }}
//                             transition={{ type: 'spring', duration: 0.3 }}
//                           >
//                             <IconComponent
//                               className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-gray-400 group-hover:text-white'} transition-colors`}
//                             />
//                           </motion.div>
//                         </div>

//                         <h3
//                           className={`font-bold text-lg mb-3 relative z-10 ${
//                             isSelected
//                               ? 'text-white'
//                               : 'text-white group-hover:text-white'
//                           } transition-colors`}
//                         >
//                           {element.name}
//                         </h3>

//                         <div className="relative z-10">
//                           <div
//                             className={`w-full h-1 rounded-full overflow-hidden ${
//                               isSelected
//                                 ? 'bg-white/30'
//                                 : 'bg-gray-600 group-hover:bg-gray-500'
//                             } transition-colors`}
//                           >
//                             <motion.div
//                               className={`h-full ${
//                                 isSelected
//                                   ? 'bg-white'
//                                   : 'bg-gradient-to-r from-blue-500 to-green-500 opacity-0 group-hover:opacity-100'
//                               } transition-opacity`}
//                               initial={{ width: '0%' }}
//                               animate={{ width: isSelected ? '100%' : '0%' }}
//                               whileHover={{ width: '100%' }}
//                               transition={{ duration: 0.3 }}
//                             />
//                           </div>
//                         </div>

//                         {isSelected && (
//                           <div className="absolute inset-0 overflow-hidden pointer-events-none">
//                             {[...Array(6)].map((_, i) => (
//                               <motion.div
//                                 key={i}
//                                 className="absolute w-1 h-1 bg-white rounded-full"
//                                 animate={{
//                                   y: [20, -20, 20],
//                                   x: [0, Math.random() * 10 - 5, 0],
//                                   opacity: [0, 1, 0],
//                                 }}
//                                 transition={{
//                                   duration: 2 + Math.random() * 2,
//                                   repeat: Infinity,
//                                   delay: Math.random() * 2,
//                                 }}
//                                 style={{
//                                   left: `${20 + Math.random() * 60}%`,
//                                   top: `${50 + Math.random() * 30}%`,
//                                 }}
//                               />
//                             ))}
//                           </div>
//                         )}
//                       </motion.button>
//                     );
//                   })}
//                 </motion.div>
//               </AnimatePresence>

//               <motion.div
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ delay: 0.5 }}
//                 className="flex items-center justify-between mb-8"
//               >
//                 <motion.button
//                   whileHover={{ x: -2 }}
//                   whileTap={{ scale: 0.98 }}
//                   onClick={handleBack}
//                   disabled={currentStep === 0}
//                   className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
//                     currentStep === 0
//                       ? 'text-gray-500 cursor-not-allowed bg-gray-800'
//                       : 'text-gray-300 hover:text-white hover:bg-gray-700/50 bg-gray-800/50'
//                   }`}
//                 >
//                   <ArrowLeft className="w-4 h-4" />
//                   <span>Back</span>
//                 </motion.button>

//                 <div className="text-center">
//                   <div
//                     className={`text-sm mb-1 ${
//                       isCurrentStepComplete(currentStep)
//                         ? 'text-green-400'
//                         : 'text-yellow-400'
//                     }`}
//                   >
//                     {isCurrentStepComplete(currentStep)
//                       ? '✅ Step complete!'
//                       : '⏳ Please select an option'}
//                   </div>

//                   {status === 'loading' && (
//                     <div className="text-xs text-gray-400">
//                       Checking authentication...
//                     </div>
//                   )}
//                 </div>

//                 <motion.button
//                   whileHover={
//                     !isCreating && isCurrentStepComplete(currentStep)
//                       ? { x: 2 }
//                       : {}
//                   }
//                   whileTap={
//                     !isCreating && isCurrentStepComplete(currentStep)
//                       ? { scale: 0.98 }
//                       : {}
//                   }
//                   onClick={
//                     currentStep === steps.length - 1
//                       ? handleCreateStory
//                       : handleNext
//                   }
//                   disabled={!isCurrentStepComplete(currentStep) || isCreating}
//                   className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
//                     !isCurrentStepComplete(currentStep) || isCreating
//                       ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
//                       : currentStep === steps.length - 1
//                         ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700 shadow-lg shadow-purple-500/25'
//                         : 'bg-gradient-to-r from-green-500 to-blue-600 text-white hover:from-green-600 hover:to-blue-700 shadow-lg shadow-green-500/25'
//                   }`}
//                 >
//                   {isCreating ? (
//                     <>
//                       <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                       <span>Creating Magic...</span>
//                     </>
//                   ) : currentStep === steps.length - 1 ? (
//                     <>
//                       <span>Create My Story</span>
//                       <Wand2 className="w-4 h-4" />
//                     </>
//                   ) : (
//                     <>
//                       <span>Next</span>
//                       <ArrowRight className="w-4 h-4" />
//                     </>
//                   )}
//                 </motion.button>
//               </motion.div>

//               {Object.values(selectedElements).some(
//                 (value) => value !== ''
//               ) && (
//                 <motion.div
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   className="p-6 bg-gray-800/40 backdrop-blur-xl border border-gray-600/40 rounded-xl"
//                 >
//                   <h3 className="text-white font-semibold mb-4 flex items-center">
//                     <Sparkles className="w-5 h-5 mr-2 text-yellow-400" />
//                     Your Story Elements
//                   </h3>
//                   <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
//                     {Object.entries(selectedElements).map(
//                       ([type, elementName]) => {
//                         if (!elementName) return null;

//                         const elementTypeKey =
//                           type as keyof typeof STORY_ELEMENTS;
//                         const element = STORY_ELEMENTS[elementTypeKey]?.find(
//                           (e: any) => e.name === elementName
//                         );

//                         return (
//                           <div key={type} className="text-center">
//                             <div className="text-2xl mb-1">
//                               {element?.emoji || '✨'}
//                             </div>
//                             <div className="text-xs text-gray-400 uppercase mb-1">
//                               {type}
//                             </div>
//                             <div className="text-sm text-white font-medium">
//                               {elementName}
//                             </div>
//                             <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mt-2" />
//                           </div>
//                         );
//                       }
//                     )}
//                   </div>

//                   {allStepsComplete && (
//                     <motion.div
//                       initial={{ opacity: 0, scale: 0.9 }}
//                       animate={{ opacity: 1, scale: 1 }}
//                       className="mt-8 p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-center"
//                     >
//                       <div className="text-green-400 font-semibold text-lg mb-2">
//                         🎉 All elements selected! Ready to create your story!
//                       </div>
//                       <div className="text-green-300 text-sm">
//                         Your unique story will be:{' '}
//                         <strong>{selectedElements.genre}</strong> adventure with{' '}
//                         <strong>{selectedElements.character}</strong> in{' '}
//                         <strong>{selectedElements.setting}</strong>
//                       </div>
//                     </motion.div>
//                   )}
//                 </motion.div>
//               )}
//             </div>
//           </main>
//         </div>
//       </div>
//     </ToastProvider>
//   );
// }

// app/create-stories/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  Sparkles,
  BookOpen,
  Users,
  Target,
  Palette,
  Star,
  Compass,
  Wand2,
  HelpCircle,
  Rocket,
  Smile,
  Heart,
  Castle,
  Baby,
  TreePine,
  Waves,
  Building,
  Home,
  Mountain,
  Sun,
  Eye,
  Gamepad2,
  Crown,
  Shield,
  Flame,
  Zap,
  Gift,
  Sword,
  Trophy,
  HandHeart,
  Award,
  TrendingUp,
  UserCheck,
  Play,
  ArrowRight,
  Check,
  ChevronRight,
  PenTool,
  MessageSquare,
  Lightbulb,
  Brain,
  Globe,
  Clock,
  CheckCircle,
  Feather,
  Share2,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { STORY_ELEMENTS } from '@/config/story-elements';
import Link from 'next/link';
import { DiamondSeparator } from '@/components/seperators/DiamondSeparator';


interface SelectedElements {
  genre: string;
  character: string;
  setting: string;
  theme: string;
  mood: string;
  tone: string;
  [key: string]: string;
}

const steps = [
  {
    id: 'genre',
    title: 'Choose Your Genre',
    description: 'What type of story excites you?',
  },
  {
    id: 'character',
    title: 'Pick Your Hero',
    description: 'Who will be the star of your adventure?',
  },
  {
    id: 'setting',
    title: 'Select Your World',
    description: 'Where will your story take place?',
  },
  {
    id: 'theme',
    title: 'Choose Your Theme',
    description: 'What will your story be about?',
  },
  {
    id: 'mood',
    title: 'Set the Mood',
    description: 'How should your story feel?',
  },
  {
    id: 'tone',
    title: 'Pick Your Tone',
    description: 'What style fits your story?',
  },
];

export default function CreateStoriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedElements, setSelectedElements] = useState<SelectedElements>({
    genre: '',
    character: '',
    setting: '',
    theme: '',
    mood: '',
    tone: '',
  });
  const [isCreating, setIsCreating] = useState(false);
  const [isProcessingToken, setIsProcessingToken] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Get pending token from URL
  const pendingToken = searchParams?.get('pendingToken');

  // Helper functions
  function isCurrentStepComplete(stepIndex: number) {
    const stepId = steps[stepIndex]?.id;
    return stepId ? selectedElements[stepId] !== '' : false;
  }

  function scrollToStoryElements() {
    const storyElementsSection = document.getElementById('story-elements');
    if (storyElementsSection) {
      storyElementsSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }

  // FIXED: Immediate token processing with proper loading states
  useEffect(() => {
    // Don't run multiple times
    if (hasInitialized) return;

    const processInitialization = async () => {
      console.log('🔄 Initializing create stories page...', {
        pendingToken: !!pendingToken,
        status,
        userRole: session?.user?.role,
      });

      // CASE 1: Has pending token - process immediately
      if (pendingToken) {
        console.log('🎯 Found pending token, processing...');
        setIsProcessingToken(true);

        // Show immediate feedback
        toast({
          title: '🔄 Processing Your Story',
          description: 'Restoring your saved story elements...',
        });

        // Wait for authentication if needed
        if (status === 'loading') {
          console.log('⏳ Waiting for authentication...');
          return; // Will retry when status changes
        }

        // If authenticated, process token
        if (status === 'authenticated' && session?.user?.role === 'child') {
          console.log('✅ User authenticated, processing token...');
          await createStoryFromPendingToken(pendingToken);
          setHasInitialized(true);
          return;
        }

        // If not authenticated, something went wrong
        if (status === 'unauthenticated') {
          console.log('❌ User not authenticated, redirecting to login...');
          toast({
            title: '🔒 Authentication Required',
            description: 'Please log in to continue creating your story.',
            variant: 'destructive',
          });

          const callbackUrl = `/create-stories?pendingToken=${pendingToken}`;
          router.push(
            `/login/child?callbackUrl=${encodeURIComponent(callbackUrl)}`
          );
          setHasInitialized(true);
          return;
        }
      }

      // CASE 2: No token - normal initialization
      else {
        console.log('📝 Normal page load, checking localStorage...');

        // Try to restore from localStorage
        if (typeof window !== 'undefined') {
          const pendingElements = localStorage.getItem('pendingStoryElements');
          if (pendingElements) {
            try {
              const parsed = JSON.parse(pendingElements);
              setSelectedElements(parsed);

              const completedSteps = Object.values(parsed).filter(
                (v) => v !== ''
              ).length;
              if (completedSteps > 0) {
                setCurrentStep(Math.min(completedSteps, steps.length - 1));
              }

              localStorage.removeItem('pendingStoryElements');

              toast({
                title: '✨ Welcome Back!',
                description: 'Your story elements have been restored.',
              });
            } catch (error) {
              console.error('Error loading pending elements:', error);
              localStorage.removeItem('pendingStoryElements');
            }
          }
        }

        setHasInitialized(true);
      }
    };

    processInitialization();
  }, [pendingToken, status, session, hasInitialized, toast, router]);

  // Create story from pending token
  const createStoryFromPendingToken = async (token: string) => {
    try {
      console.log(
        '🚀 Creating story from pending token:',
        token.substring(0, 8) + '...'
      );

      toast({
        title: '✨ Creating Your Story',
        description: 'Your magical adventure is being prepared...',
      });

      const response = await fetch('/api/stories/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pendingToken: token }),
      });

      const data = await response.json();
      console.log('📤 Create-session response:', { ok: response.ok, data });

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || 'Failed to create story from saved elements'
        );
      }

      // Success!
      toast({
        title: '🎉 Story Created Successfully!',
        description: 'Your magical adventure begins now!',
      });

      console.log(
        '🎯 Redirecting to story:',
        `/children-dashboard/story/${data.session.id}`
      );

      // Small delay to show success message
      setTimeout(() => {
        router.push(`/children-dashboard/story/${data.session.id}`);
      }, 1500);
    } catch (error) {
      console.error('❌ Error processing pending token:', error);

      toast({
        title: '❌ Error Creating Story',
        description:
          error instanceof Error
            ? error.message
            : 'Please try selecting your story elements again.',
        variant: 'destructive',
      });

      // Fallback to normal story creation
      setIsProcessingToken(false);
      router.replace('/create-stories');
    }
  };

  // Handle element selection
  const handleElementSelect = (elementName: string) => {
    setSelectedElements((prev) => ({
      ...prev,
      [currentStepData.id]: elementName,
    }));
  };

  // Navigation handlers
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Create story handler
  const handleCreateStory = async () => {
    setIsCreating(true);

    try {
      // Validate all elements are selected
      const incompleteElements = Object.entries(selectedElements).filter(
        ([_, value]) => !value
      );
      if (incompleteElements.length > 0) {
        toast({
          title: '❌ Incomplete Selection',
          description: 'Please select all story elements first!',
          variant: 'destructive',
        });
        setIsCreating(false);
        return;
      }

      toast({
        title: '✨ Creating Your Story',
        description: 'Getting everything ready for your creative adventure...',
      });

      const response = await fetch('/api/stories/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ elements: selectedElements }),
      });

      const data = await response.json();
      console.log('📤 Create-session response:', { ok: response.ok, data });

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create story session');
      }

      // Case 1: Need authentication
      if (data.requiresAuth) {
        toast({
          title: '🔒 Login Required',
          description:
            "Please log in to create your story. We'll save your progress!",
        });

        const callbackUrl = `/create-stories?pendingToken=${data.token}`;
        router.push(
          `/login/child?callbackUrl=${encodeURIComponent(callbackUrl)}`
        );
        return;
      }

      // Case 2: Story created successfully
      if (data.success) {
        toast({
          title: '🎉 Story Created!',
          description: 'Your magical adventure begins now!',
        });

        // Clear localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('pendingStoryElements');
        }

        // Small delay to show success message
        setTimeout(() => {
          router.push(`/children-dashboard/story/${data.session.id}`);
        }, 1500);
        return;
      }

      throw new Error('Unexpected response from server');
    } catch (error) {
      console.error('❌ Error creating story:', error);
      toast({
        title: '❌ Error Creating Story',
        description:
          error instanceof Error
            ? error.message
            : 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Loading state for token processing
  if (isProcessingToken || (pendingToken && !hasInitialized)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 bg-gray-800/50 backdrop-blur-xl border border-gray-600/40 rounded-2xl max-w-md"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>

          <h2 className="text-2xl font-bold text-white mb-4">
            ✨ Creating Your Story
          </h2>

          <div className="space-y-2 text-gray-300 mb-6">
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              🔄 Restoring your saved story elements...
            </motion.p>
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
            >
              🤖 Preparing AI collaboration...
            </motion.p>
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
            >
              📚 Setting up your writing space...
            </motion.p>
          </div>

          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 3, ease: 'easeInOut' }}
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
            />
          </div>

          <p className="text-gray-400 text-sm mt-4">
            This usually takes a few seconds...
          </p>
        </motion.div>
      </div>
    );
  }

  // Don't show the main UI until initialized
  if (!hasInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  // Get current step data
  const currentStepData = steps[currentStep];
  const elementType = currentStepData.id as keyof typeof STORY_ELEMENTS;
  const currentElements = STORY_ELEMENTS[elementType] || [];
  const allStepsComplete = Object.values(selectedElements).every(
    (value) => value !== ''
  );

  return ( 
    <div className=" py-10 text-white min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-96 h-96 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            top: '10%',
            left: '10%',
          }}
        />

        <motion.div
          className="absolute w-80 h-80 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
          style={{
            top: '60%',
            right: '10%',
          }}
        />

        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 5,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: 'easeInOut',
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Enhanced Hero Section - Same as before */}
      <div className="relative  flex items-center px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pt-20">
            {/* Left Content */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <motion.div
                className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-400/30 backdrop-blur-xl"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                >
                  <Sparkles className="w-4 h-4 text-purple-400 mr-2" />
                </motion.div>
                <span className="text-purple-200 font-medium text-sm">
                  Start Your Creative Journey
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                <h1 className="font-bold text-4xl sm:text-5xl lg:text-6xl leading-tight tracking-tight">
                  <motion.span
                    className="block text-white"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                  >
                    How to Create
                  </motion.span>
                  <motion.span
                    className="block bg-gradient-to-r from-purple-400 via-pink-300 to-cyan-400 bg-clip-text text-transparent"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.0, duration: 0.6 }}
                  >
                    Amazing Stories
                  </motion.span>
                </h1>
              </motion.div>

              <motion.p
                className="text-xl text-gray-300 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.8 }}
              >
                Follow our simple 6-step process to transform your imagination
                into incredible stories with AI collaboration and teacher
                mentorship.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4, duration: 0.8 }}
              >
                <Link href="/contact-us">
                  <motion.button
                    className="group relative px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl font-semibold text-lg text-white shadow-lg shadow-purple-500/25 overflow-hidden"
                    whileHover={{
                      scale: 1.05,
                      boxShadow: '0 20px 40px -10px rgba(147, 51, 234, 0.6)',
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="relative z-10 flex items-center">
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <Play className="w-5 h-5 mr-2" />
                      </motion.div>
                      Know More →
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-500"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '0%' }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Right Side - Enhanced 3D Animated Scene */}
            <motion.div
              className="relative flex justify-center items-center "
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
            >
              <motion.div
                className="relative z-20"
                animate={{
                  y: [0, -20, 0],
                  rotateY: [0, 5, 0, -5, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <motion.div
                  className="relative w-[32rem] h-96 bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-2xl rounded-3xl border border-cyan-400/30 shadow-2xl overflow-hidden"
                  whileHover={{
                    scale: 1.05,
                    rotateY: 10,
                    boxShadow: '0 30px 60px -10px rgba(34, 211, 238, 0.4)',
                  }}
                  style={{
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <div className="absolute inset-0">
                    <Image
                      src="/kid7.jpg"
                      alt="Creative young writer"
                      fill
                      className="object-cover"
                      sizes="32rem"
                    />
                    <div className="absolute inset-0 bg-gray-900/70" />
                  </div>

                  <div className="absolute inset-0">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-cyan-500/20"
                      animate={{
                        background: [
                          'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(34, 211, 238, 0.2) 100%)',
                          'linear-gradient(135deg, rgba(34, 211, 238, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)',
                          'linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
                        ],
                      }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                  </div>

                  <div className="relative z-10 p-8 h-full flex flex-col justify-between">
                    <div className="text-center">
                      <motion.div
                        className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
                        animate={{
                          rotate: [0, 360],
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      >
                        <span className="text-white font-bold text-xl">M</span>
                      </motion.div>

                      <motion.h3
                        className="text-2xl font-bold text-white mb-2"
                        animate={{
                          opacity: [0.8, 1, 0.8],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                        }}
                      >
                        Mintoons
                      </motion.h3>

                      <p className="text-cyan-300 text-sm font-medium">
                        "How to Create Amazing Stories"
                      </p>
                    </div>

                    <div className="space-y-3">
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="h-2 bg-gradient-to-r from-gray-600/50 to-transparent rounded-full"
                          initial={{ width: 0 }}
                          animate={{
                            width: `${Math.random() * 40 + 60}%`,
                            opacity: [0.3, 0.8, 0.3],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.3,
                            ease: 'easeInOut',
                          }}
                        />
                      ))}
                    </div>

                    <div className="flex justify-center space-x-8">
                      {[Feather, Palette, Sparkles, BookOpen].map((Icon, i) => (
                        <motion.div
                          key={i}
                          className="w-8 h-8 bg-gray-700/50 rounded-lg flex items-center justify-center"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.4,
                          }}
                        >
                          <Icon className="w-4 h-4 text-cyan-400" />
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <motion.div
                    className="absolute inset-0 rounded-3xl border-2 border-transparent"
                    animate={{
                      borderColor: [
                        'rgba(34, 211, 238, 0.5)',
                        'rgba(168, 85, 247, 0.5)',
                        'rgba(236, 72, 153, 0.5)',
                        'rgba(34, 211, 238, 0.5)',
                      ],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                    }}
                  />
                </motion.div>
              </motion.div>

              <motion.div
                className="absolute w-full h-full"
                animate={{ rotate: [0, 360] }}
                transition={{
                  duration: 30,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                {[
                  {
                    icon: Target,
                    color: 'from-purple-500 to-indigo-600',
                    position: 'top-0 left-1/2 -translate-x-1/2 -translate-y-8',
                  },
                  {
                    icon: PenTool,
                    color: 'from-blue-500 to-cyan-600',
                    position: 'right-0 top-1/2 -translate-y-1/2 translate-x-8',
                  },
                  {
                    icon: MessageSquare,
                    color: 'from-orange-500 to-red-600',
                    position:
                      'bottom-0 left-1/2 -translate-x-1/2 translate-y-8',
                  },
                  {
                    icon: Share2,
                    color: 'from-pink-500 to-purple-600',
                    position: 'left-0 top-1/2 -translate-y-1/2 -translate-x-8',
                  },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className={`absolute ${item.position} w-16 h-16 bg-gradient-to-r ${item.color} rounded-full flex items-center justify-center shadow-lg opacity-80`}
                    animate={{
                      rotate: [0, -360],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      rotate: {
                        duration: 30,
                        repeat: Infinity,
                        ease: 'linear',
                      },
                      scale: {
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 0.5,
                      },
                    }}
                    whileHover={{ scale: 1.3, opacity: 1 }}
                  >
                    <item.icon className="w-8 h-8 text-white" />
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                className="absolute -top-20 -left-20 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-sm text-white border border-white/20"
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: 1,
                }}
              >
                ✨ Choose Elements
              </motion.div>

              <motion.div
                className="absolute -bottom-20 -right-20 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-sm text-white border border-white/20"
                animate={{
                  y: [0, 10, 0],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: 2,
                }}
              >
                📚 Publish Stories
              </motion.div>

              <motion.div
                className="absolute top-1/2 -right-32 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-sm text-white border border-white/20"
                animate={{
                  x: [0, 10, 0],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: 0.5,
                }}
              >
                🤖 AI Collaboration
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      <DiamondSeparator/>

      {/* How It Works Section */}
      <div className="relative px-4 sm:px-6 lg:px-8 py-20 ">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6">
              How{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                It Works
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our AI-powered platform makes story creation fun and educational
              through collaborative writing
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Choose Elements',
                description:
                  'Select your favorite story elements from our curated collection',
                icon: Target,
                color: 'from-blue-500 to-cyan-500',
              },
              {
                step: '02',
                title: 'AI Collaboration',
                description:
                  'Our AI creates story prompts based on your choices and guides your writing',
                icon: Brain,
                color: 'from-purple-500 to-pink-500',
              },
              {
                step: '03',
                title: 'Create Together',
                description:
                  'Write your story with AI assistance, getting real-time feedback and suggestions',
                icon: PenTool,
                color: 'from-green-500 to-emerald-500',
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 h-full">
                  <div
                    className={`w-16 h-16 bg-gradient-to-r ${item.color} rounded-xl flex items-center justify-center mb-6`}
                  >
                    <item.icon className="w-8 h-8 text-white" />
                  </div>

                  <div className="mb-4">
                    <span className="text-sm font-mono text-gray-400 block mb-2">
                      STEP {item.step}
                    </span>
                    <h3 className="text-2xl font-bold text-white mb-3">
                      {item.title}
                    </h3>
                  </div>

                  <p className="text-gray-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-cyan-400 to-transparent transform -translate-y-1/2" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

    
      <DiamondSeparator />

      {/* Features Section */}
      <div className="relative px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6">
              Why Choose{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Mintoons
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Advanced features designed to make story writing engaging,
              educational, and fun for children
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'AI-Powered Assistance',
                description:
                  "Smart AI that adapts to your child's writing level and provides helpful suggestions",
                icon: Brain,
                color: 'from-purple-500 to-indigo-500',
              },
              {
                title: 'Age-Appropriate Content',
                description:
                  'All content is filtered and optimized for different age groups and learning levels',
                icon: Shield,
                color: 'from-green-500 to-teal-500',
              },
              {
                title: 'Real-time Feedback',
                description:
                  'Instant feedback on grammar, creativity, and story structure as you write',
                icon: MessageSquare,
                color: 'from-blue-500 to-cyan-500',
              },
              {
                title: 'Progress Tracking',
                description:
                  'Monitor writing improvement with detailed analytics and achievement systems',
                icon: TrendingUp,
                color: 'from-orange-500 to-red-500',
              },
              {
                title: 'Creative Elements',
                description:
                  'Hundreds of story elements to choose from for endless creative possibilities',
                icon: Lightbulb,
                color: 'from-yellow-500 to-orange-500',
              },
              {
                title: 'Safe Environment',
                description:
                  'Secure platform with parental controls and content moderation',
                icon: Shield,
                color: 'from-pink-500 to-purple-500',
              },
              {
                title: 'Export Stories',
                description:
                  'Download completed stories as PDF or Word documents to share and print',
                icon: BookOpen,
                color: 'from-indigo-500 to-purple-500',
              },
              {
                title: '24/7 Support',
                description:
                  'Round-the-clock support for both children and parents',
                icon: Clock,
                color: 'from-teal-500 to-green-500',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 h-full">
                  <div
                    className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-3">
                    {feature.title}
                  </h3>

                  <p className="text-sm text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <DiamondSeparator />

      {/* Call to Action Section */}

      {/* STORY ELEMENTS SELECTION SECTION */}
      <div
        className="relative z-10 min-h-screen flex flex-col"
        id="story-elements"
      >
        <div className="sticky top-0 z-30 bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 p-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">
                Step {currentStep + 1} of {steps.length}
              </h2>
            </div>

            <div className="mb-4">
              <h3 className="text-xl text-cyan-400 font-semibold mb-2">
                {currentStepData.title}
              </h3>
              <p className="text-gray-300">{currentStepData.description}</p>
            </div>

            <div className="w-full bg-gray-700/50 rounded-full h-2">
              <motion.div
                className="h-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                initial={{ width: 0 }}
                animate={{
                  width: `${((currentStep + (isCurrentStepComplete(currentStep) ? 1 : 0)) / steps.length) * 100}%`,
                }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              />
            </div>

            <div className="flex justify-between mt-4 text-xs">
              {steps.map((step, index) => {
                const isCompleted =
                  selectedElements[step.id as keyof SelectedElements] !== '';
                const isCurrent = index === currentStep;

                return (
                  <div
                    key={step.id}
                    className={`flex flex-col items-center space-y-1 ${
                      isCurrent
                        ? 'text-cyan-400'
                        : isCompleted
                          ? 'text-green-400'
                          : 'text-gray-500'
                    }`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full ${
                        isCurrent
                          ? 'bg-cyan-400 animate-pulse'
                          : isCompleted
                            ? 'bg-green-400'
                            : 'bg-gray-600'
                      }`}
                    />
                    <span className="hidden sm:block text-center max-w-16">
                      {step.title.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <main className="flex-1 p-4 sm:p-6 mt-8 mb-8">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8"
              >
                {currentElements.map((element: any, index: number) => {
                  const isSelected =
                    selectedElements[elementType as string] === element.name;
                  const IconComponent = element.icon;

                  return (
                    <motion.button
                      key={`${String(elementType)}-${element.name}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      whileHover={{
                        y: -8,
                        scale: 1.02,
                        transition: { duration: 0.2 },
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleElementSelect(element.name)}
                      className={`relative p-6 rounded-2xl border-2 transition-all duration-300 group overflow-hidden ${
                        isSelected
                          ? `bg-gradient-to-br ${element.color} border-white/30 text-white shadow-2xl shadow-black/20`
                          : 'bg-gray-800/60 border-gray-600/40 text-gray-300 hover:border-gray-500/60 hover:bg-gray-700/60'
                      }`}
                    >
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                      </div>

                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', duration: 0.6 }}
                          className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30"
                        >
                          <Check className="w-4 h-4 text-white" />
                        </motion.div>
                      )}

                      <div className="relative z-10 flex items-center justify-between mb-4">
                        <div className="text-4xl">{element.emoji}</div>
                        <motion.div
                          className={`p-3 rounded-xl ${isSelected ? 'bg-white/20' : 'bg-gray-700/50 group-hover:bg-gray-600/50'} transition-colors`}
                          whileHover={{ rotate: 15, scale: 1.1 }}
                          transition={{ type: 'spring', duration: 0.3 }}
                        >
                          <IconComponent
                            className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-gray-400 group-hover:text-white'} transition-colors`}
                          />
                        </motion.div>
                      </div>

                      <h3
                        className={`font-bold text-lg mb-3 relative z-10 ${
                          isSelected
                            ? 'text-white'
                            : 'text-white group-hover:text-white'
                        } transition-colors`}
                      >
                        {element.name}
                      </h3>

                      <div className="relative z-10">
                        <div
                          className={`w-full h-1 rounded-full overflow-hidden ${
                            isSelected
                              ? 'bg-white/30'
                              : 'bg-gray-600 group-hover:bg-gray-500'
                          } transition-colors`}
                        >
                          <motion.div
                            className={`h-full ${
                              isSelected
                                ? 'bg-white'
                                : 'bg-gradient-to-r from-blue-500 to-green-500 opacity-0 group-hover:opacity-100'
                            } transition-opacity`}
                            initial={{ width: '0%' }}
                            animate={{ width: isSelected ? '100%' : '0%' }}
                            whileHover={{ width: '100%' }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>

                      {isSelected && (
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                          {[...Array(6)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute w-1 h-1 bg-white rounded-full"
                              animate={{
                                y: [20, -20, 20],
                                x: [0, Math.random() * 10 - 5, 0],
                                opacity: [0, 1, 0],
                              }}
                              transition={{
                                duration: 2 + Math.random() * 2,
                                repeat: Infinity,
                                delay: Math.random() * 2,
                              }}
                              style={{
                                left: `${20 + Math.random() * 60}%`,
                                top: `${50 + Math.random() * 30}%`,
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </motion.div>
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-between mb-8"
            >
              <motion.button
                whileHover={{ x: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBack}
                disabled={currentStep === 0}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  currentStep === 0
                    ? 'text-gray-500 cursor-not-allowed bg-gray-800'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50 bg-gray-800/50'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </motion.button>

              <div className="text-center">
                <div
                  className={`text-sm mb-1 ${
                    isCurrentStepComplete(currentStep)
                      ? 'text-green-400'
                      : 'text-yellow-400'
                  }`}
                >
                  {isCurrentStepComplete(currentStep)
                    ? '✅ Step complete!'
                    : '⏳ Please select an option'}
                </div>

                {status === 'loading' && (
                  <div className="text-xs text-gray-400">
                    Checking authentication...
                  </div>
                )}
              </div>

              <motion.button
                whileHover={
                  !isCreating && isCurrentStepComplete(currentStep)
                    ? { x: 2 }
                    : {}
                }
                whileTap={
                  !isCreating && isCurrentStepComplete(currentStep)
                    ? { scale: 0.98 }
                    : {}
                }
                onClick={
                  currentStep === steps.length - 1
                    ? handleCreateStory
                    : handleNext
                }
                disabled={!isCurrentStepComplete(currentStep) || isCreating}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  !isCurrentStepComplete(currentStep) || isCreating
                    ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                    : currentStep === steps.length - 1
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700 shadow-lg shadow-purple-500/25'
                      : 'bg-gradient-to-r from-green-500 to-blue-600 text-white hover:from-green-600 hover:to-blue-700 shadow-lg shadow-green-500/25'
                }`}
              >
                {isCreating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating Magic...</span>
                  </>
                ) : currentStep === steps.length - 1 ? (
                  <>
                    <span>Create My Story</span>
                    <Wand2 className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </motion.div>

            {Object.values(selectedElements).some((value) => value !== '') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-gray-800/40 backdrop-blur-xl border border-gray-600/40 rounded-xl"
              >
                <h3 className="text-white font-semibold mb-4 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-yellow-400" />
                  Your Story Elements
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {Object.entries(selectedElements).map(
                    ([type, elementName]) => {
                      if (!elementName) return null;

                      const elementTypeKey =
                        type as keyof typeof STORY_ELEMENTS;
                      const element = STORY_ELEMENTS[elementTypeKey]?.find(
                        (e: any) => e.name === elementName
                      );

                      return (
                        <div key={type} className="text-center">
                          <div className="text-2xl mb-1">
                            {element?.emoji || '✨'}
                          </div>
                          <div className="text-xs text-gray-400 uppercase mb-1">
                            {type}
                          </div>
                          <div className="text-sm text-white font-medium">
                            {elementName}
                          </div>
                          <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mt-2" />
                        </div>
                      );
                    }
                  )}
                </div>

                {allStepsComplete && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-8 p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-center"
                  >
                    <div className="text-green-400 font-semibold text-lg mb-2">
                      🎉 All elements selected! Ready to create your story!
                    </div>
                    <div className="text-green-300 text-sm">
                      Your unique story will be:{' '}
                      <strong>{selectedElements.genre}</strong> adventure with{' '}
                      <strong>{selectedElements.character}</strong> in{' '}
                      <strong>{selectedElements.setting}</strong>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
