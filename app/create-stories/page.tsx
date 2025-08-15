// This file has been fully migrated to use only the three core usage types: freestyleStories, assessmentRequests, competitionEntries.
// All legacy fields (stories, assessments, attempts, competitions, publications, etc.) have been removed.
//     if (selectedFile) {
//       const allowedTypes = [
//         'text/plain',
//         'application/pdf',
//         'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//       ];
//       const allowedExtensions = ['.txt', '.pdf', '.docx'];
//       const maxSize =
//         selectedFile.type === 'text/plain' ? 2 * 1024 * 1024 : 4 * 1024 * 1024;
//       const ext = selectedFile.name
//         .slice(selectedFile.name.lastIndexOf('.'))
//         .toLowerCase();
//       if (
//         !allowedTypes.includes(selectedFile.type) ||
//         !allowedExtensions.includes(ext)
//       ) {
//         setError('Please upload a .txt, .pdf, or .docx file');
//         return;
//       }
//       if (selectedFile.size > maxSize) {
//         setError(
//           'File size must be less than 2MB for .txt, 4MB for .pdf/.docx'
//         );
//         return;
//       }
//       setFile(selectedFile);
//       setError('');
//     }
//   };

//   const handleDrag = (e: React.DragEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     if (e.type === 'dragenter' || e.type === 'dragover') {
//       setDragActive(true);
//     } else if (e.type === 'dragleave') {
//       setDragActive(false);
//     }
//   };

//   const handleDrop = (e: React.DragEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setDragActive(false);

//     const droppedFile = e.dataTransfer.files?.[0];
//     if (droppedFile) {
//       if (
//         droppedFile.type !== 'text/plain' &&
//         !droppedFile.name.endsWith('.txt')
//       ) {
//         setError('Please upload a .txt file');
//         return;
//       }
//       setFile(droppedFile);
//       setError('');
//     }
//   };

//   const handleUploadForAssessment = async () => {
//     if (!title.trim()) {
//       setError('Please enter a story title');
//       return;
//     }

//     if (!content.trim() && !file) {
//       setError('Please provide story content via file upload or text input');
//       return;
//     }

//     setLoading(true);
//     setError('');

//     try {
//       const formData = new FormData();
//       formData.append('title', title.trim());
//       if (file) {
//         formData.append('file', file);
//       } else {
//         formData.append('content', content.trim());
//       }

//       const response = await fetch('/api/stories/upload', {
//         method: 'POST',
//         body: formData,
//       });

//       const data = await response.json();

//       if (data.success) {
//         // Redirect to assessment interface
//         router.push(`/children-dashboard/assessment/${data.story.id}`);
//       } else {
//         setError(data.error || 'Failed to upload story');
//       }
//     } catch (error) {
//       setError('Failed to upload story for assessment');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (status === 'loading') {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent border-solid animate-spin mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="py-10 text-white min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 relative overflow-hidden">
//       {/* Floating Elements */}
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         <motion.div
//           className="absolute w-96 h-96 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-full blur-3xl"
//           animate={{
//             x: [0, 100, 0],
//             y: [0, -50, 0],
//             scale: [1, 1.2, 1],
//           }}
//           transition={{
//             duration: 20,
//             repeat: Infinity,
//             ease: 'easeInOut',
//           }}
//           style={{
//             top: '10%',
//             left: '10%',
//           }}
//         />

//         <motion.div
//           className="absolute w-80 h-80 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-full blur-3xl"
//           animate={{
//             x: [0, -80, 0],
//             y: [0, 60, 0],
//             scale: [1, 0.8, 1],
//           }}
//           transition={{
//             duration: 25,
//             repeat: Infinity,
//             ease: 'easeInOut',
//             delay: 2,
//           }}
//           style={{
//             top: '60%',
//             right: '10%',
//           }}
//         />

//         {/* Floating Particles */}
//         {[...Array(20)].map((_, i) => {
//           const left = Math.random() * 100;
//           const top = Math.random() * 100;
//           return (
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
//                 left: `${left}%`,
//                 top: `${top}%`,
//               }}
//             />
//           );
//         })}
//       </div>

//       {/* Enhanced Hero Section - FIXED LAYOUT */}
//       <div className="relative flex items-center px-2 sm:px-4 md:px-6 lg:px-8 py-10 sm:py-12">
//         <div className="max-w-7xl mx-auto w-full">
//           <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 sm:gap-12 items-center pt-8 sm:pt-20">
//             {/* Left Content - Always on top for mobile */}
//             <motion.div
//               className="space-y-8 text-center lg:text-left w-full lg:order-1"
//               initial={{ opacity: 0, x: -100 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ duration: 1, delay: 0.2 }}
//             >
//               <motion.div
//                 className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-400/30 backdrop-blur-xl"
//                 initial={{ opacity: 0, scale: 0.8 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 transition={{ delay: 0.4, duration: 0.8 }}
//                 whileHover={{ scale: 1.05 }}
//               >
//                 <motion.div
//                   animate={{ rotate: [0, 360] }}
//                   transition={{
//                     duration: 3,
//                     repeat: Infinity,
//                     ease: 'linear',
//                   }}
//                 >
//                   <Sparkles className="w-4 h-4 text-purple-400 mr-2" />
//                 </motion.div>
//                 <span className="text-purple-200 font-medium text-sm">
//                   Choose Your Writing Path
//                 </span>
//               </motion.div>

//               <motion.div
//                 initial={{ opacity: 0, y: 30 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.6, duration: 0.8 }}
//               >
//                 <h1 className=" text-2xl sm:text-4xl lg:text-6xl leading-tight tracking-tight">
//                   <motion.span
//                     className="block text-white"
//                     initial={{ opacity: 0, x: -20 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     transition={{ delay: 0.8, duration: 0.6 }}
//                   >
//                     Two Ways to
//                   </motion.span>
//                   <motion.span
//                     className="block bg-gradient-to-r from-purple-400 via-pink-300 to-cyan-400 bg-clip-text text-transparent"
//                     initial={{ opacity: 0, x: 20 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     transition={{ delay: 1.0, duration: 0.6 }}
//                   >
//                     Create & Improve
//                   </motion.span>
//                 </h1>
//               </motion.div>

//               <motion.p
//                 className="text-base sm:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto lg:mx-0"
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 1.2, duration: 0.8 }}
//               >
//                 Write new stories with AI collaboration OR upload existing
//                 stories for detailed AI assessment and feedback.
//               </motion.p>

//               <motion.div
//                 className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center lg:justify-start"
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 1.4, duration: 0.8 }}
//               >
//                 <Link href="/contact-us">
//                   <motion.button
//                     className="group relative px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-600   text-lg text-white shadow-lg shadow-purple-500/25 overflow-hidden"
//                     whileHover={{
//                       scale: 1.05,
//                       boxShadow: '0 20px 40px -10px rgba(147, 51, 234, 0.6)',
//                     }}
//                     whileTap={{ scale: 0.95 }}
//                   >
//                     <span className="relative z-10 flex items-center">
//                       <motion.div
//                         animate={{ x: [0, 5, 0] }}
//                         transition={{ duration: 1.5, repeat: Infinity }}
//                       >
//                         <Play className="w-5 h-5 mr-2" />
//                       </motion.div>
//                       Get Started Now →
//                     </span>
//                     <motion.div
//                       className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-500"
//                       initial={{ x: '-100%' }}
//                       whileHover={{ x: '0%' }}
//                       transition={{ duration: 0.3 }}
//                     />
//                   </motion.button>
//                 </Link>
//               </motion.div>
//             </motion.div>

//             {/* Right Side - Enhanced 3D Animated Scene - Below text on mobile */}
//             <motion.div
//               className="relative flex justify-center items-center w-full lg:order-2"
//               initial={{ opacity: 0, x: 100 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ duration: 1, delay: 0.8 }}
//             >
//               <motion.div
//                 className="relative z-20"
//                 animate={{
//                   y: [0, -20, 0],
//                   rotateY: [0, 5, 0, -5, 0],
//                 }}
//                 transition={{
//                   duration: 6,
//                   repeat: Infinity,
//                   ease: 'easeInOut',
//                 }}
//               >
//                 <motion.div
//                   className="relative w-full max-w-xs sm:max-w-lg h-72 sm:h-96 bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-cyan-400/30  overflow-hidden"
//                   whileHover={{
//                     scale: 1.05,
//                     rotateY: 10,
//                     boxShadow: '0 30px 60px -10px rgba(34, 211, 238, 0.4)',
//                   }}
//                   style={{
//                     transformStyle: 'preserve-3d',
//                   }}
//                 >
//                   <div className="absolute inset-0">
//                     <Image
//                       src="/kid7.jpg"
//                       alt="Creative young writer"
//                       fill
//                       className="object-cover"
//                       sizes="(max-width: 640px) 90vw, 32rem"
//                     />
//                   </div>

