# Testing Guide

This guide covers testing strategies, frameworks, and best practices for the Swiss Army Knife (SAK) custom card project.

## 🧪 Testing Strategy

### Testing Pyramid

Our testing strategy follows the testing pyramid approach:

```
    /\
   /  \     E2E Tests (Few)
  /____\    
 /      \   Integration Tests (Some)
/________\  
/          \ Unit Tests (Many)
/____________\
```

### Test Categories

1. **Unit Tests** (70%)
   - Individual component testing
   - Tool functionality testing
   - Utility function testing
   - State management testing

2. **Integration Tests** (20%)
   - Component interaction testing
   - Service integration testing
   - API integration testing

3. **End-to-End Tests** (10%)
   - Full user workflow testing
   - Cross-browser testing
   - Performance testing

## 🛠️ Testing Frameworks

### Unit Testing - Vitest

**Why Vitest?**
- Fast execution (Vite-powered)
- TypeScript support out of the box
- Jest-compatible API
- Great developer experience

**Installation:**
```bash
npm install -D vitest @vitest/ui
```

**Configuration:**
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*'
      ]
    }
  }
});
```

### End-to-End Testing - Playwright

**Why Playwright?**
- Cross-browser support
- Fast execution
- Great debugging tools
- Reliable automation

**Installation:**
```bash
npm install -D @playwright/test
npx playwright install
```

**Configuration:**
```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
```

### Visual Regression Testing - Chromatic

**Why Chromatic?**
- Automated visual testing
- Cross-browser visual comparison
- Component isolation
- Design system integration

**Installation:**
```bash
npm install -D chromatic
```

## 📝 Unit Testing

### Component Testing

**Test Structure:**
```typescript
// src/components/__tests__/SakCard.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/lit';
import { SakCard } from '../SakCard';

describe('SakCard', () => {
  let card: SakCard;

  beforeEach(() => {
    card = new SakCard();
  });

  it('should render with basic configuration', async () => {
    const config = {
      entities: [{ entity: 'sensor.test' }],
      layout: { toolsets: [] }
    };
    
    render(html`<sak-card .config=${config}></sak-card>`);
    
    expect(screen.getByRole('region')).toBeInTheDocument();
  });

  it('should handle entity updates', async () => {
    // Test entity update handling
  });

  it('should handle configuration changes', async () => {
    // Test configuration change handling
  });
});
```

### Tool Testing

**Tool Test Example:**
```typescript
// src/tools/__tests__/CircleTool.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
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

  it('should update color based on entity state', () => {
    // Test color updates
  });

  it('should handle animations', () => {
    // Test animation handling
  });
});
```

### Utility Testing

**Utility Test Example:**
```typescript
// src/utils/__tests__/ColorUtils.test.ts
import { describe, it, expect } from 'vitest';
import { ColorUtils } from '../ColorUtils';

