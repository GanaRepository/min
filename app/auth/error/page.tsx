'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Component that uses useSearchParams hook
function AuthErrorContent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>('');
  const [loginRedirect, setLoginRedirect] = useState<string>('/login');

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      let errorMessage = 'An authentication error occurred';
      let redirectPath = '/login';

      // Parse different error types
      switch (errorParam) {
        case 'CredentialsSignin':
          errorMessage = 'Invalid email or password';
          break;
        case 'AccessDenied':
          errorMessage =
            'Access denied. You do not have permission to access this resource.';
          break;
        default:
          // Check if it's a role mismatch error
          if (errorParam.includes('account is registered as a')) {
            errorMessage = errorParam;

            // Extract the correct login path from the error message
            const pathMatch = errorParam.match(/at (\/[a-z\/-]+)/i);
            if (pathMatch && pathMatch[1]) {
              redirectPath = pathMatch[1];
            }
          } else {
            errorMessage = errorParam;
          }
      }

      setError(errorMessage);
      setLoginRedirect(redirectPath);
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-4">
        <AlertCircle className="h-8 w-8" />
      </div>

      <h1 className="text-2xl font-semibold mb-2">Authentication Error</h1>
      <p className="text-gray-600 mb-6">{error}</p>

      <Link href={loginRedirect}>
        <Button className="flex items-center justify-center">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Login
        </Button>
      </Link>
    </div>
  );
}

// Loading fallback
function AuthErrorFallback() {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
        <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-gray-600 rounded-full"></div>
      </div>
      <h1 className="text-2xl font-semibold mb-2">Loading...</h1>
      <p className="text-gray-600 mb-6">Retrieving error information</p>
    </div>
  );
}

// Main page component with Suspense boundary
export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-2 sm:px-4">
      <div className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl p-2 sm:p-4">
        <Card className="border shadow-lg">
          <CardContent className="p-4 sm:p-6">
            <Suspense fallback={<AuthErrorFallback />}>
              <AuthErrorContent />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
