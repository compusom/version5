#!/bin/bash

# 🛑 Detener Meta Ads Creative Assistant

echo "🛑 Deteniendo Meta Ads Creative Assistant..."

# Detener servicios PM2
pm2 stop meta-ads-frontend meta-ads-backend

echo "✅ Servicios detenidos correctamente"
echo
echo "💡 Para iniciar nuevamente: ./start.sh"
echo "📊 Para ver el estado: ./check-status.sh"
