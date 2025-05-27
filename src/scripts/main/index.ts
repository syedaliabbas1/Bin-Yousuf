// src/scripts/main/index.ts
import type { Project, AnimationElements, AnimationState } from '../types/index.js';
import { GSAPLoader } from '../utils/gsap-loader.js';

// Import projects data - this will be loaded dynamically
let projects: Project[] = [];

// Function to load projects data
async function loadProjects(): Promise<Project[]> {
  try {
    const { projects: importedProjects } = await import('../../data/projects.js');
    return importedProjects;
  } catch (error) {
    console.warn('Could not import projects data:', error);
    // Fallback with properly typed default data
    return [
      {
        id: 1,
        number: '01',
        name: 'Default Project',
        location: 'Default Location',
        image: { src: '', alt: 'Default Image' }
      }
    ];
  }
}

class ProjectAnimationController {
  private elements: AnimationElements;
  private animationState: AnimationState;
  private mainTimeline: any;
  private ticking: boolean = false;
  private projects: Project[];
  private gsapLoader: GSAPLoader;

  constructor(projects: Project[]) {
    this.projects = projects;
    this.gsapLoader = GSAPLoader.getInstance();
    this.elements = this.initializeElements();
    this.animationState = {
      scrollY: 0,
      windowHeight: window.innerHeight,
      progress: 0,
      isAnimating: false
    };
  }

  private initializeElements(): AnimationElements {
    return {
      projectsSidebar: document.getElementById('projectsSidebar'),
      projectItems: document.querySelectorAll<HTMLElement>('.project-item'),
      imageItems: document.querySelectorAll<HTMLElement>('.project-image-item'),
      animatedProjectImage: document.getElementById('animatedProjectImage'),
      mainAnimatedImage: document.getElementById('mainAnimatedImage') as HTMLImageElement,
      firstProjectInGrid: document.querySelector<HTMLElement>('#project-1')
    };
  }

  private waitForGSAP(callback: () => void): void {
    this.gsapLoader.waitForGSAP(callback);
  }

  private initializeGSAPAnimations(): void {
    const gsap = window.gsap;
    if (!gsap || !this.elements.animatedProjectImage) return;

    // Create main timeline
    this.mainTimeline = gsap.timeline({ paused: true });

    // Set initial state
    gsap.set(this.elements.animatedProjectImage, {
      top: '100vh',
      left: '0',
      width: '100vw',
      height: '100vh',
      opacity: 0,
      borderRadius: '0px'
    });

    // Create animation sequence
    this.mainTimeline
      .to(this.elements.animatedProjectImage, {
        top: '0vh',
        opacity: 1,
        duration: 0.5,
        ease: "power2.out"
      })
      .to(this.elements.animatedProjectImage, {
        top: '12vh',
        left: '38vw',
        width: '60vw',
        height: '60vh',
        borderRadius: '12px',
        opacity: 0,
        duration: 0.5,
        ease: "power2.out"
      });
  }

  private scrollSidebarToActiveProject(activeItem: HTMLElement): void {
    if (!this.elements.projectsSidebar || !activeItem) return;
    
    const gsap = window.gsap;
    const sidebarRect = this.elements.projectsSidebar.getBoundingClientRect();
    const activeItemRect = activeItem.getBoundingClientRect();
    
    const activeItemTop = activeItemRect.top - sidebarRect.top;
    const activeItemBottom = activeItemRect.bottom - sidebarRect.top;
    
    const sidebarHeight = this.elements.projectsSidebar.clientHeight;
    const sidebarScrollTop = this.elements.projectsSidebar.scrollTop;
    
    // Smooth scroll with GSAP if available, fallback to native
    if (gsap) {
      if (activeItemTop < 0) {
        gsap.to(this.elements.projectsSidebar, {
          scrollTop: sidebarScrollTop + activeItemTop - 20,
          duration: 0.5,
          ease: "power2.out"
        });
      } else if (activeItemBottom > sidebarHeight) {
        gsap.to(this.elements.projectsSidebar, {
          scrollTop: sidebarScrollTop + (activeItemBottom - sidebarHeight) + 20,
          duration: 0.5,
          ease: "power2.out"
        });
      }
    } else {
      // Fallback to native scrolling
      if (activeItemTop < 0) {
        this.elements.projectsSidebar.scrollTo({
          top: sidebarScrollTop + activeItemTop - 20,
          behavior: 'smooth'
        });
      } else if (activeItemBottom > sidebarHeight) {
        this.elements.projectsSidebar.scrollTo({
          top: sidebarScrollTop + (activeItemBottom - sidebarHeight) + 20,
          behavior: 'smooth'
        });
      }
    }
  }

