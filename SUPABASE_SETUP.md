# 🚀 Configuración de Supabase para Meta Ads Creative Assistant

Esta guía te ayudará a configurar Supabase como base de datos y backend para tu proyecto Meta Ads Creative Assistant integrado con MCP (Model Context Protocol).

## 📋 Prerrequisitos

- Cuenta en [Supabase](https://app.supabase.com)
- Node.js v18+ instalado
- Git instalado

## 🛠️ Paso 1: Crear Proyecto en Supabase

1. **Visita [Supabase](https://app.supabase.com)**
2. **Haz clic en "New Project"**
3. **Completa la información:**
   - **Name:** `meta-ads-creative-assistant`
   - **Database Password:** (genera una contraseña segura y guárdala)
   - **Region:** Selecciona la región más cercana
   - **Pricing Plan:** Free tier es suficiente para empezar

4. **Espera a que el proyecto se cree** (puede tomar 1-2 minutos)

## 🔑 Paso 2: Obtener Credenciales

Una vez creado el proyecto:

1. **Ve a Settings → API**
2. **Copia los siguientes valores:**
   - **Project URL:** `https://tu-project-ref.supabase.co`
   - **anon public key:** (empieza con `eyJhbGciOiJIUzI1NiIs...`)
   - **service_role key:** (empieza con `eyJhbGciOiJIUzI1NiIs...`)

⚠️ **IMPORTANTE:** Solo usa la `service_role key` en el backend, nunca en el frontend.

## 🗄️ Paso 3: Configurar Base de Datos

1. **Ve a SQL Editor en tu panel de Supabase**
2. **Ejecuta el script SQL** que se encuentra en `supabase-setup.sql`:

```sql
-- Copia y pega todo el contenido de supabase-setup.sql
-- Este script creará todas las tablas, índices, políticas RLS y funciones necesarias
```

3. **Verifica que las tablas se crearon correctamente** en Database → Tables:
   - `campaigns`
   - `creatives`
   - `creative_analytics`
   - `mcp_analyses`

## 🔐 Paso 4: Configurar Autenticación (Opcional)

Si planeas usar autenticación de Supabase:

1. **Ve a Authentication → Settings**
2. **Configura los providers que necesites:**
   - Email/Password
   - Google OAuth
   - Facebook OAuth
   - etc.

3. **Configura las URLs de redirección:**
   - **Site URL:** `http://localhost:5173` (desarrollo)
   - **Redirect URLs:** `http://localhost:5173/auth/callback`

## 📁 Paso 5: Configurar Storage

1. **Ve a Storage**
2. **Crea un bucket llamado `creatives`:**
   - **Name:** `creatives`
   - **Public:** ✅ (habilitado)
   - **File size limit:** 10MB
   - **Allowed MIME types:** `image/*,video/*`

## 🔧 Paso 6: Configurar Variables de Entorno

### Backend (.env)

Crea o actualiza `backend/.env` con:

```env
# Supabase Configuration
SUPABASE_URL=https://tu-project-ref.supabase.co
SUPABASE_ANON_KEY=tu-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui

# Otras configuraciones existentes...
GEMINI_API_KEY=tu-gemini-api-key
```

### Frontend (.env)

Crea o actualiza `frontend/.env` con:

```env
# Supabase Configuration (SOLO ANON KEY)
VITE_SUPABASE_URL=https://tu-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui

# API Configuration
VITE_API_URL=http://localhost:3001/api

# Feature Flags
VITE_ENABLE_MCP=true
VITE_ENABLE_REALTIME=true
```

## 🧪 Paso 7: Probar la Conexión

### Desde el Backend

```bash
cd backend
npm run dev
```

Verifica en los logs que veas:
```
🤖 MCP Integration Service initialized
📁 Database connection established
🚀 Server running on port 3001
```

### Desde el Frontend

```bash
cd frontend
npm run dev
```

Ve a `http://localhost:5173` y verifica que la aplicación se carga sin errores.

### Test de Endpoints MCP

Puedes probar los endpoints MCP:

```bash
# Health check
curl http://localhost:3001/api/mcp/health

# Herramientas disponibles
curl http://localhost:3001/api/mcp/tools
```

## 📊 Paso 8: Configurar Row Level Security (RLS)

Las políticas RLS ya están configuradas en el script SQL, pero puedes revisarlas:

1. **Ve a Authentication → Policies**
2. **Verifica que existen políticas para:**
   - `campaigns` (4 políticas)
   - `creatives` (4 políticas)  
   - `creative_analytics` (2 políticas)
   - `mcp_analyses` (2 políticas)

## 🔍 Paso 9: Monitoreo y Logs

### Ver Logs en Tiempo Real

1. **Ve a Logs → Realtime**
2. **Puedes filtrar por:**
   - Database logs
   - API logs
   - Auth logs
   - Storage logs

### Métricas

1. **Ve a Reports**
2. **Monitorea:**
   - Database usage
   - API requests
   - Storage usage

## 🚨 Solución de Problemas

### Error: "Invalid API key"

- Verifica que copiaste correctamente las keys
- Asegúrate de usar `anon key` en frontend y `service_role key` en backend

### Error: "Row Level Security policy violation"

- Verifica que las políticas RLS estén configuradas
- Asegúrate de que el usuario esté autenticado si es requerido

### Error: "relation does not exist"

- Verifica que ejecutaste el script SQL completamente
- Revisa si hay errores en el SQL Editor

### Error de conexión

- Verifica la URL del proyecto
- Asegúrate de que el proyecto esté activo en Supabase

## 🔄 Migración desde MySQL/MariaDB

Si ya tenías datos en MySQL/MariaDB:

1. **Exporta los datos** desde tu base actual
2. **Transforma el formato** a PostgreSQL (Supabase usa PostgreSQL)
3. **Importa usando** el SQL Editor o herramientas como `pg_dump`

## 📚 Recursos Adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [Guía de JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)

## 🎯 Siguientes Pasos

1. **Configurar autenticación** si planeas tener usuarios
2. **Implementar funciones Edge** para lógica compleja
3. **Configurar webhooks** para integraciones externas
4. **Optimizar queries** basado en el uso real

---

¡Felicidades! 🎉 Ahora tienes Supabase completamente configurado e integrado con MCP para tu proyecto Meta Ads Creative Assistant.