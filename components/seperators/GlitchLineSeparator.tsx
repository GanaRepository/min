interface GlitchLineSeparatorProps {
  className?: string;
}

export const GlitchLineSeparator: React.FC<GlitchLineSeparatorProps> = ({ 
  className = "" 
}) => {
  return (
    <div className={`py-10 ${className}`}>
      <div className="relative">
        <div className="h-[1px] bg-gradient-to-r from-transparent via-teal-400 to-transparent"></div>
        <div className="absolute top-0 left-1/4 w-16 h-[1px] bg-emerald-400 animate-pulse"></div>
        <div className="absolute top-0 right-1/3 w-12 h-[1px] bg-teal-300 animate-pulse delay-75"></div>
      </div>
    </div>
  );
};