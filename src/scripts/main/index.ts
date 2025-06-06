// src/scripts/main/index.ts - Updated to use AnimationManager
import AnimationManager from '../managers/AnimationManager';

// Initialize on DOM ready
function initialize() {
  const manager = AnimationManager.getInstance();
  
  // Only initialize animations through the manager
  manager.initialize();
  
  // Log the current page type for debugging
  const config = manager.getConfig();
  console.log(`🎯 AnimationManager initialized for ${config.page} page`);
  
  // Add debug info in development
  if (import.meta.env.DEV) {
    (window as any).__animationManager = manager;
    console.log('💡 Debug: Access Animation Manager via window.__animationManager');
  }
}

// Wait for DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  const manager = AnimationManager.getInstance();
  manager.cleanup();
});

// Handle Astro page transitions
document.addEventListener('astro:before-preparation', () => {
  const manager = AnimationManager.getInstance();
  manager.cleanup();
});

// Export for use in other scripts if needed
export { AnimationManager };