// src/components/About/AboutContent.tsx
import React, { useEffect, useRef } from 'react';

const AboutContent: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (contentRef.current) {
      const elements = contentRef.current.querySelectorAll('.animate-on-scroll');
      elements.forEach((el, index) => {
        (el as HTMLElement).style.animationDelay = `${index * 0.1}s`;
        observer.observe(el);
      });
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="py-20 lg:py-32 bg-white"
    >
      <div className="max-w-6xl mx-auto px-8">
        <div 
          ref={contentRef}
          className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
        >
          
          {/* Text Content */}
          <div className="space-y-8">
            
            {/* First Paragraph */}
            <div className="animate-on-scroll opacity-0 transform translate-y-8">
              <p className="text-lg leading-relaxed text-gray-700 font-normal">
                At BinYousuf Group, we don't just sell properties—we deliver dreams wrapped in ocean views. 
                As the <span className="font-semibold text-gray-900">official sales partners</span> of 
                HMR Waterfront and Emaar Oceanfront, we open doors to a lifestyle that blends prestige, serenity, 
                and investment potential like never before.
              </p>
            </div>

            {/* Second Paragraph */}
            <div className="animate-on-scroll opacity-0 transform translate-y-8">
              <p className="text-lg leading-relaxed text-gray-700 font-normal">
                Karachi's waterfront is transforming, and we're leading the movement. Our expertise, 
                unparalleled service, and passion for luxury living ensure every transaction is seamless, 
                strategic, and rewarding.
              </p>
            </div>

            {/* Third Paragraph */}
            <div className="animate-on-scroll opacity-0 transform translate-y-8">
              <p className="text-lg leading-relaxed text-gray-700 font-normal">
                Step into a world where the sea meets sophistication. 
                <span className="font-semibold text-gray-900"> Your journey starts with BinYousuf Group.</span>
              </p>
            </div>

            {/* CTA Button */}
            <div className="animate-on-scroll opacity-0 transform translate-y-8 pt-4">
              <a 
                href="/projects" 
                className="btn-primary"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6m-6 4h6" />
                </svg>
                Explore Our Projects
              </a>
            </div>
          </div>

          {/* Visual Element */}
          <div className="animate-on-scroll opacity-0 transform translate-y-8">
            <div className="relative">
              
              {/* Main Card */}
              <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl p-8 text-white relative overflow-hidden shadow-2xl">
                
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div 
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 0%, transparent 50%), 
                                       radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)`
                    }}
                  />
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-6 text-white">
                    Our Expertise
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-300 leading-relaxed">
                        Official sales partners for premium waterfront developments
                      </p>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-300 leading-relaxed">
                        Specialized in luxury oceanfront properties
                      </p>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-300 leading-relaxed">
                        Strategic investment guidance and market insights
                      </p>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-300 leading-relaxed">
                        End-to-end transaction management
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Element */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full opacity-20 blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full opacity-20 blur-xl"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutContent;