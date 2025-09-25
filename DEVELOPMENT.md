# Development Framework

This document describes the complete development framework implemented for the Swiss Army Knife (SAK) custom card project.

## 🏗️ Architecture Overview

The project has been modernized with a comprehensive development framework that includes:

- **Modern Build System**: Vite for fast development and optimized builds
- **TypeScript**: Full type safety and better developer experience
- **Testing Framework**: Unit, E2E, and visual regression testing
- **CI/CD Pipeline**: Automated testing, building, and deployment
- **Code Quality**: ESLint, Prettier, and automated formatting
- **Security**: Automated vulnerability scanning and security checks
- **Documentation**: Comprehensive documentation and API references

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm 8+
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/AmoebeLabs/swiss-army-knife-card.git
cd swiss-army-knife-card

# Install dependencies
npm install

# Start development server
npm run dev
```

## 📋 Available Scripts

### Development
```bash
npm run dev              # Start development server with hot reload
npm run build            # Build for production
npm run preview          # Preview production build
```

### Testing
```bash
npm run test             # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage report
npm run test:e2e         # Run end-to-end tests
npm run test:visual      # Run visual regression tests
npm run test:performance # Run performance tests
```

### Code Quality
```bash
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues automatically
npm run type-check       # Run TypeScript type checking
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
```

### Utilities
```bash
npm run clean            # Clean build artifacts
npm run analyze          # Analyze bundle size
npm run docs             # Generate documentation
npm run changelog        # Generate changelog
```

## 🧪 Testing Framework

### Unit Testing (Vitest)
- Fast test runner with Vite integration
- TypeScript support out of the box
- Coverage reporting with v8
- Mock support for Home Assistant

### End-to-End Testing (Playwright)
- Cross-browser testing (Chrome, Firefox, Safari)
- Mobile device testing
- Visual regression testing
- Performance testing

### Test Structure
```
src/test/
├── setup.ts              # Test setup and global mocks
├── fixtures/              # Test data and configurations
├── mocks/                 # Mock implementations
└── example.test.ts        # Example unit test

tests/e2e/
└── example.spec.ts        # Example E2E test
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflows

#### Main CI Pipeline (`.github/workflows/ci.yml`)
- Code quality checks (linting, formatting, type checking)
- Unit and E2E testing
- Build verification
- Security scanning
- Automated deployment

#### Pull Request Checks (`.github/workflows/pr.yml`)
- Automated PR validation
- Build status comments
- Test result reporting

#### Release Pipeline (`.github/workflows/release.yml`)
- Automated version bumping
- Changelog generation
- GitHub release creation
- HACS repository updates

#### Security Pipeline (`.github/workflows/security.yml`)
- Dependency vulnerability scanning
- Code security analysis
- Weekly security audits

### Quality Gates
- Test coverage > 80%
- No linting errors
- No TypeScript errors
- Security scan passes
- Build succeeds

## 🛠️ Development Tools

### VS Code Configuration
- Recommended extensions
- Debug configurations
- Workspace settings
- Launch configurations

### TypeScript Configuration
- Strict mode enabled
- Modern ES2022 target
- Declaration file generation
- Source map support

### Build Configuration
- Vite for fast development
- Rollup for optimized production builds
- Tree shaking and code splitting
- Bundle analysis

## 📊 Project Structure

```
swiss-army-knife-card/
├── .github/                    # GitHub workflows and templates
│   ├── workflows/              # CI/CD pipelines
│   ├── ISSUE_TEMPLATE/         # Issue templates
│   └── PULL_REQUEST_TEMPLATE.md
├── .vscode/                    # VS Code configuration
├── src/                        # Source code
│   ├── components/             # UI Components
│   ├── tools/                  # Tool implementations
│   ├── types/                  # TypeScript definitions
│   ├── test/                   # Test files and utilities
│   └── main.ts                 # Main entry point
├── tests/                      # E2E tests
├── docs/                       # Documentation
├── dist/                       # Build output
├── package.json                # Project configuration
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite configuration
├── vitest.config.ts            # Vitest configuration
├── playwright.config.ts        # Playwright configuration
└── .eslintrc.json              # ESLint configuration
```

## 🔒 Security Framework

### Automated Security Checks
- Dependency vulnerability scanning
- Code security analysis
- License compliance checking
- Security policy enforcement

### Security Tools
- npm audit for vulnerability scanning
- Snyk for dependency monitoring
- GitHub Security Advisories
- Automated security updates

## 📈 Performance Monitoring

### Performance Metrics
- Bundle size tracking
- Build time monitoring
- Test execution time
- Memory usage tracking

### Performance Budgets
- Bundle size: < 200KB
- Build time: < 10 seconds
- Test coverage: > 80%
- Performance score: > 90

## 🚀 Deployment

### Automated Deployment
- GitHub Actions triggers
- HACS repository updates
- Version management
- Release automation

### Release Process
1. Automated version bumping
2. Changelog generation
3. Build and test execution
4. GitHub release creation
5. HACS repository update

## 📚 Documentation

### Generated Documentation
- API reference (TypeDoc)
- User guides
- Developer documentation
- Contributing guidelines

### Documentation Structure
```
docs/
├── developer/                  # Developer documentation
├── getting-started/            # Getting started guides
├── user-guides/                # User documentation
├── reference/                  # Reference materials
└── modernization/              # Modernization plans
```

## 🔧 Troubleshooting

### Common Issues

#### Build Issues
```bash
# Clean and rebuild
npm run clean
npm run build
```

#### Test Issues
```bash
# Clear test cache
npm run test -- --clearCache
```

#### Dependency Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Getting Help
- Check the [troubleshooting guide](docs/reference/troubleshooting.md)
- Review [GitHub Issues](https://github.com/AmoebeLabs/swiss-army-knife-card/issues)
- Join [GitHub Discussions](https://github.com/AmoebeLabs/swiss-army-knife-card/discussions)

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

### Code Standards
- TypeScript strict mode
- ESLint and Prettier formatting
- Comprehensive test coverage
- Documentation updates

### Pull Request Process
- All PRs must pass automated checks
- Code review required
- Documentation updates required
- Test coverage maintained

## 📞 Support

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and community help
- **Documentation**: Comprehensive guides and references
- **Security**: security@amoebelabs.com

---

**Last Updated**: December 2024
**Version**: 3.0.0 (Modernization Phase)
