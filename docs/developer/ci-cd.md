# CI/CD Documentation

This document describes the Continuous Integration and Continuous Deployment (CI/CD) pipeline for the Swiss Army Knife (SAK) custom card project.

## 🚀 Overview

Our CI/CD pipeline ensures code quality, automated testing, and reliable deployments. The pipeline is built using GitHub Actions and follows modern DevOps best practices.

## 📋 Pipeline Stages

### 1. Code Quality Checks

**Trigger**: Every push and pull request

**Steps:**
- Lint code with ESLint
- Format check with Prettier
- TypeScript type checking
- Security vulnerability scanning

**Tools:**
- ESLint
- Prettier
- TypeScript Compiler
- npm audit

### 2. Testing

**Trigger**: Every push and pull request

**Steps:**
- Unit tests with Vitest
- Integration tests
- End-to-end tests with Playwright
- Visual regression tests
- Performance tests

**Tools:**
- Vitest
- Playwright
- Chromatic (visual testing)

### 3. Build

**Trigger**: Every push and pull request

**Steps:**
- Production build with Vite
- Bundle size analysis
- Asset optimization
- Source map generation

**Tools:**
- Vite
- Rollup
- Bundle Analyzer

### 4. Deployment

**Trigger**: 
- `main` branch (production)
- `develop` branch (staging)
- Release tags (production)

**Steps:**
- Deploy to staging/production
- Update HACS repository
- Create GitHub release
- Update documentation

## 🔧 GitHub Actions Workflows

### Main Workflow

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]
  release:
    types: [ published ]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      
      - run: npm run lint
      
      - run: npm run format:check
      
      - run: npm run type-check
      
      - run: npm audit --audit-level moderate

  test:
    runs-on: ubuntu-latest
    needs: quality
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      
      - run: npm run test:coverage
      
      - uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
      
      - run: npm run test:e2e
      
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-results
          path: test-results/

  build:
    runs-on: ubuntu-latest
    needs: [quality, test]
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      
      - run: npm run build
      
      - run: npm run analyze
      
      - uses: actions/upload-artifact@v4
        with:
          name: build-artifacts
          path: dist/

  deploy:
    runs-on: ubuntu-latest
    needs: [quality, test, build]
    if: github.ref == 'refs/heads/main' || startsWith(github.ref, 'refs/tags/')
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/download-artifact@v4
        with:
          name: build-artifacts
          path: dist/
      
      - name: Deploy to HACS
        run: |
          # Deploy to HACS repository
          # Update version information
          # Update documentation
      
      - name: Create GitHub Release
        if: startsWith(github.ref, 'refs/tags/')
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          draft: false
          prerelease: false
```

### Pull Request Workflow

```yaml
# .github/workflows/pr.yml
name: Pull Request Checks

on:
  pull_request:
    branches: [ main, develop ]

jobs:
  pr-checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      
      - run: npm run lint
      
      - run: npm run type-check
      
      - run: npm run test
      
      - run: npm run build
      
      - name: Comment PR
        uses: actions/github-script@v7
        with:
          script: |
            const { data: comments } = await github.rest.issues.listComments({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
            });
            
            const botComment = comments.find(comment => 
              comment.user.type === 'Bot' && comment.body.includes('## Build Status')
            );
            
            const body = `## Build Status ✅
            
            All checks passed successfully!
            
            - ✅ Linting
            - ✅ Type checking
            - ✅ Tests
            - ✅ Build
            
            Ready for review!`;
            
            if (botComment) {
              await github.rest.issues.updateComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                comment_id: botComment.id,
                body: body
              });
            } else {
              await github.rest.issues.createComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: context.issue.number,
                body: body
              });
            }
```

### Release Workflow

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      
      - run: npm run build
      
      - name: Generate Changelog
        run: |
          # Generate changelog from git history
          # Update version in package.json
          # Update documentation
      
      - name: Create Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          body_path: CHANGELOG.md
          draft: false
          prerelease: false
      
      - name: Update HACS
        run: |
          # Update HACS repository
          # Update version information
          # Update documentation
```

