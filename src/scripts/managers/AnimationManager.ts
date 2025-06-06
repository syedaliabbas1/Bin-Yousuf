// src/scripts/managers/AnimationManager.ts
import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollToPlugin);

interface AnimationConfig {
  enabled: boolean;
  page: 'home' | 'projects' | 'project-detail' | 'other';
}

class AnimationManager {
  private static instance: AnimationManager;
  private activeAnimations: Map<string, gsap.core.Timeline | gsap.core.Tween> = new Map();
  private scrollHandlers: Map<string, Function> = new Map();
  private observers: Map<string, IntersectionObserver> = new Map();
  private config: AnimationConfig;
  private isInitialized: boolean = false;

  private constructor() {
    this.config = this.detectPageType();
  }

  public static getInstance(): AnimationManager {
    if (!AnimationManager.instance) {
      AnimationManager.instance = new AnimationManager();
    }
    return AnimationManager.instance;
  }

  private detectPageType(): AnimationConfig {
    const path = window.location.pathname;
    
    if (path === '/' || path === '') {
      return { enabled: true, page: 'home' };
    } else if (path === '/projects' || path === '/projects/') {
      return { enabled: true, page: 'projects' };
    } else if (path.startsWith('/projects/') && path !== '/projects/') {
      return { enabled: true, page: 'project-detail' };
    }
    
    return { enabled: true, page: 'other' };
  }

  public initialize(): void {
    if (this.isInitialized) {
      console.warn('AnimationManager already initialized');
      return;
    }

    this.cleanup(); // Clean any existing animations
    this.isInitialized = true;

    // Initialize page-specific animations
    switch (this.config.page) {
      case 'home':
        this.initializeHomeAnimations();
        break;
      case 'projects':
        this.initializeProjectsAnimations();
        break;
      case 'project-detail':
        this.initializeProjectDetailAnimations();
        break;
    }

    console.log(`✅ AnimationManager initialized for ${this.config.page} page`);
  }

  private initializeHomeAnimations(): void {
    // Home page specific animations
    this.registerScrollHandler('home-main', () => {
      this.handleHomeScroll();
    });

    // Initialize hero text animation
    this.initializeHeroTextAnimation();
    
    // Initialize project grid animation
    this.initializeProjectGridAnimation();
  }

  private initializeProjectsAnimations(): void {
    // Projects page specific animations
    // Delegate to React components, but manage conflicts
    this.preventConflictingScrollHandlers();
  }

  private initializeProjectDetailAnimations(): void {
    // Project detail page animations
    this.initializeParallaxEffect();
    this.initializeGalleryAnimations();
  }

  private handleHomeScroll(): void {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    
    // Centralized scroll handling for home page
    this.updateProjectAnimation(scrollY, windowHeight);
    this.updateSidebarVisibility(scrollY, windowHeight);
    this.updateActiveProjectHighlight(scrollY, windowHeight);
  }

