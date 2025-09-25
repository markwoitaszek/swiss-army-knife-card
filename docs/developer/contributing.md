# Contributing Guide

Thank you for your interest in contributing to the Swiss Army Knife (SAK) custom card! This guide will help you get started with contributing to the project.

## 🤝 How to Contribute

### Types of Contributions

We welcome various types of contributions:

- **Bug Reports**: Report issues and bugs
- **Feature Requests**: Suggest new features or improvements
- **Code Contributions**: Submit code changes and improvements
- **Documentation**: Improve or add documentation
- **Testing**: Help with testing and quality assurance
- **Design**: UI/UX improvements and design suggestions

### Getting Started

1. **Fork the Repository**
   ```bash
   git clone https://github.com/your-username/swiss-army-knife-card.git
   cd swiss-army-knife-card
   ```

2. **Set Up Development Environment**
   ```bash
   npm install
   npm run dev
   ```

3. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make Your Changes**
   - Follow the coding standards
   - Write tests for new functionality
   - Update documentation as needed

5. **Test Your Changes**
   ```bash
   npm run test
   npm run lint
   npm run type-check
   ```

6. **Submit a Pull Request**
   - Create a detailed description
   - Reference any related issues
   - Ensure all checks pass

## 🛠️ Development Setup

### Prerequisites

- **Node.js**: Version 18 or later
- **npm**: Version 8 or later
- **Git**: Latest version
- **Home Assistant**: For testing (local or cloud)

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/AmoebeLabs/swiss-army-knife-card.git
   cd swiss-army-knife-card
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Open in Browser**
   - Navigate to `http://localhost:3000`
   - The development server will automatically reload on changes

### Development Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build

# Testing
npm run test             # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage
npm run test:e2e         # Run end-to-end tests

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run type-check       # Run TypeScript type checking
npm run format           # Format code with Prettier