## 🧪 Testing Pipeline

### Unit Testing

```yaml
# .github/workflows/test-unit.yml
name: Unit Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20]
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - run: npm ci
      
      - run: npm run test:coverage
      
      - uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          flags: unit-tests
          name: unit-tests-${{ matrix.node-version }}
```

### End-to-End Testing

```yaml
# .github/workflows/test-e2e.yml
name: E2E Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      
      - run: npx playwright install --with-deps
      
      - run: npm run test:e2e
      
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

### Visual Regression Testing

```yaml
# .github/workflows/test-visual.yml
name: Visual Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  visual-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      
      - run: npm run test:visual
      
      - name: Chromatic
        uses: chromaui/action@v1
        with:
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
          token: ${{ secrets.GITHUB_TOKEN }}
```

## 🔒 Security Pipeline

### Security Scanning

```yaml
# .github/workflows/security.yml
name: Security

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]
  schedule:
    - cron: '0 0 * * 0'  # Weekly

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      
      - run: npm audit --audit-level moderate
      
      - name: Run Snyk to check for vulnerabilities
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
      
      - name: Upload Snyk results to GitHub Code Scanning
        uses: github/codeql-action/upload-sarif@v2
        if: always()
        with:
          sarif_file: snyk.sarif
```

### Dependency Updates

```yaml
# .github/workflows/dependabot.yml
name: Dependabot

on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly

jobs:
  dependabot:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      
      - run: npm update
      
      - run: npm audit fix
      
      - name: Create Pull Request
        uses: peter-evans/create-pull-request@v5
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          commit-message: 'chore: update dependencies'
          title: 'chore: update dependencies'
          body: |
            This PR updates dependencies to their latest versions.
            
            - Updated npm packages
            - Fixed security vulnerabilities
            - Updated lock file
          branch: dependabot/update-dependencies
```

## 📊 Quality Gates

### Code Quality Metrics

```yaml
# .github/workflows/quality.yml
name: Quality Gates

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      
      - run: npm run test:coverage
      
      - name: Quality Gate
        run: |
          # Check test coverage
          COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
          if (( $(echo "$COVERAGE < 80" | bc -l) )); then
            echo "Coverage is below 80%: $COVERAGE%"
            exit 1
          fi
          
          # Check bundle size
          BUNDLE_SIZE=$(stat -c%s dist/swiss-army-knife-card.js)
          if [ $BUNDLE_SIZE -gt 200000 ]; then
            echo "Bundle size is too large: $BUNDLE_SIZE bytes"
            exit 1
          fi
          
          echo "Quality gates passed!"
```

### Performance Testing

```yaml
# .github/workflows/performance.yml
name: Performance

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      
      - run: npm run build
      
      - run: npm run test:performance
      
      - name: Performance Budget
        run: |
          # Check performance metrics
          RENDER_TIME=$(cat performance/results.json | jq '.renderTime')
          if (( $(echo "$RENDER_TIME > 100" | bc -l) )); then
            echo "Render time exceeds budget: ${RENDER_TIME}ms"
            exit 1
          fi
          
          MEMORY_USAGE=$(cat performance/results.json | jq '.memoryUsage')
          if (( $(echo "$MEMORY_USAGE > 10485760" | bc -l) )); then
            echo "Memory usage exceeds budget: ${MEMORY_USAGE} bytes"
            exit 1
          fi
          
          echo "Performance budget passed!"
```

## 🚀 Deployment Pipeline

### Staging Deployment

```yaml
# .github/workflows/deploy-staging.yml
name: Deploy to Staging

on:
  push:
    branches: [ develop ]

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      
      - run: npm run build
      
      - name: Deploy to Staging
        run: |
          # Deploy to staging environment
          # Update staging HACS repository
          # Run smoke tests
      
      - name: Notify Team
        run: |
          # Send notification to team
          # Update status in project management tool
