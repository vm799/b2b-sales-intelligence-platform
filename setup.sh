#!/bin/bash

# B2B Sales Intelligence Platform - Automated Setup Script
# This script sets up the development environment for the B2B sales intelligence platform

set -e  # Exit on any error

echo "🚀 Setting up B2B Sales Intelligence Platform..."
echo "=================================================="

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

# Check if Node.js is installed
check_node() {
    print_status "Checking Node.js installation..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js is installed: $NODE_VERSION"
        
        # Check if version is >= 16
        NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$NODE_MAJOR_VERSION" -lt 16 ]; then
            print_error "Node.js version 16 or higher is required. Current version: $NODE_VERSION"
            exit 1
        fi
    else
        print_error "Node.js is not installed. Please install Node.js 16+ and try again."
        print_status "Visit: https://nodejs.org/"
        exit 1
    fi
}

# Check if npm is installed
check_npm() {
    print_status "Checking npm installation..."
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm is installed: $NPM_VERSION"
    else
        print_error "npm is not installed. Please install npm and try again."
        exit 1
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing Node.js dependencies..."
    
    if [ -f "package.json" ]; then
        npm install
        print_success "Dependencies installed successfully"
    else
        print_error "package.json not found. Please run this script from the project root directory."
        exit 1
    fi
}

# Create environment file
setup_environment() {
    print_status "Setting up environment configuration..."
    
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_success "Created .env file from .env.example"
            print_warning "Please update .env file with your specific configuration"
        else
            print_warning ".env.example not found. Creating basic .env file..."
            cat > .env << EOF
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)
EOF
            print_success "Created basic .env file"
        fi
    else
        print_warning ".env file already exists. Skipping..."
    fi
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    directories=("logs" "uploads" "coverage" "public")
    
    for dir in "${directories[@]}"; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
            print_success "Created directory: $dir"
        else
            print_status "Directory already exists: $dir"
        fi
    done
}

# Setup git hooks (if husky is available)
setup_git_hooks() {
    print_status "Setting up git hooks..."
    
    if [ -f "node_modules/.bin/husky" ]; then
        npx husky install
        print_success "Git hooks installed"
    else
        print_warning "Husky not found. Git hooks will be set up after running npm install"
    fi
}

# Create logs directory and initial log file
setup_logging() {
    print_status "Setting up logging..."
    
    if [ ! -f "logs/app.log" ]; then
        touch logs/app.log
        print_success "Created initial log file"
    fi
    
    # Create .gitkeep for logs directory
    if [ ! -f "logs/.gitkeep" ]; then
        touch logs/.gitkeep
        print_success "Created .gitkeep for logs directory"
    fi
}

# Run initial tests to verify setup
run_tests() {
    print_status "Running initial tests..."
    
    if npm run test --silent; then
        print_success "All tests passed"
    else
        print_warning "Some tests failed. This might be expected for a fresh setup."
    fi
}

# Check if Docker is available
check_docker() {
    print_status "Checking Docker installation..."
    
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version)
        print_success "Docker is available: $DOCKER_VERSION"
        
        if command -v docker-compose &> /dev/null; then
            COMPOSE_VERSION=$(docker-compose --version)
            print_success "Docker Compose is available: $COMPOSE_VERSION"
        else
            print_warning "Docker Compose not found. Install it for containerized development"
        fi
    else
        print_warning "Docker not found. Install Docker for containerized development"
    fi
}

# Display final setup information
display_info() {
    echo ""
    echo "=================================================="
    echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
    echo "=================================================="
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Review and update the .env file with your configuration"
    echo "2. Start the development server: npm run dev"
    echo "3. Visit http://localhost:3000 to access the application"
    echo "4. Run tests: npm test"
    echo "5. Check out the API documentation in the README.md"
    echo ""
    echo -e "${BLUE}Available npm scripts:${NC}"
    echo "  npm start          - Start production server"
    echo "  npm run dev        - Start development server with auto-reload"
    echo "  npm test           - Run test suite"
    echo "  npm run lint       - Run code linting"
    echo "  npm run format     - Format code with Prettier"
    echo "  npm run docker:dev - Start with Docker Compose"
    echo ""
    echo -e "${BLUE}Project structure:${NC}"
    echo "  server.js          - Main application server"
    echo "  public/            - Static web files"
    echo "  logs/              - Application logs"
    echo "  uploads/           - File uploads"
    echo ""
}

# Main setup process
main() {
    echo "Starting setup process..."
    echo ""
    
    check_node
    check_npm
    install_dependencies
    setup_environment
    create_directories
    setup_logging
    setup_git_hooks
    check_docker
    
    # Only run tests if test files exist
    if [ -f "test-functionality.js" ] || find . -name "*.test.js" -o -name "*.spec.js" | grep -q .; then
        run_tests
    else
        print_status "No test files found. Skipping test execution."
    fi
    
    display_info
}

# Run main function
main "$@"