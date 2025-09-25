# Development Setup

This guide will help you set up a complete development environment for the Swiss Army Knife (SAK) custom card project.

## 🛠️ Prerequisites

### Required Software

- **Node.js**: Version 18 or later
- **npm**: Version 8 or later (comes with Node.js)
- **Git**: Latest version
- **Home Assistant**: For testing (local or cloud instance)

### Recommended Software

- **VS Code**: With TypeScript and Lit extensions
- **Chrome/Chromium**: For testing and debugging
- **Docker**: For containerized Home Assistant testing

## 📦 Installation

### 1. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/AmoebeLabs/swiss-army-knife-card.git
cd swiss-army-knife-card

# Install dependencies
npm install
```

### 2. Verify Installation

```bash
# Check Node.js version
node --version  # Should be 18+

# Check npm version
npm --version   # Should be 8+

# Verify dependencies
npm list
```

## 🚀 Development Environment

### 1. Start Development Server

```bash
# Start the development server
npm run dev

# The server will start on http://localhost:3000
# Hot reload is enabled for development
```

### 2. Development Scripts

```bash
# Development
npm run dev              # Start development server with hot reload
npm run build            # Build for production
npm run preview          # Preview production build

# Testing
npm run test             # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage report
npm run test:e2e         # Run end-to-end tests

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues automatically
npm run type-check       # Run TypeScript type checking
npm run format           # Format code with Prettier

# Utilities
npm run clean            # Clean build artifacts
npm run analyze          # Analyze bundle size
npm run docs             # Generate documentation
```

### 3. VS Code Setup

Install recommended extensions:

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "runem.lit-plugin",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json"
  ]
}
```

Create `.vscode/settings.json`:

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "lit-plugin": {
    "rules": {
      "no-unknown-tag-name": "off"
    }
  }
}
```

## 🧪 Testing Setup

### 1. Unit Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test src/components/__tests__/SakCard.test.ts
```

### 2. End-to-End Testing

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests in headed mode
npm run test:e2e -- --headed

# Run specific E2E test
npm run test:e2e -- --grep "temperature card"
```

### 3. Visual Regression Testing

```bash
# Run visual tests
npm run test:visual

# Update visual baselines
npm run test:visual -- --update-snapshots
```

## 🏠 Home Assistant Integration

### 1. Local Home Assistant Setup

**Option A: Docker (Recommended)**

```bash
# Create docker-compose.yml
version: '3.8'
services:
  homeassistant:
    container_name: homeassistant
    image: "ghcr.io/home-assistant/home-assistant:stable"
    volumes:
      - ./config:/config
      - /etc/localtime:/etc/localtime:ro
    restart: unless-stopped
    privileged: true
    network_mode: host

# Start Home Assistant
docker-compose up -d
```

**Option B: Python Virtual Environment**

```bash
# Create virtual environment
python3 -m venv homeassistant
source homeassistant/bin/activate

# Install Home Assistant
pip3 install homeassistant

# Start Home Assistant
hass --open-ui
```

### 2. Development Configuration

Create `config/configuration.yaml`:

```yaml
# Enable development mode
default_config:

# Add development entities
sensor:
  - platform: template
    sensors:
      test_temperature:
        friendly_name: "Test Temperature"
        value_template: "{{ 20 + (range(-5, 5) | random) }}"
        unit_of_measurement: "°C"
      
      test_humidity:
        friendly_name: "Test Humidity"
        value_template: "{{ 40 + (range(-10, 10) | random) }}"
        unit_of_measurement: "%"

# Enable Lovelace
lovelace:
  mode: yaml
  resources:
    - url: /local/swiss-army-knife-card.js
      type: module
```

### 3. Development Resources

Add to `config/ui-lovelace.yaml`:

```yaml
resources:
  - url: /local/swiss-army-knife-card.js
    type: module
```

## 🔧 Build System

### 1. Vite Configuration

The project uses Vite for fast development and optimized builds:

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    // TypeScript support
    typescript(),
    
    // Lit plugin for optimal bundling
    lit({
      include: ['src/**/*.ts']
    })
  ],
  
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'SwissArmyKnifeCard',
      fileName: 'swiss-army-knife-card',
      formats: ['es']
    },
    
    rollupOptions: {
      external: ['lit', 'lit/decorators.js'],
      output: {
        globals: {
          lit: 'Lit'
        }
      }
    }
  }
});
```

