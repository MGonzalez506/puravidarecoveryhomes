/**
 * Top Navigation Manager - Pura Vida Medical Homes
 * Sistema centralizado para generar la barra de navegación superior
 * en todas las páginas del sitio web
 */

class TopNavigationManager {
    constructor() {
        this.navigationItems = [
            {
                id: 'inicio',
                href: 'index.html',
                text: 'Inicio',
                title: 'Página de inicio'
            },
            {
                id: 'contacto',
                href: 'contacto.html', 
                text: 'Contacto',
                title: 'Contacto para coordinación'
            }
        ];
    }

    /**
     * Determina qué página está activa basándose en la URL actual
     */
    getCurrentPage() {
        const currentPath = window.location.pathname;
        const fileName = currentPath.split('/').pop() || 'index.html';
        
        // Mapeo de archivos a IDs de navegación
        const pageMapping = {
            'index.html': 'inicio',
            '': 'inicio', // Cuando no hay archivo específico
            'contacto.html': 'contacto'
        };

        return pageMapping[fileName] || 'inicio';
    }

    /**
     * Genera el HTML de la navegación superior
     */
    generateNavigationHTML() {
        const currentPage = this.getCurrentPage();
        
        let navigationHTML = `
            <nav id="top-nav">
                <div class="container">
                    <ul>`;

        this.navigationItems.forEach(item => {
            const isActive = item.id === currentPage;
            const activeClass = isActive ? ' class="current"' : '';
            
            navigationHTML += `
                        <li${activeClass}>
                            <a href="${item.href}" title="${item.title}">
                                <span>${item.text}</span>
                            </a>
                        </li>`;
        });

        navigationHTML += `
                    </ul>
                </div>
            </nav>`;

        return navigationHTML;
    }

    /**
     * Inserta la navegación en el DOM
     */
    insertNavigation() {
        const pageWrapper = document.getElementById('page-wrapper');
        if (!pageWrapper) {
            console.error('TopNavigationManager: No se encontró el elemento #page-wrapper');
            return;
        }

        // Verificar si ya existe navegación para evitar duplicados
        const existingNav = document.getElementById('top-nav');
        if (existingNav) {
            existingNav.remove();
        }

        // Generar y insertar la navegación
        const navigationHTML = this.generateNavigationHTML();
        pageWrapper.insertAdjacentHTML('afterbegin', navigationHTML);
    }

    /**
     * Inicializa la navegación cuando el DOM está listo
     */
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.insertNavigation();
            });
        } else {
            this.insertNavigation();
        }
    }

    /**
     * Método para agregar nuevos elementos de navegación
     * (útil para futuras expansiones)
     */
    addNavigationItem(item) {
        this.navigationItems.push(item);
    }

    /**
     * Método para habilitar/deshabilitar elementos específicos
     */
    toggleNavigationItem(itemId, enabled = true) {
        const item = this.navigationItems.find(nav => nav.id === itemId);
        if (item) {
            item.enabled = enabled;
        }
    }

    /**
     * Método estático para uso global fácil
     */
    static initialize() {
        const topNav = new TopNavigationManager();
        topNav.init();
        return topNav;
    }
}

// Auto-inicialización cuando se carga el script
TopNavigationManager.initialize();

// Exportar para uso manual si es necesario
window.TopNavigationManager = TopNavigationManager;

// Agregar nuevo elemento de navegación para la página de contacto
this.navigationItems.push({
            id: 'contacto',
            href: 'contacto.html',
            title: 'Contáctanos',
            text: 'Contacto'
        });