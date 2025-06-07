// src/scripts/utils/performance-monitor.ts
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeMetrics();
    }
  }

  private initializeMetrics(): void {
    // Monitor page load performance
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          this.metrics.set('lcp', lastEntry.renderTime || lastEntry.loadTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.warn('LCP observer not supported');
      }

      // First Input Delay
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (entry.name === 'first-input') {
              this.metrics.set('fid', entry.processingStart - entry.startTime);
            }
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        console.warn('FID observer not supported');
      }

      // Cumulative Layout Shift
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              this.metrics.set('cls', clsValue);
            }
          });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.warn('CLS observer not supported');
      }
    }

    // Monitor resource timing
    if ('performance' in window && 'getEntriesByType' in performance) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          this.analyzeResourceTiming();
        }, 1000);
      });
    }
  }

  private analyzeResourceTiming(): void {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    // Group resources by type
    const resourcesByType: Record<string, number[]> = {
      script: [],
      style: [],
      image: [],
      font: [],
      other: []
    };

    resources.forEach(resource => {
      const duration = resource.duration;
      if (resource.name.includes('.js')) {
        resourcesByType.script.push(duration);
      } else if (resource.name.includes('.css')) {
        resourcesByType.style.push(duration);
      } else if (resource.name.match(/\.(jpg|jpeg|png|webp|gif|svg)/i)) {
        resourcesByType.image.push(duration);
      } else if (resource.name.match(/\.(woff|woff2|ttf|otf)/i)) {
        resourcesByType.font.push(duration);
      } else {
        resourcesByType.other.push(duration);
      }
    });

    // Calculate average load times
    Object.entries(resourcesByType).forEach(([type, durations]) => {
      if (durations.length > 0) {
        const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
        this.metrics.set(`avg_${type}_load_time`, avg);
      }
    });
  }

  public mark(name: string): void {
    if ('performance' in window && 'mark' in performance) {
      performance.mark(name);
    }
  }

  public measure(name: string, startMark: string, endMark?: string): void {
    if ('performance' in window && 'measure' in performance) {
      try {
        if (endMark) {
          performance.measure(name, startMark, endMark);
        } else {
          performance.measure(name, startMark);
        }
        
        const entries = performance.getEntriesByName(name);
        if (entries.length > 0) {
          this.metrics.set(name, entries[entries.length - 1].duration);
        }
      } catch (e) {
        console.warn(`Failed to measure ${name}:`, e);
      }
    }
  }

  public getMetrics(): Record<string, number> {
    const result: Record<string, number> = {};
    this.metrics.forEach((value, key) => {
      result[key] = Math.round(value * 100) / 100;
    });
    return result;
  }

  public logMetrics(): void {
    if (import.meta.env.DEV) {
      console.table(this.getMetrics());
    }
  }

  // Send metrics to analytics (implement based on your analytics provider)
  public sendMetrics(): void {
    const metrics = this.getMetrics();
    
    // Example: Send to Google Analytics
    if (typeof window !== 'undefined' && 'gtag' in window) {
      Object.entries(metrics).forEach(([key, value]) => {
        (window as any).gtag('event', 'performance', {
          event_category: 'Web Vitals',
          event_label: key,
          value: Math.round(value),
          non_interaction: true
        });
      });
    }
  }
}

// Auto-initialize
if (typeof window !== 'undefined') {
  const monitor = PerformanceMonitor.getInstance();
  
  // Log metrics in development
  if (import.meta.env.DEV) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        monitor.logMetrics();
      }, 2000);
    });
  }
}