//                   <div className="relative z-10 p-6 sm:p-8 h-full flex flex-col justify-between">
//                     <div className="text-center">
//                       <motion.div
//                         className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg"
//                         animate={{
//                           rotate: [0, 360],
//                           scale: [1, 1.1, 1],
//                         }}
//                         transition={{
//                           duration: 4,
//                           repeat: Infinity,
//                           ease: 'linear',
//                         }}
//                       >
//                         <span className="text-white  text-lg sm:text-xl">
//                           M
//                         </span>
//                       </motion.div>

//                       <motion.h3
//                         className="text-xl sm:text-2xl  text-white mb-2"
//                         animate={{
//                           opacity: [0.8, 1, 0.8],
//                         }}
//                         transition={{
//                           duration: 3,
//                           repeat: Infinity,
//                         }}
//                       >
//                         Mintoons
//                       </motion.h3>

//                       <p className="text-cyan-300 text-xs sm:text-sm font-medium">
//                         &quot;How to Create Amazing Stories&quot;
//                       </p>
//                     </div>

//                     <div className="space-y-2 sm:space-y-3">
//                       {[...Array(6)].map((_, i) => (
//                         <motion.div
//                           key={i}
//                           className="h-2 bg-gradient-to-r from-gray-600/50 to-transparent rounded-full"
//                           initial={{ width: 0 }}
//                           animate={{
//                             width: `${Math.random() * 40 + 60}%`,
//                             opacity: [0.3, 0.8, 0.3],
//                           }}
//                           transition={{
//                             duration: 2,
//                             repeat: Infinity,
//                             delay: i * 0.3,
//                             ease: 'easeInOut',
//                           }}
//                         />
//                       ))}
//                     </div>

//                     <div className="flex justify-center space-x-4 sm:space-x-8">
//                       {[Feather, Palette, Sparkles, BookOpen].map((Icon, i) => (
//                         <motion.div
//                           key={i}
//                           className="w-6 sm:w-8 h-6 sm:h-8 bg-gray-700/50 rounded-lg flex items-center justify-center"
//                           animate={{
//                             scale: [1, 1.2, 1],
//                             opacity: [0.5, 1, 0.5],
//                           }}
//                           transition={{
//                             duration: 2,
//                             repeat: Infinity,
//                             delay: i * 0.4,
//                           }}
//                         >
//                           <Icon className="w-3 sm:w-4 h-3 sm:h-4 text-cyan-400" />
//                         </motion.div>
//                       ))}
//                     </div>
//                   </div>

//                   <motion.div
//                     className="absolute inset-0  border-2 border-transparent"
//                     animate={{
//                       borderColor: [
//                         'rgba(34, 211, 238, 0.5)',
//                         'rgba(168, 85, 247, 0.5)',
//                         'rgba(236, 72, 153, 0.5)',
//                         'rgba(34, 211, 238, 0.5)',
//                       ],
//                     }}
//                     transition={{
//                       duration: 4,
//                       repeat: Infinity,
//                     }}
//                   />
//                 </motion.div>
//               </motion.div>

//               <motion.div
//                 className="absolute w-full h-full"
//                 animate={{ rotate: [0, 360] }}
//                 transition={{
//                   duration: 30,
//                   repeat: Infinity,
//                   ease: 'linear',
//                 }}
//               >
//                 {[
//                   {
//                     icon: Target,
//                     color: 'from-purple-500 to-indigo-600',
//                     position:
//                       'top-0 left-1/2 -translate-x-1/2 -translate-y-6 sm:-translate-y-8',
//                   },
//                   {
//                     icon: PenTool,
//                     color: 'from-blue-500 to-cyan-600',
//                     position:
//                       'right-0 top-1/2 -translate-y-1/2 translate-x-6 sm:translate-x-8',
//                   },
//                   {
//                     icon: MessageSquare,
//                     color: 'from-orange-500 to-red-600',
//                     position:
//                       'bottom-0 left-1/2 -translate-x-1/2 translate-y-6 sm:translate-y-8',
//                   },
//                   {
//                     icon: Share2,
//                     color: 'from-pink-500 to-purple-600',
//                     position:
//                       'left-0 top-1/2 -translate-y-1/2 -translate-x-6 sm:-translate-x-8',
//                   },
//                 ].map((item, i) => (
//                   <motion.div
//                     key={i}
//                     className={`absolute ${item.position} w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-r ${item.color} rounded-full flex items-center justify-center shadow-lg opacity-80`}
//                     animate={{
//                       rotate: [0, -360],
//                       scale: [1, 1.2, 1],
//                     }}
//                     transition={{
//                       rotate: {
//                         duration: 30,
//                         repeat: Infinity,
//                         ease: 'linear',
//                       },
//                       scale: {
//                         duration: 3,
//                         repeat: Infinity,
//                         delay: i * 0.5,
//                       },
//                     }}
//                     whileHover={{ scale: 1.3, opacity: 1 }}
//                   >
//                     <item.icon className="w-5 sm:w-8 h-5 sm:h-8 text-white" />
//                   </motion.div>
//                 ))}
//               </motion.div>

//               <motion.div
//                 className="absolute -top-12 sm:-top-20 -left-12 sm:-left-20 bg-white/10 backdrop-blur-sm rounded-lg px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm text-white border border-white/20"
//                 animate={{
//                   y: [0, -10, 0],
//                   opacity: [0.7, 1, 0.7],
//                 }}
//                 transition={{
//                   duration: 3,
//                   repeat: Infinity,
//                   delay: 1,
//                 }}
//               >
//                 ✨ Creative Freedom
//               </motion.div>

//               <motion.div
//                 className="absolute -bottom-12 sm:-bottom-20 -right-12 sm:-right-20 bg-white/10 backdrop-blur-sm rounded-lg px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm text-white border border-white/20"
//                 animate={{
//                   y: [0, 10, 0],
//                   opacity: [0.7, 1, 0.7],
//                 }}
//                 transition={{
//                   duration: 3,
//                   repeat: Infinity,
//                   delay: 2,
//                 }}
//               >
//                 📚 Publish your Stories
//               </motion.div>

//               <motion.div
//                 className="absolute top-1/2 -right-20 sm:-right-32 bg-white/10 backdrop-blur-sm rounded-lg px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm text-white border border-white/20"
//                 animate={{
//                   x: [0, 10, 0],
//                   opacity: [0.7, 1, 0.7],
//                 }}
//                 transition={{
//                   duration: 3,
//                   repeat: Infinity,
//                   delay: 0.5,
//                 }}
//               >
//                 🤖 AI Collaboration
//               </motion.div>
//             </motion.div>
//           </div>
//         </div>
//       </div>

//       <DiamondSeparator />

//       {/* Simple Process Section */}
//       <section className="py-12 px-6">
//         <div className="max-w-6xl mx-auto text-center">
//           <motion.h2
//             initial={{ opacity: 0, y: 30 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             className="text-4xl text-white mb-4"
//           >
//             Your Creative Journey Starts Here
//           </motion.h2>
//           <motion.p
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ delay: 0.2 }}
//             className="text-gray-400 text-xl mb-16"
//           >
//             Simple steps to improve your writing skills
//           </motion.p>

