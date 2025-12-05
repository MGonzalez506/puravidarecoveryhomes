// Form handling and validation
import { debounce, isValidEmail, addEventListenerWithCleanup } from './utils.js';

/**
 * Form Manager Class
 */
class FormManager {
  constructor() {
    this.forms = document.querySelectorAll('form');
    this.cleanupFunctions = [];
    this.validationRules = {};
    
    this.init();
  }

  /**
   * Initialize form functionality
   */
  init() {
    this.setupFormValidation();
    this.setupFormSubmission();
    this.setupRealTimeValidation();
    
    console.log(`Form manager initialized for ${this.forms.length} forms`);
  }

  /**
   * Setup form validation rules
   */
  setupFormValidation() {
    // Default validation rules
    this.validationRules = {
      required: {
        test: (value) => value.trim() !== '',
        message: 'Este campo es obligatorio'
      },
      email: {
        test: (value) => !value || isValidEmail(value),
        message: 'Por favor ingresa un email válido'
      },
      phone: {
        test: (value) => !value || /^[\+]?[\s\-\(\)]*([0-9][\s\-\(\)]*){8,}$/.test(value),
        message: 'Por favor ingresa un número de teléfono válido'
      },
      minLength: {
        test: (value, min) => !value || value.length >= min,
        message: (min) => `Debe tener al menos ${min} caracteres`
      },
      maxLength: {
        test: (value, max) => !value || value.length <= max,
        message: (max) => `No debe exceder ${max} caracteres`
      }
    };
  }

  /**
   * Setup real-time validation
   */
  setupRealTimeValidation() {
    this.forms.forEach(form => {
      const inputs = form.querySelectorAll('input, textarea, select');
      
      inputs.forEach(input => {
        const debouncedValidate = debounce(() => {
          this.validateField(input);
        }, 300);

        const cleanup1 = addEventListenerWithCleanup(input, 'blur', () => {
          this.validateField(input);
        });

        const cleanup2 = addEventListenerWithCleanup(input, 'input', debouncedValidate);

        this.cleanupFunctions.push(cleanup1, cleanup2);
      });
    });
  }

