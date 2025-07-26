interface DiamondSeparatorProps {
  className?: string;
}

export const DiamondSeparator: React.FC<DiamondSeparatorProps> = ({
  className = '',
}) => {
  return (
    <div className={`py-10 flex justify-center ${className}`}>
      <div className="relative flex items-center">
        <div className="w-16 h-px bg-gray-300"></div>
        <div className="mx-4">
          <div className="w-4 h-4 bg-gray-500 rotate-45 border border-gray-300"></div>
        </div>
        <div className="w-16 h-px bg-gray-300"></div>
      </div>
    </div>
  );
};