  private setupProjectInteractions(): void {
    this.elements.projectItems.forEach((item: HTMLElement) => {
      item.addEventListener('click', () => {
        // Remove active class from all items
        this.elements.projectItems.forEach((pi: HTMLElement) => 
          pi.classList.remove('active')
        );
        item.classList.add('active');
        
        const targetId = item.dataset.scrollTarget || null;
        if (targetId) {
          const targetImage = document.getElementById(targetId);
          
          if (targetImage) {
            const navHeight = 80;
            const elementPosition = targetImage.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - navHeight;
            
            const gsap = window.gsap;
            if (gsap) {
              // Smooth scroll with GSAP
              gsap.to(window, {
                scrollTo: offsetPosition,
                duration: 0.5,
                ease: "power2.out"
              });
              
              // Highlight animation
              gsap.timeline()
                .to(targetImage, {
                  y: -15,
                  boxShadow: "0 40px 100px rgba(0, 0, 0, 0.25)",
                  duration: 0.6,
                  ease: "power2.out"
                })
                .to(targetImage.querySelector('.project-image'), {
                  scale: 1.02,
                  duration: 0.6,
                  ease: "power2.out"
                }, 0)
                .to(targetImage, {
                  y: 0,
                  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
                  duration: 0.6,
                  ease: "power2.out",
                  delay: 1.4
                })
                .to(targetImage.querySelector('.project-image'), {
                  scale: 1,
                  duration: 0.6,
                  ease: "power2.out"
                }, "-=0.6");
            } else {
              // Fallback to native scroll
              window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
              });
              
              // Simple highlight effect
              targetImage.style.transform = 'translateY(-15px)';
              targetImage.style.boxShadow = '0 40px 100px rgba(0, 0, 0, 0.25)';
              
              setTimeout(() => {
                targetImage.style.transform = 'translateY(0)';
                targetImage.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.15)';
              }, 2000);
            }
          }
        }
      });
    });
  }

  private handleScroll(): void {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    
    // Update animation state
    this.animationState = {
      ...this.animationState,
      scrollY,
      windowHeight
    };
    
    // Calculate positions - matching your layout exactly
    const heroHeight = windowHeight * 1.1; // 110vh from scrollSpacer
    const projectsSectionPadding = windowHeight * 0.12; // 12vh padding-top
    const firstProjectPosition = heroHeight + projectsSectionPadding;
    const scrollStart = firstProjectPosition - windowHeight;
    const scrollRange = windowHeight * 2;
    
    const gsap = window.gsap;
    
    // Sidebar visibility
    if (scrollY > windowHeight * 0.8) {
      if (this.elements.projectsSidebar && !this.elements.projectsSidebar.classList.contains('visible')) {
        if (gsap) {
          gsap.to(this.elements.projectsSidebar, {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: "power2.out"
          });
        } else {
          this.elements.projectsSidebar.style.opacity = '1';
          this.elements.projectsSidebar.style.transform = 'translateX(0)';
        }
        this.elements.projectsSidebar.classList.add('visible');
      }
    } else {
      if (this.elements.projectsSidebar && this.elements.projectsSidebar.classList.contains('visible')) {
        if (gsap) {
          gsap.to(this.elements.projectsSidebar, {
            opacity: 0,
            x: -100,
            duration: 0.8,
            ease: "power2.out"
          });
        } else {
          this.elements.projectsSidebar.style.opacity = '0';
          this.elements.projectsSidebar.style.transform = 'translateX(-100px)';
        }
        this.elements.projectsSidebar.classList.remove('visible');
      }
    }
    
    if (!this.elements.animatedProjectImage) return;
    
    // Calculate progress
    const progress = Math.min((scrollY - scrollStart) / scrollRange, 1);
    this.animationState.progress = Math.max(0, progress);
    
    // Update timeline progress with GSAP or fallback
    if (gsap && this.mainTimeline) {
      this.mainTimeline.progress(this.animationState.progress);
    } else {
      // Fallback animation without GSAP
      this.fallbackAnimation(this.animationState.progress);
    }
    
    // Handle first project grid visibility
    if (this.elements.firstProjectInGrid) {
      if (progress < 0.5) {
        const moveProgress = progress / 0.5;
        const opacity = 1 - moveProgress * 0.5;
        if (gsap) {
          gsap.set(this.elements.firstProjectInGrid, { opacity });
        } else {
          this.elements.firstProjectInGrid.style.opacity = opacity.toString();
        }
      } else {
        const shrinkProgress = (progress - 0.5) / 0.5;
        const opacity = 0.5 + shrinkProgress * 0.5;
        if (gsap) {
          gsap.set(this.elements.firstProjectInGrid, { opacity });
        } else {
          this.elements.firstProjectInGrid.style.opacity = opacity.toString();
        }
      }
      
      if (progress >= 1) {
        if (gsap) {
          gsap.set(this.elements.firstProjectInGrid, { opacity: 1 });
        } else {
          this.elements.firstProjectInGrid.style.opacity = '1';
        }
      }
    }
  }

  private fallbackAnimation(progress: number): void {
    if (!this.elements.animatedProjectImage) return;
    
    if (progress < 0.5) {
      // Phase 1: Move up and fade in
      const moveProgress = progress / 0.5;
      const top = 100 - (moveProgress * 100);
      
      this.elements.animatedProjectImage.style.top = `${top}vh`;
      this.elements.animatedProjectImage.style.left = '0';
      this.elements.animatedProjectImage.style.width = '100vw';
      this.elements.animatedProjectImage.style.height = '100vh';
      this.elements.animatedProjectImage.style.opacity = moveProgress.toString();
      this.elements.animatedProjectImage.style.borderRadius = '0px';
    } else {
      // Phase 2: Shrink and move to position
      const shrinkProgress = (progress - 0.5) / 0.5;
      const top = 0 + (shrinkProgress * 12);
      const left = 0 + (shrinkProgress * 38);
      const width = 100 - (shrinkProgress * 40);
      const height = 100 - (shrinkProgress * 40);
      
      this.elements.animatedProjectImage.style.top = `${top}vh`;
      this.elements.animatedProjectImage.style.left = `${left}vw`;
      this.elements.animatedProjectImage.style.width = `${width}vw`;
      this.elements.animatedProjectImage.style.height = `${height}vh`;
      this.elements.animatedProjectImage.style.opacity = (1 - shrinkProgress).toString();
      this.elements.animatedProjectImage.style.borderRadius = `${shrinkProgress * 12}px`;
    }
    
    if (progress >= 1) {
      this.elements.animatedProjectImage.style.opacity = '0';
    }
  }

  private highlightActiveProject(): void {
    const scrollPosition = window.scrollY + window.innerHeight / 2;
    
    this.elements.imageItems.forEach((image: HTMLElement) => {
      const rect = image.getBoundingClientRect();
      const imageTop = rect.top + window.scrollY;
      const imageBottom = imageTop + rect.height;
      
      if (scrollPosition >= imageTop && scrollPosition <= imageBottom) {
        this.elements.projectItems.forEach((item: HTMLElement) => 
          item.classList.remove('active')
        );
        const projectName = image.dataset.project;
        if (projectName) {
          const correspondingItem = document.querySelector<HTMLElement>(
            `.project-item[data-project="${projectName}"]`
          );
          if (correspondingItem) {
            correspondingItem.classList.add('active');
            this.scrollSidebarToActiveProject(correspondingItem);
          }
        }
      }
    });
  }

  private requestTick(): void {
    if (!this.ticking) {
      requestAnimationFrame(() => {
        this.handleScroll();
        this.highlightActiveProject();
        this.ticking = false;
      });
      this.ticking = true;
    }
  }

  public async initialize(): Promise<void> {
    try {
      // Load GSAP first
      await this.gsapLoader.loadGSAP();
      
      // Initialize GSAP animations
      this.initializeGSAPAnimations();
      this.setupProjectInteractions();
      
      // Add scroll listener
      window.addEventListener('scroll', () => this.requestTick(), { passive: true });
      
      // Initial calls
      this.handleScroll();
      
      console.log('🚀 App initialized with GSAP animations!');
    } catch (error) {
      console.warn('GSAP failed to load, using fallback animations:', error);
      
      // Setup basic functionality without GSAP
      this.setupProjectInteractions();
      window.addEventListener('scroll', () => this.requestTick(), { passive: true });
      this.handleScroll();
      
      console.log('🚀 App initialized with fallback animations!');
    }

    // Handle window resize
    window.addEventListener('resize', () => {
      this.animationState.windowHeight = window.innerHeight;
      this.handleScroll();
    });
  }
}