  /**
   * Setup form submission
   */
  setupFormSubmission() {
    this.forms.forEach(form => {
      const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate entire form
        const isValid = this.validateForm(form);
        
        if (!isValid) {
          this.focusFirstError(form);
          return;
        }

        // Show loading state
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        this.setButtonLoading(submitButton, true);

        try {
          await this.submitForm(form);
          this.showFormSuccess(form);
        } catch (error) {
          this.showFormError(form, error.message);
        } finally {
          this.setButtonLoading(submitButton, false, originalText);
        }
      };

      const cleanup = addEventListenerWithCleanup(form, 'submit', handleSubmit);
      this.cleanupFunctions.push(cleanup);
    });
  }

  /**
   * Validate a single field
   * @param {Element} field - The form field to validate
   * @returns {boolean} Whether the field is valid
   */
  validateField(field) {
    const value = field.value;
    const rules = this.getFieldRules(field);
    const errorElement = this.getErrorElement(field);
    
    // Clear previous error
    this.clearFieldError(field, errorElement);

    // Run validation rules
    for (const rule of rules) {
      const isValid = this.runValidationRule(rule, value, field);
      
      if (!isValid) {
        this.showFieldError(field, errorElement, rule.message);
        return false;
      }
    }

    this.showFieldSuccess(field);
    return true;
  }

  /**
   * Validate entire form
   * @param {Element} form - The form to validate
   * @returns {boolean} Whether the form is valid
   */
  validateForm(form) {
    const fields = form.querySelectorAll('input, textarea, select');
    let isValid = true;

    fields.forEach(field => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });

    return isValid;
  }

  /**
   * Get validation rules for a field
   * @param {Element} field - The form field
   * @returns {Array} Array of validation rules
   */
  getFieldRules(field) {
    const rules = [];
    
    // Required validation
    if (field.hasAttribute('required')) {
      rules.push({
        type: 'required',
        message: this.validationRules.required.message
      });
    }

    // Email validation
    if (field.type === 'email') {
      rules.push({
        type: 'email',
        message: this.validationRules.email.message
      });
    }

    // Phone validation
    if (field.type === 'tel') {
      rules.push({
        type: 'phone',
        message: this.validationRules.phone.message
      });
    }

    // Length validation
    const minLength = field.getAttribute('minlength');
    if (minLength) {
      rules.push({
        type: 'minLength',
        value: parseInt(minLength),
        message: this.validationRules.minLength.message(minLength)
      });
    }

    const maxLength = field.getAttribute('maxlength');
    if (maxLength) {
      rules.push({
        type: 'maxLength',
        value: parseInt(maxLength),
        message: this.validationRules.maxLength.message(maxLength)
      });
    }

    return rules;
  }

  /**
   * Run a validation rule
   * @param {Object} rule - The validation rule
   * @param {string} value - The field value
   * @param {Element} field - The form field
   * @returns {boolean} Whether the rule passes
   */
  runValidationRule(rule, value, field) {
    const validationRule = this.validationRules[rule.type];
    
    if (!validationRule) return true;

    return validationRule.test(value, rule.value, field);
  }

  /**
   * Get or create error element for field
   * @param {Element} field - The form field
   * @returns {Element} The error element
   */
  getErrorElement(field) {
    const fieldId = field.id || field.name;
    let errorElement = document.getElementById(`${fieldId}-error`);
    
    if (!errorElement) {
      errorElement = document.createElement('span');
      errorElement.id = `${fieldId}-error`;
      errorElement.className = 'error-message';
      errorElement.setAttribute('role', 'alert');
      errorElement.setAttribute('aria-live', 'polite');
      
      field.parentNode.appendChild(errorElement);
    }
    
    return errorElement;
  }

  /**
   * Show field error
   * @param {Element} field - The form field
   * @param {Element} errorElement - The error element
   * @param {string} message - The error message
   */
  showFieldError(field, errorElement, message) {
    field.classList.add('error');
    field.setAttribute('aria-invalid', 'true');
    field.setAttribute('aria-describedby', errorElement.id);
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }

  /**
   * Clear field error
   * @param {Element} field - The form field
   * @param {Element} errorElement - The error element
   */
  clearFieldError(field, errorElement) {
    field.classList.remove('error', 'success');
    field.removeAttribute('aria-invalid');
    field.removeAttribute('aria-describedby');
    
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }
  }

  /**
   * Show field success
   * @param {Element} field - The form field
   */
  showFieldSuccess(field) {
    if (field.value.trim() !== '') {
      field.classList.add('success');
    }
  }

  /**
   * Submit form data
   * @param {Element} form - The form to submit
   * @returns {Promise} Promise resolving when submission is complete
   */
  async submitForm(form) {
    const formData = new FormData(form);
    const action = form.action || '/contact';
    const method = form.method || 'POST';

    // Convert FormData to regular object for easier handling
    const data = {};
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }

    // Add timestamp and user agent for tracking
    data.timestamp = new Date().toISOString();
    data.userAgent = navigator.userAgent;

    const response = await fetch(action, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Error al enviar el formulario. Por favor intenta de nuevo.');
    }

    return response.json();
  }

  /**
   * Show form success message
   * @param {Element} form - The form element
   */
  showFormSuccess(form) {
    // Create success message if it doesn't exist
    let successMessage = form.querySelector('.form-success-message');
    
    if (!successMessage) {
      successMessage = document.createElement('div');
      successMessage.className = 'alert alert-success form-success-message';
      successMessage.setAttribute('role', 'alert');
      form.insertBefore(successMessage, form.firstChild);
    }

    successMessage.innerHTML = `
      <i class="fas fa-check-circle" aria-hidden="true"></i>
      <strong>¡Mensaje enviado exitosamente!</strong>
      <p>Nos pondremos en contacto contigo pronto.</p>
    `;

    successMessage.style.display = 'block';

    // Reset form
    form.reset();
    
    // Clear validation states
    const fields = form.querySelectorAll('input, textarea, select');
    fields.forEach(field => {
      field.classList.remove('error', 'success');
      const errorElement = this.getErrorElement(field);
      this.clearFieldError(field, errorElement);
    });

    // Scroll to success message
    successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Hide success message after 10 seconds
    setTimeout(() => {
      successMessage.style.display = 'none';
    }, 10000);
  }

  /**
   * Show form error message
   * @param {Element} form - The form element
   * @param {string} message - The error message
   */
  showFormError(form, message) {
    let errorMessage = form.querySelector('.form-error-message');
    
    if (!errorMessage) {
      errorMessage = document.createElement('div');
      errorMessage.className = 'alert alert-error form-error-message';
      errorMessage.setAttribute('role', 'alert');
      form.insertBefore(errorMessage, form.firstChild);
    }

    errorMessage.innerHTML = `
      <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
      <strong>Error al enviar el formulario</strong>
      <p>${message}</p>
    `;

    errorMessage.style.display = 'block';
    errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Hide error message after 8 seconds
    setTimeout(() => {
      errorMessage.style.display = 'none';
    }, 8000);
  }

  /**
   * Set button loading state
   * @param {Element} button - The button element
   * @param {boolean} loading - Whether to show loading state
   * @param {string} originalText - Original button text to restore
   */
  setButtonLoading(button, loading, originalText = '') {
    if (loading) {
      button.disabled = true;
      button.innerHTML = `
        <span class="spinner" aria-hidden="true"></span>
        Enviando...
      `;
    } else {
      button.disabled = false;
      button.innerHTML = originalText;
    }
  }

  /**
   * Focus first field with error
   * @param {Element} form - The form element
   */
  focusFirstError(form) {
    const firstError = form.querySelector('.error');
    if (firstError) {
      firstError.focus();
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /**
   * Add custom validation rule
   * @param {string} name - Rule name
   * @param {Function} test - Validation function
   * @param {string} message - Error message
   */
  addValidationRule(name, test, message) {
    this.validationRules[name] = { test, message };
  }

  /**
   * Cleanup all event listeners
   */
  destroy() {
    this.cleanupFunctions.forEach(cleanup => cleanup());
    this.cleanupFunctions = [];
    
    console.log('Form manager destroyed');
  }
}

// Initialize when DOM is loaded
let formManager;

document.addEventListener('DOMContentLoaded', () => {
  formManager = new FormManager();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (formManager) {
    formManager.destroy();
  }
});

// Export for use in other modules
export { FormManager };