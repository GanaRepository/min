// app/children-dashboard/story/create/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function StoryCreateContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user.role !== 'child') {
      router.push('/login/child');
      return;
    }

    const pendingToken = searchParams?.get('pendingToken');

    if (!pendingToken) {
      toast({
        title: '❌ Error',
        description: 'Missing story creation token. Please start over.',
        variant: 'destructive',
      });
      router.push('/create-stories');
      return;
    }

    // Do NOT automatically create story from token. Only create when user clicks a button or triggers explicitly.
  }, [session, status, searchParams, router, toast]);

  const createStoryFromToken = async (token: string) => {
    setIsCreating(true);

    try {
      const response = await fetch('/api/stories/create-from-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pendingToken: token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create story');
      }

      toast({
        title: '🎉 Story Created!',
        description: 'Your magical adventure begins now!',
      });

      // Navigate to the story writing page
      router.push(`/children-dashboard/story/${data.session.id}`);
    } catch (error) {
      console.error('Error creating story from token:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      setError(errorMessage);
      toast({
        title: '❌ Creation Failed',
        description: errorMessage,
        variant: 'destructive',
      });

      // Redirect back to create stories after a delay
      setTimeout(() => {
        router.push('/create-stories');
      }, 3000);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
      <div className="text-white text-center max-w-md mx-auto p-8">
        <motion.div
          className="mb-8"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Sparkles className="w-16 h-16 mx-auto text-green-400" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h1 className="text-2xl font-bold">
            {isCreating
              ? 'Creating Your Magical Story...'
              : error
                ? 'Oops! Something went wrong'
                : 'Loading...'}
          </h1>

          {isCreating && (
            <p className="text-gray-300">
              We&apos;re preparing your adventure with the story elements you
              selected. This may take a moment!
            </p>
          )}

          {error && (
            <div className="space-y-4">
              <p className="text-red-300">{error}</p>
              <p className="text-gray-400">
                Redirecting you back to story creation...
              </p>
            </div>
          )}

          <div className="flex items-center justify-center space-x-2 mt-6">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-gray-400">
              Mintoons Creative Writing Platform
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function StoryCreatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      }
    >
      <StoryCreateContent />
    </Suspense>
  );
}
