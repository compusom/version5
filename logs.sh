#!/bin/bash

# 📋 Ver logs de Meta Ads Creative Assistant

echo "📋 Logs de Meta Ads Creative Assistant:"
echo "=================================================="
echo "Presiona Ctrl+C para salir del modo logs"
echo

# Verificar si PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2 no está instalado"
    exit 1
fi

# Mostrar logs en tiempo real
pm2 logs
