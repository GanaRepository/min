interface PixelTextSeparatorProps {
  className?: string;
  text?: string;
}

export const PixelTextSeparator: React.FC<PixelTextSeparatorProps> = ({
  className = '',
  text = '◆ ◆ ◆',
}) => {
  return (
    <div className={`relative py-8 ${className}`}>
      <div className="absolute inset-0 flex items-center">
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
      </div>
      <div className="relative flex justify-center">
        <div className="bg-gray-900 px-6 py-2 border border-teal-400/20 rounded-lg backdrop-blur-sm">
          <span className="text-teal-400 text-sm font-mono tracking-wider">
            {text}
          </span>
        </div>
      </div>
    </div>
  );
};
