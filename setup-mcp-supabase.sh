#!/bin/bash

# ========================================
# Meta Ads Creative Assistant
# Setup MCP + Supabase Integration
# ========================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js v18+ first."
        exit 1
    fi
    
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    print_success "Prerequisites check passed!"
}

# Install dependencies
install_dependencies() {
    print_status "Installing MCP and Supabase dependencies..."
    
    # Root dependencies
    npm install @modelcontextprotocol/sdk @supabase/supabase-js
    
    # Backend dependencies
    cd backend
    npm install @modelcontextprotocol/sdk @supabase/supabase-js
    cd ..
    
    # Frontend dependencies
    cd frontend
    npm install @modelcontextprotocol/sdk @supabase/supabase-js
    cd ..
    
    print_success "Dependencies installed successfully!"
}

# Setup environment files
setup_environment() {
    print_status "Setting up environment files..."
    
    # Backend environment
    if [ ! -f "backend/.env" ]; then
        cp "backend/.env.example" "backend/.env"
        print_warning "Created backend/.env from example. Please update with your Supabase credentials."
    else
        print_warning "backend/.env already exists. Please ensure it has Supabase configuration."
    fi
    
    # Frontend environment
    if [ ! -f "frontend/.env" ]; then
        cp "frontend/.env.example" "frontend/.env"
        print_warning "Created frontend/.env from example. Please update with your Supabase credentials."
    else
        print_warning "frontend/.env already exists. Please ensure it has Supabase configuration."
    fi
    
    print_success "Environment files setup complete!"
}

# Make scripts executable
make_scripts_executable() {
    print_status "Making scripts executable..."
    
    chmod +x mcp-server.js
    chmod +x *.sh
    
    print_success "Scripts are now executable!"
}

# Test MCP server
test_mcp_server() {
    print_status "Testing MCP server..."
    
    # Check if the MCP server can start (just validate syntax)
    if node -c mcp-server.js; then
        print_success "MCP server syntax is valid!"
    else
        print_error "MCP server has syntax errors!"
        exit 1
    fi
}

# Display next steps
display_next_steps() {
    echo ""
    echo "========================================="
    echo -e "${GREEN}🎉 MCP + Supabase Setup Complete!${NC}"
    echo "========================================="
    echo ""
    echo "📋 Next Steps:"
    echo ""
    echo "1. 🔧 Configure Supabase:"
    echo "   • Create a project at https://app.supabase.com"
    echo "   • Get your Project URL and anon key"
    echo "   • Update backend/.env and frontend/.env with your credentials"
    echo ""
    echo "2. 🗄️ Setup Database:"
    echo "   • Run the SQL script in Supabase SQL Editor:"
    echo "     cat supabase-setup.sql"
    echo ""
    echo "3. 🚀 Start the application:"
    echo "   • Backend: cd backend && npm run dev"
    echo "   • Frontend: cd frontend && npm run dev"
    echo ""
    echo "4. 🤖 Use MCP Server directly:"
    echo "   • Test: node mcp-server.js"
    echo "   • Configure with Claude Desktop (see documentation)"
    echo ""
    echo "📚 Documentation:"
    echo "   • Supabase setup: ./SUPABASE_SETUP.md"
    echo "   • Project README: ./README.md"
    echo ""
    echo "🧪 Test endpoints:"
    echo "   • Health check: curl http://localhost:3001/api/mcp/health"
    echo "   • Available tools: curl http://localhost:3001/api/mcp/tools"
    echo ""
    echo "🔗 Useful links:"
    echo "   • Supabase Dashboard: https://app.supabase.com"
    echo "   • MCP Documentation: https://modelcontextprotocol.io"
    echo ""
    print_success "Happy coding! 🚀"
}

# Main execution
main() {
    echo "========================================="
    echo "🚀 Meta Ads Creative Assistant"
    echo "📱 MCP + Supabase Integration Setup"
    echo "========================================="
    echo ""
    
    check_prerequisites
    install_dependencies
    setup_environment
    make_scripts_executable
    test_mcp_server
    display_next_steps
}

# Handle script interruption
trap 'print_error "Setup interrupted!"; exit 1' INT TERM

# Run main function
main "$@"