  private updateActiveProjectHighlight(scrollY: number, windowHeight: number): void {
    // Find which project is currently in view
    const projectElements = document.querySelectorAll('[data-project]');
    const viewportCenter = scrollY + windowHeight / 2;

    projectElements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const elementTop = rect.top + scrollY;
      const elementBottom = elementTop + rect.height;

      if (viewportCenter >= elementTop && viewportCenter <= elementBottom) {
        const projectId = element.getAttribute('data-project');
        
        // Update sidebar active state
        const sidebarItems = document.querySelectorAll('[data-project-id]');
        sidebarItems.forEach(item => {
          if (item.getAttribute('data-project-id') === projectId) {
            item.classList.add('active');
          } else {
            item.classList.remove('active');
          }
        });
      }
    });
  }

  private updateProjectAnimation(scrollY: number, windowHeight: number): void {
    const animatedImage = document.getElementById('animatedProjectImage');
    if (!animatedImage) return;

    const heroHeight = windowHeight * 1.1;
    const projectsSectionPadding = windowHeight * 0.12;
    const firstProjectPosition = heroHeight + projectsSectionPadding;
    const scrollStart = firstProjectPosition - windowHeight * 0.8;
    const scrollRange = windowHeight * 1.5;
    
    const progress = Math.min(Math.max((scrollY - scrollStart) / scrollRange, 0), 1);
    
    // Get or create timeline
    let timeline = this.activeAnimations.get('home-project-animation') as gsap.core.Timeline;
    
    if (!timeline) {
      timeline = this.createProjectAnimationTimeline(animatedImage);
      this.activeAnimations.set('home-project-animation', timeline);
    }
    
    timeline.progress(progress);
    
    // Handle crossfade
    this.handleImageCrossfade(progress);
  }

  private createProjectAnimationTimeline(element: HTMLElement): gsap.core.Timeline {
    const timeline = gsap.timeline({ paused: true });
    
    gsap.set(element, {
      top: '100vh',
      left: '0',
      width: '100vw',
      height: '100vh',
      opacity: 0,
      borderRadius: '0px',
      zIndex: 999,
      position: 'fixed'
    });

    timeline
      .to(element, {
        top: '0vh',
        opacity: 1,
        duration: 0.4,
        ease: "power2.out"
      })
      .to(element, {
        top: '12vh',
        left: '38vw',
        width: '60vw',
        height: '60vh',
        borderRadius: '12px',
        duration: 0.55,
        ease: "power2.inOut"
      });
    
    return timeline;
  }

  private handleImageCrossfade(progress: number): void {
    const firstProjectInGrid = document.querySelector('#project-1') as HTMLElement;
    const animatedImage = document.getElementById('animatedProjectImage');
    
    if (!firstProjectInGrid || !animatedImage) return;

    if (progress < 0.95) {
      gsap.set(firstProjectInGrid, { opacity: 0 });
      gsap.set(animatedImage, { opacity: 1 });
    } else if (progress >= 0.95 && progress < 1) {
      const fadeProgress = (progress - 0.95) / 0.05;
      gsap.set(animatedImage, { opacity: 1 - fadeProgress });
      gsap.set(firstProjectInGrid, { opacity: fadeProgress });
    } else {
      gsap.set(firstProjectInGrid, { opacity: 1 });
      gsap.set(animatedImage, { 
        opacity: 0,
        pointerEvents: 'none',
        zIndex: -1
      });
    }
  }

  private updateSidebarVisibility(scrollY: number, windowHeight: number): void {
    const sidebar = document.getElementById('projectsSidebar');
    if (!sidebar) return;

    // Get first project image position
    const firstProjectImage = document.querySelector('#project-1') as HTMLElement;
    if (!firstProjectImage) return;

    // Calculate when first project image starts to appear
    const firstProjectRect = firstProjectImage.getBoundingClientRect();
    const firstProjectTop = firstProjectRect.top + scrollY;
    
    // Show sidebar when we're about to see the first project (with some buffer)
    const showBuffer = windowHeight * 0.5; // Show when first project is 50% of viewport away
    const shouldShowBasedOnProject = scrollY + windowHeight > firstProjectTop - showBuffer;

    // Check footer proximity
    const footer = document.querySelector('footer');
    let isNearFooter = false;
    
    if (footer) {
      const footerRect = footer.getBoundingClientRect();
      const footerTop = footerRect.top + scrollY;
      const footerBuffer = windowHeight * 0.4; // Hide when footer is 40% of viewport away
      isNearFooter = scrollY + windowHeight > footerTop - footerBuffer;
    }

    // Show sidebar only when first project is appearing AND not near footer
    const shouldShow = shouldShowBasedOnProject && !isNearFooter;

    if (shouldShow && !sidebar.classList.contains('visible')) {
      this.showSidebar(sidebar);
    } else if (!shouldShow && sidebar.classList.contains('visible')) {
      this.hideSidebar(sidebar);
    }
  }

  private showSidebar(sidebar: HTMLElement): void {
    sidebar.classList.add('visible');
    
    // Kill any existing animations on this element
    gsap.killTweensOf(sidebar);
    
    const animation = gsap.fromTo(sidebar,
      { 
        opacity: 0, 
        x: -100,
        scale: 0.95
      },
      { 
        opacity: 1, 
        x: 0,
        scale: 1,
        duration: 0.6, 
        ease: "power3.out",
        clearProps: "scale" // Clean up scale after animation
      }
    );
    
    this.activeAnimations.set('sidebar-show', animation);
  }

  private hideSidebar(sidebar: HTMLElement): void {
    // Kill any existing animations on this element
    gsap.killTweensOf(sidebar);
    
    const animation = gsap.to(sidebar, {
      opacity: 0,
      x: -100,
      scale: 0.95,
      duration: 0.4,
      ease: "power3.in",
      onComplete: () => {
        sidebar.classList.remove('visible');
      }
    });
    
    this.activeAnimations.set('sidebar-hide', animation);
  }

  private initializeHeroTextAnimation(): void {
    const animatedText = document.getElementById('animatedText');
    if (!animatedText) return;

    const words = ['PANORAMA', 'THE VIEWS', 'PARK EDGE', 'CORAL TOWERS', 'PEARL & REEF'];
    let currentIndex = 0;

    const changeWord = () => {
      animatedText.classList.add('blur-out');
      
      setTimeout(() => {
        currentIndex = (currentIndex + 1) % words.length;
        animatedText.textContent = words[currentIndex];
        animatedText.classList.remove('blur-out');
        animatedText.classList.add('blur-in');
        
        setTimeout(() => {
          animatedText.classList.remove('blur-in');
        }, 800);
      }, 400);
    };

    // Store interval for cleanup
    const interval = setInterval(changeWord, 3000);
    (window as any).__heroTextInterval = interval;
  }

  private initializeProjectGridAnimation(): void {
    // Observe project items for scroll-triggered animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          gsap.to(entry.target, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out"
          });
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.project-image-item').forEach(item => {
      gsap.set(item, { opacity: 0, y: 40 });
      observer.observe(item);
    });

    this.observers.set('project-grid', observer);
  }

  private initializeParallaxEffect(): void {
    const heroImage = document.querySelector('.hero-image') as HTMLElement;
    if (!heroImage) return;

    this.registerScrollHandler('parallax', () => {
      const scrollY = window.scrollY;
      const speed = 0.5;
      gsap.set(heroImage, {
        y: scrollY * speed
      });
    });
  }

  private initializeGalleryAnimations(): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('visible')) {
          entry.target.classList.add('visible');
          gsap.fromTo(entry.target,
            { opacity: 0, y: 40 },
            { 
              opacity: 1, 
              y: 0, 
              duration: 0.8, 
              ease: "power2.out",
              delay: parseFloat(entry.target.getAttribute('data-delay') || '0')
            }
          );
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.gallery-item').forEach((item, index) => {
      item.setAttribute('data-delay', (index * 0.1).toString());
      observer.observe(item);
    });

    this.observers.set('gallery', observer);
  }

  private preventConflictingScrollHandlers(): void {
    // Remove any main.ts scroll handlers on projects page
    const existingHandlers = (window as any).__scrollHandlers || [];
    existingHandlers.forEach((handler: EventListener) => {
      window.removeEventListener('scroll', handler);
    });
    (window as any).__scrollHandlers = [];
  }

  public registerScrollHandler(id: string, handler: Function): void {
    // Remove existing handler with same ID
    this.removeScrollHandler(id);
    
    // Create throttled version
    let ticking = false;
    const throttledHandler = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handler();
          ticking = false;
        });
        ticking = true;
      }
    };

    this.scrollHandlers.set(id, throttledHandler);
    window.addEventListener('scroll', throttledHandler as EventListener, { passive: true });
  }

  public removeScrollHandler(id: string): void {
    const handler = this.scrollHandlers.get(id);
    if (handler) {
      window.removeEventListener('scroll', handler as EventListener);
      this.scrollHandlers.delete(id);
    }
  }

  public scrollToElement(element: HTMLElement, offset: number = 80): void {
    gsap.to(window, {
      scrollTo: { y: element, offsetY: offset },
      duration: 1,
      ease: "power2.inOut"
    });
  }

  public highlightElement(element: HTMLElement): void {
    const timeline = gsap.timeline();
    
    timeline
      .to(element, {
        y: -15,
        boxShadow: "0 40px 100px rgba(0, 0, 0, 0.25)",
        duration: 0.6,
        ease: "power2.out"
      })
      .to(element.querySelector('img'), {
        scale: 1.02,
        duration: 0.6,
        ease: "power2.out"
      }, 0)
      .to(element, {
        y: 0,
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
        duration: 0.6,
        ease: "power2.out"
      }, "+=1.4")
      .to(element.querySelector('img'), {
        scale: 1,
        duration: 0.6,
        ease: "power2.out"
      }, "-=0.6");
  }

  public cleanup(): void {
    // Kill all active animations
    this.activeAnimations.forEach(animation => {
      if (animation && typeof animation.kill === 'function') {
        animation.kill();
      }
    });
    this.activeAnimations.clear();

    // Remove all scroll handlers
    this.scrollHandlers.forEach((handler, id) => {
      window.removeEventListener('scroll', handler as EventListener);
    });
    this.scrollHandlers.clear();

    // Disconnect all observers
    this.observers.forEach(observer => {
      observer.disconnect();
    });
    this.observers.clear();

    // Clear hero text interval
    if ((window as any).__heroTextInterval) {
      clearInterval((window as any).__heroTextInterval);
      (window as any).__heroTextInterval = null;
    }

    this.isInitialized = false;
    console.log('🧹 AnimationManager cleanup complete');
  }

  public getConfig(): AnimationConfig {
    return this.config;
  }

  public isPageType(page: AnimationConfig['page']): boolean {
    return this.config.page === page;
  }
  public getDebugInfo(): {
    scrollY: number;
    windowHeight: number;
    firstProjectTop: number | null;
    footerTop: number | null;
    sidebarVisible: boolean;
  } {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const firstProject = document.querySelector('#project-1') as HTMLElement;
    const footer = document.querySelector('footer');
    const sidebar = document.getElementById('projectsSidebar');
    
    return {
      scrollY,
      windowHeight,
      firstProjectTop: firstProject ? firstProject.getBoundingClientRect().top + scrollY : null,
      footerTop: footer ? footer.getBoundingClientRect().top + scrollY : null,
      sidebarVisible: sidebar ? sidebar.classList.contains('visible') : false
    };
  }
}

export default AnimationManager;