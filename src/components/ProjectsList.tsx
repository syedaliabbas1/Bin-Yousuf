// src/components/ProjectsList.tsx - Updated to use AnimationManager
import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { Project } from '../scripts/types/index.js';
import { useAnimationManager } from '../hooks/useAnimationManager';

interface ProjectsListProps {
  projects: Project[];
  emaarProjects: Project[];
  hmrProjects: Project[];
}

const ProjectsList: React.FC<ProjectsListProps> = ({ projects, emaarProjects, hmrProjects }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<HTMLElement[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);
  
  // Use Animation Manager
  const { scrollToElement } = useAnimationManager({
    scrollHandler: {
      id: 'projects-list-scroll',
      handler: () => {
        // Custom scroll handling for projects list can be added here if needed
      }
    }
  });

  // Debounced scroll handler to prevent excessive state updates
  const debouncedSetCurrentIndex = useCallback((index: number) => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      setCurrentIndex(index);
    }, 100);
  }, []);

  // Handle initial scroll based on URL hash
  const handleInitialScroll = useCallback(() => {
    if (isInitializedRef.current) return;
    
    const hash = window.location.hash;
    if (hash) {
      requestAnimationFrame(() => {
        const targetElement = document.querySelector(hash);
        if (targetElement) {
          const projectIndex = parseInt((targetElement as HTMLElement).dataset.projectIndex || '0');
          if (!isNaN(projectIndex)) {
            setCurrentIndex(projectIndex);
            
            // Use Animation Manager for scrolling
            scrollToElement(targetElement as HTMLElement, 0);
          }
        }
      });
    }
    isInitializedRef.current = true;
  }, [scrollToElement]);

  // Setup intersection observer with optimized settings
  const setupIntersectionObserver = useCallback(() => {
    // Clean up existing observer to prevent duplicates
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

    sectionsRef.current.forEach(section => {
      if (section && observerRef.current) {
        observerRef.current.observe(section);
      }
    });
  }, [isScrolling, debouncedSetCurrentIndex]);

  // Optimized scroll to project function
  const scrollToProject = useCallback((index: number) => {
    if (index < 0 || index >= sectionsRef.current.length || isScrolling) return;
    
    const targetSection = sectionsRef.current[index];
    if (!targetSection) return;

    setIsScrolling(true);
    
    // Use Animation Manager for smooth scrolling
    scrollToElement(targetSection, 0);
    
    // Reset scrolling state after animation
    setTimeout(() => {
      setIsScrolling(false);
    }, 1400);
  }, [isScrolling, scrollToElement]);

  // Handle navigation clicks
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

  // Keyboard navigation with throttling
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

  // Generate project URL
  const getProjectUrl = useCallback((project: Project) => {
    return `/projects/${project.name.toLowerCase().replace(/[\s&]/g, '-').replace(/--+/g, '-')}`;
  }, []);

  // Initialize everything
  useEffect(() => {
    handleInitialScroll();
    
    const initTimeout = setTimeout(() => {
      setupIntersectionObserver();
    }, 100);

    return () => {
      clearTimeout(initTimeout);
    };
  }, [handleInitialScroll, setupIntersectionObserver]);

  // Add event listeners
  useEffect(() => {
    document.addEventListener('click', handleNavigationClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('click', handleNavigationClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleNavigationClick, handleKeyDown]);

  // Cleanup on unmount
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
            
            {/* Project Image */}
            <a 
              href={getProjectUrl(project)}
              className="w-full h-[70vh] overflow-hidden rounded-2xl 
                shadow-[0_40px_80px_rgba(0,0,0,0.15)] relative block 
                no-underline text-inherit transition-all duration-500
                ease-out group hover:-translate-y-2 
                hover:shadow-[0_50px_100px_rgba(0,0,0,0.2)]
                focus:outline-none focus:ring-4 focus:ring-blue-500/20"
            >
              <img
                src={project.image.src}
                alt={project.name}
                className="w-full h-full object-cover transition-transform 
                  duration-700 ease-out group-hover:scale-105"
                loading={index < 2 ? "eager" : "lazy"}
              />
              
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