interface NeonGlowSeparatorProps {
  className?: string;
}

export const NeonGlowSeparator: React.FC<NeonGlowSeparatorProps> = ({ 
  className = "" 
}) => {
  return (
    <div className={`relative py-16 ${className}`}>
      <div className="absolute inset-0 flex items-center">
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-teal-400/50 to-transparent"></div>
      </div>
      <div className="relative flex justify-center">
        <div className="bg-gray-900 px-8">
          <div className="w-4 h-4 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full shadow-lg shadow-teal-400/50 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};