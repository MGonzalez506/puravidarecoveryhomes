# Server Configuration for Pura Vida Recovery Homes

Este directorio contiene toda la configuración necesaria para el servidor personalizado con integración de Cloudflare.

## Archivos Incluidos

### 1. `nginx-production.conf`
Configuración de Nginx para el entorno de producción:
- SSL/TLS configurado para HTTPS
- Headers de seguridad completos
- Caché optimizado para rendimiento
- Compresión gzip habilitada
- Redirecciones de HTTP a HTTPS y www a no-www
- Configuración para FontAwesome Pro
- Logging estructurado

### 2. `nginx-staging.conf` 
Configuración de Nginx para el entorno de staging:
- Autenticación básica para proteger el staging
- Configuración SSL menos estricta
- Sin caché para HTML (testing)
- Robots.txt que bloquea motores de búsqueda
- Logging separado

### 3. `deploy.sh`
Script automatizado de despliegue que:
- Maneja backups automáticos
- Despliega archivos con permisos correctos
- Configura Nginx automáticamente
- Valida configuración antes de aplicar
- Rollback automático en caso de error
- Logging y limpieza de archivos antiguos

## Configuración del Servidor

### Prerrequisitos
```bash
# Instalar Nginx
sudo apt update
sudo apt install nginx

# Instalar herramientas necesarias
sudo apt install htpasswd curl

# Crear directorios necesarios
sudo mkdir -p /var/www
sudo mkdir -p /var/backups/web
sudo mkdir -p /etc/ssl/certs
sudo mkdir -p /etc/ssl/private
```

### Configuración SSL/TLS

#### Para Producción (con Cloudflare)
1. Obtener certificados de Cloudflare Origin Certificate
2. Guardar certificados en:
   ```
   /etc/ssl/certs/puravidarecoveryhomes.com.pem
   /etc/ssl/private/puravidarecoveryhomes.com.key
   ```

#### Para Staging (certificado self-signed)
```bash
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/staging.puravidarecoveryhomes.com.key \
  -out /etc/ssl/certs/staging.puravidarecoveryhomes.com.pem \
  -subj "/C=CR/ST=SanJose/L=SanJose/O=PuraVidaRecovery/CN=staging.puravidarecoveryhomes.com"
```

### Configuración de Autenticación para Staging
```bash
# Crear archivo de usuarios para staging
sudo htpasswd -c /etc/nginx/.htpasswd staging
```

### Deployment

#### Despliegue Manual
```bash
# Copiar archivos de configuración al servidor
scp server-config/* user@your-server:/path/to/project/

# En el servidor, ejecutar deployment
cd /path/to/project
sudo ./deploy.sh staging    # Para staging
sudo ./deploy.sh production # Para producción
```

#### Despliegue Automático (vía GitHub Actions)
El CI/CD pipeline ya está configurado para usar estos archivos automáticamente.

## Variables de Entorno Requeridas en GitHub

Para que el deployment automático funcione, configurar estos secrets en GitHub:

```
HOST_STAGING=your-staging-server-ip
HOST_PRODUCTION=your-production-server-ip
USERNAME=your-ssh-username
SSH_KEY=your-private-ssh-key

CLOUDFLARE_API_TOKEN=your-cloudflare-api-token
CLOUDFLARE_ZONE_ID=your-zone-id
```

## Estructura de Directorios en el Servidor

```
/var/www/
├── puravidarecoveryhomes.com/          # Producción
│   ├── index.html
│   ├── about.html
│   ├── contact.html
│   ├── assets/
│   └── ...
├── staging.puravidarecoveryhomes.com/  # Staging
│   ├── index.html
│   ├── about.html
│   ├── contact.html
│   ├── assets/
│   └── ...

/var/backups/web/
├── puravidarecoveryhomes.com_20240101_120000/
├── staging.puravidarecoveryhomes.com_20240101_110000/
└── ...

/var/log/nginx/
├── puravidarecoveryhomes.com_access.log
├── puravidarecoveryhomes.com_error.log
├── staging.puravidarecoveryhomes.com_access.log
└── staging.puravidarecoveryhomes.com_error.log
```

## Configuración de Cloudflare

### DNS Records
```
A    puravidarecoveryhomes.com         → your-server-ip
A    www.puravidarecoveryhomes.com     → your-server-ip
A    staging.puravidarecoveryhomes.com → your-server-ip
```

### SSL/TLS Settings
- SSL/TLS encryption mode: **Full (strict)**
- Always Use HTTPS: **On**
- Automatic HTTPS Rewrites: **On**
- Minimum TLS Version: **1.2**

### Performance Settings
- Caching Level: **Standard**
- Browser Cache TTL: **4 hours**
- Always Online: **On**

## Monitoreo y Logs

### Revisar logs en tiempo real
```bash
# Logs de acceso
sudo tail -f /var/log/nginx/puravidarecoveryhomes.com_access.log

# Logs de errores
sudo tail -f /var/log/nginx/puravidarecoveryhomes.com_error.log

# Logs del sistema Nginx
sudo tail -f /var/log/nginx/error.log
```

### Comandos útiles
```bash
# Verificar estado de Nginx
sudo systemctl status nginx

# Recargar configuración
sudo systemctl reload nginx

# Reiniciar Nginx
sudo systemctl restart nginx

# Verificar configuración
sudo nginx -t

# Verificar sitios habilitados
sudo nginx -T | grep server_name
```

## Troubleshooting

### Problemas comunes

1. **Error 502 Bad Gateway**: Verificar que el servidor web esté ejecutándose
2. **Error 403 Forbidden**: Verificar permisos de archivos y directorios
3. **SSL Certificate Error**: Verificar rutas de certificados en configuración
4. **Staging no accesible**: Verificar configuración de basic auth

### Rollback en caso de problemas
```bash
# El script de deployment crea backups automáticamente
sudo cp -r /var/backups/web/puravidarecoveryhomes.com_YYYYMMDD_HHMMSS/* /var/www/puravidarecoveryhomes.com/
sudo systemctl reload nginx
```

## Seguridad

### Recomendaciones
- Mantener Nginx actualizado
- Revisar logs regularmente
- Usar fail2ban para protección contra ataques de fuerza bruta
- Configurar firewall (ufw) para permitir solo puertos necesarios (80, 443, SSH)
- Mantener backups regulares
- Monitorear uso de recursos del servidor

### Comandos de seguridad básica
```bash
# Configurar firewall básico
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Instalar fail2ban (opcional)
sudo apt install fail2ban
sudo systemctl enable fail2ban
```