# 🌿 Pura Vida Medical Stays

> Servicios especializados de hospitalidad médica en San José, Costa Rica

[![CI/CD Pipeline](https://github.com/MGonzalez506/puravidarecoveryhomes/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/MGonzalez506/puravidarecoveryhomes/actions/workflows/ci-cd.yml)
[![Lighthouse CI](https://github.com/MGonzalez506/puravidarecoveryhomes/actions/workflows/lighthouse.yml/badge.svg)](https://github.com/MGonzalez506/puravidarecoveryhomes/actions/workflows/lighthouse.yml)
[![CodeQL](https://github.com/MGonzalez506/puravidarecoveryhomes/actions/workflows/codeql.yml/badge.svg)](https://github.com/MGonzalez506/puravidarecoveryhomes/actions/workflows/codeql.yml)

## 🚀 Descripción

Website profesional para Pura Vida Medical Stays, empresa especializada en servicios de hospitalidad médica que ofrece alojamiento confortable y transporte seguro para pacientes que vienen a Costa Rica para tratamientos médicos, cirugías y procedimientos dentales.

### ✨ Características

- 🎨 **Diseño Moderno**: Interfaz limpia y profesional optimizada para conversiones
- 📱 **Responsive Design**: Experiencia perfecta en todos los dispositivos
- ⚡ **Alto Rendimiento**: Optimizado para velocidad y SEO
- 🔒 **Seguro**: Implementación de mejores prácticas de seguridad
- ♿ **Accesible**: Cumple con estándares WCAG 2.1 AA
- 🌐 **Multiidioma**: Preparado para español e inglés
- 📊 **Analytics**: Integración con Google Analytics y métricas de rendimiento

## 🛠️ Stack Tecnológico

### Frontend
- **HTML5**: Estructura semántica y accesible
- **CSS3**: Diseño modular con CSS Custom Properties
- **JavaScript ES6+**: Funcionalidad moderna y eficiente
- **FontAwesome Pro 7.1.0**: Iconografía profesional

### Herramientas de Desarrollo
- **Vite**: Build tool ultrarrápido
- **ESLint**: Linting de código
- **Prettier**: Formateo de código
- **Stylelint**: Linting de CSS
- **Lighthouse**: Auditorías de rendimiento

### CI/CD & Deployment
- **GitHub Actions**: Pipelines automatizados
- **Firebase Hosting**: Hosting de producción
- **Surge.sh**: Staging environment
- **Lighthouse CI**: Monitoreo continuo de rendimiento

## 📁 Estructura del Proyecto

```
puravidarecoveryhomes/
├── .github/                    # GitHub Actions workflows
│   └── workflows/
│       ├── ci-cd.yml          # Pipeline principal
│       └── lighthouse.yml     # Auditorías de rendimiento
├── src/                       # Código fuente
│   ├── assets/               # Assets estáticos
│   │   ├── fonts/           # Fuentes (FontAwesome Pro)
│   │   └── images/          # Imágenes optimizadas
│   ├── css/                 # Estilos modulares
│   │   ├── reset.css        # Reset CSS
│   │   ├── variables.css    # Custom Properties
│   │   ├── base.css         # Estilos base
│   │   ├── components.css   # Componentes UI
│   │   ├── layout.css       # Layout y estructura
│   │   ├── responsive.css   # Media queries
│   │   └── pages/          # Estilos específicos por página
│   ├── js/                 # JavaScript modular
│   │   ├── utils.js        # Utilidades
│   │   ├── navigation.js   # Navegación
│   │   ├── forms.js        # Manejo de formularios
│   │   └── main.js         # Aplicación principal
│   ├── index.html          # Página de inicio
│   ├── about.html          # Sobre nosotros
│   └── contact.html        # Contacto
├── dist/                   # Build de producción (generado)
├── package.json           # Dependencias y scripts
├── vite.config.js         # Configuración de Vite
├── lighthouserc.json      # Configuración de Lighthouse
└── README.md             # Documentación
```

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js >= 18.0.0
- npm >= 8.0.0

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/MGonzalez506/puravidarecoveryhomes.git
   cd puravidarecoveryhomes
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar FontAwesome Pro**
   ```bash
   # Copiar archivos de FontAwesome Pro 7.1.0 a:
   # src/assets/fonts/fontawesome/css/
   # src/assets/fonts/fontawesome/webfonts/
   ```

4. **Iniciar servidor de desarrollo**
   ```bash
   npm run dev
   ```

5. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 📋 Scripts Disponibles

### Desarrollo
```bash
npm run dev          # Servidor de desarrollo
npm run preview      # Preview del build
npm start           # Alias para npm run dev
```

### Build y Optimización
```bash
npm run build       # Build de producción
npm run clean       # Limpiar directorio dist
npm run optimize    # Build optimizado con imágenes
```

### Calidad de Código
```bash
npm run lint        # Linting con ESLint
npm run lint:fix    # Fix automático de issues
npm run format      # Formatear con Prettier
npm run format:check # Verificar formato
```

### Testing y Validación
```bash
npm run test                    # Ejecutar tests
npm run test:coverage          # Tests con coverage
npm run validate:html          # Validar HTML
npm run validate:css           # Validar CSS
npm run validate:accessibility # Tests de accesibilidad
npm run lighthouse            # Auditoría de Lighthouse
```

### Deployment
```bash
npm run deploy:staging  # Deploy a staging
npm run deploy:prod    # Deploy a producción
```

### Análisis y Seguridad
```bash
npm run analyze     # Análisis de bundle
npm run security   # Auditoría de seguridad
```

## 🌐 Deployment

### Staging
- **URL**: https://staging-puravidarecoveryhomes.surge.sh
- **Deploy**: Automático en push a `develop`
- **Proveedor**: Surge.sh

### Producción
- **URL**: https://puravidarecoveryhomes.com
- **Deploy**: Automático en push a `main`
- **Proveedor**: Firebase Hosting

## 🔧 Configuración

### Variables de Entorno

Crear archivo `.env` para configuraciones locales:

```env
# Analytics
GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID

# APIs
CONTACT_FORM_ENDPOINT=https://formspree.io/f/your-form-id

# Firebase (para producción)
FIREBASE_API_KEY=your-api-key
FIREBASE_PROJECT_ID=pura-vida-recovery-homes
```

### Secrets de GitHub

Configurar en GitHub Settings > Secrets:

```
SURGE_TOKEN                           # Token de Surge.sh
FIREBASE_SERVICE_ACCOUNT_PURA_VIDA   # Service Account de Firebase
LHCI_GITHUB_APP_TOKEN                # Token de Lighthouse CI
```

## 📊 Métricas de Rendimiento

### Objetivos de Lighthouse

- **Performance**: ≥ 80
- **Accessibility**: ≥ 95  
- **Best Practices**: ≥ 85
- **SEO**: ≥ 90

### Bundle Size Limits

- **JavaScript**: ≤ 50KB
- **CSS**: ≤ 30KB

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

### Convenciones de Código

- **JavaScript**: Standard + Prettier
- **CSS**: BEM methodology + Stylelint
- **HTML**: Semantic HTML5 + Accessibility
- **Commits**: Conventional Commits

## 🔒 Seguridad

- Auditorías automáticas con `npm audit` y Snyk
- HTTPS enforced
- CSP headers configurados
- Validación de inputs
- Sanitización de datos

## 📈 Monitoreo

- **Performance**: Lighthouse CI en cada deploy
- **Uptime**: Firebase Hosting monitoring
- **Analytics**: Google Analytics 4
- **Errors**: Error tracking integrado

## 📜 Licencia

Este proyecto es de uso privado. Todos los derechos reservados por Pura Vida Medical Stays.

## 📞 Contacto

**Pura Vida Medical Stays**
- 🌐 Website: [https://puravidarecoveryhomes.com](https://puravidarecoveryhomes.com)
- 📧 Email: [info@puravidarecoveryhomes.com](mailto:info@puravidarecoveryhomes.com)
- 📱 Teléfono: [+506 2555-1234](tel:+50625551234)
- 📍 Ubicación: San José, Costa Rica

## 🙏 Agradecimientos

- FontAwesome Pro por la iconografía
- Vite por las herramientas de build
- Firebase por el hosting confiable
- GitHub Actions por CI/CD

---

**🌿 "Servicios de hospitalidad médica en el paraíso de Costa Rica" 🌿**
