# 🚀 INSTRUCCIONES COMPLETAS PARA INSTALAR EN CASAOS

## 📋 Lo que necesitas antes de empezar:

1. **CasaOS** funcionando correctamente
2. **MariaDB** instalado y configurado en CasaOS (o accesible en red)
3. Acceso al **Terminal** de CasaOS
4. Conexión a Internet

---

## 🎯 PASOS DE INSTALACIÓN

### PASO 1: Acceder al Terminal de CasaOS

1. Abre tu panel de CasaOS en el navegador
2. Ve a **Aplicaciones** → **Terminal** (o usa SSH si prefieres)
3. Verifica que estés en el directorio home:

```bash
cd ~
pwd
```

### PASO 2: Descargar el Repositorio

```bash
# Clonar el repositorio desde GitHub
git clone https://github.com/compusom/version5.git

# Entrar al directorio del proyecto
cd version5

# Verificar que se descargó correctamente
ls -la
```

### PASO 3: Ejecutar la Instalación Automática

```bash
# Dar permisos de ejecución al script
chmod +x install.sh

# Ejecutar la instalación (esto tomará varios minutos)
./install.sh
```

**Durante la instalación te preguntará:**

```
📊 Configuración de Base de Datos:
Host de MariaDB [192.168.1.234]: [ENTER para usar el valor por defecto]
Puerto [3306]: [ENTER para usar el valor por defecto]
Nombre de la base de datos [casaos]: [ENTER para usar el valor por defecto]
Usuario [casaos]: [ENTER para usar el valor por defecto]
Contraseña: [ESCRIBE tu contraseña de MariaDB]
```

### PASO 4: Verificar la Instalación

```bash
# Verificar que los servicios estén corriendo
./check-status.sh
```

Deberías ver algo como:
```
📊 Estado de Meta Ads Creative Assistant:
==================================================
┌─────────────────────┬────┬─────────┬──────┬─────────┬────────┬─────────────┐
│ App name            │ id │ mode    │ pid  │ status  │ restart│ uptime      │
├─────────────────────┼────┼─────────┼──────┼─────────┼────────┼─────────────┤
│ meta-ads-frontend   │ 0  │ fork    │ 1234 │ online  │ 0      │ 0s          │
│ meta-ads-backend    │ 1  │ fork    │ 1235 │ online  │ 0      │ 0s          │
└─────────────────────┴────┴─────────┴──────┴─────────┴────────┴─────────────┘

🌐 URLs de acceso:
   Frontend: http://192.168.1.XXX:5173
   Backend:  http://192.168.1.XXX:3001
```

---

## 🌐 ACCEDER A LA APLICACIÓN

Una vez instalado correctamente:

- **Frontend (Interfaz de usuario)**: `http://tu-ip-casaos:5173`
- **Backend (API)**: `http://tu-ip-casaos:3001`

Reemplaza `tu-ip-casaos` con la IP real de tu servidor CasaOS.

---

## 🛠️ COMANDOS ÚTILES PARA GESTIONAR LA APLICACIÓN

### Comandos Básicos:
```bash
cd ~/version5

# Ver estado de los servicios
./check-status.sh

# Iniciar servicios (si están detenidos)
./start.sh

# Detener servicios
./stop.sh

# Ver logs en tiempo real
./logs.sh
```

### Comandos Avanzados con PM2:
```bash
# Ver estado detallado
pm2 status

# Reiniciar un servicio específico
pm2 restart meta-ads-frontend
pm2 restart meta-ads-backend

# Reiniciar todos los servicios
pm2 restart all

# Ver logs de un servicio específico
pm2 logs meta-ads-frontend
pm2 logs meta-ads-backend

# Detener todos los servicios
pm2 stop all

# Eliminar servicios de PM2 (¡cuidado!)
pm2 delete all
```

---

## ⚙️ CONFIGURACIÓN ADICIONAL

### 1. Configurar API Keys (Opcional pero Recomendado)

```bash
# Editar configuración del backend
nano backend/.env
```

Busca estas líneas y agrega tus API keys:
```env
# API Keys (configurar para funcionalidad completa)
GEMINI_API_KEY=tu_api_key_de_gemini_aqui
META_APP_ID=tu_app_id_de_meta
META_APP_SECRET=tu_app_secret_de_meta
```

Después de editar:
```bash
# Reiniciar el backend para aplicar cambios
pm2 restart meta-ads-backend
```

### 2. Configurar Firewall (Si es necesario)

```bash
# Permitir puertos en el firewall
sudo ufw allow 5173/tcp  # Frontend
sudo ufw allow 3001/tcp  # Backend
```

---

## 🆘 SOLUCIÓN DE PROBLEMAS COMUNES

### Problema 1: Los servicios no inician
```bash
# Ver logs para identificar el error
pm2 logs

# Verificar puertos ocupados
netstat -tlnp | grep :5173
netstat -tlnp | grep :3001

# Si están ocupados, cambiar puertos en configuración
nano frontend/.env  # Cambiar VITE_PORT=5174
nano backend/.env   # Cambiar PORT=3002
```

### Problema 2: Error de conexión a la base de datos
```bash
# Verificar configuración
nano backend/.env

# Probar conexión manual a MariaDB
mysql -h 192.168.1.234 -u casaos -p casaos

# Si no funciona, verificar que MariaDB esté corriendo
# y que las credenciales sean correctas
```

### Problema 3: "Command not found" al ejecutar scripts
```bash
# Dar permisos de ejecución
chmod +x *.sh

# O ejecutar directamente con bash
bash install.sh
bash start.sh
```

### Problema 4: Página no carga en el navegador
```bash
# Verificar que los servicios estén corriendo
pm2 status

# Verificar la IP correcta de tu CasaOS
hostname -I

# Verificar que no haya firewall bloqueando
sudo ufw status
```

---

## 🔄 ACTUALIZAR LA APLICACIÓN

Para actualizar a una nueva versión:

```bash
cd ~/version5

# Detener servicios
./stop.sh

# Actualizar código desde GitHub
git pull origin main

# Reinstalar dependencias (si es necesario)
./install.sh

# O solo reiniciar servicios si no hay cambios mayores
./start.sh
```

---

## 📊 MONITOREO

### Ver uso de recursos:
```bash
# Uso de CPU y memoria por PM2
pm2 monit

# Uso general del sistema
htop
```

### Ver logs históricos:
```bash
# Logs guardados en archivos
tail -f logs/frontend-combined.log
tail -f logs/backend-combined.log
```

---

## ✅ VERIFICACIÓN FINAL

Tu instalación está completa cuando:

1. ✅ `./check-status.sh` muestra ambos servicios "online"
2. ✅ Puedes acceder al frontend en `http://tu-ip:5173`
3. ✅ La API responde en `http://tu-ip:3001`
4. ✅ Los logs no muestran errores críticos

**¡Tu Meta Ads Creative Assistant está listo para usar!** 🎉

---

## 📞 SOPORTE

Si encuentras problemas:

1. Revisa los logs: `./logs.sh` o `pm2 logs`
2. Verifica la configuración de red y MariaDB
3. Consulta este documento de solución de problemas
4. Crea un issue en el repositorio de GitHub si es necesario

---

**Repositorio:** https://github.com/compusom/version5
