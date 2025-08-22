// app/pricing/page.tsx - New Pricing Page for Pay-Per-Use Model
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Check,
  Crown,
  Zap,
  Star,
  Users,
  BookOpen,
  Award,
  FileText,
  Trophy,
  CreditCard,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from '@/components/ui/toast';

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handlePurchase = async (
    productType: 'story_pack' | 'story_publication',
    storyId?: string
  ) => {
    if (!session) {
      router.push('/login/child');
      return;
    }

    setLoading(productType);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productType,
          storyId,
          userId: session.user.id,
        }),
      });

      const data = await response.json();

      if (data.success && data.checkoutUrl) {
        // Redirect to Stripe Checkout
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error(data.message || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      setToastMessage('Purchase failed. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 pt-16">
        {/* Header */}
        <div className="pt-16 pb-16">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-center gap-2 mb-6">
                <Zap className="text-green-400" size={32} />
                <h1 className="text-4xl text-white">Simple, Fair Pricing</h1>
              </div>
              <p className="text-xl text-gray-300  max-w-3xl mx-auto">
                Pay only for what you use. Start free, upgrade when you need
                more. No subscriptions, no hidden fees, just transparent pricing
                for young writers.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Free Tier */}
        <div className="max-w-7xl mx-auto px-6 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30  p-8 text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Zap className="text-green-400" size={32} />
              <h2 className="text-3xl  text-white">Free Tier</h2>
            </div>

            <p className="text-gray-300 mb-8 text-lg">
              Perfect for getting started with creative writing
            </p>

            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div className="text-center">
                <div className="bg-green-500/20 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="text-green-400" size={24} />
                </div>
                <h3 className="text-white  mb-2">3 Story Creations</h3>
                <p className="text-gray-400">
                  Write 3 original stories per month
                </p>
              </div>

              <div className="text-center">
                <div className="bg-blue-500/20 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <FileText className="text-blue-400" size={24} />
                </div>
                <h3 className="text-white  mb-2">3 AI Assessments</h3>
                <p className="text-gray-400">
                  Upload existing stories for professional feedback
                </p>
              </div>

              <div className="text-center">
                <div className="bg-purple-500/20 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Trophy className="text-purple-400" size={24} />
                </div>
                <h3 className="text-white  mb-2">3 Competition Entries</h3>
                <p className="text-gray-400">
                  Participate in monthly competitions
                </p>
              </div>
            </div>

            <div className="bg-gray-800/50  p-6">
              <h4 className="text-white  mb-4">What&apos;s Included:</h4>
              <div className="grid md:grid-cols-2 gap-3 text-left">
                {[
                  'Advanced AI writing companion',
                  'Professional grammar & style feedback',
                  'Plagiarism detection & guidance',
                  '16-category story assessment',
                  'Age-appropriate feedback (6-8, 9-12, 13+)',
                  'Monthly competition participation',
                  'Story Publication (Optional): $10/story',
                  'Progress tracking & analytics',
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="text-green-400" size={16} />
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Pay-As-You-Go Options */}
        <div className="max-w-7xl mx-auto px-6 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl  text-white mb-4">
              Need More? Pay Only When You Need It
            </h2>
            <p className="text-gray-300 text-lg">
              No monthly commitments. Purchase additional resources as your
              creativity grows.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Story Pack */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30  p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-500/20 rounded-full p-3">
                  <Star className="text-blue-400" size={28} />
                </div>
                <div>
                  <h3 className="text-2xl  text-white">Story Pack</h3>
                  <p className="text-blue-300">Perfect for active writers</p>
                </div>
              </div>

              <div className="text-center mb-8">
                <div className="text-5xl  text-white mb-2">$15</div>
                <p className="text-gray-300">One-time purchase</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500/20 rounded-full p-2">
                    <BookOpen className="text-blue-400" size={16} />
                  </div>
                  <span className="text-white">
                    +5 Additional Story Creations
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-green-500/20 rounded-full p-2">
                    <FileText className="text-green-400" size={16} />
                  </div>
                  <span className="text-white">
                    +5 Additional AI Assessments
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-purple-500/20 rounded-full p-2">
                    <Award className="text-purple-400" size={16} />
                  </div>
                  <span className="text-white">
                    +15 Total Assessment Attempts
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-500/20 rounded-full p-2">
                    <Zap className="text-yellow-400" size={16} />
                  </div>
                  <span className="text-white">Priority AI Processing</span>
                </div>
              </div>

              <div className="bg-gray-800/50  p-4 mb-6">
                <p className="text-gray-300 text-sm">
                  <strong>Great Value:</strong> That&apos;s only $1.88 per story
                  creation! Perfect for children who love to write regularly.
                </p>
              </div>

              <button
                onClick={() => handlePurchase('story_pack')}
                disabled={loading === 'story_pack'}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 border-2 border-blue-500 transition-colors  text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading === 'story_pack' ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard size={20} />
                    Purchase Story Pack
                  </>
                )}
              </button>
            </motion.div>

            {/* Story Publication */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30  p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-purple-500/20 rounded-full p-3">
                  <Crown className="text-purple-400" size={28} />
                </div>
                <div>
                  <h3 className="text-2xl  text-white">Story Publication</h3>
                  <p className="text-purple-300">Make your story public</p>
                </div>
              </div>

              <div className="text-center mb-8">
                <div className="text-5xl  text-white mb-2">$10</div>
                <p className="text-gray-300">Per story publication</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500/20 rounded-full p-2">
                    <Users className="text-green-400" size={16} />
                  </div>
                  <span className="text-white">Public Story Showcase</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-500/20 rounded-full p-2">
                    <Trophy className="text-yellow-400" size={16} />
                  </div>
                  <span className="text-white">Competition Eligibility</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500/20 rounded-full p-2">
                    <Star className="text-blue-400" size={16} />
                  </div>
                  <span className="text-white">Author Profile Feature</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-pink-500/20 rounded-full p-2">
                    <Award className="text-pink-400" size={16} />
                  </div>
                  <span className="text-white">
                    Share with Friends & Family
                  </span>
                </div>
              </div>

              <div className="bg-gray-800/50  p-4 mb-6">
                <p className="text-gray-300 text-sm">
                  <strong>Competition Ready: </strong>Competition entry is
                  completely FREE! The $10 fee is only for publishing your story
                  i.e. get printed in Physical Book Anthology Collections.
                </p>
              </div>

              <button
                onClick={() =>
                  router.push(
                    session ? '/children-dashboard/my-stories' : '/login/child'
                  )
                }
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 border-2 border-purple-500 transition-colors  text-lg flex items-center justify-center gap-2"
              >
                <BookOpen size={20} />
                {session ? 'View My Stories' : 'Login to Publish'}
              </button>
            </motion.div>
          </div>
        </div>

        {/* Physical Books Section */}
        <div className="max-w-7xl mx-auto px-6 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30  p-8 text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-6">
              <BookOpen className="text-yellow-400" size={32} />
              <h2 className="text-3xl  text-white">Physical Books</h2>
            </div>

            <p className="text-gray-300 mb-8 text-lg max-w-3xl mx-auto">
              Turn your digital stories into beautiful physical books! Perfect
              for gifts, school libraries, or building your personal collection.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-800/50  p-6">
                <h3 className="text-white  mb-3">Individual Books</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Custom printed book featuring your child&apos;s story with
                  professional layout and cover design.
                </p>
                <p className="text-yellow-400 ">Contact for Quote</p>
              </div>

              <div className="bg-gray-800/50  p-6">
                <h3 className="text-white  mb-3">Class Collections</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Compilation books featuring stories from an entire classroom.
                  Great for schools!
                </p>
                <p className="text-yellow-400 ">Bulk Discounts Available</p>
              </div>

              <div className="bg-gray-800/50  p-6">
                <h3 className="text-white  mb-3">Competition Winners</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Annual anthology featuring the best stories from our monthly
                  competitions.
                </p>
                <p className="text-yellow-400 ">Special Pricing</p>
              </div>
            </div>

            <button
              onClick={() => router.push('/contact-us')}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-3 border-2 border-yellow-500 transition-colors  text-lg"
            >
              Request Book Quote
            </button>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto px-6 ">
          <div className="text-center mb-12">
            <h2 className="text-3xl  text-white mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6 pb-12">
            {[
              {
                question: 'Do purchased story packs expire?',
                answer:
                  'Story packs expire at the end of each month, just like free tier limits. This encourages regular writing practice and keeps the platform fresh with new content monthly.',
              },
              {
                question: 'Can I get refunds for unused stories?',
                answer:
                  "Since story packs are designed for immediate use and expire monthly, we don't offer refunds for unused stories. However, if there's a technical issue preventing you from using purchased content, please contact our support team.",
              },
              {
                question: 'Is the AI assessment really as good as a teacher?',
                answer:
                  "Our AI provides comprehensive feedback across 16 categories including grammar, creativity, and critical thinking. While it can't replace human creativity, it offers consistent, encouraging, and detailed feedback that helps children improve their writing skills.",
              },
              {
                question: 'How do competitions work?',
                answer:
                  'Every month, we run a competition with three phases: 25 days for submissions, 5 days for AI judging, and 1 day for results. Children can submit up to 3 stories per competition and top 3 will be picked by our AI judge. Also, you can pay $10 per story in order to get your story published in Physical Book Anthology Collections.',
              },
              {
                question: 'Can I still access free features?',
                answer:
                  'Absolutely! Every child gets 3 free story creations, 3 AI assessments, and 3 competition entries every month. The free tier includes all core features - payments are only for additional usage.',
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-gray-800/50  p-6 border border-gray-700"
              >
                <h3 className="text-white  mb-3">{faq.question}</h3>
                <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      {toastMessage && (
        <Toast>
          <ToastTitle>Error</ToastTitle>
          <ToastDescription>{toastMessage}</ToastDescription>
          <ToastClose onClick={() => setToastMessage(null)} />
        </Toast>
      )}
      <ToastViewport />
    </ToastProvider>
  );
}