# Utilities
npm run clean            # Clean build artifacts
npm run analyze          # Analyze bundle size
npm run docs             # Generate documentation
```

## 📝 Coding Standards

### TypeScript Guidelines

1. **Use TypeScript Strict Mode**
   ```typescript
   // Good
   interface UserConfig {
     name: string;
     age: number;
     isActive: boolean;
   }
   
   // Bad
   function processUser(user: any) {
     // No type safety
   }
   ```

2. **Prefer Interfaces over Types**
   ```typescript
   // Good
   interface ToolConfig {
     type: string;
     position: Position;
   }
   
   // Avoid
   type ToolConfig = {
     type: string;
     position: Position;
   }
   ```

3. **Use Proper Naming Conventions**
   ```typescript
   // Good
   class CircleTool extends BaseTool {}
   const MAX_RADIUS = 100;
   const isToolActive = true;
   
   // Bad
   class circletool extends basetool {}
   const maxradius = 100;
   const toolactive = true;
   ```

### Lit Component Guidelines

1. **Use Decorators Properly**
   ```typescript
   @customElement('sak-card')
   export class SakCard extends LitElement {
     @property() config: SakConfig;
     @state() private isLoaded = false;
     
     @query('.main-content') private mainContent!: HTMLElement;
   }
   ```

2. **Implement Lifecycle Methods**
   ```typescript
   connectedCallback() {
     super.connectedCallback();
     this.initializeComponent();
   }
   
   disconnectedCallback() {
     super.disconnectedCallback();
     this.cleanup();
   }
   
   firstUpdated() {
     this.setupEventListeners();
   }
   ```

3. **Use Reactive Properties**
   ```typescript
   @property({ type: Boolean, reflect: true })
   disabled = false;
   
   @property({ attribute: 'entity-id' })
   entityId = '';
   
   @state()
   private entityState?: EntityState;
   ```

### CSS and Styling Guidelines

1. **Use CSS Custom Properties**
   ```typescript
   static get styles() {
     return css`
       :host {
         --sak-primary-color: var(--primary-color, #1976d2);
         --sak-border-radius: 4px;
       }
       
       .sak-card {
         background: var(--sak-primary-color);
         border-radius: var(--sak-border-radius);
       }
     `;
   }
   ```

2. **Follow BEM Naming Convention**
   ```css
   .sak-card { }
   .sak-card__header { }
   .sak-card__content { }
   .sak-card--disabled { }
   .sak-card__tool--active { }
   ```

3. **Use Semantic Class Names**
   ```typescript
   // Good
   <div class="tool-container">
     <div class="tool-content">
       <span class="tool-label">Temperature</span>
     </div>
   </div>
   
   // Bad
   <div class="div1">
     <div class="div2">
       <span class="span1">Temperature</span>
     </div>
   </div>
   ```

## 🧪 Testing Guidelines

### Unit Testing

1. **Test Structure**
   ```typescript
   import { describe, it, expect, beforeEach } from 'vitest';
   import { render, screen } from '@testing-library/lit';
   import { CircleTool } from '../CircleTool';
   
   describe('CircleTool', () => {
     let tool: CircleTool;
   
     beforeEach(() => {
       tool = new CircleTool();
     });
   
     it('should render a circle with correct radius', () => {
       tool.config = {
         position: { cx: 50, cy: 50, radius: 20 },
         entity_index: 0
       };
   
       const result = tool.render();
       expect(result).toContain('circle');
       expect(result).toContain('r="20"');
     });
   });
   ```

2. **Test Coverage Requirements**
   - **Components**: 90% coverage
   - **Tools**: 80% coverage
   - **Utilities**: 95% coverage
   - **Services**: 85% coverage

3. **Test Categories**
   ```typescript
   // Component rendering
   it('should render correctly with valid config', () => {});
   
   // Property updates
   it('should update when config changes', () => {});
   
   // Event handling
   it('should handle tap events', () => {});
   
   // Error conditions
   it('should handle invalid configuration', () => {});
   ```

### Integration Testing

1. **End-to-End Tests**
   ```typescript
   import { test, expect } from '@playwright/test';
   
   test('should display temperature card', async ({ page }) => {
     await page.goto('/test-page');
     
     const card = page.locator('sak-card');
     await expect(card).toBeVisible();
     
     const temperature = card.locator('.temperature-value');
     await expect(temperature).toContainText('20°C');
   });
   ```

2. **Visual Regression Tests**
   ```typescript
   import { test, expect } from '@playwright/test';
   
   test('temperature card visual regression', async ({ page }) => {
     await page.goto('/test-page');
     
     const card = page.locator('sak-card');
     await expect(card).toHaveScreenshot('temperature-card.png');
   });
   ```

## 📋 Pull Request Guidelines

### Before Submitting

1. **Check Your Changes**
   ```bash
   npm run lint
   npm run type-check
   npm run test
   npm run build
   ```

2. **Update Documentation**
   - Update relevant documentation
   - Add JSDoc comments for new functions
   - Update README if needed

3. **Write a Good Description**
   ```markdown
   ## Description
   Brief description of what this PR does.
   
   ## Changes
   - Added new CircleTool component
   - Implemented radius validation
   - Added unit tests
   
   ## Testing
   - [ ] Unit tests pass
   - [ ] Integration tests pass
   - [ ] Manual testing completed
   
   ## Screenshots
   (if applicable)
   
   ## Related Issues
   Fixes #123
   ```

### PR Template

```markdown
## Description
<!-- Brief description of changes -->

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Changes Made
<!-- List of specific changes -->

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed
- [ ] All existing tests pass

## Screenshots
<!-- If applicable, add screenshots -->

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
- [ ] Tests added/updated

## Related Issues
<!-- Link to related issues -->
```

## 🐛 Bug Reports

### Before Reporting

1. **Check Existing Issues**
   - Search for similar issues
   - Check if the issue is already reported

2. **Try to Reproduce**
   - Test with latest version
   - Try different configurations
   - Check browser console for errors

### Bug Report Template

```markdown
## Bug Description
<!-- Clear description of the bug -->

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
<!-- What you expected to happen -->

