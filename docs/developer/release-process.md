# Release Process

This document outlines the complete release process for the Swiss Army Knife (SAK) custom card, including versioning, testing, deployment, and communication.

## 🏷️ Versioning Strategy

### Semantic Versioning

We follow [Semantic Versioning (SemVer)](https://semver.org/) for all releases:

- **MAJOR** (X.0.0): Breaking changes that require user action
- **MINOR** (X.Y.0): New features that are backward compatible
- **PATCH** (X.Y.Z): Bug fixes that are backward compatible

### Version Numbering

```typescript
// Version format: MAJOR.MINOR.PATCH
// Examples:
"1.0.0"  // Initial release
"1.1.0"  // New features
"1.1.1"  // Bug fixes
"2.0.0"  // Breaking changes
```

### Pre-release Versions

```typescript
// Pre-release formats:
"1.0.0-alpha.1"    // Alpha release
"1.0.0-beta.1"     // Beta release
"1.0.0-rc.1"       // Release candidate
"1.0.0-dev.1"      // Development version
```

## 📋 Release Checklist

### Pre-Release Checklist

- [ ] **Code Quality**
  - [ ] All tests pass
  - [ ] Code coverage > 90%
  - [ ] No linting errors
  - [ ] TypeScript compilation successful
  - [ ] Security scan passes

- [ ] **Documentation**
  - [ ] README updated
  - [ ] Changelog updated
  - [ ] API documentation current
  - [ ] Examples updated
  - [ ] Migration guide (if needed)

- [ ] **Testing**
  - [ ] Unit tests pass
  - [ ] Integration tests pass
  - [ ] E2E tests pass
  - [ ] Visual regression tests pass
  - [ ] Performance tests pass
  - [ ] Cross-browser testing complete

- [ ] **Build**
  - [ ] Production build successful
  - [ ] Bundle size within limits
  - [ ] No build warnings
  - [ ] Source maps generated
  - [ ] Assets optimized

### Release Checklist

- [ ] **Version Management**
  - [ ] Version bumped in package.json
  - [ ] Version bumped in hacs.json
  - [ ] Version bumped in documentation
  - [ ] Git tag created
  - [ ] Release notes prepared

- [ ] **Deployment**
  - [ ] HACS repository updated
  - [ ] GitHub release created
  - [ ] Documentation deployed
  - [ ] Announcement prepared
  - [ ] Community notified

## 🚀 Release Process

### 1. Preparation Phase

**Branch Management:**
```bash
# Ensure main branch is up to date
git checkout main
git pull origin main

# Create release branch
git checkout -b release/v1.2.0
```

**Version Updates:**
```bash
# Update version in package.json
npm version 1.2.0

# Update version in hacs.json
# Update version in documentation
# Update version in README.md
```

**Testing:**
```bash
# Run full test suite
npm run test
npm run test:e2e
npm run test:visual

# Run performance tests
npm run test:performance

# Check bundle size
npm run analyze
```

### 2. Release Phase

**Create Release:**
```bash
# Build production version
npm run build

# Create git tag
git tag -a v1.2.0 -m "Release version 1.2.0"

# Push tag
git push origin v1.2.0
```

**GitHub Release:**
```bash
# Create GitHub release
gh release create v1.2.0 \
  --title "Release v1.2.0" \
  --notes-file CHANGELOG.md \
  --draft=false \
  --prerelease=false
```

**HACS Update:**
```bash
# Update HACS repository
# Copy build artifacts to HACS repo
# Update version information
# Commit and push changes
```

### 3. Post-Release Phase

**Documentation:**
```bash
# Update documentation
# Update examples
# Update migration guides
# Deploy documentation
```

**Communication:**
```bash
# Announce release
# Update community forums
# Send notifications
# Update project status
```

## 📝 Release Notes

### Release Notes Template

```markdown
# Release v1.2.0

## 🎉 What's New

### New Features
- Added new CircleTool with enhanced animations
- Implemented Config Flow integration
- Added support for custom themes

### Improvements
- Improved performance by 30%
- Enhanced error handling
- Better mobile responsiveness

### Bug Fixes
- Fixed color calculation issues
- Resolved Safari compatibility problems
- Fixed memory leak in animations

## 🔄 Breaking Changes

### Configuration Changes
- Updated tool configuration format
- Changed default animation behavior
- Modified color stop syntax

### Migration Guide
1. Update your configuration files
2. Test with new version
3. Update custom templates

## 📊 Performance Improvements

- Bundle size reduced by 20%
- Render time improved by 30%
- Memory usage reduced by 25%

## 🧪 Testing

- 95% test coverage
- All E2E tests pass
- Cross-browser compatibility verified
- Performance benchmarks met

## 📚 Documentation

- Updated user manual
- New examples added
- API documentation updated
- Migration guide available

## 🚀 Installation

### HACS (Recommended)
1. Go to HACS → Frontend
2. Search for "Swiss Army Knife"
3. Click "Download"
4. Restart Home Assistant

### Manual Installation
1. Download from [GitHub Releases](https://github.com/AmoebeLabs/swiss-army-knife-card/releases)
2. Place in `www` folder
3. Add resource to Lovelace
4. Restart Home Assistant

## 🐛 Known Issues

- Safari 14 rendering issues (workaround available)
- Memory leak in complex animations (being fixed)
- Template loading delays (optimization in progress)

## 🔮 What's Next

- Visual configuration tools
- Enhanced theming system
- Performance optimizations
- Accessibility improvements

## 📞 Support

- [GitHub Issues](https://github.com/AmoebeLabs/swiss-army-knife-card/issues)
- [GitHub Discussions](https://github.com/AmoebeLabs/swiss-army-knife-card/discussions)
- [Home Assistant Community](https://community.home-assistant.io/)

## 🙏 Contributors

Thank you to all contributors who made this release possible:
- @contributor1
- @contributor2
- @contributor3

## 📄 Changelog

See [CHANGELOG.md](CHANGELOG.md) for detailed changes.
```

## 🔄 Automated Release Process

### GitHub Actions Workflow

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
      
      - run: npm run test
      
      - run: npm run build
      
      - name: Generate Changelog
        run: |
          # Generate changelog from git history
          # Update version in package.json
          # Update version in hacs.json
      
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
      
      - name: Notify Team
        run: |
          # Send notification to team
          # Update status in project management tool
```

### Release Script

```bash
#!/bin/bash
# scripts/release.sh

set -e

# Get version from command line
VERSION=$1
if [ -z "$VERSION" ]; then
  echo "Usage: $0 <version>"
  exit 1
fi

# Validate version format
if [[ ! $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Invalid version format. Use semantic versioning (e.g., 1.2.0)"
  exit 1
fi

echo "Releasing version $VERSION..."

# Update version in package.json
npm version $VERSION --no-git-tag-version

# Update version in hacs.json
sed -i "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" hacs.json

# Update version in README.md
sed -i "s/Version: .*/Version: $VERSION/" README.md

# Run tests
echo "Running tests..."
npm run test
npm run test:e2e

# Build
echo "Building..."
npm run build

# Check bundle size
echo "Checking bundle size..."
BUNDLE_SIZE=$(stat -c%s dist/swiss-army-knife-card.js)
if [ $BUNDLE_SIZE -gt 200000 ]; then
  echo "Bundle size is too large: $BUNDLE_SIZE bytes"
  exit 1
fi

# Generate changelog
echo "Generating changelog..."
npm run changelog

# Commit changes
git add .
git commit -m "chore: release v$VERSION"

# Create tag
git tag -a v$VERSION -m "Release version $VERSION"

# Push changes
git push origin main
git push origin v$VERSION

echo "Release $VERSION completed successfully!"
```

## 📊 Release Metrics

### Key Performance Indicators

**Release Quality:**
- Test coverage percentage
- Number of bugs reported post-release
- User satisfaction scores
- Performance benchmarks

**Release Process:**
- Time from code freeze to release
- Number of release blockers
- Deployment success rate
- Rollback frequency

**User Adoption:**
- Download count
- Installation success rate
- User feedback scores
- Community engagement

### Release Dashboard

```typescript
// Release metrics tracking
interface ReleaseMetrics {
  version: string;
  releaseDate: Date;
  testCoverage: number;
  bundleSize: number;
  performanceScore: number;
  userSatisfaction: number;
  bugCount: number;
  downloadCount: number;
}
```

## 🚨 Rollback Process

### Emergency Rollback

**Immediate Actions:**
1. Identify the issue
2. Assess impact severity
3. Decide on rollback strategy
4. Execute rollback
5. Communicate to users

**Rollback Steps:**
```bash
# Revert to previous version
git checkout v1.1.0
git tag -a v1.2.1 -m "Hotfix: rollback from v1.2.0"

# Update HACS repository
# Revert to previous version
# Update documentation
# Notify users
```

**Communication:**
```markdown
# Emergency Rollback Notice

## Issue Identified
- Description of the issue
- Impact assessment
- Root cause analysis

## Actions Taken
- Rollback to previous version
- Hotfix in development
- Timeline for resolution

## User Instructions
- Steps to revert to previous version
- Workarounds if available
- Expected resolution timeline

## Contact Information
- Support channels
- Issue tracking
- Updates
```

## 📚 Release Documentation

### Release Notes Archive

```markdown
# Release Notes Archive

## 2024
- [v1.2.0](releases/v1.2.0.md) - New features and improvements
- [v1.1.0](releases/v1.1.0.md) - Bug fixes and enhancements
- [v1.0.0](releases/v1.0.0.md) - Initial release

## 2023
- [v0.9.0](releases/v0.9.0.md) - Beta release
- [v0.8.0](releases/v0.8.0.md) - Alpha release
```

### Migration Guides

```markdown
# Migration Guides

## v1.2.0 Migration Guide
- Configuration changes
- Breaking changes
- Step-by-step migration
- Troubleshooting

## v1.1.0 Migration Guide
- Configuration changes
- Breaking changes
- Step-by-step migration
- Troubleshooting
```

## 🔮 Future Releases

### Release Roadmap

**Q1 2025:**
- v1.3.0: Enhanced theming system
- v1.4.0: Performance optimizations
- v1.5.0: New tools and features

**Q2 2025:**
- v2.0.0: Major architecture update
- v2.1.0: Visual configuration tools
- v2.2.0: Accessibility improvements

**Q3 2025:**
- v2.3.0: Internationalization
- v2.4.0: Advanced animations
- v2.5.0: Plugin system

### Release Planning

**Release Planning Process:**
1. Feature planning and prioritization
2. Technical feasibility assessment
3. Resource allocation
4. Timeline estimation
5. Risk assessment
6. Release schedule

**Release Criteria:**
- All tests pass
- Performance benchmarks met
- Security scan passes
- Documentation complete
- User acceptance testing complete

## 📞 Support and Communication

### Release Communication

**Channels:**
- GitHub Releases
- Home Assistant Community
- Discord/Reddit
- Project website
- Email notifications

**Communication Timeline:**
- 2 weeks before: Release announcement
- 1 week before: Feature preview
- Release day: Release notes and announcement
- 1 week after: User feedback collection
- 2 weeks after: Post-release review

### User Support

**Support Channels:**
- GitHub Issues
- GitHub Discussions
- Home Assistant Community
- Discord server
- Reddit community

**Support Process:**
1. Issue triage and categorization
2. Priority assignment
3. Investigation and resolution
4. User communication
5. Documentation updates

## 📚 Related Documentation

- [CI/CD Pipeline](ci-cd.md)
- [Testing Guide](testing.md)
- [Contributing Guide](contributing.md)
- [Architecture Overview](architecture.md)

---

**Last Updated**: December 2024  
**Version**: 3.0.0 (Modernization Phase)