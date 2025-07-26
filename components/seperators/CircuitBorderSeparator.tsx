interface CircuitBorderSeparatorProps {
  className?: string;
  icon?: React.ReactNode;
}

export const CircuitBorderSeparator: React.FC<CircuitBorderSeparatorProps> = ({
  className = '',
  icon,
}) => {
  const defaultIcon = (
    <svg
      className="w-5 h-5 text-teal-400"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  return (
    <div className={`border-t border-gray-700/50 py-8 ${className}`}>
      <div className="flex justify-center -mt-4">
        <div className="bg-gray-900 px-6 py-2 border border-teal-400/30 rounded-full backdrop-blur-sm">
          {icon || defaultIcon}
        </div>
      </div>
    </div>
  );
};
