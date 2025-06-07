// astro.config.mjs - Performance optimized configuration
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import compress from 'astro-compress';

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
    tailwind({
      config: {
        applyBaseStyles: false,
      },
    }),
    // Add compression for better performance
    compress({
      css: true,
      html: {
        removeAttributeQuotes: false,
      },
      img: false, // Handle images separately
      js: true,
      svg: true,
    }),
  ],

  // Build optimizations
  build: {
    // Enable inlining of CSS for critical styles
    inlineStylesheets: 'auto',

    // Split code for better caching
    split: true,

    // Exclude large dependencies from bundle
    excludeMiddleware: false,
  },

  // Output configuration
  output: 'static',

  // Image optimization
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: {
        limitInputPixels: false,
      },
    },
  },

  // Vite configuration for better bundling
  vite: {
    build: {
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          // Split vendor chunks
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'gsap-vendor': ['gsap'],
            // Add more manual chunks as needed
          },
          // Asset naming for better caching
          assetFileNames: 'assets/[name].[hash][extname]',
          chunkFileNames: 'chunks/[name].[hash].js',
          entryFileNames: 'entry/[name].[hash].js',
        },
      },
      // Increase chunk size warning limit
      chunkSizeWarningLimit: 1000,
    },

    // Optimize dependencies
    optimizeDeps: {
      include: ['react', 'react-dom', 'gsap', 'gsap/ScrollToPlugin'],
      exclude: [],
    },

    // CSS optimizations
    css: {
      devSourcemap: false,
      lightningcss: {
        targets: {
          chrome: 95,
          firefox: 95,
          safari: 14,
        },
      },
    },

    // Performance optimizations
    ssr: {
      noExternal: ['@astrojs/react'],
    },
  },

  // The experimental block is now removed as the feature is standard in Astro 5.9.0
});