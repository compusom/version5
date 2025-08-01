# Meta Ads Creative Assistant - Backend

Este es el backend API para la aplicación Meta Ads Creative Assistant. Proporciona endpoints para gestión de clientes, análisis de creativos con IA, importación de datos y configuración.

## Características

- **Análisis de Creativos con IA**: Integración con Gemini AI para análisis automático de imágenes y videos publicitarios
- **Gestión de Clientes**: CRUD completo para la gestión de clientes y cuentas de Meta
- **Importación de Datos**: Soporte para importar datos desde archivos Looker, TXT y Excel
- **Base de Datos PostgreSQL**: Persistencia robusta con migraciones automáticas
- **API RESTful**: Endpoints bien documentados y estructurados
- **Autenticación y Seguridad**: Rate limiting, CORS, y validación de entrada
- **Manejo de Archivos**: Subida segura de archivos con validación

## Tecnologías

- **Node.js** + **TypeScript** - Runtime y lenguaje
- **Express.js** - Framework web
- **PostgreSQL** - Base de datos principal
- **Gemini AI** - Análisis de creativos
- **Multer** - Manejo de archivos
- **JWT** - Autenticación
- **Helmet** - Seguridad
- **Morgan** - Logging

## Configuración

### Prerrequisitos

- Node.js 18+
- PostgreSQL 13+
- API Key de Gemini AI

### Instalación

1. Instalar dependencias:
```bash
cd backend
npm install
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
```

Editar `.env` con tus configuraciones:
```env
# Base de datos
DATABASE_URL=postgresql://usuario:password@localhost:5432/meta_ads_creative_db

# API Keys
GEMINI_API_KEY=tu_gemini_api_key_aqui

# JWT Secret
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui

# URL del Frontend
FRONTEND_URL=http://localhost:5173
```

3. Crear la base de datos:
```bash
createdb meta_ads_creative_db
```

4. Ejecutar migraciones:
```bash
npm run migrate
```

### Desarrollo

```bash
# Modo desarrollo con hot reload
npm run dev

# Compilar TypeScript
npm run build

# Producción
npm start
```

## Estructura de la API

### Endpoints Principales

#### Clientes
- `GET /api/clients` - Obtener todos los clientes
- `POST /api/clients` - Crear nuevo cliente
- `PUT /api/clients/:id` - Actualizar cliente
- `DELETE /api/clients/:id` - Eliminar cliente

#### Análisis de Creativos
- `POST /api/analyze/creative` - Analizar creativo con IA
- `GET /api/analyze/history/:clientId` - Historial de análisis
- `GET /api/analyze/:id` - Obtener análisis específico

#### Importación de Datos
- `POST /api/import/looker` - Importar datos Looker
- `POST /api/import/txt` - Importar reportes TXT
- `POST /api/import/excel` - Importar archivos Excel
- `GET /api/import/history/:clientId` - Historial de importaciones

#### Configuración
- `GET /api/config/meta-api` - Obtener configuración Meta API
- `POST /api/config/meta-api` - Guardar configuración Meta API
- `GET /api/config/app-settings` - Configuración de la aplicación

### Formato de Respuesta

Todas las respuestas siguen el formato estándar:

```json
{
  "success": true,
  "data": {...},
  "message": "Mensaje opcional",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

Para errores:
```json
{
  "success": false,
  "message": "Descripción del error",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

## Base de Datos

### Tablas Principales

- **clients** - Información de clientes
- **performance_records** - Datos de rendimiento de anuncios
- **analysis_results** - Resultados de análisis de IA
- **import_batches** - Historial de importaciones
- **meta_api_configs** - Configuraciones de Meta API
- **uploaded_videos** - Metadatos de videos subidos
- **processed_hashes** - Control de duplicados
- **application_logs** - Logs de la aplicación

## Seguridad

- **Rate Limiting**: 100 requests por 15 minutos por IP
- **CORS**: Configurado para permitir solo el frontend
- **Helmet**: Headers de seguridad
- **Validación de archivos**: Solo imágenes, videos y documentos permitidos
- **Sanitización**: Validación y limpieza de entrada

## Análisis de IA con Gemini

El sistema utiliza Gemini AI para analizar creativos publicitarios y proporcionar:

- Puntuación de efectividad (0-10)
- Análisis de claridad visual
- Recomendaciones específicas por placement
- Evaluación de Advantage+ de Meta
- Identificación de etapa del funnel (TOFU/MOFU/BOFU)

## Monitoreo y Logs

- Logs estructurados con Morgan
- Manejo de errores centralizado
- Health check endpoint: `GET /health`

## Despliegue

### Variables de Entorno de Producción

```env
NODE_ENV=production
DATABASE_URL=postgresql://...
GEMINI_API_KEY=...
JWT_SECRET=...
FRONTEND_URL=https://tu-dominio.com
```

### Docker (Opcional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["node", "dist/server.js"]
```

## Desarrollo

### Estructura del Código

```
src/
├── config/         # Configuración
├── controllers/    # Controladores de rutas
├── database/       # Conexión y migraciones
├── middleware/     # Middleware personalizado
├── routes/         # Definición de rutas
├── services/       # Lógica de negocio
├── types/          # Tipos TypeScript
└── server.ts       # Punto de entrada
```

### Contribuir

1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## Soporte

Para preguntas o problemas, crear un issue en el repositorio.
