#!/bin/bash

# Script para verificar la conexión a PostgreSQL existente
set -e

echo "🔧 Verificando conexión a PostgreSQL..."

# Verificar que psql esté disponible
if ! command -v psql &> /dev/null; then
    echo "📦 Instalando PostgreSQL client..."
    sudo apt-get update
    sudo apt-get install -y postgresql-client
fi

# Verificar conexión a la base de datos remota
echo "� Verificando conexión a PostgreSQL remoto..."
if PGPASSWORD=casaos psql -h 192.168.1.234 -U casaos -d postgres -c "SELECT version();" > /dev/null 2>&1; then
    echo "✅ Conexión a PostgreSQL exitosa!"
    echo "� Host: 192.168.1.234:5432"
    echo "👤 Usuario: casaos"
    echo "🗄️ Base de datos: postgres"
else
    echo "❌ No se puede conectar a PostgreSQL"
    echo "Verifica que:"
    echo "  - El servidor PostgreSQL esté ejecutándose en 192.168.1.234:5432"
    echo "  - El usuario 'casaos' tenga acceso"
    echo "  - La contraseña 'casaos' sea correcta"
    exit 1
fi

echo ""
echo "✅ PostgreSQL configurado exitosamente!"
echo "🔗 URL de conexión: postgresql://casaos:casaos@192.168.1.234:5432/postgres"
echo ""
echo "🚀 Para iniciar el backend, ejecuta:"
echo "   cd backend && npm run dev"
