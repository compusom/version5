#!/bin/bash

# 🚀 Meta Ads Creative Assistant - Script de Instalación Automática
# Para CasaOS y sistemas Linux

set -e  # Salir si algún comando falla

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes con color
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Banner de bienvenida
echo -e "${BLUE}"
echo "=================================================="
echo "🚀 Meta Ads Creative Assistant"
echo "   Instalación Automática para CasaOS"
echo "=================================================="
echo -e "${NC}"

# Verificar si estamos en el directorio correcto
if [ ! -f "package.json" ] && [ ! -d "frontend" ] && [ ! -d "backend" ]; then
    print_error "No se encontraron los archivos del proyecto."
    print_error "Asegúrate de estar en el directorio raíz del proyecto."
    exit 1
fi

print_status "Iniciando instalación..."

# 1. Verificar e instalar Node.js
print_status "Verificando Node.js..."
if ! command -v node &> /dev/null; then
    print_warning "Node.js no está instalado. Instalando..."
    
    # Instalar Node.js usando NodeSource
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    print_success "Node.js instalado correctamente"
else
    NODE_VERSION=$(node --version)
    print_success "Node.js ya está instalado: $NODE_VERSION"
fi

# 2. Verificar e instalar PM2
print_status "Verificando PM2..."
if ! command -v pm2 &> /dev/null; then
    print_warning "PM2 no está instalado. Instalando..."
    sudo npm install -g pm2
    print_success "PM2 instalado correctamente"
else
    print_success "PM2 ya está instalado"
fi

# 3. Verificar MySQL client
print_status "Verificando cliente MySQL..."
if ! command -v mysql &> /dev/null; then
    print_warning "Cliente MySQL no está instalado. Instalando..."
    sudo apt-get update
    sudo apt-get install -y mysql-client
    print_success "Cliente MySQL instalado"
else
    print_success "Cliente MySQL ya está instalado"
fi

# 4. Configurar variables de entorno
print_status "Configurando variables de entorno..."

# Configuración de la base de datos
echo
echo -e "${YELLOW}📊 Configuración de Base de Datos:${NC}"
read -p "Host de MariaDB [192.168.1.234]: " DB_HOST
DB_HOST=${DB_HOST:-192.168.1.234}

read -p "Puerto [3306]: " DB_PORT
DB_PORT=${DB_PORT:-3306}

read -p "Nombre de la base de datos [casaos]: " DB_NAME
DB_NAME=${DB_NAME:-casaos}

read -p "Usuario [casaos]: " DB_USER
DB_USER=${DB_USER:-casaos}

read -s -p "Contraseña: " DB_PASSWORD
echo

# Obtener IP del servidor
SERVER_IP=$(hostname -I | awk '{print $1}')

# 5. Configurar Frontend
print_status "Configurando Frontend..."
cd frontend

# Crear .env para frontend
cat > .env << EOF
# Frontend Environment Variables
VITE_API_URL=http://${SERVER_IP}:3001
VITE_PORT=5173
EOF

# Instalar dependencias del frontend
print_status "Instalando dependencias del frontend..."
npm install

# Compilar frontend
print_status "Compilando frontend..."
npm run build

print_success "Frontend configurado correctamente"

# 6. Configurar Backend
print_status "Configurando Backend..."
cd ../backend

# Crear .env para backend
cat > .env << EOF
# Environment variables for production
NODE_ENV=production
PORT=3001

# Database configuration
DATABASE_URL=mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT}
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}

# API Keys (configurar después)
GEMINI_API_KEY=
META_APP_ID=
META_APP_SECRET=

# JWT Secret
JWT_SECRET=$(openssl rand -base64 32)

# File upload settings
MAX_FILE_SIZE=50MB
UPLOAD_PATH=./uploads

# Security
BCRYPT_ROUNDS=12

# CORS settings
FRONTEND_URL=http://${SERVER_IP}:5173

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF

# Instalar dependencias del backend
print_status "Instalando dependencias del backend..."
npm install

# Compilar backend
print_status "Compilando backend..."
npm run build

print_success "Backend configurado correctamente"

# 7. Probar conexión a la base de datos
print_status "Probando conexión a la base de datos..."
if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1;" "$DB_NAME" &>/dev/null; then
    print_success "Conexión a la base de datos exitosa"
else
    print_warning "No se pudo conectar a la base de datos. Verifica la configuración."
    print_warning "Puedes configurar la base de datos más tarde editando backend/.env"
fi

# 8. Crear directorio de uploads
print_status "Creando directorio de uploads..."
mkdir -p uploads
chmod 755 uploads

# 9. Configurar PM2
print_status "Configurando PM2..."
cd ..

# Crear archivo de configuración PM2
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'meta-ads-frontend',
      script: 'npm',
      args: 'run preview',
      cwd: './frontend',
      env: {
        NODE_ENV: 'production',
        PORT: 5173
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    },
    {
      name: 'meta-ads-backend',
      script: 'npm',
      args: 'start',
      cwd: './backend',
      env: {
        NODE_ENV: 'production'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    }
  ]
};
EOF

# 10. Crear scripts de gestión
print_status "Creando scripts de gestión..."

# Script para iniciar servicios
cat > start.sh << 'EOF'
#!/bin/bash
echo "🚀 Iniciando Meta Ads Creative Assistant..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup
echo "✅ Servicios iniciados correctamente"
echo "Frontend: http://$(hostname -I | awk '{print $1}'):5173"
echo "Backend: http://$(hostname -I | awk '{print $1}'):3001"
EOF

# Script para detener servicios
cat > stop.sh << 'EOF'
#!/bin/bash
echo "🛑 Deteniendo Meta Ads Creative Assistant..."
pm2 stop meta-ads-frontend meta-ads-backend
echo "✅ Servicios detenidos"
EOF

# Script para verificar estado
cat > check-status.sh << 'EOF'
#!/bin/bash
echo "📊 Estado de Meta Ads Creative Assistant:"
echo
pm2 status
echo
echo "🌐 URLs de acceso:"
echo "Frontend: http://$(hostname -I | awk '{print $1}'):5173"
echo "Backend: http://$(hostname -I | awk '{print $1}'):3001"
EOF

# Script para ver logs
cat > logs.sh << 'EOF'
#!/bin/bash
echo "📋 Logs de Meta Ads Creative Assistant:"
pm2 logs
EOF

# Dar permisos de ejecución
chmod +x start.sh stop.sh check-status.sh logs.sh

# 11. Iniciar servicios
print_status "Iniciando servicios..."
./start.sh

# Esperar un momento para que los servicios se inicien
sleep 5

# 12. Verificar que los servicios estén corriendo
print_status "Verificando servicios..."
if pm2 list | grep -q "online"; then
    print_success "Servicios iniciados correctamente"
else
    print_warning "Algunos servicios pueden no haber iniciado correctamente"
    print_warning "Ejecuta 'pm2 logs' para ver los detalles"
fi

# 13. Mensaje final
echo
echo -e "${GREEN}"
echo "=================================================="
echo "🎉 ¡Instalación Completada!"
echo "=================================================="
echo -e "${NC}"
echo
echo -e "${BLUE}🌐 Accede a tu aplicación en:${NC}"
echo "   Frontend: http://${SERVER_IP}:5173"
echo "   Backend:  http://${SERVER_IP}:3001"
echo
echo -e "${BLUE}🛠️ Comandos útiles:${NC}"
echo "   ./start.sh          - Iniciar servicios"
echo "   ./stop.sh           - Detener servicios"
echo "   ./check-status.sh   - Ver estado"
echo "   ./logs.sh           - Ver logs"
echo "   pm2 status          - Estado detallado"
echo
echo -e "${BLUE}📝 Configuración adicional:${NC}"
echo "   - Configura tu API key de Gemini en backend/.env"
echo "   - Configura credenciales de Meta en backend/.env"
echo "   - La base de datos se configuró automáticamente"
echo
echo -e "${YELLOW}⚠️  Importante:${NC}"
echo "   - Los servicios se reinician automáticamente"
echo "   - Asegúrate de que los puertos 5173 y 3001 estén abiertos"
echo "   - Revisa los logs si encuentras algún problema"
echo
print_success "¡Meta Ads Creative Assistant está listo para usar!"
