import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  type: 'success' | 'error' | 'warning';
  duration?: number;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  isVisible,
  type,
  duration = 3000,
  onClose,
}) => {
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isVisible && duration) {
      timer = setTimeout(() => {
        onClose();
      }, duration);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default:
        return null;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50';
      case 'error':
        return 'bg-red-50';
      case 'warning':
        return 'bg-amber-50';
      default:
        return 'bg-gray-50';
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-green-200';
      case 'error':
        return 'border-red-200';
      case 'warning':
        return 'border-amber-200';
      default:
        return 'border-gray-200';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
      <div
        className={`${getBgColor()} ${getBorderColor()} flex items-center p-4 rounded-lg border shadow-lg max-w-md`}
      >
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="ml-3 mr-8 text-sm  text-gray-800">
          {message}
        </div>
        <button
          onClick={onClose}
          className="ml-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 p-1.5 inline-flex h-8 w-8 focus:outline-none focus:ring-gray-300"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
