
// components/PurchaseButton.tsx - Updated for Competition Stories
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { CreditCard, Loader2, DollarSign, BookOpen } from 'lucide-react';
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from '@/components/ui/toast';

interface PurchaseButtonProps {
  productType: 'story_pack' | 'story_purchase';
  storyId?: string;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'gradient';
  showIcon?: boolean;
}

export default function PurchaseButton({
  productType,
  storyId,
  className = '',
  children,
  disabled = false,
  size = 'md',
  variant = 'default',
  showIcon = true,
}: PurchaseButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const variantClasses = {
    default: 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400',
    gradient:
      'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-green-400 disabled:to-emerald-400',
  };

  const handlePurchase = async () => {
    if (!session) {
      router.push('/login/child');
      return;
    }

    if (disabled) return;

    setLoading(true);

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
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      setToastMessage('Purchase failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const defaultText = {
    story_pack: 'Buy Story Pack - $15',
    story_publication: 'Publish Story - FREE',
    story_purchase: 'Buy Physical Copy - $10',
  };

  const defaultIcon = {
    story_pack: CreditCard,
    story_publication: variant === 'gradient' ? DollarSign : BookOpen,
    story_purchase: CreditCard,
  };

  const Icon = defaultIcon[productType];

  return (
    <ToastProvider>
      <button
        onClick={handlePurchase}
        disabled={disabled || loading}
        className={`
        flex items-center justify-center gap-2  transition-all
        disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={16} />
            Processing...
          </>
        ) : (
          <>
            {showIcon && <Icon size={16} />}
            {children || defaultText[productType]}
          </>
        )}
      </button>
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