## Actual Behavior
<!-- What actually happened -->

## Environment
- Home Assistant Version: 
- SAK Version: 
- Browser: 
- OS: 

## Configuration
```yaml
# Your SAK configuration (remove sensitive data)
```

## Screenshots
<!-- If applicable, add screenshots -->

## Browser Console
<!-- Any error messages from browser console -->
```

## 💡 Feature Requests

### Before Requesting

1. **Check Existing Features**
   - Review current functionality
   - Check if similar features exist

2. **Consider Alternatives**
   - Can it be achieved with current tools?
   - Is it a common use case?

### Feature Request Template

```markdown
## Feature Description
<!-- Clear description of the feature -->

## Use Case
<!-- Why is this feature needed? -->

## Proposed Solution
<!-- How should this feature work? -->

## Alternatives Considered
<!-- Other ways to achieve the same goal -->

## Additional Context
<!-- Any other relevant information -->
```

## 📚 Documentation Contributions

### Types of Documentation

1. **User Documentation**
   - Installation guides
   - Configuration examples
   - Troubleshooting guides

2. **Developer Documentation**
   - API references
   - Architecture guides
   - Contributing guidelines

3. **Code Documentation**
   - JSDoc comments
   - Inline comments
   - README files

### Documentation Standards

1. **Use Clear Language**
   - Write in simple, clear English
   - Avoid jargon and technical terms
   - Use active voice

2. **Provide Examples**
   ```markdown
   ## Configuration Example
   
   ```yaml
   type: custom:swiss-army-knife-card
   entities:
     - entity: sensor.temperature
   layout:
     toolsets:
       - toolset: main
         position:
           cx: 50
           cy: 50
         tools:
           - type: circle
             position:
               cx: 50
               cy: 50
               radius: 20
   ```
   ```

3. **Keep Documentation Updated**
   - Update docs with code changes
   - Remove outdated information
   - Add new features to docs

## 🏷️ Release Process

### Version Numbering

We use [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist

1. **Pre-Release**
   - [ ] All tests pass
   - [ ] Documentation updated
   - [ ] Changelog updated
   - [ ] Version bumped

2. **Release**
   - [ ] Create release tag
   - [ ] Generate release notes
   - [ ] Publish to npm (if applicable)
   - [ ] Update HACS (if applicable)

3. **Post-Release**
   - [ ] Monitor for issues
   - [ ] Update documentation
   - [ ] Announce release

## 🤔 Getting Help

### Community Support

1. **GitHub Discussions**
   - General questions
   - Feature discussions
   - Community help

2. **GitHub Issues**
   - Bug reports
   - Feature requests
   - Security issues

3. **Home Assistant Community**
   - Home Assistant forums
   - Discord channels
   - Reddit communities

### Development Help

1. **Code Review**
   - Ask for reviews on draft PRs
   - Request feedback on architecture
   - Get help with complex changes

2. **Mentoring**
   - Pair programming sessions
   - Architecture discussions
   - Best practices guidance

## 📄 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of:

- Age, body size, disability, ethnicity
- Gender identity and expression
- Level of experience, education
- Nationality, personal appearance
- Race, religion, sexual orientation

### Expected Behavior

- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, trolling, or inflammatory comments
- Personal attacks or political discussions
- Public or private harassment
- Publishing private information without permission
- Any conduct inappropriate in a professional setting

## 📞 Contact

- **Maintainer**: AmoebeLabs
- **Email**: [Contact through GitHub](https://github.com/AmoebeLabs/swiss-army-knife-card/issues)
- **Discussions**: [GitHub Discussions](https://github.com/AmoebeLabs/swiss-army-knife-card/discussions)

---

Thank you for contributing to the Swiss Army Knife custom card! Your contributions help make this project better for everyone.

**Last Updated**: December 2024  
**Version**: 3.0.0 (Modernization Phase)