// Hero Text Animation Controller
class HeroTextController {
  private words: string[];
  private currentIndex: number = 0;
  private animatedTextElement: HTMLElement | null;

  constructor(words: string[]) {
    this.words = words;
    this.animatedTextElement = document.getElementById("animatedText");
  }

  private changeWord(): void {
    if (!this.animatedTextElement) return;
    this.animatedTextElement.classList.add("blur-out");

    setTimeout(() => {
      if (!this.animatedTextElement) return;
      this.currentIndex = (this.currentIndex + 1) % this.words.length;
      this.animatedTextElement.textContent = this.words[this.currentIndex];
      this.animatedTextElement.classList.remove("blur-out");
      this.animatedTextElement.classList.add("blur-in");

      setTimeout(() => {
        if (!this.animatedTextElement) return;
        this.animatedTextElement.classList.remove("blur-in");
      }, 800);
    }, 400);
  }

  public initialize(): void {
    setTimeout(() => {
      setInterval(() => this.changeWord(), 3000);
    }, 2000);
  }
}

// Main App Controller
class AppController {
  private projectController: ProjectAnimationController | null = null;
  private heroController: HeroTextController | null = null;

  constructor() {
    // Controllers will be initialized after projects are loaded
  }

  private async initializeControllers(): Promise<void> {
    // Load projects data first
    projects = await loadProjects();
    
    const heroWords = projects.map((project: Project) => project.name.toUpperCase());
    this.projectController = new ProjectAnimationController(projects);
    this.heroController = new HeroTextController(heroWords);
  }

  public async initialize(): Promise<void> {
    // Initialize controllers first
    await this.initializeControllers();

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', async () => {
        if (this.projectController && this.heroController) {
          await this.projectController.initialize();
          this.heroController.initialize();
        }
      });
    } else {
      if (this.projectController && this.heroController) {
        await this.projectController.initialize();
        this.heroController.initialize();
      }
    }
  }
}

// Extend the global Window interface for GSAP
declare global {
  interface Window {
    gsap: any;
  }
}

// Initialize the application
const app = new AppController();
app.initialize();