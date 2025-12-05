// Navigation functionality
// Note: This file depends on utils.js being loaded first

/**
 * Navigation Manager Class
 */
class NavigationManager {
  constructor() {
    this.header = document.querySelector('.header');
    this.navbar = document.querySelector('.navbar');
    this.navbarToggle = document.querySelector('.navbar-toggle');
    this.navbarMenu = document.querySelector('.navbar-menu');
    this.navLinks = document.querySelectorAll('.navbar-menu a[href^="#"]');
    
    this.isMenuOpen = false;
    this.lastScrollY = window.scrollY;
    this.scrollThreshold = 100;
    
    this.cleanupFunctions = [];
    
    this.init();
  }

  /**
   * Initialize navigation functionality
   */
  init() {
    this.setupMobileMenu();
    this.setupScrollEffects();
    this.setupSmoothScrolling();
    this.setupActiveNavigation();
    this.setupKeyboardNavigation();
    this.setupClickOutside();
    
    console.log('Navigation initialized');
  }

  /**
   * Setup mobile menu toggle
   */
  setupMobileMenu() {
    if (!this.navbarToggle || !this.navbarMenu) return;

    const toggleMenu = () => {
      this.isMenuOpen = !this.isMenuOpen;
      this.navbarMenu.classList.toggle('open', this.isMenuOpen);
      this.navbarToggle.setAttribute('aria-expanded', this.isMenuOpen);
      
      // Update icon
      const icon = this.navbarToggle.querySelector('i');
      if (icon) {
        icon.className = this.isMenuOpen ? 'fas fa-times' : 'fas fa-bars';
      }
      
      // Prevent body scroll when menu is open
      document.body.style.overflow = this.isMenuOpen ? 'hidden' : '';
    };

    const cleanup = addEventListenerWithCleanup(this.navbarToggle, 'click', toggleMenu);
    this.cleanupFunctions.push(cleanup);

    // Close menu when clicking on nav links
    this.navbarMenu.querySelectorAll('a').forEach(link => {
      const closeMenu = () => {
        if (this.isMenuOpen) {
          this.isMenuOpen = false;
          this.navbarMenu.classList.remove('open');
          this.navbarToggle.setAttribute('aria-expanded', false);
          document.body.style.overflow = '';
          
          // Reset icon
          const icon = this.navbarToggle.querySelector('i');
          if (icon) {
            icon.className = 'fas fa-bars';
          }
        }
      };

      const cleanup = addEventListenerWithCleanup(link, 'click', closeMenu);
      this.cleanupFunctions.push(cleanup);
    });
  }

  /**
   * Setup scroll effects for header
   */
  setupScrollEffects() {
    if (!this.header) return;

    const handleScroll = debounce(() => {
      const currentScrollY = window.scrollY;
      
      // Add scrolled class for styling
      this.header.classList.toggle('scrolled', currentScrollY > 50);
      
      // Hide/show header on scroll (optional)
      if (Math.abs(currentScrollY - this.lastScrollY) > this.scrollThreshold) {
        if (currentScrollY > this.lastScrollY && currentScrollY > 200) {
          // Scrolling down
          this.header.style.transform = 'translateY(-100%)';
        } else {
          // Scrolling up
          this.header.style.transform = 'translateY(0)';
        }
        
        this.lastScrollY = currentScrollY;
      }
    }, 100);

    const cleanup = addEventListenerWithCleanup(window, 'scroll', handleScroll, { passive: true });
    this.cleanupFunctions.push(cleanup);
  }

