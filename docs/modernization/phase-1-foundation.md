# Phase 1: Foundation & Core Modernization

Phase 1 establishes the modern development foundation for the Swiss Army Knife (SAK) custom card. This phase focuses on upgrading core technologies, refactoring the architecture, and implementing modern development practices.

## 🎯 Phase 1 Objectives

### Primary Goals

1. **Technology Upgrade**
   - Migrate from Lit Element 2.5.1 to Lit 3.x
   - Implement TypeScript for type safety
   - Modernize build system with Vite

2. **Architecture Refactoring**
   - Break down monolithic structure
   - Implement proper state management
   - Add error boundaries and error handling

3. **Development Experience**
   - Establish testing framework
   - Implement modern tooling
   - Create development documentation

## 📋 Detailed Implementation Plan

### Week 1-2: Lit 3.x Migration

#### Task 1.1: Dependency Analysis and Planning

**Current State:**
```json
{
  "lit-element": "^2.5.1",    // ❌ DEPRECATED
  "lit-html": "^1.4.1"        // ❌ DEPRECATED
}
```

**Target State:**
```json
{
  "lit": "^3.0.0"             // ✅ MODERN
}
```

**Implementation Steps:**

1. **Analyze Breaking Changes**
   ```typescript
   // Current (Lit Element 2.5.1)
   import { LitElement, html, css } from 'lit-element';
   
   // Target (Lit 3.x)
   import { LitElement, html, css } from 'lit';
   ```

2. **Update Import Statements**
   - Replace all `lit-element` imports with `lit`
   - Remove `lit-html` imports (merged into `lit`)
   - Update directive imports

3. **Update Component Lifecycle**
   ```typescript
   // Current lifecycle methods
   connectedCallback() { /* ... */ }
   disconnectedCallback() { /* ... */ }
   firstUpdated() { /* ... */ }
   updated() { /* ... */ }
   
   // Lit 3.x lifecycle (mostly compatible)
   // Minimal changes required
   ```

**Deliverables:**
- [ ] Updated package.json with Lit 3.x
- [ ] All import statements updated
- [ ] Component lifecycle verified
- [ ] Basic functionality working

#### Task 1.2: Component Refactoring

**Current Issues:**
- Monolithic `main.js` (1,940+ lines)
- Tightly coupled components
- No proper separation of concerns

**Refactoring Strategy:**

1. **Extract Base Classes**
   ```typescript
   // src/base/SakCard.ts
   export abstract class SakCard extends LitElement {
     // Common card functionality
   }
   
   // src/base/SakTool.ts
   export abstract class SakTool extends LitElement {
     // Common tool functionality
   }
   ```

2. **Create Tool Modules**
   ```typescript
   // src/tools/CircleTool.ts
   export class CircleTool extends SakTool {
     // Circle-specific implementation
   }
   
   // src/tools/RectangleTool.ts
   export class RectangleTool extends SakTool {
     // Rectangle-specific implementation
   }
   ```

3. **Implement State Management**
   ```typescript
   // src/state/SakState.ts
   export class SakState {
     private _entities: EntityState[] = [];
     private _toolsets: ToolsetState[] = [];
     
     // State management methods
   }
   ```

**Deliverables:**
- [ ] Modular component structure
- [ ] Base classes implemented
- [ ] Individual tool modules
- [ ] State management system

### Week 3-4: TypeScript Implementation

#### Task 1.3: TypeScript Configuration

**Setup TypeScript:**

1. **Install Dependencies**
   ```bash
   npm install -D typescript @types/node
   npm install -D @typescript-eslint/parser @typescript-eslint/eslint-plugin
   ```

2. **Create tsconfig.json**
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

3. **Convert JavaScript Files**
   ```typescript
   // src/types/SakTypes.ts
   export interface SakConfig {
     entities: EntityConfig[];
     layout: LayoutConfig;
     aspectratio?: string;
     theme?: string;
   }
   
   export interface EntityConfig {
     entity: string;
     name?: string;
     icon?: string;
     unit?: string;
     attribute?: string;
     secondary_info?: string;
   }
   
   export interface LayoutConfig {
     aspectratio?: string;
     styles?: StyleConfig;
     toolsets: ToolsetConfig[];
   }
   ```

