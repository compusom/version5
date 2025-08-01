#!/bin/bash

# Script para verificar conexión con MariaDB
echo "🔧 Verificando conexión con MariaDB..."

# Verificar variables de entorno
if [ -z "$DB_HOST" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ] || [ -z "$DB_NAME" ]; then
    echo "❌ Variables de entorno faltantes. Asegúrate de que estén configuradas:"
    echo "   DB_HOST, DB_USER, DB_PASSWORD, DB_NAME"
    exit 1
fi

echo "📊 Configuración de base de datos:"
echo "   Host: $DB_HOST"
echo "   Puerto: $DB_PORT"
echo "   Base de datos: $DB_NAME"
echo "   Usuario: $DB_USER"

# Verificar conexión con MariaDB/MySQL
echo "🔍 Probando conexión..."
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" -e "SELECT 'Conexión exitosa a MariaDB' AS status;" "$DB_NAME"

if [ $? -eq 0 ]; then
    echo "✅ Conexión exitosa con MariaDB"
    
    # Mostrar información de la base de datos
    echo "📋 Información de la base de datos:"
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" -e "SELECT VERSION() AS version;" "$DB_NAME"
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" -e "SHOW TABLES;" "$DB_NAME"
else
    echo "❌ Error al conectar con MariaDB"
    echo "Verifica:"
    echo "   - Que MariaDB esté corriendo en $DB_HOST:$DB_PORT"
    echo "   - Que las credenciales sean correctas"
    echo "   - Que la base de datos '$DB_NAME' exista"
    exit 1
fi