  /**
   * Setup smooth scrolling for anchor links
   */
  setupSmoothScrolling() {
    this.navLinks.forEach(link => {
      const handleClick = (e) => {
        e.preventDefault();
        
        const targetId = link.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          const headerHeight = this.header ? this.header.offsetHeight : 80;
          smoothScrollTo(targetElement, headerHeight + 20);
        }
      };

      const cleanup = addEventListenerWithCleanup(link, 'click', handleClick);
      this.cleanupFunctions.push(cleanup);
    });
  }

  /**
   * Setup active navigation highlighting
   */
  setupActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    if (sections.length === 0) return;

    const updateActiveNav = debounce(() => {
      const headerHeight = this.header ? this.header.offsetHeight : 80;
      const scrollPosition = window.scrollY + headerHeight + 100;

      let currentSection = '';

      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          currentSection = section.id;
        }
      });

      // Update active nav link
      this.navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          const targetId = href.substring(1);
          link.classList.toggle('active', targetId === currentSection);
        }
      });
    }, 100);

    const cleanup = addEventListenerWithCleanup(window, 'scroll', updateActiveNav, { passive: true });
    this.cleanupFunctions.push(cleanup);

    // Initial call
    updateActiveNav();
  }

  /**
   * Setup keyboard navigation
   */
  setupKeyboardNavigation() {
    const handleKeydown = (e) => {
      // Escape key closes mobile menu
      if (e.key === 'Escape' && this.isMenuOpen) {
        this.isMenuOpen = false;
        this.navbarMenu.classList.remove('open');
        this.navbarToggle.setAttribute('aria-expanded', false);
        document.body.style.overflow = '';
        
        // Reset icon
        const icon = this.navbarToggle.querySelector('i');
        if (icon) {
          icon.className = 'fas fa-bars';
        }
        
        this.navbarToggle.focus();
      }
      
      // Enter and Space on mobile toggle
      if (e.target === this.navbarToggle && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        this.navbarToggle.click();
      }
    };

    const cleanup = addEventListenerWithCleanup(document, 'keydown', handleKeydown);
    this.cleanupFunctions.push(cleanup);
  }

  /**
   * Setup click outside to close mobile menu
   */
  setupClickOutside() {
    const handleClickOutside = (e) => {
      if (this.isMenuOpen && 
          !this.navbarMenu.contains(e.target) && 
          !this.navbarToggle.contains(e.target)) {
        
        this.isMenuOpen = false;
        this.navbarMenu.classList.remove('open');
        this.navbarToggle.setAttribute('aria-expanded', false);
        document.body.style.overflow = '';
        
        // Reset icon
        const icon = this.navbarToggle.querySelector('i');
        if (icon) {
          icon.className = 'fas fa-bars';
        }
      }
    };

    const cleanup = addEventListenerWithCleanup(document, 'click', handleClickOutside);
    this.cleanupFunctions.push(cleanup);
  }

  /**
   * Set active navigation item
   * @param {string} href - The href to set as active
   */
  setActiveNav(href) {
    this.navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === href);
    });
  }

  /**
   * Get current active navigation item
   * @returns {Element|null} The active nav element
   */
  getActiveNav() {
    return document.querySelector('.navbar-menu a.active');
  }

  /**
   * Cleanup all event listeners
   */
  destroy() {
    this.cleanupFunctions.forEach(cleanup => cleanup());
    this.cleanupFunctions = [];
    
    // Reset body overflow
    document.body.style.overflow = '';
    
    console.log('Navigation destroyed');
  }
}

/**
 * Breadcrumb navigation
 */
class BreadcrumbManager {
  constructor() {
    this.breadcrumb = document.querySelector('.breadcrumb');
    this.init();
  }

  init() {
    if (!this.breadcrumb) return;
    
    this.setupBreadcrumbNavigation();
  }

  setupBreadcrumbNavigation() {
    const links = this.breadcrumb.querySelectorAll('a');
    
    links.forEach(link => {
      const handleClick = (e) => {
        // Add loading state or smooth transition
        link.classList.add('loading');
        
        setTimeout(() => {
          link.classList.remove('loading');
        }, 500);
      };

      link.addEventListener('click', handleClick);
    });
  }

  /**
   * Update breadcrumb trail
   * @param {Array} items - Array of breadcrumb items {text, href}
   */
  updateBreadcrumb(items) {
    if (!this.breadcrumb) return;

    this.breadcrumb.innerHTML = '';
    
    items.forEach((item, index) => {
      const li = document.createElement('li');
      
      if (index === items.length - 1) {
        // Last item - current page
        li.textContent = item.text;
        li.setAttribute('aria-current', 'page');
      } else {
        // Link item
        const a = document.createElement('a');
        a.href = item.href;
        a.textContent = item.text;
        li.appendChild(a);
      }
      
      this.breadcrumb.appendChild(li);
    });
  }
}

// Initialize when DOM is loaded
let navigationManager;
let breadcrumbManager;

document.addEventListener('DOMContentLoaded', () => {
  navigationManager = new NavigationManager();
  breadcrumbManager = new BreadcrumbManager();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (navigationManager) {
    navigationManager.destroy();
  }
});

// Export for use in other modules
export { NavigationManager, BreadcrumbManager };