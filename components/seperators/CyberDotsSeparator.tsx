interface CyberDotsSeparatorProps {
  className?: string;
}

export const CyberDotsSeparator: React.FC<CyberDotsSeparatorProps> = ({
  className = '',
}) => {
  return (
    <div className={`py-12 flex justify-center items-center ${className}`}>
      <div className="flex space-x-3">
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              i === 3
                ? 'bg-teal-400 shadow-lg shadow-teal-400/50'
                : 'bg-gray-600'
            } transition-all duration-500`}
            style={{
              animationDelay: `${i * 0.15}s`,
              transform: i === 3 ? 'scale(1.5)' : 'scale(1)',
            }}
          />
        ))}
      </div>
    </div>
  );
};