//           <div className="grid md:grid-cols-4 gap-8">
//             {[
//               {
//                 step: '01',
//                 title: 'Choose Your Path',
//                 description: 'Create new stories or upload existing ones',
//                 icon: Compass,
//                 color: 'from-green-500 to-teal-600',
//               },
//               {
//                 step: '02',
//                 title: 'Write or Upload',
//                 description:
//                   'Either start writing with AI or upload your story files',
//                 icon: FileText,
//                 color: 'from-blue-500 to-cyan-600',
//               },
//               {
//                 step: '03',
//                 title: 'Get Feedback',
//                 description:
//                   'Receive detailed AI analysis and improvement suggestions',
//                 icon: Brain,
//                 color: 'from-purple-500 to-indigo-600',
//               },
//               {
//                 step: '04',
//                 title: 'Improve & Compete',
//                 description:
//                   'Apply feedback and enter monthly writing competitions',
//                 icon: Trophy,
//                 color: 'from-orange-500 to-red-600',
//               },
//             ].map((item, index) => (
//               <motion.div
//                 key={index}
//                 initial={{ opacity: 0, y: 30 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ delay: index * 0.2 }}
//                 className="relative"
//               >
//                 <div className="bg-gradient-to-br from-gray-800/60 to-gray-700/60 backdrop-blur-xl border border-gray-600/40 p-6 h-full hover:border-gray-500/60 transition-all duration-300 hover:scale-105">
//                   <div className="text-center">
//                     <div className="relative mb-6">
//                       <div
//                         className={`absolute inset-0 bg-gradient-to-r ${item.color} rounded-full blur-lg opacity-30`}
//                       ></div>
//                       <div
//                         className={`relative bg-gradient-to-r ${item.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto`}
//                       >
//                         <item.icon className="w-8 h-8 text-white" />
//                       </div>
//                     </div>

//                     <div className="text-sm text-gray-400 mb-2">
//                       STEP {item.step}
//                     </div>
//                     <h3 className="text-xl text-white mb-4">{item.title}</h3>
//                     <p className="text-gray-300 text-sm">{item.description}</p>
//                   </div>
//                 </div>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </section>

//       <DiamondSeparator />

//       {/* CTA Section */}
//       <section className="py-12 px-12">
//         <div className=" mx-auto text-center">
//           <motion.div
//             initial={{ opacity: 0, y: 50 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl p-8 sm:p-12 border border-gray-600/40 shadow-xl relative overflow-hidden"
//           >
//             <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-teal-500/10">
//               <Image
//                 src="/kid12.jpg"
//                 alt="Young writer ready to create"
//                 fill
//                 className="opacity-20 object-center object-cover"
//               />
//             </div>

//             <div className="relative z-10">
//               <motion.div
//                 className="inline-flex p-4 rounded-full bg-gradient-to-r from-green-500 to-teal-600 mb-6 shadow-lg"
//                 animate={{
//                   rotate: [0, 360],
//                   scale: [1, 1.1, 1],
//                 }}
//                 transition={{
//                   duration: 4,
//                   repeat: Infinity,
//                 }}
//               >
//                 <Rocket className="w-6 h-6 text-white" />
//               </motion.div>

//               <h2 className="text-3xl lg:text-4xl text-white mb-4">
//                 Ready to Start Your{' '}
//                 <span className="bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
//                   Writing Adventure?
//                 </span>
//               </h2>

//               <p className="text-lg text-gray-300 mb-8 leading-relaxed max-w-3xl mx-auto">
//                 Join thousands of young writers improving their skills with{' '}
//                 <span className="text-green-300 font-medium">
//                   AI collaboration
//                 </span>{' '}
//                 and{' '}
//                 <span className="text-teal-300 font-medium">
//                   detailed assessments
//                 </span>
//                 .
//               </p>

//               {/* Features Summary */}
//               <motion.div
//                 className="mt-8 pt-8 border-t border-gray-600/30"
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ delay: 1 }}
//               >
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400">
//                   <div className="flex items-center justify-center space-x-2">
//                     <CheckCircle className="w-4 h-4 text-green-400" />
//                     <span>3 Free Stories</span>
//                   </div>
//                   <div className="flex items-center justify-center space-x-2">
//                     <CheckCircle className="w-4 h-4 text-green-400" />
//                     <span>3 Free Assessments</span>
//                   </div>
//                   <div className="flex items-center justify-center space-x-2">
//                     <CheckCircle className="w-4 h-4 text-green-400" />
//                     <span>AI Collaboration</span>
//                   </div>
//                   <div className="flex items-center justify-center space-x-2">
//                     <CheckCircle className="w-4 h-4 text-green-400" />
//                     <span>Safe Platform</span>
//                   </div>
//                 </div>
//               </motion.div>
//             </div>
//           </motion.div>
//         </div>
//       </section>

//       {/* Two Paths Section */}
//       <section className="py-12 px-6">
//         <div className="max-w-6xl mx-auto">
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             className="text-center mb-16"
//           >
//             <h2 className="text-4xl text-white mb-4">
//               Choose Your Writing Journey
//             </h2>
//             <p className="text-gray-400 text-xl mb-8">
//               Two powerful ways to develop your creative writing skills
//             </p>
//           </motion.div>

//           {/* Usage Display */}
//           {usage && limits && (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//               <div className="bg-gradient-to-br from-gray-800/60 to-gray-700/60 backdrop-blur-xl border border-gray-600/40 p-4 text-center">
//                 <p className="text-sm text-gray-400">Stories Created</p>
//                 <p className="text-2xl font-medium text-white">
//                   {usage.stories}/{limits.stories}
//                 </p>
//               </div>
//               <div className="bg-gradient-to-br from-gray-800/60 to-gray-700/60 backdrop-blur-xl border border-gray-600/40 p-4 text-center">
//                 <p className="text-sm text-gray-400">Assessment Uploads</p>
//                 <p className="text-2xl font-medium text-white">
//                   {usage.assessments}/{limits.assessments}
//                 </p>
//               </div>
//               <div className="bg-gradient-to-br from-gray-800/60 to-gray-700/60 backdrop-blur-xl border border-gray-600/40 p-4 text-center">
//                 <p className="text-sm text-gray-400">Assessment Attempts</p>
//                 <p className="text-2xl font-medium text-white">
//                   {usage.attempts}/{limits.totalAttempts}
//                 </p>
//               </div>
//               <div className="bg-gradient-to-br from-gray-800/60 to-gray-700/60 backdrop-blur-xl border border-gray-600/40 p-4 text-center">
//                 <p className="text-sm text-gray-400">Competition Entries</p>
//                 <p className="text-2xl font-medium text-white">
//                   {usage.competition}/{limits.competition}
//                 </p>
//               </div>
//             </div>
//           )}

//           {/* Error Display */}
//           {error && (
//             <div className="mb-6 bg-red-500/10 border border-red-500/30 backdrop-blur-xl p-4 rounded-lg">
//               <div className="flex items-center">
//                 <AlertCircle className="h-4 w-4 text-red-400 mr-2" />
//                 <span className="text-red-300">{error}</span>
//               </div>
//             </div>
//           )}

//           {mode === 'select' && (
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//               {/* Write New Story Option */}
//               <motion.div
//                 initial={{ opacity: 0, y: 30 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 className="group"
//                 id="freestyle"
//               >
//                 <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl border border-blue-500/30 p-8 hover:scale-105 transition-all duration-300 h-full">
//                   <div className="text-center">
//                     <div className="relative mb-6">
//                       <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
//                       <div className="relative bg-gradient-to-r from-blue-500 to-cyan-600 w-16 h-16 rounded-lg flex items-center justify-center mx-auto">
//                         <PenTool className="w-8 h-8 text-white" />
//                       </div>
//                     </div>

//                     <h3 className="text-2xl text-white mb-4">
//                       Write New Story
//                     </h3>
//                     <p className="text-gray-300 mb-6 text-center">
//                       Start writing a brand new story with AI collaboration
//                     </p>

//                     <div className="space-y-3 mb-6">
//                       <div className="flex items-center text-sm text-gray-300">
//                         <Zap className="w-4 h-4 mr-2 text-blue-400" />
//                         Up to 7 AI responses to help develop your story
//                       </div>
//                       <div className="flex items-center text-sm text-gray-300">
//                         <FileText className="w-4 h-4 mr-2 text-blue-400" />
//                         Turn-based collaborative writing experience
//                       </div>
//                       <div className="flex items-center text-sm text-gray-300">
//                         <AlertCircle className="w-4 h-4 mr-2 text-blue-400" />
//                         Automatic assessment when completed
//                       </div>
//                     </div>

//                     {usage && limits && (
//                       <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
//                         <p className="text-sm text-gray-300">
//                           Usage: {usage.stories}/{limits.stories} stories this
//                           month
//                         </p>
//                         {usage.stories >= limits.stories && (
//                           <p className="text-sm text-red-400 mt-1">
//                             Monthly limit reached.
//                             <button
//                               className="underline ml-1 hover:no-underline text-blue-400"
//                               onClick={() => router.push('/pricing')}
//                             >
//                               Buy Story Pack
//                             </button>
//                           </p>
//                         )}
//                       </div>
//                     )}

