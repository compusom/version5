# 🚀 Guía de Instalación - Meta Ads Creative Assistant

Esta guía te ayudará a instalar la aplicación completa en tu servidor CasaOS.

## 📋 Requisitos Previos

- **CasaOS** instalado y funcionando
- **MariaDB** instalado en CasaOS o disponible en red
- **Node.js 18+** (se instalará automáticamente si no está disponible)
- Acceso a terminal en CasaOS

## 🛠️ Instalación Paso a Paso

### 1. Acceder al Terminal de CasaOS

1. Abre tu panel de CasaOS
2. Ve a **Terminal** o **SSH**
3. Asegúrate de estar en el directorio home:
```bash
cd ~
```

### 2. Descargar el Repositorio

```bash
# Clonar el repositorio
git clone https://github.com/compusom/version5.git

# Entrar al directorio
cd version5
```

### 3. Ejecutar la Instalación Automática

```bash
# Dar permisos de ejecución al script
chmod +x install.sh

# Ejecutar la instalación
./install.sh
```

El script automáticamente:
- ✅ Verificará e instalará Node.js si es necesario
- ✅ Instalará las dependencias del frontend y backend
- ✅ Configurará las variables de entorno
- ✅ Compilará los proyectos
- ✅ Configurará los servicios

### 4. Configuración de Base de Datos

Durante la instalación, se te preguntará por la configuración de MariaDB:

```
📊 Configuración de Base de Datos:
Host de MariaDB [localhost]: 192.168.1.234
Puerto [3306]: 3306
Nombre de la base de datos [casaos]: casaos
Usuario [casaos]: casaos
Contraseña: [tu_contraseña]
```

### 5. Verificar la Instalación

Una vez completada la instalación:

```bash
# Verificar que los servicios estén corriendo
./check-status.sh

# O verificar manualmente:
pm2 status
```

Deberías ver:
- ✅ `meta-ads-frontend` - corriendo en puerto 5173
- ✅ `meta-ads-backend` - corriendo en puerto 3001

## 🌐 Acceso a la Aplicación

Una vez instalado correctamente:

- **Frontend**: `http://tu-casaos-ip:5173`
- **Backend API**: `http://tu-casaos-ip:3001`

## 🔧 Gestión de Servicios

### Comandos Útiles con PM2

```bash
# Ver estado de los servicios
pm2 status

# Reiniciar servicios
pm2 restart meta-ads-frontend
pm2 restart meta-ads-backend

# Ver logs
pm2 logs meta-ads-frontend
pm2 logs meta-ads-backend

# Detener servicios
pm2 stop meta-ads-frontend
pm2 stop meta-ads-backend

# Iniciar servicios
pm2 start meta-ads-frontend
pm2 start meta-ads-backend
```

### Reinicio Automático

Los servicios están configurados para reiniciarse automáticamente al reiniciar el sistema.

## 📁 Estructura de Archivos

```
~/version5/
├── frontend/           # Aplicación React
├── backend/           # API Node.js
├── install.sh        # Script de instalación
├── start.sh          # Script para iniciar servicios
├── stop.sh           # Script para detener servicios
├── check-status.sh   # Verificar estado
└── ecosystem.config.js # Configuración PM2
```

## 🛡️ Configuración de Seguridad

### Firewall (Opcional pero Recomendado)

```bash
# Permitir puertos necesarios
sudo ufw allow 5173/tcp  # Frontend
sudo ufw allow 3001/tcp  # Backend API
```

### Variables de Entorno Importantes

Edita los archivos de configuración si es necesario:

```bash
# Configuración del frontend
nano frontend/.env

# Configuración del backend
nano backend/.env
```

## 🔄 Actualización

Para actualizar a una nueva versión:

```bash
cd ~/version5

# Detener servicios
./stop.sh

# Actualizar código
git pull origin main

# Reinstalar dependencias si es necesario
./install.sh

# Reiniciar servicios
./start.sh
```

## 🆘 Resolución de Problemas

### Problema: Los servicios no inician

```bash
# Verificar logs
pm2 logs

# Verificar puertos en uso
netstat -tlnp | grep :5173
netstat -tlnp | grep :3001
```

### Problema: Error de conexión a la base de datos

```bash
# Verificar configuración de MariaDB
nano backend/.env

# Probar conexión manual
mysql -h 192.168.1.234 -u casaos -p casaos
```

### Problema: Puertos ocupados

```bash
# Cambiar puertos en las configuraciones
nano frontend/.env  # VITE_PORT=5174
nano backend/.env   # PORT=3002

# Reiniciar servicios
pm2 restart all
```

## 📞 Soporte

Si encuentras algún problema:

1. Revisa los logs: `pm2 logs`
2. Verifica la configuración de red y base de datos
3. Consulta la documentación en el repositorio
4. Crea un issue en GitHub si es necesario

---

¡Tu aplicación Meta Ads Creative Assistant debería estar funcionando correctamente! 🎉
