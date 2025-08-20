// components/ui/ToastNotification.tsx
export interface ToastNotificationProps {
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
}

export default function ToastNotification({
  type,
  message,
  onClose,
}: ToastNotificationProps) {
  return (
    <div
      className={`fixed bottom-4 right-4 bg-[#112240] text-white rounded-lg border ${type === 'success' ? 'border-[#3ECF8E]' : 'border-red-500'} shadow-lg p-4 max-w-xs z-50 animate-slideIn`}
    >
      <div className="flex items-start">
        <div
          className={`flex-shrink-0 ${type === 'success' ? 'text-[#3ECF8E]' : 'text-red-500'}`}
        >
          {type === 'success' ? (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          )}
        </div>
        <div className="ml-3">
          <p
            className={`text-sm  ${type === 'success' ? 'text-[#3ECF8E]' : 'text-red-500'}`}
          >
            {type === 'success' ? 'Success' : 'Error'}
          </p>
          <p className="mt-1 text-sm text-gray-300">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-auto -mx-1.5 -my-1.5 bg-[#112240] text-gray-400 hover:text-gray-200 rounded-lg p-1.5"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </div>
    </div>
  );
}
