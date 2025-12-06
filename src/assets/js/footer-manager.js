/**
 * Footer Manager - MGonzalez506
 * Sistema centralizado para generar el footer en todas las páginas del sitio web
 * 
 * Características:
 * - Configuración integrada (datos + código en un solo archivo)
 * - Generación automática de HTML del footer
 * - Formulario de contacto con validación y envío por email
 * - Auto-inicialización en cada página
 * - Responsive design adaptado a móviles
 */

class FooterManager {
    constructor() {
        this.contactInfo = {
            organization: "Pura Vida Medical Homes",
            president: {
                name: "Miguel González",
                phone: "+(506) 6056-1709"
            },
            location: "San José, Costa Rica",
            email: "dev@mgonzalez506.com",
            social: {
                instagram: {
                    url: "https://www.instagram.com/mgonzalez506/",
                    handle: "@mgonzalez506"
                },
                facebook: {
                    url: "https://www.facebook.com/mgonzalez506/",
                    handle: "facebook.com/mgonzalez506"
                }
            }
        };
    }

    /**
     * Genera el HTML del footer completo
     */
    generateFooterHTML() {
        const currentYear = new Date().getFullYear();
        
        return `
            <!-- Footer -->
            <footer class="footer-modern">
                <!-- Header del Footer -->
                <div class="footer-header">
                    <div class="container-xl">
                        <div class="text-center">
                            <h2 class="footer-main-title">Mantente conectado con nosotros</h2>
                            <p class="footer-subtitle">Únete a nuestra comunidad de exalumnos y sé parte del legado Don Bosco</p>
                        </div>
                    </div>
                </div>

                <!-- Contenido Principal del Footer -->
                <div class="footer-content">
                    <div class="container-xl">
                        <div class="footer-grid">
                            <!-- Columna 1: Información de la Organización -->
                            <div class="footer-column">
                                <div class="footer-brand">
                                    <h3 class="footer-brand-title">
                                        <i class="fal fa-graduation-cap footer-icon mr-3"></i>
                                        Pura Vida Medical Homes
                                    </h3>
                                    <p class="footer-brand-description">
                                        ${this.contactInfo.organization}
                                    </p>
                                    <p class="footer-motto footer-golden-text">
                                        "Será un placer tenerles de nuevo en casa"
                                    </p>
                                </div>
                            </div>

                            <!-- Columna 2: Enlaces Rápidos -->
                            <div class="footer-column">
                                <h4 class="footer-column-title">
                                    <i class="fal fa-link footer-icon mr-2"></i>
                                    Enlaces Rápidos
                                </h4>
                                <ul class="footer-links">
                                    <li><a href="index.html"><i class="fal fa-home footer-icon mr-2"></i>Inicio</a></li>
                                    <li><a href="junta_directiva.html"><i class="fal fa-users footer-icon mr-2"></i>Junta Directiva</a></li>
                                    <li><a href="estatutos.html"><i class="fal fa-file-alt footer-icon mr-2"></i>Estatutos</a></li>
                                    <li><a href="#contact-form"><i class="fal fa-envelope footer-icon mr-2"></i>Contacto</a></li>
                                </ul>
                            </div>

                            <!-- Columna 3: Información de Contacto -->
                            <div class="footer-column">
                                <h4 class="footer-column-title">
                                    <i class="fal fa-address-book footer-icon mr-2"></i>
                                    Contacto
                                </h4>
                                <div class="footer-contact-info">
                                    <div class="contact-item">
                                        <i class="fal fa-map-marker-alt footer-icon"></i>
                                        <div class="contact-content">
                                            <strong>Ubicación</strong>
                                            <p>${this.contactInfo.location}</p>
                                        </div>
                                    </div>
                                    <div class="contact-item">
                                        <i class="fal fa-phone footer-icon"></i>
                                        <div class="contact-content">
                                            <strong>Presidente</strong>
                                            <p>${this.contactInfo.president.name}</p>
                                            <p>${this.contactInfo.president.phone}</p>
                                        </div>
                                    </div>
                                    <div class="contact-item">
                                        <i class="fal fa-envelope footer-icon"></i>
                                        <div class="contact-content">
                                            <strong>Email</strong>
                                            <p><a href="mailto:${this.contactInfo.email}">${this.contactInfo.email}</a></p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Columna 4: Formulario de Contacto -->
                            <div class="footer-column footer-form-column">
                                <h4 class="footer-column-title">
                                    <i class="fal fa-paper-plane footer-icon mr-2"></i>
                                    Envíanos un mensaje
                                </h4>
                                <form method="post" action="#" id="contact-form" class="footer-contact-form">
                                    <div class="form-group">
                                        <input name="name" placeholder="Tu nombre" type="text" class="form-input-modern" required />
                                    </div>
                                    <div class="form-group">
                                        <input name="email" placeholder="Tu correo electrónico" type="email" class="form-input-modern" required />
                                    </div>
                                    <div class="form-group">
                                        <textarea name="message" placeholder="Tu mensaje" rows="4" class="form-input-modern" required></textarea>
                                    </div>
                                    <button type="submit" class="btn-modern btn-primary-modern w-100">
                                        <i class="fal fa-paper-plane mr-2"></i>
                                        Enviar Mensaje
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Redes Sociales y Footer Bottom -->
                <div class="footer-bottom-section">
                    <div class="container-xl">
                        <div class="footer-bottom-content">
                            <div class="footer-social">
                                <h5 class="footer-social-title">Síguenos</h5>
                                <div class="social-links">
                                    <a href="${this.contactInfo.social.instagram.url}" target="_blank" class="social-link instagram">
                                        <i class="fab fa-instagram"></i>
                                        <span>Instagram</span>
                                    </a>
                                    <a href="${this.contactInfo.social.facebook.url}" target="_blank" class="social-link facebook">
                                        <i class="fab fa-facebook-f"></i>
                                        <span>Facebook</span>
                                    </a>
                                </div>
                            </div>
                            <div class="footer-copyright">
                                <p>&copy; ${currentYear} Pura Vida Medical Homes. Todos los derechos reservados.</p>
                                <p>Desarrollado por <a href="https://www.mgonzalez506.com" target="_blank">MGonzalez506</a></p>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>`;
    }