**Deliverables:**
- [ ] TypeScript configuration
- [ ] Type definitions for all interfaces
- [ ] All JavaScript files converted to TypeScript
- [ ] Type safety implemented

#### Task 1.4: Error Handling and Boundaries

**Implement Error Boundaries:**

1. **Create Error Boundary Component**
   ```typescript
   // src/components/ErrorBoundary.ts
   export class ErrorBoundary extends LitElement {
     @state() hasError = false;
     @state() error?: Error;
   
     static get styles() {
       return css`
         .error-container {
           padding: 1rem;
           border: 1px solid #ff0000;
           background: #ffe6e6;
           border-radius: 4px;
         }
       `;
     }
   
     render() {
       if (this.hasError) {
         return html`
           <div class="error-container">
             <h3>Something went wrong</h3>
             <p>${this.error?.message}</p>
             <button @click=${this.retry}>Retry</button>
           </div>
         `;
       }
       return html`<slot></slot>`;
     }
   }
   ```

2. **Add Error Handling to Tools**
   ```typescript
   // src/tools/BaseTool.ts
   export abstract class BaseTool extends LitElement {
     protected handleError(error: Error, context: string) {
       console.error(`Error in ${context}:`, error);
       this.dispatchEvent(new CustomEvent('sak-error', {
         detail: { error, context },
         bubbles: true
       }));
     }
   }
   ```

**Deliverables:**
- [ ] Error boundary component
- [ ] Error handling in all tools
- [ ] Error reporting system
- [ ] Graceful degradation

### Week 5-6: Build System Modernization

#### Task 1.5: Vite Implementation

**Replace Rollup with Vite:**

1. **Install Vite Dependencies**
   ```bash
   npm install -D vite @vitejs/plugin-legacy
   npm install -D vite-plugin-dts
   ```

2. **Create vite.config.ts**
   ```typescript
   import { defineConfig } from 'vite';
   import { resolve } from 'path';
   import dts from 'vite-plugin-dts';
   
   export default defineConfig({
     plugins: [
       dts({
         insertTypesEntry: true,
       }),
     ],
     build: {
       lib: {
         entry: resolve(__dirname, 'src/main.ts'),
         name: 'SwissArmyKnifeCard',
         fileName: 'swiss-army-knife-card',
         formats: ['es']
       },
       rollupOptions: {
         external: ['lit'],
         output: {
           globals: {
             lit: 'Lit'
           }
         }
       }
     },
     server: {
       port: 3000,
       open: true
     }
   });
   ```

3. **Update Package Scripts**
   ```json
   {
     "scripts": {
       "dev": "vite",
       "build": "tsc && vite build",
       "preview": "vite preview",
       "type-check": "tsc --noEmit"
     }
   }
   ```

**Deliverables:**
- [ ] Vite configuration
- [ ] Build scripts updated
- [ ] Development server working
- [ ] Production build optimized

#### Task 1.6: Testing Framework

**Implement Testing:**

1. **Install Testing Dependencies**
   ```bash
   npm install -D vitest @vitest/ui
   npm install -D @testing-library/lit
   npm install -D jsdom
   ```

2. **Create Test Configuration**
   ```typescript
   // vitest.config.ts
   import { defineConfig } from 'vitest/config';
   
   export default defineConfig({
     test: {
       environment: 'jsdom',
       globals: true,
       setupFiles: ['./src/test/setup.ts']
     }
   });
   ```

3. **Create Test Setup**
   ```typescript
   // src/test/setup.ts
   import { expect, afterEach } from 'vitest';
   import { cleanup } from '@testing-library/lit';
   
   afterEach(() => {
     cleanup();
   });
   ```

4. **Write Unit Tests**
   ```typescript
   // src/tools/__tests__/CircleTool.test.ts
   import { describe, it, expect } from 'vitest';
   import { CircleTool } from '../CircleTool';
   
   describe('CircleTool', () => {
     it('should render a circle', () => {
       const tool = new CircleTool();
       // Test implementation
     });
   });
   ```

**Deliverables:**
- [ ] Testing framework setup
- [ ] Unit tests for core components
- [ ] Test coverage reporting
- [ ] CI/CD integration

## 🧪 Testing Strategy

### Unit Testing

**Test Coverage Goals:**
- Core components: 90%
- Tools: 80%
- Utilities: 95%
- Overall: 80%

**Test Categories:**

