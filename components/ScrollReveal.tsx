import React, { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // ms
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number; // px
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({ 
  children, 
  className = '', 
  delay = 0,
  direction = 'up',
  distance = 30
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Trigger once
        }
      },
      { 
        threshold: 0.1, 
        rootMargin: '0px 0px -50px 0px' // Trigger slightly before element is fully in view
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  const getInitialTransform = () => {
      switch(direction) {
          case 'up': return `translate3d(0, ${distance}px, 0)`;
          case 'down': return `translate3d(0, -${distance}px, 0)`;
          case 'left': return `translate3d(${distance}px, 0, 0)`;
          case 'right': return `translate3d(-${distance}px, 0, 0)`;
          default: return `translate3d(0, ${distance}px, 0)`;
      }
  };

  return (
    <div
      ref={ref}
      className={`${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translate3d(0,0,0) scale(1)' : `${getInitialTransform()} scale(0.95)`,
        filter: isVisible ? 'blur(0px)' : 'blur(10px)',
        transitionProperty: 'opacity, transform, filter',
        transitionDuration: '1000ms',
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)', // ease-out-expo
        transitionDelay: `${delay}ms`,
        willChange: 'opacity, transform, filter'
      }}
    >
      {children}
    </div>
  );
};