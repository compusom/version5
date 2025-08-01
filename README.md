# Meta Ads Creative Assistant - Full Stack Application

Una aplicación completa para el análisis automatizado de creativos publicitarios de Meta Ads, con análisis de IA y gestión de datos de rendimiento.

## 🚀 Características

### Frontend (React + TypeScript)
- **Análisis de Creativos con IA**: Subida y análisis automático de imágenes/videos publicitarios
- **Dashboard de Rendimiento**: Visualización de métricas de campañas
- **Gestión de Clientes**: CRUD completo para clientes y cuentas de Meta
- **Importación de Datos**: Soporte para archivos Looker, Excel y TXT
- **Interfaz Multiidioma**: Español e inglés

### Backend (Node.js + Express + PostgreSQL)
- **API RESTful**: Endpoints seguros y bien documentados
- **Análisis con Gemini AI**: Integración con Google Gemini para análisis de creativos
- **Base de Datos PostgreSQL**: Persistencia robusta con migraciones automáticas
- **Manejo de Archivos**: Subida segura con validación
- **Rate Limiting & Seguridad**: Protección contra abusos

## 🛠️ Tecnologías

**Frontend:**
- React 19 + TypeScript
- Vite (build tool)
- CSS custom properties

**Backend:**
- Node.js + Express.js
- TypeScript
- PostgreSQL con pg
- Gemini AI (Google)
- Multer (file uploads)
- JWT, Helmet, CORS

## 📋 Prerrequisitos

- Node.js 18+
- PostgreSQL 13+
- API Key de Gemini AI (opcional para análisis)

## ⚡ Instalación Rápida

### 1. Configurar Base de Datos

```bash
# Ejecutar script de configuración automática
./setup-postgres.sh
```

### 2. Configurar Backend

```bash
cd backend
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Compilar TypeScript
npm run build

# Iniciar en modo desarrollo
npm run dev
```

### 3. Configurar Frontend

```bash
# En otra terminal, desde la raíz del proyecto
npm install

# Crear archivo .env.local para el frontend
echo "GEMINI_API_KEY=tu_api_key_aqui" > .env.local

# Iniciar frontend
npm run dev
```

### 4. Acceder a la Aplicación

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 🔧 Configuración

### Variables de Entorno del Backend (.env)

```env
# Configuración básica
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173

# Base de datos
DATABASE_URL=postgresql://postgres:password@localhost:5432/meta_ads_creative_db

# API Keys
GEMINI_API_KEY=tu_gemini_api_key
META_APP_ID=tu_meta_app_id
META_APP_SECRET=tu_meta_app_secret

# Seguridad
JWT_SECRET=tu_jwt_secret_muy_seguro
```

### Variables de Entorno del Frontend (.env.local)

```env
GEMINI_API_KEY=tu_gemini_api_key
```

## 📖 Uso de la API

### Endpoints Principales

```bash
# Clientes
GET    /api/clients                 # Listar clientes
POST   /api/clients                 # Crear cliente
PUT    /api/clients/:id             # Actualizar cliente
DELETE /api/clients/:id             # Eliminar cliente

# Análisis de Creativos
POST   /api/analyze/creative         # Analizar creativo con IA
GET    /api/analyze/history/:clientId # Historial de análisis

# Importación
POST   /api/import/looker           # Importar datos Looker
POST   /api/import/txt              # Importar reportes TXT
POST   /api/import/excel            # Importar archivos Excel

# Configuración
GET    /api/config/meta-api         # Obtener config Meta API
POST   /api/config/meta-api         # Guardar config Meta API
```

### Ejemplo de Análisis de Creativo

```bash
curl -X POST http://localhost:3001/api/analyze/creative \
  -F "creativeFile=@image.jpg" \
  -F "formatGroup=SQUARE_LIKE" \
  -F "language=es" \
  -F "context=Campaña de verano para ropa" \
  -F "isVideo=false"
```

## 🗄️ Estructura de la Base de Datos

```sql
-- Tablas principales
clients                 -- Información de clientes
performance_records     -- Datos de rendimiento de anuncios
analysis_results        -- Resultados de análisis de IA
import_batches         -- Historial de importaciones
meta_api_configs       -- Configuraciones de Meta API
uploaded_videos        -- Metadatos de videos
processed_hashes       -- Control de duplicados
application_logs       -- Logs de la aplicación
```

## 🎯 Funcionalidades Clave

### Análisis de Creativos con IA
- Evaluación automática de efectividad (0-10)
- Análisis de claridad visual
- Recomendaciones específicas por placement
- Evaluación de Advantage+ de Meta
- Identificación de etapa del funnel (TOFU/MOFU/BOFU)

### Gestión de Datos
- Importación desde múltiples fuentes
- Detección de duplicados
- Validación de datos
- Historial completo de cambios

### Integración con Meta
- Conexión con Meta Graph API
- Sincronización automática de datos
- Configuración segura de credenciales

## 🚀 Despliegue

### Desarrollo
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend  
npm run dev
```

### Producción
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
npm run build
# Servir archivos de dist/ con tu servidor web
```

## 🔒 Seguridad

- Rate limiting (100 requests/15min por IP)
- CORS configurado
- Validación de archivos subidos
- Sanitización de entrada
- Headers de seguridad con Helmet
- JWT para autenticación

## 🧪 Testing

```bash
# Backend tests
cd backend && npm test

# Frontend tests  
npm test
```

## 📊 Monitoreo

- Health check endpoint: `/health`
- Logs estructurados
- Métricas de base de datos
- Seguimiento de errores

## 🤝 Contribuir

1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📝 Notas de Desarrollo

- El backend funciona independientemente del frontend
- La API está diseñada para ser escalable
- El sistema detecta automáticamente creativos duplicados
- Los análisis se cachean para evitar llamadas innecesarias a la IA
- El frontend es compatible con diferentes resoluciones

## 🆘 Solución de Problemas

### Error de conexión a la base de datos
```bash
# Verificar que PostgreSQL esté ejecutándose
sudo service postgresql status

# Reiniciar si es necesario
sudo service postgresql restart
```

### Error de permisos de archivo
```bash
# Dar permisos al directorio de uploads
chmod 755 backend/uploads/
```

### Error de CORS
Verificar que `FRONTEND_URL` en el backend coincida con la URL del frontend.

## 📞 Soporte

Para preguntas o problemas:
1. Revisar la documentación
2. Buscar en issues existentes
3. Crear un nuevo issue con detalles

---

**Nota**: Esta aplicación está diseñada para uso profesional en análisis de creativos publicitarios de Meta Ads. Asegúrate de configurar correctamente las API keys y variables de entorno antes del uso en producción.
