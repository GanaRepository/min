interface HexagonSeparatorProps {
  className?: string;
}

export const HexagonSeparator: React.FC<HexagonSeparatorProps> = ({
  className = '',
}) => {
  return (
    <div className={`py-14 flex justify-center ${className}`}>
      <div className="relative flex items-center">
        <div className="w-20 h-[1px] bg-gradient-to-r from-transparent to-teal-400/60"></div>
        <div className="mx-6 relative">
          <div className="w-6 h-6 bg-gray-800 border-2 border-teal-400 rotate-45 shadow-lg shadow-teal-400/30"></div>
          <div className="absolute inset-0 w-6 h-6 bg-teal-400/20 rotate-45 animate-ping"></div>
        </div>
        <div className="w-20 h-[1px] bg-gradient-to-l from-transparent to-teal-400/60"></div>
      </div>
    </div>
  );
};
