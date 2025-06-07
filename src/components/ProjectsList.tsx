// src/components/ProjectsList.tsx - Optimized version with performance fixes
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import type { Project } from '../scripts/types/index.js';

interface ProjectsListProps {
  projects: Project[];
  emaarProjects: Project[];
  hmrProjects: Project[];
}

const ProjectsList: React.FC<ProjectsListProps> = ({ projects, emaarProjects, hmrProjects }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isGSAPLoaded, setIsGSAPLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<HTMLElement[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);

  // Lazy load GSAP only when needed
  useEffect(() => {
    let gsapModule: any = null;
    
    const loadGSAP = async () => {
      if (typeof window !== 'undefined' && !window.gsap) {
        try {
          // Dynamic import for code splitting
          const [{ gsap }, { ScrollToPlugin }] = await Promise.all([
            import('gsap'),
            import('gsap/ScrollToPlugin')
          ]);
          
          gsap.registerPlugin(ScrollToPlugin);
          window.gsap = gsap;
          gsapModule = gsap;
          setIsGSAPLoaded(true);
        } catch (error) {
          console.warn('Failed to load GSAP, using native scroll', error);
        }
      } else if (window.gsap) {
        gsapModule = window.gsap;
        setIsGSAPLoaded(true);
      }
    };

    loadGSAP();

    return () => {
      // Cleanup GSAP instances
      if (gsapModule) {
        gsapModule.killTweensOf(window);
      }
    };
  }, []);

  // Debounced scroll handler
  const debouncedSetCurrentIndex = useCallback((index: number) => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      setCurrentIndex(index);
    }, 100);
  }, []);

  // Handle initial scroll with requestIdleCallback for better performance
  const handleInitialScroll = useCallback(() => {
    if (isInitializedRef.current) return;
    
    const performScroll = () => {
      const hash = window.location.hash;
      if (hash) {
        const targetElement = document.querySelector(hash);
        if (targetElement) {
          const projectIndex = parseInt((targetElement as HTMLElement).dataset.projectIndex || '0');
          if (!isNaN(projectIndex)) {
            setCurrentIndex(projectIndex);
            
            // Use native smooth scroll as fallback
            targetElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start',
              inline: 'nearest'
            });
          }
        }
      }
      isInitializedRef.current = true;
    };

    // Use requestIdleCallback for non-critical initial scroll
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(performScroll);
    } else {
      setTimeout(performScroll, 1);
    }
  }, []);

  // Optimized intersection observer
  const setupIntersectionObserver = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const options: IntersectionObserverInit = {
      root: null,
      rootMargin: '-20% 0px -20% 0px',
      threshold: [0.3, 0.7]
    };

    observerRef.current = new IntersectionObserver((entries) => {
      if (isScrolling) return;

      let maxIntersectionRatio = 0;
      let mostVisibleEntry: IntersectionObserverEntry | null = null;

      entries.forEach(entry => {
        if (entry.intersectionRatio > maxIntersectionRatio) {
          maxIntersectionRatio = entry.intersectionRatio;
          mostVisibleEntry = entry;
        }
      });

      if (mostVisibleEntry && mostVisibleEntry.isIntersecting) {
        const target = mostVisibleEntry.target as HTMLElement;
        const projectId = target.dataset.projectId;
        const projectIndex = parseInt(target.dataset.projectIndex || '0');
        
        if (!isNaN(projectIndex)) {
          const newHash = `#project-${projectId}`;
          if (window.location.hash !== newHash) {
            history.replaceState(null, '', newHash);
          }
          
          debouncedSetCurrentIndex(projectIndex);
        }
      }
    }, options);

    // Observe with lazy loading
    sectionsRef.current.forEach(section => {
      if (section && observerRef.current) {
        observerRef.current.observe(section);
      }
    });
  }, [isScrolling, debouncedSetCurrentIndex]);

  // Optimized scroll function with fallback
  const scrollToProject = useCallback((index: number) => {
    if (index < 0 || index >= sectionsRef.current.length || isScrolling) return;
    
    const targetSection = sectionsRef.current[index];
    if (!targetSection) return;

    setIsScrolling(true);
    
    if (isGSAPLoaded && window.gsap) {
      // Use GSAP for smooth scrolling
      window.gsap.to(window, {
        duration: 1.2,
        scrollTo: { 
          y: targetSection, 
          offsetY: 0
        },
        ease: "power2.inOut",
        onComplete: () => {
          setTimeout(() => {
            setIsScrolling(false);
          }, 200);
        }
      });
    } else {
      // Fallback to native smooth scroll
      targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => {
        setIsScrolling(false);
      }, 1400);
    }
  }, [isScrolling, isGSAPLoaded]);

  // Navigation handler
  const handleNavigationClick = useCallback((e: Event) => {
    const target = e.target as HTMLElement;
    const link = target.closest('a[href^="#"]') as HTMLAnchorElement;
    
    if (!link) return;
    
    e.preventDefault();
    const section = link.getAttribute('href')?.substring(1);
    
    if (section === 'emaar') {
      scrollToProject(0);
    } else if (section === 'hmr') {
      const hmrIndex = projects.findIndex(p => p.location === 'HMR');
      if (hmrIndex !== -1) {
        scrollToProject(hmrIndex);
      }
    }
  }, [projects, scrollToProject]);

  // Throttled keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (isScrolling) return;
    
    if (e.key === 'ArrowDown' && currentIndex < projects.length - 1) {
      e.preventDefault();
      scrollToProject(currentIndex + 1);
    } else if (e.key === 'ArrowUp' && currentIndex > 0) {
      e.preventDefault();
      scrollToProject(currentIndex - 1);
    }
  }, [currentIndex, projects.length, scrollToProject, isScrolling]);

  // Memoized project URL generator
  const getProjectUrl = useCallback((project: Project) => {
    return `/projects/${project.name.toLowerCase().replace(/[\s&]/g, '-').replace(/--+/g, '-')}`;
  }, []);

  // Initialize on mount
  useEffect(() => {
    handleInitialScroll();
    
    const initTimeout = setTimeout(() => {
      setupIntersectionObserver();
    }, 100);

    return () => {
      clearTimeout(initTimeout);
    };
  }, [handleInitialScroll, setupIntersectionObserver]);

  // Event listeners with passive option
  useEffect(() => {
    const clickHandler = (e: Event) => handleNavigationClick(e);
    const keyHandler = (e: KeyboardEvent) => handleKeyDown(e);

    document.addEventListener('click', clickHandler, { passive: false });
    document.addEventListener('keydown', keyHandler, { passive: false });

    return () => {
      document.removeEventListener('click', clickHandler);
      document.removeEventListener('keydown', keyHandler);
    };
  }, [handleNavigationClick, handleKeyDown]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Memoize image loading attributes
  const getImageLoadingAttr = useCallback((index: number) => {
    return index < 2 ? "eager" : "lazy";
  }, []);

  return (
    <div 
      ref={containerRef}
      className="w-full min-h-screen overflow-x-hidden relative"
      id="projectsListContainer"
    >
      {projects.map((project, index) => (
        <section
          key={project.id}
          ref={el => { 
            if (el) sectionsRef.current[index] = el; 
          }}
          className={`
            min-h-screen w-full flex items-center justify-center relative
            ${index % 2 === 1 ? 'bg-gray-50' : 'bg-white'}
            transition-colors duration-300
          `}
          id={`project-${project.id}`}
          data-project-id={project.id}
          data-project-name={project.name}
          data-project-location={project.location.toLowerCase()}
          data-project-index={index}
        >
          <div className="w-full max-w-[1400px] mx-auto px-10 py-[60px] 
            grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-[60px] items-center">
            
            {/* Project Header */}
            <div className="flex flex-col gap-5 text-center lg:text-left">
              <span className="text-sm text-gray-500 font-medium">
                {project.number}
              </span>
              <h1 className="text-clamp-title font-semibold leading-tight text-gray-800 m-0">
                {project.name}
              </h1>
              <p className="text-lg text-gray-600 font-normal">
                {project.location}
              </p>
            </div>
            
            {/* Project Image with optimization */}
            <a 
              href={getProjectUrl(project)}
              className="w-full h-[70vh] overflow-hidden rounded-2xl 
                shadow-[0_40px_80px_rgba(0,0,0,0.15)] relative block 
                no-underline text-inherit transition-all duration-500
                ease-out group hover:-translate-y-2 
                hover:shadow-[0_50px_100px_rgba(0,0,0,0.2)]
                focus:outline-none focus:ring-4 focus:ring-blue-500/20
                will-change-transform"
            >
              <img
                src={project.image.src}
                alt={project.name}
                className="w-full h-full object-cover transition-transform 
                  duration-700 ease-out group-hover:scale-105"
                loading={getImageLoadingAttr(index)}
                decoding="async"
                width={1200}
                height={800}
              />
              
              {/* Lazy loaded overlay */}
              <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
            </a>
            
            {/* Desktop Details Button */}
            <div className="col-span-full text-center mt-10 hidden lg:block">
              <a 
                href={getProjectUrl(project)}
                className="btn-secondary transition-all duration-300"
              >
                View Project Details
              </a>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="absolute bottom-8 right-8 text-sm text-gray-400 font-medium">
            {String(index + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
          </div>
        </section>
      ))}
    </div>
  );
};

export default ProjectsList;