# 🚀 Meta Ads Creative Assistant - Guía de Configuración Rápida

## ¿Qué es esta aplicación?

Una plataforma completa para analizar creativos publicitarios de Meta Ads usando inteligencia artificial. Incluye:

- **Análisis automático de creativos** con Gemini AI
- **Dashboard de rendimiento** para campañas
- **Gestión de clientes** y cuentas de Meta
- **Importación de datos** desde múltiples fuentes

## 🏁 Inicio Rápido

### 1. Configurar la Base de Datos
```bash
./setup-postgres.sh
```

### 2. Instalar Dependencias
```bash
# Backend
cd backend && npm install && cd ..

# Frontend  
npm install
```

### 3. Configurar Variables de Entorno
```bash
# Backend
cp backend/.env.example backend/.env
# Editar backend/.env con tus configuraciones

# Frontend
echo "GEMINI_API_KEY=tu_api_key_aqui" > .env.local
```

### 4. Iniciar la Aplicación
```bash
./start-app.sh
```

### 5. Abrir en el Navegador
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## 📋 Scripts Disponibles

- `./setup-postgres.sh` - Configurar PostgreSQL automáticamente
- `./verify-setup.sh` - Verificar que todo esté configurado
- `./start-app.sh` - Iniciar frontend y backend juntos
- `./project-status.sh` - Ver estado actual del proyecto

## 🔧 Configuración Avanzada

### Variables de Entorno Importantes

**Backend (`backend/.env`):**
```env
GEMINI_API_KEY=tu_gemini_api_key    # Para análisis de IA
DATABASE_URL=postgresql://...        # Conexión a PostgreSQL
JWT_SECRET=secret_muy_seguro         # Para autenticación
FRONTEND_URL=http://localhost:5173   # URL del frontend
```

**Frontend (`.env.local`):**
```env
GEMINI_API_KEY=tu_gemini_api_key    # Mismo que el backend
```

### Obtener API Key de Gemini

1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crea una nueva API key
3. Cópiala en las variables de entorno

## 🎯 Funcionalidades Principales

### 1. Análisis de Creativos
- Sube imágenes o videos publicitarios
- Obtén análisis automático de efectividad
- Recibe recomendaciones específicas por placement
- Evaluación de compatibilidad con Advantage+

### 2. Gestión de Clientes
- Crear y administrar clientes
- Asociar cuentas de Meta
- Historial de análisis por cliente

### 3. Importación de Datos
- Archivos Looker (Excel/CSV)
- Reportes de texto (TXT)
- Datos de rendimiento de campañas

### 4. Dashboard de Rendimiento
- Métricas de campaña
- Análisis de tendencias
- Reportes personalizados

## 🛠️ Desarrollo

### Estructura del Backend
```
backend/src/
├── config/         # Configuración
├── controllers/    # Lógica de endpoints
├── database/       # Conexión y migraciones
├── middleware/     # Middleware personalizado
├── routes/         # Definición de rutas
├── services/       # Servicios (Gemini, etc.)
├── types/          # Tipos TypeScript
└── server.ts       # Punto de entrada
```

### API Endpoints Principales
```
GET  /api/clients           # Listar clientes
POST /api/clients           # Crear cliente
POST /api/analyze/creative  # Analizar creativo
GET  /api/analyze/history/:clientId  # Historial
POST /api/import/looker     # Importar datos
```

### Comandos de Desarrollo
```bash
# Solo backend
cd backend && npm run dev

# Solo frontend
npm run dev

# Compilar backend
cd backend && npm run build

# Ver logs de base de datos
sudo tail -f /var/log/postgresql/postgresql-*-main.log
```

## 🔒 Seguridad

- Rate limiting (100 requests/15min)
- CORS configurado
- Validación de archivos
- JWT para autenticación
- Headers de seguridad

## 🚨 Solución de Problemas

### Error de conexión a PostgreSQL
```bash
sudo service postgresql restart
./setup-postgres.sh
```

### Error "Puerto ya en uso"
```bash
# Matar procesos en puertos 3001 y 5173
sudo pkill -f "node.*3001"
sudo pkill -f "vite.*5173"
```

### Verificar estado
```bash
./project-status.sh
```

## 📞 Soporte

Si tienes problemas:
1. Ejecuta `./verify-setup.sh` para diagnóstico
2. Revisa logs en las terminales
3. Verifica variables de entorno
4. Consulta la documentación detallada en README.md

---

**¡Listo para usar!** 🎉