    /**
     * Inserta el footer en el DOM
     */
    insertFooter() {
        // Buscar el contenedor principal
        const pageWrapper = document.getElementById('page-wrapper');
        if (!pageWrapper) {
            console.error('FooterManager: No se encontró el elemento #page-wrapper');
            return;
        }

        // Verificar si ya existe footer para evitar duplicados
        const existingFooter = document.querySelector('footer.footer');
        if (existingFooter) {
            existingFooter.remove();
        }

        // Buscar el main element o crear uno si no existe
        let mainElement = pageWrapper.querySelector('main');
        if (!mainElement) {
            // Si no hay main, crear uno que contenga todo el contenido actual excepto scripts
            const scripts = pageWrapper.querySelectorAll('script');
            const mainContent = Array.from(pageWrapper.children).filter(child => 
                child.tagName !== 'SCRIPT' && !child.classList.contains('footer')
            );
            
            mainElement = document.createElement('main');
            mainContent.forEach(element => {
                mainElement.appendChild(element);
            });
            
            pageWrapper.appendChild(mainElement);
        }

        // Generar y insertar el footer
        const footerHTML = this.generateFooterHTML();
        mainElement.insertAdjacentHTML('beforeend', footerHTML);

        // Configurar el formulario de contacto
        this.setupContactForm();
    }

    /**
     * Configura la funcionalidad del formulario de contacto
     */
    setupContactForm() {
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleContactFormSubmit(e);
            });
        }
    }

    /**
     * Maneja el envío del formulario de contacto
     */
    handleContactFormSubmit(event) {
        const formData = new FormData(event.target);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            message: formData.get('message')
        };

        // Crear mailto link con los datos del formulario
        const subject = encodeURIComponent(`Contacto desde Pura Vida Medical Homes - ${data.name}`);
        const body = encodeURIComponent(
            `Nombre: ${data.name}\n` +
            `Email: ${data.email}\n\n` +
            `Mensaje:\n${data.message}\n\n` +
            `---\n` +
            `Enviado desde Pura Vida Medical Homes`
        );
        
        const mailtoLink = `mailto:${this.contactInfo.email}?subject=${subject}&body=${body}`;
        window.location.href = mailtoLink;

        // Mostrar mensaje de confirmación
        const button = event.target.querySelector('button[type="submit"]');
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fal fa-check mr-2"></i>¡Mensaje Preparado!';
        button.disabled = true;

        setTimeout(() => {
            button.innerHTML = originalText;
            button.disabled = false;
            event.target.reset();
        }, 3000);
    }

    /**
     * Inicializa el footer cuando el DOM está listo
     */
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.insertFooter();
            });
        } else {
            this.insertFooter();
        }
    }

    /**
     * Método para actualizar información de contacto
     */
    updateContactInfo(newInfo) {
        this.contactInfo = { ...this.contactInfo, ...newInfo };
    }

    /**
     * Método estático para uso global fácil
     */
    static initialize() {
        const footerManager = new FooterManager();
        footerManager.init();
        return footerManager;
    }
}

// Auto-inicialización cuando se carga el script
FooterManager.initialize();

// Exportar para uso manual si es necesario
window.FooterManager = FooterManager;