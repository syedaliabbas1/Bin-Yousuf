// src/components/About/AboutStats.tsx
import React, { useEffect, useRef, useState } from 'react';
import { getProjectCounts } from '../../data/projects.js';

interface StatItemProps {
  value: string;
  label: string;
  delay: number;
}

const StatItem: React.FC<StatItemProps> = ({ value, label, delay }) => {
  const [isVisible, setIsVisible] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setIsVisible(true);
            }, delay);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (itemRef.current) {
      observer.observe(itemRef.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  return (
    <div 
      ref={itemRef}
      className={`text-center transform transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
      }`}
    >
      <div className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
        {value}
      </div>
      <div className="text-base text-gray-600 font-medium">
        {label}
      </div>
    </div>
  );
};

const AboutStats: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [projectCounts, setProjectCounts] = useState({ emaar: 0, hmr: 0 });

  useEffect(() => {
    const counts = getProjectCounts();
    setProjectCounts(counts);
  }, []);

  const stats = [
    {
      value: '10+',
      label: 'Years Experience'
    },
    {
      value: '100+',
      label: 'Satisfied Clients'
    }
  ];

  return (
    <section 
      ref={sectionRef}
      className="py-20 bg-gradient-to-r from-gray-50 to-gray-100"
    >
      <div className="max-w-6xl mx-auto px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Our Impact in Numbers
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Trusted by hundreds of clients for their waterfront property investments
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <StatItem
              key={index}
              value={stat.value}
              label={stat.label}
              delay={index * 100}
            />
          ))}
        </div>

        {/* Achievement Cards */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Partnership Card */}
          <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Official Partnerships
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Offical Sales Partners for HMR Waterfront and Emaar Oceanfront, ensuring authenticity and best prices.
                </p>
              </div>
            </div>
          </div>

          {/* Excellence Card */}
          <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Market Leadership
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Leading Karachi's waterfront transformation with expertise in luxury property investments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutStats;