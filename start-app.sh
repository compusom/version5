#!/bin/bash

# Script para iniciar toda la aplicación
set -e

echo "🚀 Iniciando Meta Ads Creative Assistant..."

# Verificar que PostgreSQL remoto esté disponible
echo "📊 Verificando PostgreSQL remoto..."
if ! PGPASSWORD=casaos psql -h 192.168.1.234 -U casaos -d postgres -c "SELECT 1;" > /dev/null 2>&1; then
    echo "❌ No se puede conectar a PostgreSQL en 192.168.1.234:5432"
    echo "   Verifica que el servidor esté ejecutándose y sea accesible"
    exit 1
fi
echo "✅ Conexión a PostgreSQL exitosa"

# Función para manejar la interrupción (Ctrl+C)
cleanup() {
    echo ""
    echo "🛑 Deteniendo aplicación..."
    kill %1 %2 2>/dev/null || true
    exit 0
}

# Configurar manejo de señales
trap cleanup SIGINT SIGTERM

# Verificar que las compilaciones estén actualizadas
echo "🔨 Verificando compilación del backend..."
cd backend
npm run build > /dev/null 2>&1
cd ..

echo "📦 Iniciando backend..."
cd backend && npm run dev &
BACKEND_PID=$!

echo "⏳ Esperando que el backend se inicie..."
sleep 5

echo "🎨 Iniciando frontend..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Aplicación iniciada exitosamente!"
echo ""
echo "📱 URLs de acceso:"
echo "   🎨 Frontend: http://localhost:5173"
echo "   🔧 Backend:  http://localhost:3001"
echo "   💚 Health:   http://localhost:3001/health"
echo ""
echo "📋 Características disponibles:"
echo "   • Análisis de creativos con IA"
echo "   • Gestión de clientes"
echo "   • Importación de datos"
echo "   • Dashboard de rendimiento"
echo ""
echo "⌨️  Presiona Ctrl+C para detener la aplicación"
echo ""

# Esperar a que terminen los procesos
wait
