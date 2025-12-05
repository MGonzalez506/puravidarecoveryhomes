// Utility functions for the website

/**
 * Debounce function to limit the rate at which a function can fire
 * @param {Function} func - The function to debounce
 * @param {number} wait - The number of milliseconds to delay
 * @param {boolean} immediate - Whether to execute immediately
 * @returns {Function} The debounced function
 */
function debounce(func, wait, immediate = false) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
}

/**
 * Throttle function to limit function execution
 * @param {Function} func - The function to throttle
 * @param {number} limit - The time limit in milliseconds
 * @returns {Function} The throttled function
 */
function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Check if element is in viewport
 * @param {Element} element - The element to check
 * @param {number} threshold - The threshold percentage (0-1)
 * @returns {boolean} Whether the element is in viewport
 */
function isInViewport(element, threshold = 0) {
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;
  
  const vertInView = (rect.top <= windowHeight * (1 - threshold)) && 
                     ((rect.top + rect.height) >= windowHeight * threshold);
  const horInView = (rect.left <= windowWidth * (1 - threshold)) && 
                    ((rect.left + rect.width) >= windowWidth * threshold);
  
  return vertInView && horInView;
}

/**
 * Smooth scroll to element
 * @param {Element|string} target - Element or selector to scroll to
 * @param {number} offset - Offset from top in pixels
 * @param {number} duration - Animation duration in milliseconds
 */
function smoothScrollTo(target, offset = 0, duration = 800) {
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  
  if (!element) {
    console.warn('Smooth scroll target not found:', target);
    return;
  }

  const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - offset;
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  let startTime = null;

  function animation(currentTime) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
    window.scrollTo(0, run);
    
    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    }
  }

  // Easing function
  function easeInOutQuad(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  }

  requestAnimationFrame(animation);
}

/**
 * Add event listener with options and cleanup
 * @param {Element} element - The element to add listener to
 * @param {string} event - The event type
 * @param {Function} handler - The event handler
 * @param {Object} options - Event listener options
 * @returns {Function} Cleanup function
 */
function addEventListenerWithCleanup(element, event, handler, options = {}) {
  element.addEventListener(event, handler, options);
  
  return function cleanup() {
    element.removeEventListener(event, handler, options);
  };
}

/**
 * Get CSS custom property value
 * @param {string} property - CSS custom property name (without --)
 * @param {Element} element - Element to get property from (defaults to document.documentElement)
 * @returns {string} The property value
 */
function getCSSCustomProperty(property, element = document.documentElement) {
  return getComputedStyle(element).getPropertyValue(`--${property}`).trim();
}

/**
 * Set CSS custom property value
 * @param {string} property - CSS custom property name (without --)
 * @param {string} value - The value to set
 * @param {Element} element - Element to set property on (defaults to document.documentElement)
 */
function setCSSCustomProperty(property, value, element = document.documentElement) {
  element.style.setProperty(`--${property}`, value);
}

/**
 * Format phone number for display
 * @param {string} phoneNumber - Raw phone number
 * @returns {string} Formatted phone number
 */
function formatPhoneNumber(phoneNumber) {
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Costa Rica format: +506 XXXX-XXXX
  if (cleaned.length === 11 && cleaned.startsWith('506')) {
    return `+506 ${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }
  
  // US format: (XXX) XXX-XXXX
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  // International format fallback
  if (cleaned.length > 10) {
    return `+${cleaned.slice(0, -10)} ${cleaned.slice(-10, -7)}-${cleaned.slice(-7, -4)}-${cleaned.slice(-4)}`;
  }
  
  return phoneNumber; // Return original if no format matches
}

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} Whether email is valid
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Get preferred language from browser
 * @returns {string} Language code (e.g., 'en', 'es')
 */
function getPreferredLanguage() {
  const language = navigator.language || navigator.userLanguage;
  return language.split('-')[0]; // Get just the language part (e.g., 'en' from 'en-US')
}

/**
 * Detect if user prefers dark mode
 * @returns {boolean} Whether user prefers dark mode
 */
function prefersDarkMode() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Detect if user prefers reduced motion
 * @returns {boolean} Whether user prefers reduced motion
 */
function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Whether copy was successful
 */
async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Generate unique ID
 * @param {string} prefix - Optional prefix for the ID
 * @returns {string} Unique ID
 */
function generateUniqueId(prefix = 'id') {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 7);
  return `${prefix}-${timestamp}-${randomStr}`;
}

/**
 * Parse URL parameters
 * @param {string} url - URL to parse (defaults to current URL)
 * @returns {Object} Object with URL parameters
 */
function parseURLParams(url = window.location.href) {
  const urlObj = new URL(url);
  const params = {};
  
  for (const [key, value] of urlObj.searchParams.entries()) {
    params[key] = value;
  }
  
  return params;
}

/**
 * Cookie utilities
 */
const cookies = {
  /**
   * Set cookie
   * @param {string} name - Cookie name
   * @param {string} value - Cookie value
   * @param {number} days - Expiration in days
   */
  set(name, value, days = 365) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  },

  /**
   * Get cookie
   * @param {string} name - Cookie name
   * @returns {string|null} Cookie value or null
   */
  get(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    
    return null;
  },

  /**
   * Delete cookie
   * @param {string} name - Cookie name
   */
  delete(name) {
    document.cookie = name + '=; Max-Age=-99999999; path=/';
  }
};

/**
 * Simple logger utility
 */
const logger = {
  info: (message, ...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[INFO] ${message}`, ...args);
    }
  },
  
  warn: (message, ...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },
  
  error: (message, ...args) => {
    console.error(`[ERROR] ${message}`, ...args);
  }
};