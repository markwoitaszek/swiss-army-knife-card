# Swiss Army Knife Custom Card

## Overview

The Swiss Army Knife (SAK) custom card is a versatile and powerful custom card for Home Assistant that allows you to create highly customized visualizations using 17+ SVG-based tools. This card is designed for users who want complete control over their dashboard appearance and functionality.

## Key Features

### 🛠️ 17+ Powerful Tools

- **Basic Tools**: Circle, Rectangle, Line, Text, Icon
- **Advanced Tools**: Segmented Arc, Horseshoe, Sparkline, Bar Chart
- **Interactive Tools**: Switch, Range Slider, Circular Slider
- **Entity Tools**: Entity State, Entity Name, Entity Icon, Entity Area
- **Specialized Tools**: User SVG, Badge, Regular Polygon

### 🎨 Advanced Styling & Animation

- Full CSS3 support with custom properties
- CSS animations and transitions
- Theme integration with Home Assistant
- Color temperature and RGB support
- Dynamic styling based on entity states

### 📊 Data Visualization

- Real-time entity state updates
- Historical data with sparklines
- Multiple data sources per card
- Custom data processing and formatting

### 🔧 Highly Configurable

- YAML-based configuration
- Template system for reusable components
- Layout templates for common patterns
- Responsive design support

## Installation Requirements

- **Home Assistant**: 2022.11.0 or newer
- **Frontend**: Latest version recommended
- **HACS**: For easy installation and updates

## Quick Start

1. **Install via HACS**:
   - Add this repository to HACS
   - Install the Swiss Army Knife Custom Card
   - Add the card to your Lovelace resources

2. **Basic Configuration**:

   ```yaml
   type: custom:swiss-army-knife-card
   entities:
     - entity: sensor.temperature
   layout:
     aspectratio: 1/1
     toolsets:
       - position: [50, 50]
         tools:
           - type: circle
             position: [50, 50]
             radius: 40
           - type: text
             position: [50, 50]
             text: '[[sensor.temperature.state]]°C'
   ```

3. **Explore Examples**:
   - Check the [functional card examples](https://swiss-army-knife-card-manual.amoebelabs.com/design/example-set-functional-cards/)
   - Browse the [12 example views](https://swiss-army-knife-card-manual.amoebelabs.com/examples/introduction/)

## Documentation

- **Main Documentation**: [swiss-army-knife-card-manual.amoebelabs.com](https://swiss-army-knife-card-manual.amoebelabs.com/)
- **Installation Guide**: [Installation Documentation](https://swiss-army-knife-card-manual.amoebelabs.com/start/installation/)
- **Design Guide**: [How to Design Your Card](https://swiss-army-knife-card-manual.amoebelabs.com/design/how-to-design-your-card/)
- **API Reference**: [Tools Reference](https://swiss-army-knife-card-manual.amoebelabs.com/tools/introduction/)

## Support & Community

- **Issues**: [GitHub Issues](https://github.com/AmoebeLabs/swiss-army-knife-card/issues)
- **Discussions**: [GitHub Discussions](https://github.com/AmoebeLabs/swiss-army-knife-card/discussions)
- **Documentation**: [Complete Manual](https://swiss-army-knife-card-manual.amoebelabs.com/)

## Version Information

- **Current Version**: 3.0.0-dev.1 (Modernization Phase)
- **Minimum HA Version**: 2022.11.0
- **License**: MIT
- **Maintainer**: AmoebeLabs

## Recent Updates

### Version 3.0.0 (Modernization)

- ✅ **Phase 1 Complete**: Lit 3.x migration, TypeScript implementation, modern build system
- 🚧 **Phase 2 In Progress**: Enhanced HACS integration, automatic updates, improved installation
- 📋 **Coming Soon**: Config Flow, visual configuration tools, accessibility improvements

### Key Improvements

- Modern TypeScript codebase with full type safety
- Vite build system for faster development and builds
- Comprehensive testing framework with Vitest and Playwright
- Enhanced error handling and debugging
- Performance optimizations and reduced bundle size
- Modern development workflow with ESLint and Prettier

## Migration from 2.x

If you're upgrading from version 2.x, please refer to the migration guide in the documentation. The modernized version maintains backward compatibility while offering improved performance and developer experience.

## Contributing

We welcome contributions! Please see our [Contributing Guide](docs/CONTRIBUTING.md) for details on how to get started.

---

**Note**: This card is actively maintained and continuously improved. Check the documentation for the latest features and updates.