1. **Component Tests**
   ```typescript
   // Test component rendering
   // Test property updates
   // Test event handling
   // Test lifecycle methods
   ```

2. **Tool Tests**
   ```typescript
   // Test tool rendering
   // Test entity integration
   // Test animations
   // Test user interactions
   ```

3. **Utility Tests**
   ```typescript
   // Test helper functions
   // Test data transformations
   // Test validation logic
   // Test error handling
   ```

### Integration Testing

**Test Scenarios:**
- Card rendering with multiple toolsets
- Entity state updates
- Theme switching
- Configuration changes

### Performance Testing

**Performance Benchmarks:**
- Initial render time: < 50ms
- State update time: < 20ms
- Memory usage: < 10MB per card
- Bundle size: < 200KB

## 📊 Success Metrics

### Technical Metrics

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| **Build Time** | 30+ seconds | < 10 seconds | 🎯 |
| **Bundle Size** | 500KB | < 200KB | 🎯 |
| **TypeScript Coverage** | 0% | > 80% | 🎯 |
| **Test Coverage** | 0% | > 80% | 🎯 |
| **Error Rate** | High | < 1% | 🎯 |

### Quality Metrics

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| **Code Maintainability** | Low | High | 🎯 |
| **Developer Experience** | Poor | Excellent | 🎯 |
| **Documentation Coverage** | Minimal | Comprehensive | 🎯 |
| **Performance** | Poor | Excellent | 🎯 |

## 🚨 Risk Mitigation

### High-Risk Items

**Risk: Breaking Changes in Lit 3.x**
- **Mitigation**: Comprehensive testing, gradual migration
- **Contingency**: Fallback to Lit 2.x if critical issues arise

**Risk: TypeScript Migration Complexity**
- **Mitigation**: Incremental conversion, type definitions first
- **Contingency**: JavaScript fallback for complex components

**Risk: Performance Regression**
- **Mitigation**: Performance budgets, continuous monitoring
- **Contingency**: Optimization sprints, bundle analysis

### Medium-Risk Items

**Risk: Build System Issues**
- **Mitigation**: Parallel Rollup setup during transition
- **Contingency**: Rollback to Rollup if Vite issues persist

**Risk: Testing Framework Complexity**
- **Mitigation**: Start with simple tests, expand gradually
- **Contingency**: Manual testing as fallback

## 📋 Deliverables Checklist

### Week 1-2: Lit 3.x Migration
- [ ] Dependency analysis completed
- [ ] Package.json updated with Lit 3.x
- [ ] All import statements updated
- [ ] Component lifecycle verified
- [ ] Basic functionality working
- [ ] Breaking changes documented

### Week 3-4: TypeScript Implementation
- [ ] TypeScript configuration created
- [ ] Type definitions for all interfaces
- [ ] All JavaScript files converted to TypeScript
- [ ] Type safety implemented
- [ ] Error boundaries added
- [ ] Error handling implemented

### Week 5-6: Build System Modernization
- [ ] Vite configuration created
- [ ] Build scripts updated
- [ ] Development server working
- [ ] Production build optimized
- [ ] Testing framework setup
- [ ] Unit tests written
- [ ] Test coverage reporting

### Final Deliverables
- [ ] Modern TypeScript codebase
- [ ] Vite build system
- [ ] Modular component architecture
- [ ] Comprehensive testing framework
- [ ] Error handling and boundaries
- [ ] Performance optimizations
- [ ] Documentation updates

## 🔄 Next Steps

After Phase 1 completion:

1. **Phase 2 Preparation**: Begin HACS integration planning
2. **User Testing**: Test Phase 1 changes with beta users
3. **Performance Monitoring**: Monitor production performance
4. **Documentation**: Update all documentation for new architecture

## 📚 Related Documentation

- [Modernization Overview](overview.md) - Complete modernization strategy
- [Phase 2: HACS Integration](phase-2-hacs.md) - Next phase details
- [Technical Architecture](../developer/architecture.md) - Architecture details
- [Contributing Guide](../developer/contributing.md) - Development guidelines
- [Testing Guide](../developer/testing.md) - Testing strategies

---

**Phase 1 Timeline**: 4-6 weeks  
**Status**: Planning  
**Next Milestone**: Lit 3.x Migration Complete  
**Success Criteria**: All existing functionality preserved with modern architecture