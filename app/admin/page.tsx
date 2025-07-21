'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to admin dashboard by default
    router.push('/admin/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center w-full bg-[#F6F9FC]">
      <div className="text-center p-8 bg-white rounded-lg shadow-md border border-gray-100">
        <div className="animate-spin h-8 w-8 border-4 border-[#7E69AB] border-t-transparent rounded-full mx-auto mb-4"></div>
        <div className="text-gray-700">Redirecting to dashboard...</div>
      </div>
    </div>
  );
}
