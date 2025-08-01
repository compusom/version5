#!/bin/bash

echo "📊 Estado del Proyecto Meta Ads Creative Assistant"
echo "================================================="
echo ""

# Verificar PostgreSQL
echo "🗄️  Base de Datos:"
if PGPASSWORD=casaos psql -h 192.168.1.234 -U casaos -d postgres -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" > /dev/null 2>&1; then
    echo "   ✅ PostgreSQL: Conectado a 192.168.1.234:5432"
    TABLE_COUNT=$(PGPASSWORD=casaos psql -h 192.168.1.234 -U casaos -d postgres -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | xargs)
    echo "   📋 Tablas en la BD: $TABLE_COUNT"
else
    echo "   ❌ PostgreSQL: No se puede conectar a 192.168.1.234:5432"
fi

echo ""

# Verificar servicios
echo "🌐 Servicios:"
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "   ✅ Backend API: http://localhost:3001"
else
    echo "   ❌ Backend API: No disponible"
fi

if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "   ✅ Frontend: http://localhost:5173"
else
    echo "   ❌ Frontend: No disponible"
fi

echo ""

# Verificar archivos de configuración
echo "⚙️  Configuración:"
if [ -f "backend/.env" ]; then
    echo "   ✅ backend/.env"
    if grep -q "GEMINI_API_KEY=" backend/.env && [ $(grep "GEMINI_API_KEY=" backend/.env | cut -d'=' -f2 | wc -c) -gt 5 ]; then
        echo "   ✅ GEMINI_API_KEY configurada"
    else
        echo "   ⚠️  GEMINI_API_KEY no configurada"
    fi
else
    echo "   ❌ backend/.env"
fi

if [ -f ".env.local" ]; then
    echo "   ✅ .env.local"
else
    echo "   ⚠️  .env.local no encontrado"
fi

echo ""

# Verificar dependencias
echo "📦 Dependencias:"
if [ -d "backend/node_modules" ]; then
    echo "   ✅ Backend: Instaladas"
else
    echo "   ❌ Backend: No instaladas"
fi

if [ -d "node_modules" ]; then
    echo "   ✅ Frontend: Instaladas"
else
    echo "   ❌ Frontend: No instaladas"
fi

echo ""

# Mostrar comandos útiles
echo "🛠️  Comandos Útiles:"
echo "   ./setup-postgres.sh     - Configurar PostgreSQL"
echo "   ./verify-setup.sh       - Verificar configuración"
echo "   ./start-app.sh          - Iniciar aplicación completa"
echo "   cd backend && npm run dev - Solo backend"
echo "   npm run dev             - Solo frontend"
echo ""

# Mostrar estructura del proyecto
echo "📁 Estructura del Proyecto:"
echo "   📂 backend/             - API Node.js + Express"
echo "   📂 components/          - Componentes React"
echo "   📂 lib/                 - Utilidades"
echo "   📄 App.tsx             - Aplicación principal"
echo "   📄 package.json        - Frontend"
echo "   📄 backend/package.json - Backend"