```

### Production Deployment

```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  push:
    tags:
      - 'v*'

jobs:
  deploy-production:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      
      - run: npm run build
      
      - name: Deploy to Production
        run: |
          # Deploy to production environment
          # Update production HACS repository
          # Update documentation
      
      - name: Create Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          body_path: CHANGELOG.md
          draft: false
          prerelease: false
      
      - name: Notify Team
        run: |
          # Send notification to team
          # Update status in project management tool
```

## 📈 Monitoring and Alerting

### Pipeline Monitoring

```yaml
# .github/workflows/monitor.yml
name: Pipeline Monitoring

on:
  workflow_run:
    workflows: ["CI/CD Pipeline"]
    types: [completed]

jobs:
  monitor:
    runs-on: ubuntu-latest
    if: ${{ github.event.workflow_run.conclusion != 'success' }}
    steps:
      - name: Alert on Failure
        run: |
          # Send alert to team
          # Update monitoring dashboard
          # Create incident ticket
```

### Performance Monitoring

```yaml
# .github/workflows/monitor-performance.yml
name: Performance Monitoring

on:
  schedule:
    - cron: '0 0 * * *'  # Daily

jobs:
  monitor-performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      
      - run: npm run build
      
      - run: npm run test:performance
      
      - name: Update Performance Dashboard
        run: |
          # Update performance metrics
          # Check for regressions
          # Alert if performance degrades
```

## 🔧 Configuration

### Environment Variables

```yaml
# .github/workflows/env.yml
env:
  NODE_ENV: production
  NPM_CONFIG_CACHE: ~/.npm
  NPM_CONFIG_PREFER_OFFLINE: true
```

### Secrets

Required secrets in GitHub repository:

- `GITHUB_TOKEN`: GitHub API token
- `CHROMATIC_PROJECT_TOKEN`: Chromatic project token
- `SNYK_TOKEN`: Snyk security token
- `HACS_TOKEN`: HACS deployment token

### Branch Protection

Configure branch protection rules:

- Require status checks to pass
- Require up-to-date branches
- Require pull request reviews
- Restrict pushes to main branch

## 📊 Metrics and Reporting

### Code Coverage

```yaml
# .github/workflows/coverage.yml
name: Code Coverage

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  coverage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      
      - run: npm run test:coverage
      
      - uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella
          fail_ci_if_error: true
```

### Bundle Analysis

```yaml
# .github/workflows/bundle-analysis.yml
name: Bundle Analysis

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  bundle-analysis:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      
      - run: npm run build
      
      - run: npm run analyze
      
      - uses: actions/upload-artifact@v4
        with:
          name: bundle-analysis
          path: dist/analysis/
```

## 🚨 Troubleshooting

### Common Issues

**Pipeline Failures:**
- Check logs for specific error messages
- Verify environment variables and secrets
- Check branch protection rules
- Verify dependency versions

**Test Failures:**
- Check test environment setup
- Verify test data and fixtures
- Check for flaky tests
- Review test coverage

**Build Failures:**
- Check TypeScript compilation errors
- Verify build configuration
- Check for missing dependencies
- Review bundle size limits

### Debugging

**Enable Debug Logging:**
```yaml
- name: Debug
  run: |
    echo "Debug information:"
    echo "Node version: $(node --version)"
    echo "NPM version: $(npm --version)"
    echo "Working directory: $(pwd)"
    echo "Files: $(ls -la)"
```

**Artifact Collection:**
```yaml
- uses: actions/upload-artifact@v4
  if: always()
  with:
    name: debug-logs
    path: |
      logs/
      coverage/
      test-results/
```

## 📚 Related Documentation

- [Development Setup](development-setup.md)
- [Testing Guide](testing.md)
- [Contributing Guide](contributing.md)
- [Architecture Overview](architecture.md)

---

**Last Updated**: December 2024  
**Version**: 3.0.0 (Modernization Phase)