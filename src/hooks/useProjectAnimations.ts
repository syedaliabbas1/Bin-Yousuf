// src/hooks/useProjectAnimations.ts - Updated to work with AnimationManager
import { useEffect, useState } from 'react';
import type { Project } from '../scripts/types/index.js';
import { useAnimationManager } from './useAnimationManager';

interface AnimationState {
  scrollY: number;
  windowHeight: number;
  progress: number;
  isAnimating: boolean;
}

export const useProjectAnimations = (projects: Project[], enabled: boolean = true) => {
  const [animationState, setAnimationState] = useState<AnimationState>({
    scrollY: 0,
    windowHeight: typeof window !== 'undefined' ? window.innerHeight : 0,
    progress: 0,
    isAnimating: false
  });

  const [sidebarVisible, setSidebarVisible] = useState(false);
  
  // Use Animation Manager
  const { manager } = useAnimationManager({
    scrollHandler: {
      id: 'project-animations',
      handler: () => {
        if (!enabled || !manager?.isPageType('home')) return;
        
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        
        // Update animation state
        setAnimationState({
          scrollY,
          windowHeight,
          progress: calculateProgress(scrollY, windowHeight),
          isAnimating: isInAnimationRange(scrollY, windowHeight)
        });
        
        // Update sidebar visibility based on Animation Manager's logic
        const sidebar = document.getElementById('projectsSidebar');
        if (sidebar) {
          setSidebarVisible(sidebar.classList.contains('visible'));
        }
      }
    }
  });

  const calculateProgress = (scrollY: number, windowHeight: number): number => {
    const heroHeight = windowHeight * 1.1;
    const projectsSectionPadding = windowHeight * 0.12;
    const firstProjectPosition = heroHeight + projectsSectionPadding;
    const scrollStart = firstProjectPosition - windowHeight * 0.8;
    const scrollRange = windowHeight * 1.5;
    
    return Math.min(Math.max((scrollY - scrollStart) / scrollRange, 0), 1);
  };

  const isInAnimationRange = (scrollY: number, windowHeight: number): boolean => {
    const progress = calculateProgress(scrollY, windowHeight);
    return progress > 0 && progress < 1;
  };

  const scrollToProject = (projectIndex: number) => {
    const targetElement = document.getElementById(`project-${projectIndex + 1}`);
    if (targetElement && manager) {
      manager.scrollToElement(targetElement, 80);
    }
  };

  const highlightProject = (projectElement: HTMLElement) => {
    if (manager) {
      manager.highlightElement(projectElement);
    }
  };

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      setAnimationState(prev => ({
        ...prev,
        windowHeight: window.innerHeight
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    animationState,
    sidebarVisible,
    scrollToProject,
    highlightProject
  };
};