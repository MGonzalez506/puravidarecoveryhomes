// Main application JavaScript
// Note: This file depends on utils.js and navigation.js being loaded first

/**
 * Main Application Class
 */
class PuraVidaApp {
  constructor() {
    this.cleanupFunctions = [];
    this.components = new Map();
    this.isInitialized = false;
    
    this.init();
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      logger.info('Initializing Pura Vida Medical Stays website');
      
      // Setup core functionality
      this.setupLazyLoading();
      this.setupScrollAnimations();
      this.setupAccessibility();
      this.setupPerformanceOptimizations();
      this.setupErrorHandling();
      this.setupAnalytics();
      
      this.isInitialized = true;
      logger.info('Application initialized successfully');
      
      // Dispatch custom event
      document.dispatchEvent(new CustomEvent('puraVidaAppReady', {
        detail: { app: this }
      }));
      
    } catch (error) {
      logger.error('Failed to initialize application:', error);
    }
  }

  /**
   * Setup lazy loading for images
   */
  setupLazyLoading() {
    // Use Intersection Observer for modern browsers
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            this.loadImage(img);
            observer.unobserve(img);
          }
        });
      }, {
        rootMargin: '50px 0px',
        threshold: 0.01
      });

      // Observe all images with data-src
      const lazyImages = document.querySelectorAll('img[data-src]');
      lazyImages.forEach(img => imageObserver.observe(img));
      
      // Store for cleanup
      this.components.set('imageObserver', imageObserver);
      
    } else {
      // Fallback for older browsers
      this.setupLazyLoadingFallback();
    }
  }

  /**
   * Load image with proper error handling
   * @param {Element} img - The image element
   */
  loadImage(img) {
    const src = img.dataset.src;
    if (!src) return;

    // Create new image to preload
    const imageLoader = new Image();
    
    imageLoader.onload = () => {
      img.src = src;
      img.classList.add('loaded');
      img.removeAttribute('data-src');
    };
    
    imageLoader.onerror = () => {
      img.classList.add('error');
      logger.warn('Failed to load image:', src);
      
      // Set fallback image if available
      const fallback = img.dataset.fallback;
      if (fallback) {
        img.src = fallback;
      }
    };
    
    imageLoader.src = src;
  }

  /**
   * Fallback lazy loading for older browsers
   */
  setupLazyLoadingFallback() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    const checkImages = throttle(() => {
      lazyImages.forEach(img => {
        if (isInViewport(img, 0.1)) {
          this.loadImage(img);
        }
      });
    }, 100);

    const cleanup = addEventListenerWithCleanup(window, 'scroll', checkImages, { passive: true });
    this.cleanupFunctions.push(cleanup);
    
    // Initial check
    checkImages();
  }

  /**
   * Setup scroll-based animations
   */
  setupScrollAnimations() {
    // Skip animations if user prefers reduced motion
    if (prefersReducedMotion()) {
      logger.info('Reduced motion preferred, skipping scroll animations');
      return;
    }

    const animatedElements = document.querySelectorAll('[data-animate]');
    
    if ('IntersectionObserver' in window && animatedElements.length > 0) {
      const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target;
            const animationType = element.dataset.animate;
            const delay = element.dataset.animationDelay || '0ms';
            
            // Add animation delay
            element.style.animationDelay = delay;
            element.classList.add('animate', `animate-${animationType}`);
            
            // Unobserve after animation starts
            animationObserver.unobserve(element);
          }
        });
      }, {
        rootMargin: '-50px 0px',
        threshold: 0.1
      });

      animatedElements.forEach(el => animationObserver.observe(el));
      this.components.set('animationObserver', animationObserver);
    }
  }

  /**
   * Setup accessibility enhancements
   */
  setupAccessibility() {
    // Skip link for screen readers
    this.createSkipLink();
    
    // Enhanced focus management
    this.setupFocusManagement();
    
    // ARIA live regions for dynamic content
    this.createLiveRegions();
    
    // Keyboard navigation improvements
    this.setupKeyboardNavigation();
  }

  /**
   * Create skip link for accessibility
   */
  createSkipLink() {
    const skipLink = document.createElement('a');
    skipLink.href = '#main';
    skipLink.textContent = 'Saltar al contenido principal';
    skipLink.className = 'skip-link';
    skipLink.setAttribute('tabindex', '1');
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    const handleSkipClick = (e) => {
      e.preventDefault();
      const main = document.getElementById('main') || document.querySelector('main');
      if (main) {
        main.focus();
        main.scrollIntoView();
      }
    };

    const cleanup = addEventListenerWithCleanup(skipLink, 'click', handleSkipClick);
    this.cleanupFunctions.push(cleanup);
  }

  /**
   * Setup focus management
   */
  setupFocusManagement() {
    // Track focus for better UX
    let isKeyboardNavigation = false;
    
    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        isKeyboardNavigation = true;
        document.body.classList.add('keyboard-navigation');
      }
    };
    
    const handleMouseDown = () => {
      isKeyboardNavigation = false;
      document.body.classList.remove('keyboard-navigation');
    };

    const cleanup1 = addEventListenerWithCleanup(document, 'keydown', handleKeyDown);
    const cleanup2 = addEventListenerWithCleanup(document, 'mousedown', handleMouseDown);
    
    this.cleanupFunctions.push(cleanup1, cleanup2);
  }

  /**
   * Create ARIA live regions
   */
  createLiveRegions() {
    // Create polite live region for non-urgent updates
    const politeRegion = document.createElement('div');
    politeRegion.setAttribute('aria-live', 'polite');
    politeRegion.setAttribute('aria-atomic', 'true');
    politeRegion.className = 'sr-only';
    politeRegion.id = 'live-region-polite';
    document.body.appendChild(politeRegion);

    // Create assertive live region for urgent updates
    const assertiveRegion = document.createElement('div');
    assertiveRegion.setAttribute('aria-live', 'assertive');
    assertiveRegion.setAttribute('aria-atomic', 'true');
    assertiveRegion.className = 'sr-only';
    assertiveRegion.id = 'live-region-assertive';
    document.body.appendChild(assertiveRegion);
    
    this.components.set('liveRegions', { politeRegion, assertiveRegion });
  }

  /**
   * Announce message to screen readers
   * @param {string} message - Message to announce
   * @param {string} priority - 'polite' or 'assertive'
   */
  announceMessage(message, priority = 'polite') {
    const liveRegions = this.components.get('liveRegions');
    if (!liveRegions) return;
    
    const region = priority === 'assertive' ? 
      liveRegions.assertiveRegion : liveRegions.politeRegion;
    
    region.textContent = message;
    
    // Clear after announcement
    setTimeout(() => {
      region.textContent = '';
    }, 1000);
  }

  /**
   * Setup keyboard navigation
   */
  setupKeyboardNavigation() {
    // Add keyboard support for custom interactive elements
    const customButtons = document.querySelectorAll('[role="button"]:not(button)');
    
    customButtons.forEach(button => {
      const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          button.click();
        }
      };

      const cleanup = addEventListenerWithCleanup(button, 'keydown', handleKeyDown);
      this.cleanupFunctions.push(cleanup);
    });
  }

  /**
   * Setup performance optimizations
   */
  setupPerformanceOptimizations() {
    // Preload critical resources
    this.preloadCriticalResources();
    
    // Optimize font loading
    this.optimizeFontLoading();
    
    // Setup resource hints
    this.setupResourceHints();
  }

  /**
   * Preload critical resources
   */
  preloadCriticalResources() {
    // Preload hero image if it exists
    const heroImage = document.querySelector('.hero img, .hero picture source');
    if (heroImage) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = heroImage.srcset || heroImage.src;
      document.head.appendChild(link);
    }

    // Preload FontAwesome if not already loaded
    const faLink = document.createElement('link');
    faLink.rel = 'preload';
    faLink.as = 'style';
    faLink.href = './assets/fonts/fontawesome/css/all.min.css';
    document.head.appendChild(faLink);
  }

  /**
   * Optimize font loading
   */
  optimizeFontLoading() {
    // Add font-display: swap to Google Fonts
    const googleFonts = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
    googleFonts.forEach(link => {
      const url = new URL(link.href);
      url.searchParams.set('display', 'swap');
      link.href = url.toString();
    });
  }

  /**
   * Setup resource hints
   */
  setupResourceHints() {
    // DNS prefetch for external domains
    const domains = [
      'fonts.googleapis.com',
      'fonts.gstatic.com',
      'www.google-analytics.com'
    ];

    domains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = `//${domain}`;
      document.head.appendChild(link);
    });
  }

  /**
   * Setup error handling
   */
  setupErrorHandling() {
    // Global error handler
    window.addEventListener('error', (e) => {
      logger.error('JavaScript error:', e.error);
      this.trackError(e.error);
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (e) => {
      logger.error('Unhandled promise rejection:', e.reason);
      this.trackError(e.reason);
    });
  }

  /**
   * Track error for analytics
   * @param {Error} error - The error object
   */
  trackError(error) {
    // In production, you would send this to an error tracking service
    if (typeof gtag !== 'undefined') {
      gtag('event', 'exception', {
        description: error.message,
        fatal: false
      });
    }
  }

  /**
   * Setup analytics
   */
  setupAnalytics() {
    // Track page view
    this.trackPageView();
    
    // Setup event tracking
    this.setupEventTracking();
  }

  /**
   * Track page view
   */
  trackPageView() {
    if (typeof gtag !== 'undefined') {
      gtag('config', 'GA_MEASUREMENT_ID', {
        page_title: document.title,
        page_location: window.location.href
      });
    }
  }

  /**
   * Setup event tracking
   */
  setupEventTracking() {
    // Track contact form submissions
    document.addEventListener('puraVidaFormSubmit', (e) => {
      if (typeof gtag !== 'undefined') {
        gtag('event', 'form_submit', {
          event_category: 'engagement',
          event_label: 'contact_form'
        });
      }
    });

    // Track phone number clicks
    const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
    phoneLinks.forEach(link => {
      const cleanup = addEventListenerWithCleanup(link, 'click', () => {
        if (typeof gtag !== 'undefined') {
          gtag('event', 'click', {
            event_category: 'contact',
            event_label: 'phone_call'
          });
        }
      });
      
      this.cleanupFunctions.push(cleanup);
    });
  }

  /**
   * Get component by name
   * @param {string} name - Component name
   * @returns {any} The component
   */
  getComponent(name) {
    return this.components.get(name);
  }

  /**
   * Check if app is initialized
   * @returns {boolean} Whether app is initialized
   */
  isReady() {
    return this.isInitialized;
  }

  /**
   * Cleanup all resources
   */
  destroy() {
    // Cleanup event listeners
    this.cleanupFunctions.forEach(cleanup => cleanup());
    this.cleanupFunctions = [];

    // Cleanup components
    this.components.forEach((component, name) => {
      if (component && typeof component.disconnect === 'function') {
        component.disconnect();
      }
    });
    
    this.components.clear();
    this.isInitialized = false;
    
    logger.info('Application destroyed');
  }
}

// Initialize app when DOM is ready
let app;

document.addEventListener('DOMContentLoaded', () => {
  app = new PuraVidaApp();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (app) {
    app.destroy();
  }
});

// Make app available globally for debugging
if (typeof window !== 'undefined') {
  window.PuraVidaApp = app;
}