### 2. TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 3. ESLint Configuration

```json
{
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "prefer-const": "error"
  }
}
```

## 📁 Project Structure

```
swiss-army-knife-card/
├── src/                          # Source code
│   ├── components/               # UI Components
│   │   ├── SakCard.ts           # Main card component
│   │   ├── ErrorBoundary.ts     # Error handling
│   │   └── LoadingSpinner.ts    # Loading states
│   ├── tools/                    # Tool implementations
│   │   ├── base/                # Base tool classes
│   │   ├── shapes/              # Shape tools
│   │   ├── text/                # Text tools
│   │   ├── interactive/         # Interactive tools
│   │   └── charts/              # Chart tools
│   ├── toolsets/                 # Toolset management
│   ├── state/                    # State management
│   ├── services/                 # Business logic
│   ├── utils/                    # Utility functions
│   ├── types/                    # TypeScript definitions
│   ├── constants/                # Application constants
│   └── test/                     # Test files
├── docs/                         # Documentation
├── dist/                         # Build output
├── node_modules/                 # Dependencies
├── .vscode/                      # VS Code configuration
├── .github/                      # GitHub workflows
├── package.json                  # Project configuration
├── tsconfig.json                 # TypeScript configuration
├── vite.config.ts                # Vite configuration
└── README.md                     # Project documentation
```

## 🐛 Debugging

### 1. Browser DevTools

```javascript
// Enable debug mode in card configuration
dev:
  debug: true
  performance: true

// Check console for debug messages
console.log('SAK Debug:', sakCard);
```

### 2. VS Code Debugging

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/vitest/vitest.mjs",
      "args": ["run", "--reporter=verbose"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### 3. Performance Profiling

```bash
# Build with profiling
npm run build -- --profile

# Analyze bundle
npm run analyze

# Check performance metrics
npm run test:performance
```

## 🔄 Development Workflow

### 1. Feature Development

```bash
# Create feature branch
git checkout -b feature/new-tool

# Make changes
# ... edit files ...

# Run tests
npm run test

# Check code quality
npm run lint
npm run type-check

# Build and test
npm run build
npm run preview
```

### 2. Testing Workflow

```bash
# Run all tests
npm run test

# Run specific test
npm run test -- --grep "CircleTool"

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

### 3. Code Quality Workflow

```bash
# Check code quality
npm run lint
npm run type-check
npm run format

# Fix issues automatically
npm run lint:fix
npm run format
```

## 📦 Dependencies

### Production Dependencies

```json
{
  "lit": "^3.0.0",
  "home-assistant-js-websocket": "^8.0.0"
}
```

### Development Dependencies

```json
{
  "typescript": "^5.0.0",
  "vite": "^5.0.0",
  "vitest": "^1.0.0",
  "playwright": "^1.40.0",
  "eslint": "^8.0.0",
  "prettier": "^3.0.0"
}
```

## 🚀 Deployment

### 1. Build for Production

```bash
# Build optimized bundle
npm run build

# Verify build
npm run preview
```

### 2. Test Production Build

```bash
# Test with Home Assistant
# Copy dist/swiss-army-knife-card.js to HA www folder
# Test functionality
```

### 3. Release Process

```bash
# Update version
npm version patch  # or minor, major

# Build and test
npm run build
npm run test

# Create release
git push --tags
```

## 🔧 Troubleshooting

### Common Issues

**Node.js Version Issues**
```bash
# Use Node Version Manager
nvm install 18
nvm use 18
```

**Dependency Issues**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Build Issues**
```bash
# Clean and rebuild
npm run clean
npm run build
```

**Test Issues**
```bash
# Clear test cache
npm run test -- --clearCache
```

### Getting Help

- **GitHub Issues**: [Report problems](https://github.com/AmoebeLabs/swiss-army-knife-card/issues)
- **GitHub Discussions**: [Ask questions](https://github.com/AmoebeLabs/swiss-army-knife-card/discussions)
- **Documentation**: [Read the docs](../README.md)

## 📚 Additional Resources

- [Contributing Guide](contributing.md)
- [Architecture Overview](architecture.md)
- [Testing Guide](testing.md)
- [API Reference](api-reference.md)

---

**Last Updated**: December 2024  
**Version**: 3.0.0 (Modernization Phase)