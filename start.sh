#!/bin/bash

# 🚀 Iniciar Meta Ads Creative Assistant

echo "🚀 Iniciando Meta Ads Creative Assistant..."

# Verificar que PM2 esté instalado
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2 no está instalado. Ejecuta ./install.sh primero."
    exit 1
fi

# Iniciar servicios con PM2
pm2 start ecosystem.config.js

# Guardar configuración PM2 para reinicio automático
pm2 save

# Configurar PM2 para reinicio automático del sistema
pm2 startup

echo "✅ Servicios iniciados correctamente"
echo
echo "🌐 URLs de acceso:"
SERVER_IP=$(hostname -I | awk '{print $1}')
echo "   Frontend: http://${SERVER_IP}:5173"
echo "   Backend:  http://${SERVER_IP}:3001"
echo
echo "📊 Para ver el estado: ./check-status.sh"
echo "📋 Para ver logs: ./logs.sh"