//                     <Button
//                       onClick={() => setMode('write')}
//                       disabled={
//                         !!(
//                           loading ||
//                           (usage && limits && usage.stories >= limits.stories)
//                         )
//                       }
//                       className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white border-0"
//                     >
//                       {loading ? 'Creating...' : 'Begin Writing'}
//                     </Button>
//                   </div>
//                 </div>
//               </motion.div>

//               {/* Upload for Assessment Option */}
//               <motion.div
//                 initial={{ opacity: 0, y: 30 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ delay: 0.2 }}
//                 className="group"
//                 id="assessment"
//               >
//                 <div className="bg-gradient-to-br from-green-500/10 to-teal-500/10 backdrop-blur-xl border border-green-500/30 p-8 hover:scale-105 transition-all duration-300 h-full">
//                   <div className="text-center">
//                     <div className="relative mb-6">
//                       <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
//                       <div className="relative bg-gradient-to-r from-green-500 to-teal-600 w-16 h-16 rounded-lg flex items-center justify-center mx-auto">
//                         <Upload className="w-8 h-8 text-white" />
//                       </div>
//                     </div>

//                     <h3 className="text-2xl text-white mb-4">
//                       Upload for Assessment
//                     </h3>
//                     <p className="text-gray-300 mb-6 text-center">
//                       Get AI feedback on a story you've already written
//                     </p>

//                     <div className="space-y-3 mb-6">
//                       <div className="flex items-center text-sm text-gray-300">
//                         <FileText className="w-4 h-4 mr-2 text-green-400" />
//                         Upload .txt files or paste text directly
//                       </div>
//                       <div className="flex items-center text-sm text-gray-300">
//                         <Zap className="w-4 h-4 mr-2 text-green-400" />
//                         16-category AI assessment like an English teacher
//                       </div>
//                       <div className="flex items-center text-sm text-gray-300">
//                         <AlertCircle className="w-4 h-4 mr-2 text-green-400" />
//                         Up to 3 revision attempts per story
//                       </div>
//                     </div>

//                     {usage && limits && (
//                       <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
//                         <p className="text-sm text-gray-300">
//                           Usage: {usage.assessments}/{limits.assessments}{' '}
//                           assessments this month
//                         </p>
//                         <p className="text-sm text-gray-300">
//                           Attempts: {usage.attempts}/{limits.totalAttempts}{' '}
//                           total attempts
//                         </p>
//                         {usage.assessments >= limits.assessments && (
//                           <p className="text-sm text-red-400 mt-1">
//                             Monthly limit reached.
//                             <button
//                               className="underline ml-1 hover:no-underline text-green-400"
//                               onClick={() => router.push('/pricing')}
//                             >
//                               Buy Story Pack
//                             </button>
//                           </p>
//                         )}
//                       </div>
//                     )}

//                     <Button
//                       onClick={() => setMode('upload')}
//                       disabled={
//                         !!(
//                           loading ||
//                           (usage &&
//                             limits &&
//                             usage.assessments >= limits.assessments)
//                         )
//                       }
//                       className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white border-0"
//                     >
//                       Upload Story
//                     </Button>
//                   </div>
//                 </div>
//               </motion.div>
//             </div>
//           )}

//           {/* Write New Story Confirmation */}
//           {mode === 'write' && (
//             <motion.div
//               initial={{ opacity: 0, y: 30 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="max-w-2xl mx-auto"
//             >
//               <div className="bg-gradient-to-br from-gray-800/60 to-gray-700/60 backdrop-blur-xl border border-gray-600/40 p-8">
//                 <div className="text-center mb-6">
//                   <h3 className="text-2xl text-white mb-2">
//                     Ready to Start Writing?
//                   </h3>
//                   <p className="text-gray-300">
//                     You'll be taken to the story writing interface where you can
//                     collaborate with AI
//                   </p>
//                 </div>

//                 <div className="bg-blue-500/10 p-4 border border-blue-500/20 rounded-lg mb-6">
//                   <h4 className="font-medium text-blue-300 mb-2">
//                     What happens next:
//                   </h4>
//                   <ul className="space-y-2 text-sm text-gray-300">
//                     <li>
//                       • You'll start with a blank page to write your opening
//                     </li>
//                     <li>
//                       • AI will respond to help develop your story (up to 7
//                       turns)
//                     </li>
//                     <li>• Each turn requires at least 60 words from you</li>
//                     <li>• Your completed story gets automatic AI assessment</li>
//                   </ul>
//                 </div>

//                 <div className="flex gap-3 justify-center">
//                   <Button
//                     variant="outline"
//                     onClick={() => setMode('select')}
//                     disabled={loading}
//                     className="border-gray-600 text-gray-300 hover:bg-gray-700/50 bg-transparent"
//                   >
//                     Back to Options
//                   </Button>
//                   <Button
//                     onClick={handleCreateNewStory}
//                     disabled={loading}
//                     className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white border-0"
//                   >
//                     {loading ? (
//                       <div className="flex items-center">
//                         <div className="w-4 h-4 border-2 border-white border-t-transparent border-solid animate-spin mr-2"></div>
//                         Creating Session...
//                       </div>
//                     ) : (
//                       'Start Writing Now'
//                     )}
//                   </Button>
//                 </div>
//               </div>
//             </motion.div>
//           )}

//           {/* Upload Story Form */}
//           {mode === 'upload' && (
//             <motion.div
//               initial={{ opacity: 0, y: 30 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="max-w-2xl mx-auto"
//             >
//               <div className="bg-gradient-to-br from-gray-800/60 to-gray-700/60 backdrop-blur-xl border border-gray-600/40 p-8">
//                 <div className="text-center mb-6">
//                   <h3 className="text-2xl text-white mb-2">
//                     Upload Your Story for Assessment
//                   </h3>
//                   <p className="text-gray-300">
//                     Upload a .txt file or paste your story text directly for AI
//                     feedback
//                   </p>
//                 </div>

//                 <div className="space-y-6">
//                   {/* Title Input */}
//                   <div className="space-y-2">
//                     <Label
//                       htmlFor="title"
//                       className="text-sm font-medium text-gray-300"
//                     >
//                       Story Title *
//                     </Label>
//                     <Input
//                       id="title"
//                       type="text"
//                       placeholder="Enter your story title..."
//                       value={title}
//                       onChange={(e) => setTitle(e.target.value)}
//                       maxLength={100}
//                       className="border-gray-600 bg-gray-800/50 text-white placeholder:text-gray-400 focus:border-green-500 focus:ring-green-500"
//                     />
//                     <p className="text-sm text-gray-400">
//                       {title.length}/100 characters
//                     </p>
//                   </div>

//                   {/* File Upload */}
//                   <div className="space-y-2">
//                     <Label className="text-sm font-medium text-gray-300">
//                       Upload Story File
//                     </Label>
//                     <div
//                       className={`border-2 border-dashed p-6 text-center transition-colors rounded-lg ${
//                         dragActive
//                           ? 'border-green-400 bg-green-500/10'
//                           : 'border-gray-600 hover:border-gray-500'
//                       }`}
//                       onDragEnter={handleDrag}
//                       onDragLeave={handleDrag}
//                       onDragOver={handleDrag}
//                       onDrop={handleDrop}
//                     >
//                       <Upload className="w-8 h-8 text-gray-400 mx-auto mb-4" />
//                       <p className="text-gray-300 mb-2">
//                         Drag and drop your .txt file here, or click to browse
//                       </p>
//                       <input
//                         type="file"
//                         accept=".txt,text/plain"
//                         onChange={handleFileChange}
//                         className="hidden"
//                         id="file-upload"
//                       />
//                       <Button
//                         type="button"
//                         variant="outline"
//                         onClick={() =>
//                           document.getElementById('file-upload')?.click()
//                         }
//                         className="border-gray-600 text-gray-300 hover:bg-gray-700/50 bg-transparent"
//                       >
//                         Choose File
//                       </Button>
//                       {file && (
//                         <p className="text-sm text-green-400 mt-2">
//                           Selected: {file.name} ({Math.round(file.size / 1024)}{' '}
//                           KB)
//                         </p>
//                       )}
//                     </div>
//                   </div>

//                   {/* OR Divider */}
//                   <div className="relative">
//                     <div className="absolute inset-0 flex items-center">
//                       <div className="w-full border-t border-gray-600" />
//                     </div>
//                     <div className="relative flex justify-center text-sm">
//                       <span className="px-2 bg-gray-800 text-gray-400">OR</span>
//                     </div>
//                   </div>

