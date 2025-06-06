// src/hooks/useAnimationManager.ts
import { useEffect, useRef } from 'react';
import AnimationManager from '../scripts/managers/AnimationManager';

interface UseAnimationManagerOptions {
  scrollHandler?: {
    id: string;
    handler: () => void;
  };
  cleanupOnUnmount?: boolean;
}

export const useAnimationManager = (options?: UseAnimationManagerOptions) => {
  const managerRef = useRef<AnimationManager | null>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    // Get or create animation manager instance
    managerRef.current = AnimationManager.getInstance();
    
    // Initialize if not already done
    if (!isInitializedRef.current) {
      managerRef.current.initialize();
      isInitializedRef.current = true;
    }

    // Register scroll handler if provided
    if (options?.scrollHandler) {
      managerRef.current.registerScrollHandler(
        options.scrollHandler.id,
        options.scrollHandler.handler
      );
    }

    // Cleanup
    return () => {
      if (options?.scrollHandler && managerRef.current) {
        managerRef.current.removeScrollHandler(options.scrollHandler.id);
      }
      
      if (options?.cleanupOnUnmount && managerRef.current) {
        managerRef.current.cleanup();
        isInitializedRef.current = false;
      }
    };
  }, []);

  return {
    manager: managerRef.current,
    scrollToElement: (element: HTMLElement, offset?: number) => {
      managerRef.current?.scrollToElement(element, offset);
    },
    highlightElement: (element: HTMLElement) => {
      managerRef.current?.highlightElement(element);
    }
  };
};