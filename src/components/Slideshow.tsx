// src/components/Slideshow.tsx - Optimized version with performance improvements
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

interface SlideshowProps {
  images: Array<{
    src: string;
    alt: string;
  }>;
  autoPlayInterval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  height?: string;
}

const ProjectsSlideshow: React.FC<SlideshowProps> = ({
  images,
  autoPlayInterval = 2000,
  showDots = true,
  showArrows = false,
  height = "60vh"
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]));
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const slideshowRef = useRef<HTMLDivElement>(null);
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());

  // Preload next image for smoother transitions
  const preloadImage = useCallback((index: number) => {
    if (!images[index] || loadedImages.has(index)) return;
    
    const img = new Image();
    img.src = images[index].src;
    img.onload = () => {
      setLoadedImages(prev => new Set(prev).add(index));
      imageCache.current.set(images[index].src, img);
    };
  }, [images, loadedImages]);

  // Memoized next/prev functions
  const nextSlide = useCallback(() => {
    const nextIndex = (currentIndex + 1) % images.length;
    setCurrentIndex(nextIndex);
    
    // Preload the next image
    const preloadIndex = (nextIndex + 1) % images.length;
    preloadImage(preloadIndex);
  }, [currentIndex, images.length, preloadImage]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  }, [images.length]);

  const goToSlide = useCallback((index: number) => {
    if (index === currentIndex) return;
    setCurrentIndex(index);
    preloadImage((index + 1) % images.length);
  }, [currentIndex, images.length, preloadImage]);

  // Optimized auto-play with RAF
  useEffect(() => {
    if (!isPlaying || images.length <= 1) return;

    const animate = () => {
      intervalRef.current = setTimeout(() => {
        requestAnimationFrame(() => {
          nextSlide();
        });
      }, autoPlayInterval);
    };

    animate();

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, autoPlayInterval, images.length, nextSlide]);

  // Preload initial images
  useEffect(() => {
    preloadImage(0);
    if (images.length > 1) {
      preloadImage(1);
    }
  }, [images, preloadImage]);

  // Pause on hover handlers
  const handleMouseEnter = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPlaying(true);
  }, []);

  // Manual navigation with temporary pause
  const handleManualNavigation = useCallback((action: () => void) => {
    setIsPlaying(false);
    action();
    
    setTimeout(() => {
      setIsPlaying(true);
    }, autoPlayInterval);
  }, [autoPlayInterval]);

  // Memoize controls visibility
  const showControls = useMemo(() => images.length > 1, [images.length]);

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div 
      className="relative w-full overflow-hidden bg-gray-50 group" 
      style={{ height }}
      role="region"
      aria-label="Image slideshow"
      aria-live="polite"
    >
      <div 
        ref={slideshowRef}
        className="relative w-full h-full"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Images container with will-change for optimization */}
        <div className="relative w-full h-full will-change-transform">
          {images.map((image, index) => (
            <div
              key={index}
              className={`absolute top-0 left-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                index === currentIndex 
                  ? 'opacity-100 z-10' 
                  : 'opacity-0 z-0'
              }`}
              aria-hidden={index !== currentIndex}
            >
              {/* Only render images that are loaded or current */}
              {(loadedImages.has(index) || index === currentIndex) && (
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                />
              )}
              
              {/* Subtle overlay */}
              <div className="absolute inset-0 bg-black/5 pointer-events-none"></div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows - Only render if needed */}
        {showArrows && showControls && (
          <>
            <button
              onClick={() => handleManualNavigation(prevSlide)}
              className="absolute left-6 top-1/2 -translate-y-1/2 z-20 
                bg-white/20 hover:bg-white/30 backdrop-blur-sm 
                rounded-full p-3 transition-all duration-300 
                opacity-0 group-hover:opacity-100 hover:scale-110
                focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Previous image"
              type="button"
            >
              <svg 
                className="w-5 h-5 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={() => handleManualNavigation(nextSlide)}
              className="absolute right-6 top-1/2 -translate-y-1/2 z-20 
                bg-white/20 hover:bg-white/30 backdrop-blur-sm 
                rounded-full p-3 transition-all duration-300 
                opacity-0 group-hover:opacity-100 hover:scale-110
                focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Next image"
              type="button"
            >
              <svg 
                className="w-5 h-5 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Dot indicators - Optimized rendering */}
        {showDots && showControls && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
            <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm rounded-full px-4 py-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleManualNavigation(() => goToSlide(index))}
                  className={`transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-white/50 ${
                    index === currentIndex
                      ? 'w-6 h-2 bg-white'
                      : 'w-2 h-2 bg-white/50 hover:bg-white/70'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={index === currentIndex ? 'true' : 'false'}
                  type="button"
                />
              ))}
            </div>
          </div>
        )}

        {/* Image counter */}
        {showControls && (
          <div className="absolute top-6 left-6 z-20 
            bg-black/20 backdrop-blur-sm rounded-full px-3 py-1 
            text-white text-sm font-medium opacity-70"
            aria-live="polite"
            aria-atomic="true"
          >
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(ProjectsSlideshow);