//                   {/* Text Input */}
//                   <div className="space-y-2">
//                     <Label
//                       htmlFor="content"
//                       className="text-sm font-medium text-gray-300"
//                     >
//                       Paste Story Text
//                     </Label>
//                     <Textarea
//                       id="content"
//                       placeholder="Paste your story here..."
//                       value={content}
//                       onChange={(e) => setContent(e.target.value)}
//                       rows={12}
//                       maxLength={5000}
//                       className="border-gray-600 bg-gray-800/50 text-white placeholder:text-gray-400 focus:border-green-500 focus:ring-green-500"
//                     />
//                     <div className="flex justify-between text-sm text-gray-400">
//                       <span>{content.length}/5,000 characters</span>
//                       <span>
//                         {content.trim().split(/\s+/).filter(Boolean).length}{' '}
//                         words
//                       </span>
//                     </div>
//                   </div>

//                   {/* Requirements */}
//                   <div className="bg-yellow-500/10 p-4 border border-yellow-500/20 rounded-lg">
//                     <h4 className="font-medium text-yellow-300 mb-2">
//                       Assessment Requirements:
//                     </h4>
//                     <ul className="space-y-1 text-sm text-gray-300">
//                       <li>• Story must be between 50-5,000 words</li>
//                       <li>
//                         • Original work only (plagiarism detection active)
//                       </li>
//                       <li>• You get 3 assessment attempts per story</li>
//                       <li>
//                         • Each attempt provides detailed feedback for
//                         improvement
//                       </li>
//                     </ul>
//                   </div>

//                   {/* Action Buttons */}
//                   <div className="flex gap-3 justify-center">
//                     <Button
//                       variant="outline"
//                       onClick={() => setMode('select')}
//                       disabled={loading}
//                       className="border-gray-600 text-gray-300 hover:bg-gray-700/50 bg-transparent"
//                     >
//                       Back to Options
//                     </Button>
//                     <Button
//                       onClick={handleUploadForAssessment}
//                       disabled={
//                         loading || (!content.trim() && !file) || !title.trim()
//                       }
//                       className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white border-0"
//                     >
//                       {loading ? (
//                         <div className="flex items-center">
//                           <div className="w-4 h-4 border-2 border-white border-t-transparent border-solid animate-spin mr-2"></div>
//                           Uploading...
//                         </div>
//                       ) : (
//                         'Get AI Assessment'
//                       )}
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//           )}

//           {/* Need More Stories/Assessments */}
//           {usage &&
//             limits &&
//             (usage.stories >= limits.stories ||
//               usage.assessments >= limits.assessments) && (
//               <motion.div
//                 initial={{ opacity: 0, y: 30 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 className="max-w-2xl mx-auto mt-8"
//               >
//                 <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-500/30 p-8">
//                   <h3 className="text-xl text-white mb-3 text-center">
//                     Need More Stories?
//                   </h3>
//                   <p className="text-gray-300 mb-4 text-center">
//                     You've reached your monthly limit. Get a Story Pack for $15
//                     to unlock:
//                   </p>
//                   <ul className="space-y-2 text-sm text-gray-300 mb-4">
//                     <li>• +5 additional story creations</li>
//                     <li>• +5 additional assessment uploads</li>
//                     <li>• +15 total assessment attempts</li>
//                     <li>• Priority AI processing</li>
//                   </ul>
//                   <div className="text-center">
//                     <Button
//                       onClick={() => router.push('/pricing')}
//                       className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white border-0"
//                     >
//                       View Pricing Options
//                     </Button>
//                   </div>
//                 </div>
//               </motion.div>
//             )}
//         </div>
//       </section>

//       <DiamondSeparator />

//       {/* Usage Limits Section */}
//       <section className="py-12 px-6">
//         <div className="max-w-7xl mx-auto text-center">
//           <motion.h2
//             initial={{ opacity: 0, y: 30 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             className="text-4xl text-white mb-4"
//           >
//             Your Monthly Creative Allowance
//           </motion.h2>
//           <motion.p
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ delay: 0.2 }}
//             className="text-gray-400 text-xl mb-16"
//           >
//             Every month, you get free access to our platform
//           </motion.p>

//           <div className="grid md:grid-cols-3 gap-8">
//             {[
//               {
//                 icon: Edit3,
//                 title: '3 Free Stories',
//                 description: 'Create new stories with AI collaboration',
//                 color: 'from-green-500 to-teal-600',
//                 bgColor: 'from-green-500/10 to-teal-500/10',
//                 borderColor: 'border-green-500/30',
//               },
//               {
//                 icon: Brain,
//                 title: '3 Free Assessments',
//                 description: 'Upload stories for detailed AI feedback',
//                 color: 'from-blue-500 to-purple-600',
//                 bgColor: 'from-blue-500/10 to-purple-500/10',
//                 borderColor: 'border-blue-500/30',
//               },
//               {
//                 icon: Trophy,
//                 title: '3 Competition Entries',
//                 description: 'Enter monthly writing competitions',
//                 color: 'from-orange-500 to-yellow-600',
//                 bgColor: 'from-orange-500/10 to-yellow-500/10',
//                 borderColor: 'border-orange-500/30',
//               },
//             ].map((item, index) => (
//               <motion.div
//                 key={index}
//                 initial={{ opacity: 0, y: 30 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ delay: index * 0.2 }}
//                 className="group"
//               >
//                 <div
//                   className={`bg-gradient-to-br ${item.bgColor} backdrop-blur-xl border ${item.borderColor} p-6 hover:scale-105 transition-all duration-300`}
//                 >
//                   <div className="relative mb-4">
//                     <div
//                       className={`absolute inset-0 bg-gradient-to-r ${item.color} rounded-lg blur-lg opacity-30 group-hover:opacity-50 transition-opacity`}
//                     ></div>
//                     <div
//                       className={`relative bg-gradient-to-r ${item.color} w-12 h-12 rounded-lg flex items-center justify-center mx-auto`}
//                     >
//                       <item.icon className="w-6 h-6 text-white" />
//                     </div>
//                   </div>

//                   <h3 className="text-xl text-white mb-2">{item.title}</h3>
//                   <p className="text-gray-300 text-sm">{item.description}</p>
//                 </div>
//               </motion.div>
//             ))}
//           </div>

//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ delay: 0.8 }}
//             className="mt-12 p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 backdrop-blur-xl"
//           >
//             <h3 className="text-xl text-white mb-3">Need More Stories?</h3>
//             <p className="text-gray-300 mb-4">
//               Upgrade to Story Pack for just $15 and get 5 additional stories +
//               5 additional assessments for the month!
//             </p>
//             <Link href="/pricing">
//               <motion.button
//                 className="bg-gradient-to-r from-purple-500 to-pink-600 text-white py-2 px-6 rounded-lg hover:shadow-lg transition-all duration-300"
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//               >
//                 <span className="flex items-center justify-center">
//                   <Zap className="w-5 h-5 mr-2" />
//                   View Pricing
//                 </span>
//               </motion.button>
//             </Link>
//           </motion.div>
//         </div>
//       </section>
//     </div>
//   );
// }

// export default function CreateStoriesPage() {
//   return (
//     <Suspense
//       fallback={
//         <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
//           <div className="text-center">
//             <Loader2 className="w-16 h-16 text-purple-400 animate-spin mx-auto mb-4" />
//             <p className="text-white text-xl">Loading create stories page...</p>
//           </div>
//         </div>
//       }
//     >
//       <CreateStoriesContent />
//     </Suspense>
//   );
// }

// app/create-stories/page.tsx - COMPLETE UPDATE FOR MINTOONS REQUIREMENTS
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Upload,
  Trophy,
  FileText,
  Zap,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  BookOpen,
  Star,
  Brain,
  Target,
  Clock,
  Palette,
  Heart,
  Rocket,
  Crown,
  Shield,
  Gift,
  Plus,
  X,
  Download,
  Eye,
} from 'lucide-react';

// ===== INTERFACES =====
interface UsageStats {
  freestyleStories: { used: number; limit: number; remaining: number; canUse: boolean };
  assessmentRequests: { used: number; limit: number; remaining: number; canUse: boolean };
  competitionEntries: { used: number; limit: number; remaining: number; canUse: boolean };
  subscriptionTier: 'FREE' | 'STORY_PACK';
  resetDate: string;
}

interface FileUpload {
  file: File | null;
  content: string;
  title: string;
  uploadType: 'freestyle' | 'assessment' | 'competition';
}

export default function CreateStoriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // ===== STATE =====
  const [loading, setLoading] = useState(true);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [activeSection, setActiveSection] = useState<'home' | 'freestyle' | 'assessment' | 'competition'>('home');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // File upload states
  const [uploadData, setUploadData] = useState<FileUpload>({
    file: null,
    content: '',
    title: '',
    uploadType: 'assessment'
  });
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [creatingStory, setCreatingStory] = useState(false);

  // ===== EFFECTS =====
  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'child') {
      router.push('/login/child');
      return;
    }

    // Check for URL hash to navigate to specific section
    const hash = window.location.hash.replace('#', '');
    if (['freestyle', 'assessment', 'competition'].includes(hash)) {
      setActiveSection(hash as any);
    }

    fetchUsageStats();
  }, [session, status, router]);

  useEffect(() => {
    // Update URL hash when section changes
    if (activeSection !== 'home') {
      window.history.replaceState(null, '', `#${activeSection}`);
    } else {
      window.history.replaceState(null, '', '/create-stories');
    }
  }, [activeSection]);

  // ===== DATA FETCHING =====
  const fetchUsageStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/usage');
      
      if (response.ok) {
        const data = await response.json();
        setUsageStats(data.usage);
      } else {
        console.error('Failed to fetch usage stats');
      }
    } catch (error) {
      console.error('Error fetching usage:', error);
    } finally {
      setLoading(false);
    }
  };

  // ===== STORY CREATION =====
  const handleCreateFreestyleStory = async () => {
  if (!usageStats?.freestyleStories.canUse) {
      setError('You have reached your monthly story creation limit. Upgrade to Story Pack for more stories!');
      return;
    }

    setCreatingStory(true);
    setError(null);

    try {
      const response = await fetch('/api/stories/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionType: 'freestyle',
          title: 'My New Story' // Default title, user can change later
        })
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to the story writing interface
        router.push(`/children-dashboard/story/${data.sessionId}`);
      } else {
        throw new Error(data.error || 'Failed to create story session');
      }
    } catch (error) {
      console.error('❌ Story creation error:', error);
      setError(error instanceof Error ? error.message : 'Failed to create story. Please try again.');
    } finally {
      setCreatingStory(false);
    }
  };

  // ===== FILE HANDLING =====
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (file: File) => {
    // Check file type
    const validTypes = ['text/plain', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const validExtensions = ['.txt', '.pdf', '.docx'];
    
    const isValidType = validTypes.includes(file.type) || validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!isValidType) {
      setError('Please upload only .txt, .pdf, or .docx files');
      return;
    }

    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setUploadData(prev => ({ 
      ...prev, 
      file,
      title: prev.title || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
    }));
    setError(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  // ===== STORY UPLOAD =====
  const handleUploadStory = async () => {
    if (!uploadData.title.trim()) {
      setError('Please enter a story title');
      return;
    }

    if (!uploadData.content.trim() && !uploadData.file) {
      setError('Please provide story content via file upload or text input');
      return;
    }

    // Check usage limits based on upload type
  if (uploadData.uploadType === 'assessment' && !usageStats?.assessmentRequests.canUse) {
      setError('You have reached your monthly assessment upload limit. Upgrade to Story Pack for more uploads!');
      return;
    }

  if (uploadData.uploadType === 'competition' && !usageStats?.competitionEntries.canUse) {
      setError('You have reached your monthly competition entry limit (3 entries maximum).');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('title', uploadData.title.trim());
      formData.append('uploadType', uploadData.uploadType);
      
      if (uploadData.file) {
        formData.append('file', uploadData.file);
      } else {
        formData.append('content', uploadData.content.trim());
      }

      const endpoint = uploadData.uploadType === 'competition' 
        ? '/api/user/stories/upload-competition'
        : '/api/stories/upload';

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`Story uploaded successfully! ${
          uploadData.uploadType === 'assessment' 
            ? 'AI assessment has begun and will be ready shortly.'
            : 'Your competition entry has been submitted.'
        }`);
        
        // Reset form
        setUploadData({
          file: null,
          content: '',
          title: '',
          uploadType: 'assessment'
        });
        
        // Refresh usage stats
        fetchUsageStats();

        // Redirect to story view after delay
        setTimeout(() => {
          router.push(`/children-dashboard/my-stories/${data.storyId}`);
        }, 2000);
      } else {
        // Handle specific file type errors with helpful suggestions
        if (data.suggestion === 'copy_paste') {
          setError(`${data.error}\n\nTip: Open your ${data.fileType?.toUpperCase() || 'file'}, select all text (Ctrl+A), copy (Ctrl+C), and paste it in the text area below.`);
          // Clear the file to encourage text pasting
          setUploadData(prev => ({ ...prev, file: null }));
        } else {
          setError(data.error || 'Failed to upload story');
        }
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload story. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // ===== LOADING STATE =====
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
        <div className="text-white text-xl flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          Loading your creative studio...
        </div>
      </div>
    );
  }

  // ===== RENDER SECTIONS =====
  const renderHomeSection = () => (
    <div className="max-w-7xl mx-auto px-6 mt-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <div className="flex justify-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="relative"
          >
            <Palette className="w-20 h-20 text-purple-400" />
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-pink-500 to-yellow-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </motion.div>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          <span className="block">Your Creative</span>
          <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            Writing Studio
          </span>
        </h1>

        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
          Three powerful ways to create and improve your stories: 
          <span className="text-blue-400 font-medium"> AI Collaboration</span>,
          <span className="text-green-400 font-medium"> Expert Assessment</span>, and
          <span className="text-purple-400 font-medium"> Monthly Competitions</span>
        </p>

        {/* Usage Stats Overview */}
        {usageStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-3 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-12"
          >
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-400">
                {usageStats.freestyleStories.remaining}
              </div>
              <div className="text-sm text-blue-300">Freestyle Stories Left</div>
            </div>
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400">
                {usageStats.assessmentRequests.remaining}
              </div>
              <div className="text-sm text-green-300">Assessment Requests Left</div>
            </div>
            <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-400">
                {usageStats.competitionEntries.remaining}
              </div>
              <div className="text-sm text-purple-300">Competition Entries</div>
            </div>
          </motion.div>
        )}

        {/* Subscription Tier Badge */}
        {usageStats && (
          <div className="flex justify-center mb-8">
            {usageStats.subscriptionTier === 'STORY_PACK' ? (
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-gray-900 px-6 py-2 rounded-full font-semibold flex items-center gap-2">
                <Crown className="w-5 h-5" />
                Story Pack Active
              </div>
            ) : (
              <div className="bg-gray-700/50 text-gray-300 px-6 py-2 rounded-full font-medium flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Free Writer
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Three Main Options */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        
        {/* Freestyle Writing */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => setActiveSection('freestyle')}
          className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-8 cursor-pointer hover:scale-105 transition-all duration-300 group"
        >
          <div className="text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 w-16 h-16 rounded-lg flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-white mb-4">Freestyle Writing</h3>
            <p className="text-gray-300 mb-6">
              Turn-based AI collaboration to develop your creative story ideas
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center text-sm text-gray-300">
                <Clock className="w-4 h-4 mr-2 text-blue-400" />
                7 turns of collaborative writing
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <Brain className="w-4 h-4 mr-2 text-blue-400" />
                AI helps develop your story naturally
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <Target className="w-4 h-4 mr-2 text-blue-400" />
                Automatic assessment when complete
              </div>
            </div>

            {usageStats && (
              <div className="mb-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-sm text-gray-300">
                  {usageStats.freestyleStories?.canUse ? (
                    `${usageStats.freestyleStories?.remaining ?? 0} stories remaining this month`
                  ) : (
                    <span className="text-red-400">Monthly limit reached - Upgrade to Story Pack</span>
                  )}
                </p>
              </div>
            )}

            <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2">
              <Rocket className="w-5 h-5" />
              Start Writing
            </button>
          </div>
        </motion.div>

        {/* Upload for Assessment */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => setActiveSection('assessment')}
          className="bg-gradient-to-br from-green-500/20 to-teal-500/20 border border-green-500/30 rounded-xl p-8 cursor-pointer hover:scale-105 transition-all duration-300 group"
        >
          <div className="text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative bg-gradient-to-r from-green-500 to-teal-600 w-16 h-16 rounded-lg flex items-center justify-center mx-auto">
                <Upload className="w-8 h-8 text-white" />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-white mb-4">Upload for Assessment</h3>
            <p className="text-gray-300 mb-6">
              Get detailed AI feedback on stories you've already written
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center text-sm text-gray-300">
                <FileText className="w-4 h-4 mr-2 text-green-400" />
                Support for .txt, .pdf, .docx files
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <Brain className="w-4 h-4 mr-2 text-green-400" />
                16+ category analysis like a teacher
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <Shield className="w-4 h-4 mr-2 text-green-400" />
                Plagiarism and AI content detection
              </div>
            </div>

            {usageStats && (
              <div className="mb-6 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-sm text-gray-300">
                  {usageStats.assessmentRequests.canUse ? (
                    `${usageStats.assessmentRequests.remaining} uploads remaining this month`
                  ) : (
                    <span className="text-red-400">Monthly limit reached - Upgrade to Story Pack</span>
                  )}
                </p>
              </div>
            )}

            <button className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Story
            </button>
          </div>
        </motion.div>

        {/* Competition Entry */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => setActiveSection('competition')}
          className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-8 cursor-pointer hover:scale-105 transition-all duration-300 group"
        >
          <div className="text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative bg-gradient-to-r from-purple-500 to-pink-600 w-16 h-16 rounded-lg flex items-center justify-center mx-auto">
                <Trophy className="w-8 h-8 text-white" />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-white mb-4">Competition Entry</h3>
            <p className="text-gray-300 mb-6">
              Submit your best stories to monthly writing competitions
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center text-sm text-gray-300">
                <Gift className="w-4 h-4 mr-2 text-purple-400" />
                Completely FREE to enter
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <Star className="w-4 h-4 mr-2 text-purple-400" />
                Top 3 winners each month
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <Trophy className="w-4 h-4 mr-2 text-purple-400" />
                AI-powered fair judging
              </div>
            </div>

            {usageStats && (
              <div className="mb-6 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <p className="text-sm text-gray-300">
                  {usageStats.competitionEntries.canUse ? (
                    `${usageStats.competitionEntries.remaining} entries remaining this month`
                  ) : (
                    <span className="text-orange-400">3 entries used - Maximum reached</span>
                  )}
                </p>
              </div>
            )}

            <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2">
              <Trophy className="w-5 h-5" />
              Enter Competition
            </button>
          </div>
        </motion.div>
      </div>

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-8 mb-16"
      >
        <h2 className="text-3xl font-bold text-white text-center mb-8">
          Why Choose Mintoons? ✨
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <Brain className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">AI-Powered Learning</h3>
            <p className="text-gray-400 text-sm">Get detailed feedback on 16+ writing categories</p>
          </div>
          
          <div className="text-center">
            <Shield className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Safe & Secure</h3>
            <p className="text-gray-400 text-sm">Child-friendly platform with integrity checking</p>
          </div>
          
          <div className="text-center">
            <Trophy className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Monthly Contests</h3>
            <p className="text-gray-400 text-sm">Compete with young writers worldwide</p>
          </div>
          
          <div className="text-center">
            <Heart className="w-12 h-12 text-pink-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Encouraging Community</h3>
            <p className="text-gray-400 text-sm">Supportive feedback from mentors and peers</p>
          </div>
        </div>
      </motion.div>

      {/* Upgrade Promotion */}
      {usageStats && usageStats.subscriptionTier === 'FREE' && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl p-8 text-center"
        >
          <Crown className="w-16 h-16 text-orange-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-4">Want More Creative Power?</h3>
          <p className="text-gray-300 mb-6">
            Upgrade to Story Pack and get 5 more stories, 5 more assessments, and 15 more assessment attempts each month!
          </p>
          <button
            onClick={() => router.push('/pricing')}
            className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
          >
            Upgrade to Story Pack - $15/month
          </button>
        </motion.div>
      )}
    </div>
  );

  const renderFreestyleSection = () => (
    <div className="max-w-4xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <button
          onClick={() => setActiveSection('home')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors mx-auto"
        >
          ← Back to Options
        </button>

        <div className="relative mb-6">
          <Sparkles className="w-20 h-20 text-blue-400 mx-auto" />
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Rocket className="w-4 h-4 text-white" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-white mb-4">Freestyle Story Writing</h1>
        <p className="text-xl text-gray-300 mb-8">
          Collaborate with AI to create amazing stories through turn-based writing
        </p>
      </motion.div>

      <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-8 mb-8">
        <h3 className="text-2xl font-bold text-white mb-6">How It Works:</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold">1</div>
            <h4 className="font-semibold text-white mb-2">You Write</h4>
            <p className="text-gray-400 text-sm">Start your story with any idea - at least 60 words per turn</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold">2</div>
            <h4 className="font-semibold text-white mb-2">AI Responds</h4>
            <p className="text-gray-400 text-sm">AI continues your story naturally and asks inspiring questions</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold">3</div>
            <h4 className="font-semibold text-white mb-2">Repeat & Assess</h4>
            <p className="text-gray-400 text-sm">Continue for 7 turns, then get detailed AI assessment</p>
          </div>
        </div>

        {usageStats && (
              <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300">Stories Remaining:</span>
                  <span className="text-white font-semibold">{usageStats.freestyleStories?.remaining ?? 0} / {usageStats.freestyleStories?.limit ?? 0}</span>
                </div>
                <div className="w-full bg-blue-800/30 rounded-full h-2">
                  <div
                    className="bg-blue-400 h-2 rounded-full transition-all"
                    style={{ width: `${((usageStats.freestyleStories?.used ?? 0) / (usageStats.freestyleStories?.limit ?? 1)) * 100}%` }}
                  />
                </div>
                {!usageStats.freestyleStories?.canUse && (
                  <p className="text-red-400 text-sm mt-2">
                    Monthly limit reached. 
                    <button
                      onClick={() => router.push('/pricing')}
                      className="underline ml-1 hover:no-underline"
                    >
                      Upgrade to Story Pack
                    </button>
                  </p>
                )}
              </div>
        )}

        <div className="text-center">
          <button
            onClick={handleCreateFreestyleStory}
            disabled={creatingStory || !usageStats?.freestyleStories?.canUse}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all flex items-center gap-3 mx-auto disabled:cursor-not-allowed"
          >
            {creatingStory ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating Your Story...
              </>
            ) : (
              <>
                <Rocket className="w-6 h-6" />
                Start Writing Now!
              </>
            )}
          </button>
        </div>
      </div>

      {/* Story Examples */}
      <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-600/30 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Story Ideas to Get You Started:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-700/30 rounded-lg p-4">
            <h4 className="font-semibold text-blue-400 mb-2">🚀 Adventure</h4>
            <p className="text-gray-300 text-sm">A kid discovers a secret spaceship in their backyard...</p>
          </div>
          <div className="bg-gray-700/30 rounded-lg p-4">
            <h4 className="font-semibold text-green-400 mb-2">🧙‍♂️ Fantasy</h4>
            <p className="text-gray-300 text-sm">Your pet suddenly starts talking and reveals a magical secret...</p>
          </div>
          <div className="bg-gray-700/30 rounded-lg p-4">
            <h4 className="font-semibold text-purple-400 mb-2">🔮 Mystery</h4>
            <p className="text-gray-300 text-sm">Strange things keep disappearing from your school locker...</p>
          </div>
          <div className="bg-gray-700/30 rounded-lg p-4">
            <h4 className="font-semibold text-pink-400 mb-2">👥 Friendship</h4>
            <p className="text-gray-300 text-sm">You meet someone who seems to be from a different time period...</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAssessmentSection = () => (
    <div className="max-w-4xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <button
          onClick={() => setActiveSection('home')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors mx-auto"
        >
          ← Back to Options
        </button>

        <div className="relative mb-6">
          <Upload className="w-20 h-20 text-green-400 mx-auto" />
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-white mb-4">Upload for Assessment</h1>
        <p className="text-xl text-gray-300 mb-8">
          Get detailed AI feedback on stories you've already written
        </p>
      </motion.div>

      <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-8">
        {/* Upload Type Selection */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Upload Purpose:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setUploadData(prev => ({ ...prev, uploadType: 'assessment' }))}
              className={`p-4 rounded-lg border transition-all ${
                uploadData.uploadType === 'assessment'
                  ? 'border-green-500 bg-green-500/20 text-green-300'
                  : 'border-gray-600 bg-gray-700/30 text-gray-300 hover:border-green-400'
              }`}
            >
              <Brain className="w-8 h-8 mx-auto mb-2" />
              <div className="font-semibold">For Assessment</div>
              <div className="text-sm opacity-75">Get detailed AI feedback</div>
            </button>
            
            <button
              onClick={() => setUploadData(prev => ({ ...prev, uploadType: 'competition' }))}
              className={`p-4 rounded-lg border transition-all ${
                uploadData.uploadType === 'competition'
                  ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                  : 'border-gray-600 bg-gray-700/30 text-gray-300 hover:border-purple-400'
              }`}
            >
              <Trophy className="w-8 h-8 mx-auto mb-2" />
              <div className="font-semibold">For Competition</div>
              <div className="text-sm opacity-75">Enter monthly contest</div>
            </button>
          </div>
        </div>

        {/* Title Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Story Title *
          </label>
          <input
            type="text"
            placeholder="Enter your story title..."
            value={uploadData.title}
            onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
            maxLength={100}
            className="w-full bg-gray-700/50 border border-gray-600/40 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-400 mt-1">{uploadData.title.length}/100 characters</p>
        </div>

        {/* File Upload Area */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Upload Story File
          </label>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-green-400 bg-green-400/10'
                : 'border-gray-600 hover:border-gray-500'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {uploadData.file ? (
              <div className="space-y-4">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto" />
                <div>
                  <p className="text-white font-medium">{uploadData.file.name}</p>
                  <p className="text-gray-400 text-sm">
                    {(uploadData.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={() => setUploadData(prev => ({ ...prev, file: null }))}
                  className="text-red-400 hover:text-red-300 text-sm underline"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-white font-medium mb-2">
                    Drag and drop your story file here
                  </p>
                  <p className="text-gray-400 text-sm mb-2">
                    or click to browse (.txt, .pdf, .docx files up to 10MB)
                  </p>
                  <p className="text-yellow-400 text-xs mb-4">
                    📝 Note: For PDF/DOCX files, you'll be asked to copy-paste the text
                  </p>
                  <input
                    type="file"
                    accept=".txt,.pdf,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors inline-block"
                  >
                    Choose File
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Text Input Alternative */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Or paste your story text directly:
          </label>
          <textarea
            placeholder="Paste your story here..."
            value={uploadData.content}
            onChange={(e) => setUploadData(prev => ({ ...prev, content: e.target.value }))}
            rows={8}
            className="w-full bg-gray-700/50 border border-gray-600/40 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-vertical"
          />
          <p className="text-sm text-gray-400 mt-1">
            {uploadData.content.split(' ').filter(word => word.length > 0).length} words
          </p>
        </div>

        {/* Usage Stats */}
        {usageStats && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300">Uploads Remaining:</span>
                  <span className="text-white font-semibold">
                    {uploadData.uploadType === 'assessment' 
                      ? `${usageStats.assessmentRequests.remaining} / ${usageStats.assessmentRequests.limit}`
                      : `${usageStats.competitionEntries.remaining} / ${usageStats.competitionEntries.limit}`
                    }
                  </span>
                </div>
                <div className="w-full bg-green-800/30 rounded-full h-2">
                  <div
                    className="bg-green-400 h-2 rounded-full transition-all"
                    style={{ 
                      width: `${uploadData.uploadType === 'assessment'
                        ? (usageStats.assessmentRequests.used / usageStats.assessmentRequests.limit) * 100
                        : (usageStats.competitionEntries.used / usageStats.competitionEntries.limit) * 100
                      }%` 
                    }}
                  />
                </div>
              </div>
              
              {uploadData.uploadType === 'assessment' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300">Assessment Attempts:</span>
                    <span className="text-white font-semibold">
                      {usageStats.assessmentRequests.remaining} / {usageStats.assessmentRequests.limit}
                    </span>
                  </div>
                  <div className="w-full bg-yellow-800/30 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all"
                      style={{ width: `${(usageStats.assessmentRequests.used / usageStats.assessmentRequests.limit) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="text-red-400">
                {error.split('\n').map((line, index) => (
                  <p key={index} className={index > 0 ? 'mt-2' : ''}>{line}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <p className="text-green-400">{success}</p>
            </div>
          </div>
        )}

        {/* Upload Button */}
        <div className="text-center">
          <button
            onClick={handleUploadStory}
            disabled={
              uploading || 
              !uploadData.title.trim() || 
              (!uploadData.content.trim() && !uploadData.file) ||
              (uploadData.uploadType === 'assessment' && !usageStats?.assessmentRequests.canUse) ||
              (uploadData.uploadType === 'competition' && !usageStats?.competitionEntries.canUse)
            }
            className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all flex items-center gap-3 mx-auto disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-6 h-6" />
                {uploadData.uploadType === 'assessment' ? 'Upload for Assessment' : 'Submit to Competition'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Assessment Features */}
      <div className="mt-8 bg-gray-800/40 backdrop-blur-xl border border-gray-600/30 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">What You'll Get:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <Target className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="font-medium text-white text-sm">Grammar Analysis</div>
          </div>
          <div className="text-center">
            <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <div className="font-medium text-white text-sm">Creativity Score</div>
          </div>
          <div className="text-center">
            <BookOpen className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="font-medium text-white text-sm">Vocabulary Review</div>
          </div>
          <div className="text-center">
            <Shield className="w-8 h-8 text-orange-400 mx-auto mb-2" />
            <div className="font-medium text-white text-sm">Integrity Check</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCompetitionSection = () => (
    <div className="max-w-4xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <button
          onClick={() => setActiveSection('home')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors mx-auto"
        >
          ← Back to Options
        </button>

        <div className="relative mb-6">
          <Trophy className="w-20 h-20 text-purple-400 mx-auto" />
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
            <Star className="w-4 h-4 text-white" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-white mb-4">Competition Entry</h1>
        <p className="text-xl text-gray-300 mb-8">
          Submit your best stories to monthly writing competitions - completely FREE!
        </p>
      </motion.div>

      <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-8 mb-8">
        <h3 className="text-2xl font-bold text-white mb-6">How Competitions Work:</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold">1</div>
            <h4 className="font-semibold text-white mb-2">Submit (Days 1-25)</h4>
            <p className="text-gray-400 text-sm">Upload up to 3 of your best stories</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold">2</div>
            <h4 className="font-semibold text-white mb-2">AI Judging (Days 26-30)</h4>
            <p className="text-gray-400 text-sm">Advanced AI evaluates all entries fairly</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold">3</div>
            <h4 className="font-semibold text-white mb-2">Results (Day 31)</h4>
            <p className="text-gray-400 text-sm">Top 3 winners announced with certificates</p>
          </div>
        </div>

        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-6 mb-6">
          <h4 className="font-semibold text-purple-300 mb-3">Competition Rules:</h4>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li>• Completely FREE to enter</li>
            <li>• Maximum 3 stories per month</li>
            <li>• Stories must be 350-2000 words</li>
            <li>• Any genre welcome</li>
            <li>• Original work only (AI detection in place)</li>
            <li>• Winner announcements on the last day of each month</li>
          </ul>
        </div>

        <div className="text-center">
          <button
            onClick={() => {
              setUploadData(prev => ({ ...prev, uploadType: 'competition' }));
              setActiveSection('assessment'); // Reuse upload interface
            }}
            disabled={!usageStats?.competitionEntries.canUse}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all flex items-center gap-3 mx-auto disabled:cursor-not-allowed"
          >
            <Trophy className="w-6 h-6" />
            {usageStats?.competitionEntries.canUse ? 'Submit to Competition' : 'Competition Limit Reached'}
          </button>
        </div>
      </div>

      {/* Competition Features */}
      <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-600/30 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Why Enter Competitions?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <Gift className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <div className="font-medium text-white text-sm">Completely Free</div>
          </div>
          <div className="text-center">
            <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <div className="font-medium text-white text-sm">Recognition</div>
          </div>
          <div className="text-center">
            <Brain className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="font-medium text-white text-sm">Fair AI Judging</div>
          </div>
          <div className="text-center">
            <Heart className="w-8 h-8 text-pink-400 mx-auto mb-2" />
            <div className="font-medium text-white text-sm">Community</div>
          </div>
        </div>
      </div>
    </div>
  );

  // ===== MAIN RENDER =====
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 py-20">
      {/* Section Router */}
      {activeSection === 'home' && renderHomeSection()}
      {activeSection === 'freestyle' && renderFreestyleSection()}
      {activeSection === 'assessment' && renderAssessmentSection()}
      {activeSection === 'competition' && renderCompetitionSection()}
    </div>
  );
}