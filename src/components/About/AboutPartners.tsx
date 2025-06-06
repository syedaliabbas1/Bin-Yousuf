// src/components/About/AboutPartners.tsx
import React, { useEffect, useRef } from 'react';

const AboutPartners: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const animatedElements = entry.target.querySelectorAll('.animate-on-scroll');
            animatedElements.forEach((el, index) => {
              setTimeout(() => {
                el.classList.add('animate-fade-in-up');
              }, index * 200);
            });
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="py-20 lg:py-32 bg-white"
    >
      <div className="max-w-6xl mx-auto px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16 animate-on-scroll opacity-0 transform translate-y-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Our Trusted Partners
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Official sales partners with the most prestigious waterfront developers in Karachi
          </p>
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Emaar Partner Card */}
          <div className="animate-on-scroll opacity-0 transform translate-y-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100 hover:shadow-xl transition-all duration-300 h-full">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-white font-bold text-xl">E</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Emaar Oceanfront
                </h3>
                <p className="text-blue-600 font-semibold mb-4">
                  Official Sales Partner
                </p>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Partnered with Emaar to bring world-class oceanfront living to Karachi. 
                  Our collaboration ensures access to premium sea-facing apartments and luxury amenities.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600">Sea-facing luxury apartments</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600">World-class amenities</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600">Premium DHA Phase 8 location</span>
                  </div>
                </div>
                
                <a 
                  href="/projects?section=emaar" 
                  className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition-colors duration-300 mt-4"
                >
                  View Emaar Projects
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* HMR Partner Card */}
          <div className="animate-on-scroll opacity-0 transform translate-y-8">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 border border-emerald-100 hover:shadow-xl transition-all duration-300 h-full">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-white font-bold text-xl">H</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  HMR Waterfront
                </h3>
                <p className="text-emerald-600 font-semibold mb-4">
                  Official Sales Partner
                </p>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Exclusive dealer for HMR Waterfront's premium residential projects. 
                  Offering diverse waterfront living options with modern design and exceptional value.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-gray-600">Waterfront residences</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-gray-600">Modern architectural design</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-gray-600">Comprehensive lifestyle amenities</span>
                  </div>
                </div>
                
                <a 
                  href="/projects#project-6" 
                  className="inline-flex items-center gap-2 text-emerald-600 font-medium hover:text-emerald-700 transition-colors duration-300 mt-4"
                >
                  View HMR Projects
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Partnership Benefits */}
        <div className="mt-16 animate-on-scroll opacity-0 transform translate-y-8">
          <div className="bg-gray-50 rounded-2xl p-8 lg:p-12">
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
              Why Our Partnerships Matter
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Authenticity Guaranteed
                </h4>
                <p className="text-gray-600 text-sm">
                  Direct partnerships ensure genuine properties and transparent pricing
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Best Value
                </h4>
                <p className="text-gray-600 text-sm">
                  Official partnership rates and exclusive deals for our clients
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Complete Support
                </h4>
                <p className="text-gray-600 text-sm">
                  End-to-end service from selection to key handover
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutPartners;