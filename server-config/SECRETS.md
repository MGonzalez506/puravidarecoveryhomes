# Secrets Configuration for GitHub Actions

Para que el deployment automático funcione correctamente, es necesario configurar los siguientes secrets en GitHub.

## Cómo configurar los secrets

1. Ve a tu repositorio en GitHub
2. Click en **Settings** → **Secrets and variables** → **Actions**
3. Click en **New repository secret**
4. Agrega cada secret con su respectivo valor

## Secrets requeridos

### SSH Configuration
```
HOST_STAGING
Descripción: IP address o hostname del servidor de staging
Ejemplo: 192.168.1.100 o staging.puravidarecoveryhomes.com

HOST_PRODUCTION  
Descripción: IP address o hostname del servidor de producción
Ejemplo: 192.168.1.101 o puravidarecoveryhomes.com

USERNAME
Descripción: Usuario SSH para deployment
Valor: deploy

SSH_KEY
Descripción: Private key SSH para autenticación sin password
Cómo obtener: Generar en el servidor con:
  ssh-keygen -t rsa -b 4096 -C "deploy@puravidarecoveryhomes"
  cat ~/.ssh/id_rsa  # Este es el contenido que va en SSH_KEY
```

### Cloudflare Configuration
```
CLOUDFLARE_API_TOKEN
Descripción: Token de API de Cloudflare para purgar caché
Cómo obtener:
  1. Ve a Cloudflare Dashboard
  2. My Profile → API Tokens
  3. Create Token → Custom token
  4. Permissions: Zone:Zone:Read, Zone:Cache Purge:Edit
  5. Zone Resources: Include - Specific zone - puravidarecoveryhomes.com

CLOUDFLARE_ZONE_ID
Descripción: ID de la zona de Cloudflare
Cómo obtener:
  1. Ve a Cloudflare Dashboard
  2. Select your domain (puravidarecoveryhomes.com)
  3. Sidebar derecho, bajo "API" → Zone ID
```

## Configuración del servidor

### 1. Preparar el servidor
Ejecutar en el servidor (Ubuntu/Debian):
```bash
# Descargar scripts de configuración
git clone https://github.com/tu-usuario/puravidarecoveryhomes.git
cd puravidarecoveryhomes/server-config

# Ejecutar configuración inicial
sudo ./server-setup.sh
```

### 2. Generar claves SSH para deployment
```bash
# En el servidor, como usuario deploy
sudo su - deploy
ssh-keygen -t rsa -b 4096 -C "deploy@puravidarecoveryhomes"

# Mostrar clave pública (para agregar a authorized_keys si es necesario)
cat ~/.ssh/id_rsa.pub

# Mostrar clave privada (para copiar a GitHub Secrets)
cat ~/.ssh/id_rsa
```

### 3. Configurar SSL para producción
```bash
# Si usas Cloudflare Origin Certificates
# Descargar los certificados de Cloudflare y guardarlos como:
sudo cp origin-cert.pem /etc/ssl/certs/puravidarecoveryhomes.com.pem
sudo cp private-key.key /etc/ssl/private/puravidarecoveryhomes.com.key

# Establecer permisos correctos
sudo chmod 644 /etc/ssl/certs/puravidarecoveryhomes.com.pem
sudo chmod 600 /etc/ssl/private/puravidarecoveryhomes.com.key
sudo chown root:root /etc/ssl/certs/puravidarecoveryhomes.com.pem
sudo chown root:root /etc/ssl/private/puravidarecoveryhomes.com.key
```

## Configuración de DNS en Cloudflare

Configurar los siguientes registros DNS:

```
Type: A
Name: @
Content: [IP_DEL_SERVIDOR]
Proxy status: Proxied (orange cloud)

Type: A  
Name: www
Content: [IP_DEL_SERVIDOR]
Proxy status: Proxied (orange cloud)

Type: A
Name: staging
Content: [IP_DEL_SERVIDOR]
Proxy status: Proxied (orange cloud)
```

## Testing del deployment

### 1. Test manual del deployment
```bash
# En el servidor
cd /path/to/project
sudo ./deploy.sh staging

# Verificar que el sitio esté funcionando
curl -I https://staging.puravidarecoveryhomes.com
```

### 2. Test del deployment automático
```bash
# En tu máquina local, hacer un push al repositorio
git add .
git commit -m "Test deployment"
git push origin main

# Revisar GitHub Actions en:
# https://github.com/tu-usuario/puravidarecoveryhomes/actions
```

## Verificación de secrets

Para verificar que los secrets están correctamente configurados:

### SSH Connection Test
```bash
# Desde GitHub Actions, deberías poder hacer:
ssh -i $SSH_KEY $USERNAME@$HOST_STAGING "echo 'SSH connection successful'"
```

### Cloudflare API Test
```bash
# Test de conexión a API de Cloudflare
curl -X GET "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json"
```

## Troubleshooting

### Error: Host key verification failed
```bash
# En el servidor, agregar GitHub a known_hosts
ssh-keyscan github.com >> ~/.ssh/known_hosts
```

### Error: Permission denied (publickey)
```bash
# Verificar que la clave SSH está correctamente configurada
# En el servidor como deploy user:
cat ~/.ssh/authorized_keys
# Debe contener la clave pública correspondiente al SSH_KEY
```

### Error: Nginx configuration test failed
```bash
# En el servidor, verificar configuración
sudo nginx -t
# Revisar logs para más detalles
sudo tail -f /var/log/nginx/error.log
```

### Error: Cloudflare API authentication failed
- Verificar que el token tiene los permisos correctos
- Verificar que el Zone ID es correcto
- Verificar que el token no ha expirado

## Seguridad

### Recomendaciones importantes:
1. **SSH Keys**: Usar claves SSH dedicadas solo para deployment
2. **Limited Permissions**: El usuario deploy solo tiene permisos necesarios
3. **Firewall**: Solo puertos 22, 80, 443 abiertos
4. **fail2ban**: Protección automática contra ataques de fuerza bruta
5. **Basic Auth**: Staging protegido con autenticación básica
6. **SSL/TLS**: Todas las conexiones encriptadas
7. **Regular Updates**: Mantener el servidor actualizado

### Comandos útiles para monitoreo:
```bash
# Ver intentos de login fallidos
sudo journalctl -u ssh | grep "Failed password"

# Ver status de fail2ban
sudo fail2ban-client status

# Monitorear logs en tiempo real
sudo tail -f /var/log/nginx/*_error.log

# Ver uso de recursos
htop
df -h
```