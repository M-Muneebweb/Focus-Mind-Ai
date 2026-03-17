import React, { useRef } from 'react';

interface SpotlightCardProps {
    children: React.ReactNode;
    className?: string;
    spotlightColor?: string;
    onClick?: () => void;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({ 
    children, 
    className = "", 
    spotlightColor = "rgba(139, 92, 246, 0.15)",
    onClick 
}) => {
  const divRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current || !overlayRef.current) return;
    
    const rect = divRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    overlayRef.current.style.opacity = '1';
    overlayRef.current.style.background = `radial-gradient(600px circle at ${x}px ${y}px, ${spotlightColor}, transparent 40%)`;
  };

  const handleMouseLeave = () => {
      if (overlayRef.current) {
          overlayRef.current.style.opacity = '0';
      }
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`relative overflow-hidden ${className}`}
    >
      <div
        ref={overlayRef}
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 z-10"
        style={{ willChange: 'opacity, background' }}
      />
      <div className="relative z-20 h-full">
         {children}
      </div>
    </div>
  );
};