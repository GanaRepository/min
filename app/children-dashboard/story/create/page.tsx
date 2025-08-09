'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateStoryPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main create-stories page
    router.replace('/create-stories');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
      <div className="text-white text-xl">Redirecting to story creation...</div>
    </div>
  );
}