describe('ColorUtils', () => {
  it('should convert hex to RGB', () => {
    const rgb = ColorUtils.hexToRgb('#ff0000');
    expect(rgb).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('should calculate color stops', () => {
    const stops = ColorUtils.calculateColorStops(50, {
      0: '#0000ff',
      100: '#ff0000'
    });
    expect(stops).toBe('#800080');
  });

  it('should handle invalid colors', () => {
    expect(() => ColorUtils.hexToRgb('invalid')).toThrow();
  });
});
```

### State Management Testing

**State Test Example:**
```typescript
// src/state/__tests__/SakState.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { SakState } from '../SakState';

describe('SakState', () => {
  let state: SakState;

  beforeEach(() => {
    state = new SakState();
  });

  it('should update entity state', () => {
    state.updateEntity('sensor.test', { state: 'on' });
    expect(state.getEntityState('sensor.test')).toEqual({ state: 'on' });
  });

  it('should notify subscribers of changes', () => {
    const callback = vi.fn();
    state.subscribe(callback);
    
    state.updateEntity('sensor.test', { state: 'off' });
    expect(callback).toHaveBeenCalled();
  });
});
```

## 🔗 Integration Testing

### Component Integration

**Integration Test Example:**
```typescript
// src/integration/__tests__/CardIntegration.test.ts
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/lit';
import { SakCard } from '../../components/SakCard';

describe('Card Integration', () => {
  it('should render multiple toolsets', async () => {
    const config = {
      entities: [
        { entity: 'sensor.temperature' },
        { entity: 'sensor.humidity' }
      ],
      layout: {
        toolsets: [
          {
            toolset: 'main',
            position: { cx: 50, cy: 50 },
            tools: [
              { type: 'circle', id: 'temp', position: { cx: 30, cy: 50, radius: 20 } },
              { type: 'circle', id: 'humidity', position: { cx: 70, cy: 50, radius: 20 } }
            ]
          }
        ]
      }
    };

    render(html`<sak-card .config=${config}></sak-card>`);
    
    expect(screen.getByTestId('temp')).toBeInTheDocument();
    expect(screen.getByTestId('humidity')).toBeInTheDocument();
  });
});
```

### Service Integration

**Service Test Example:**
```typescript
// src/services/__tests__/EntityService.test.ts
import { describe, it, expect, vi } from 'vitest';
import { EntityService } from '../EntityService';

describe('EntityService', () => {
  it('should fetch entity state', async () => {
    const mockHass = {
      states: {
        'sensor.test': { state: 'on', attributes: {} }
      }
    };

    const service = new EntityService(mockHass);
    const state = await service.getEntityState('sensor.test');
    
    expect(state.value).toBe('on');
  });
});
```

## 🌐 End-to-End Testing

### User Workflow Testing

**E2E Test Example:**
```typescript
// tests/e2e/temperature-card.spec.ts
import { test, expect } from '@playwright/test';

test('should display temperature card', async ({ page }) => {
  await page.goto('/test-page');
  
  const card = page.locator('sak-card');
  await expect(card).toBeVisible();
  
  const temperature = card.locator('.temperature-value');
  await expect(temperature).toContainText('20°C');
});

test('should handle temperature updates', async ({ page }) => {
  await page.goto('/test-page');
  
  // Simulate temperature change
  await page.evaluate(() => {
    window.hass.states['sensor.temperature'].state = '25';
  });
  
  const temperature = page.locator('.temperature-value');
  await expect(temperature).toContainText('25°C');
});
```

### Cross-Browser Testing

**Cross-Browser Test:**
```typescript
// tests/e2e/cross-browser.spec.ts
import { test, expect, devices } from '@playwright/test';

test.describe('Cross-Browser Compatibility', () => {
  test('should work in Chrome', async ({ page }) => {
    await page.goto('/test-page');
    await expect(page.locator('sak-card')).toBeVisible();
  });

  test('should work in Firefox', async ({ page }) => {
    await page.goto('/test-page');
    await expect(page.locator('sak-card')).toBeVisible();
  });

  test('should work in Safari', async ({ page }) => {
    await page.goto('/test-page');
    await expect(page.locator('sak-card')).toBeVisible();
  });
});
```

## 🎨 Visual Regression Testing

### Component Visual Testing

**Visual Test Example:**
```typescript
// tests/visual/temperature-card.spec.ts
import { test, expect } from '@playwright/test';

test('temperature card visual regression', async ({ page }) => {
  await page.goto('/test-page');
  
  const card = page.locator('sak-card');
  await expect(card).toHaveScreenshot('temperature-card.png');
});

test('temperature card dark theme', async ({ page }) => {
  await page.goto('/test-page?theme=dark');
  
  const card = page.locator('sak-card');
  await expect(card).toHaveScreenshot('temperature-card-dark.png');
});
```

## 📊 Performance Testing

### Performance Benchmarks

**Performance Test Example:**
```typescript
// tests/performance/rendering.spec.ts
import { test, expect } from '@playwright/test';

test('card rendering performance', async ({ page }) => {
  await page.goto('/test-page');
  
  const startTime = Date.now();
  await page.locator('sak-card').waitFor();
  const renderTime = Date.now() - startTime;
  
  expect(renderTime).toBeLessThan(100); // Should render in < 100ms
});

test('memory usage', async ({ page }) => {
  await page.goto('/test-page');
  
  const metrics = await page.evaluate(() => {
    return performance.memory;
  });
  
  expect(metrics.usedJSHeapSize).toBeLessThan(10 * 1024 * 1024); // < 10MB
});
```

## 🧪 Test Data and Fixtures

### Test Fixtures

**Fixture Example:**
```typescript
// src/test/fixtures/sakConfig.ts
export const basicConfig = {
  entities: [
    { entity: 'sensor.temperature' },
    { entity: 'sensor.humidity' }
  ],
  layout: {
    toolsets: [
      {
        toolset: 'main',
        position: { cx: 50, cy: 50 },
        tools: [
          { type: 'circle', id: 'temp', position: { cx: 50, cy: 50, radius: 20 } }
        ]
      }
    ]
  }
};

export const complexConfig = {
  // More complex configuration for testing
};
```

### Mock Data

**Mock Example:**
```typescript
// src/test/mocks/hassMock.ts
export const mockHass = {
  states: {
    'sensor.temperature': {
      state: '20',
      attributes: { unit_of_measurement: '°C' }
    },
    'sensor.humidity': {
      state: '60',
      attributes: { unit_of_measurement: '%' }
    }
  },
  themes: {
    darkMode: false,
    themes: {}
  }
};
```

## 📋 Test Coverage

### Coverage Goals

- **Overall Coverage**: 90%
- **Components**: 95%
- **Tools**: 90%
- **Utilities**: 95%
- **Services**: 85%

### Coverage Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        global: {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        }
      }
    }
  }
});
```

## 🚀 CI/CD Integration

### GitHub Actions

**Test Workflow:**
```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      
      - run: npm run lint
      
      - run: npm run type-check
      
      - run: npm run test:coverage
      
      - run: npm run test:e2e
      
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: coverage-report
          path: coverage/
```

## 🔧 Testing Utilities

### Custom Test Helpers

**Test Helper Example:**
```typescript
// src/test/helpers/renderHelper.ts
import { render, RenderOptions } from '@testing-library/lit';
import { html } from 'lit';

export function renderSakCard(config: any, options?: RenderOptions) {
  return render(html`<sak-card .config=${config}></sak-card>`, options);
}

export function createMockEntity(id: string, state: any) {
  return {
    entity_id: id,
    state: state.state,
    attributes: state.attributes || {},
    last_changed: new Date().toISOString()
  };
}
```

### Test Utilities

**Utility Example:**
```typescript
// src/test/utils/testUtils.ts
export function waitForElement(selector: string, timeout = 1000) {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found within ${timeout}ms`));
    }, timeout);
  });
}
```

## 📚 Best Practices

### Test Organization

1. **Group Related Tests**
   ```typescript
   describe('CircleTool', () => {
     describe('rendering', () => {
       // Rendering tests
     });
     
     describe('interactions', () => {
       // Interaction tests
     });
     
     describe('animations', () => {
       // Animation tests
     });
   });
   ```

2. **Use Descriptive Test Names**
   ```typescript
   // Good
   it('should render a circle with radius 20 when radius is set to 20', () => {});
   
   // Bad
   it('should work', () => {});
   ```

3. **Test One Thing at a Time**
   ```typescript
   // Good - tests one specific behavior
   it('should update color when entity state changes to "on"', () => {});
   
   // Bad - tests multiple behaviors
   it('should update color and size and position when entity changes', () => {});
   ```

### Test Data Management

1. **Use Fixtures for Common Data**
2. **Mock External Dependencies**
3. **Keep Tests Independent**
4. **Clean Up After Tests**

### Performance Considerations

1. **Use Fast Test Runners**
2. **Parallel Test Execution**
3. **Minimize DOM Manipulation**
4. **Mock Heavy Operations**

## 🐛 Debugging Tests

### Debugging Unit Tests

```bash
# Run specific test with debug output
npm run test -- --reporter=verbose --grep "CircleTool"

# Run tests in watch mode
npm run test:watch

# Debug with VS Code
# Set breakpoints and use debug configuration
```

### Debugging E2E Tests

```bash
# Run E2E tests in headed mode
npm run test:e2e -- --headed

# Run specific E2E test
npm run test:e2e -- --grep "temperature card"

# Debug with Playwright Inspector
npm run test:e2e -- --debug
```

## 📖 Related Documentation

- [Development Setup](development-setup.md)
- [Contributing Guide](contributing.md)
- [Architecture Overview](architecture.md)
- [API Reference](api-reference.md)

---

**Last Updated**: December 2024  
**Version**: 3.0.0 (Modernization Phase)