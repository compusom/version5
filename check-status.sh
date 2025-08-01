#!/bin/bash

# 📊 Verificar estado de Meta Ads Creative Assistant

echo "📊 Estado de Meta Ads Creative Assistant:"
echo "=================================================="

# Verificar si PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2 no está instalado"
    exit 1
fi

# Mostrar estado de PM2
pm2 status

echo
echo "🌐 URLs de acceso:"
SERVER_IP=$(hostname -I | awk '{print $1}')
echo "   Frontend: http://${SERVER_IP}:5173"
echo "   Backend:  http://${SERVER_IP}:3001"

echo
echo "🛠️ Comandos útiles:"
echo "   ./start.sh    - Iniciar servicios"
echo "   ./stop.sh     - Detener servicios"
echo "   ./logs.sh     - Ver logs en tiempo real"
echo "   pm2 restart all - Reiniciar todos los servicios"

# Verificar puertos
echo
echo "🔌 Estado de puertos:"
if netstat -tlnp 2>/dev/null | grep -q ":5173 "; then
    echo "   ✅ Puerto 5173 (Frontend) - ACTIVO"
else
    echo "   ❌ Puerto 5173 (Frontend) - INACTIVO"
fi

if netstat -tlnp 2>/dev/null | grep -q ":3001 "; then
    echo "   ✅ Puerto 3001 (Backend) - ACTIVO"
else
    echo "   ❌ Puerto 3001 (Backend) - INACTIVO"
fi
