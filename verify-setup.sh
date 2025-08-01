#!/bin/bash

# Script para verificar que todo esté funcionando correctamente
set -e

echo "🧪 Verificando configuración del proyecto..."

# Verificar que PostgreSQL esté funcionando
echo "📊 Verificando PostgreSQL..."
if sudo service postgresql status > /dev/null 2>&1; then
    echo "✅ PostgreSQL está ejecutándose"
else
    echo "❌ PostgreSQL no está ejecutándose. Ejecuta: ./setup-postgres.sh"
    exit 1
fi

# Verificar conexión a la base de datos
echo "🔗 Verificando conexión a la base de datos..."
if PGPASSWORD=casaos psql -h 192.168.1.234 -U casaos -d postgres -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Conexión a la base de datos exitosa"
else
    echo "❌ No se puede conectar a la base de datos"
    echo "   Verifica que PostgreSQL esté ejecutándose en 192.168.1.234:5432"
    echo "   Usuario: casaos, Password: casaos, Database: postgres"
    exit 1
fi

# Verificar que las dependencias del backend estén instaladas
echo "📦 Verificando dependencias del backend..."
if [ -d "backend/node_modules" ]; then
    echo "✅ Dependencias del backend instaladas"
else
    echo "❌ Dependencias del backend no instaladas"
    echo "   Ejecuta: cd backend && npm install"
    exit 1
fi

# Verificar que el backend compile
echo "🔨 Verificando compilación del backend..."
cd backend
if npm run build > /dev/null 2>&1; then
    echo "✅ Backend compila correctamente"
else
    echo "❌ Error al compilar el backend"
    exit 1
fi
cd ..

# Verificar que las dependencias del frontend estén instaladas  
echo "📦 Verificando dependencias del frontend..."
if [ -d "node_modules" ]; then
    echo "✅ Dependencias del frontend instaladas"
else
    echo "❌ Dependencias del frontend no instaladas"
    echo "   Ejecuta: npm install"
    exit 1
fi

# Verificar archivos de configuración
echo "⚙️  Verificando archivos de configuración..."
if [ -f "backend/.env" ]; then
    echo "✅ Archivo backend/.env encontrado"
else
    echo "⚠️  Archivo backend/.env no encontrado"
    echo "   Copia backend/.env.example a backend/.env y configúralo"
fi

if [ -f ".env.local" ]; then
    echo "✅ Archivo .env.local encontrado"
else
    echo "⚠️  Archivo .env.local no encontrado"
    echo "   Crea .env.local con GEMINI_API_KEY=tu_api_key"
fi

echo ""
echo "🎉 ¡Verificación completada!"
echo ""
echo "🚀 Para iniciar la aplicación:"
echo "   1. Terminal 1: cd backend && npm run dev"
echo "   2. Terminal 2: npm run dev"
echo ""
echo "📱 URLs de acceso:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3001"
echo "   Health:   http://localhost:3001/health"
