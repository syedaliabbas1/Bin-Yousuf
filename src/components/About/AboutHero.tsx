// src/components/About/AboutHero.tsx
import React, { useEffect, useRef } from 'react';

const AboutHero: React.FC = () => {
  const heroRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    );

    if (titleRef.current) observer.observe(titleRef.current);
    if (subtitleRef.current) observer.observe(subtitleRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={heroRef}
      className="relative w-full min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-gray-50 to-white overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(76,76,76,0.2) 0%, transparent 50%), 
                             radial-gradient(circle at 75% 75%, rgba(76,76,76,0.2) 0%, transparent 50%)`
          }}
        />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-6xl mx-auto px-8 text-center">
        
        {/* Main Title */}
        <h1 
          ref={titleRef}
          className="text-clamp-hero font-bold leading-[0.9] tracking-tight text-gray-900 mb-8 opacity-0 transform translate-y-8"
          style={{ animationFillMode: 'forwards' }}
        >
          BinYousuf Group
        </h1>

        {/* Subtitle */}
        <p 
          ref={subtitleRef}
          className="text-clamp-description font-medium text-primary max-w-4xl mx-auto leading-[1.4] opacity-0 transform translate-y-8"
          style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}
        >
          Specialists in waterfront properties
        </p>

        {/* Decorative Element */}
        <div className="mt-12 flex justify-center">
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent opacity-60"></div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg 
          className="w-6 h-6 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M19 14l-7 7m0 0l-7-7m7 7V3" 
          />
        </svg>
      </div>
    </section>
  );
};

export default AboutHero;