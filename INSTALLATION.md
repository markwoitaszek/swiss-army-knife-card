# Installation Guide - Swiss Army Knife Custom Card

This guide provides detailed installation instructions for the Swiss Army Knife (SAK) custom card for Home Assistant.

## 🎯 Prerequisites

Before installing the SAK custom card, ensure you have:

- **Home Assistant**: Version 2022.11.0 or newer
- **HACS**: Home Assistant Community Store installed (recommended method)
- **Lovelace**: Modern Lovelace frontend (not legacy UI)

## 📦 Installation Methods

### Method 1: HACS Installation (Recommended)

#### Step 1: Install via HACS

1. **Open HACS** in your Home Assistant instance
2. Navigate to **"Frontend"** section
3. Click **"Explore & Download Repositories"**
4. Search for **"Swiss Army Knife Custom Card"**
5. Click **"Download"**
6. **Restart Home Assistant** when prompted

#### Step 2: Add to Lovelace Resources

HACS should automatically add the card to your resources. If not, add manually:

1. Go to **Settings** → **Dashboards** → **Resources**
2. Click **"Add Resource"**
3. Add the following:
   - **URL**: `/hacsfiles/swiss-army-knife-card/swiss-army-knife-card.js`
   - **Resource Type**: `JavaScript Module`

### Method 2: Manual Installation

#### Step 1: Download Files

1. Go to the [latest release](https://github.com/AmoebeLabs/swiss-army-knife-card/releases/latest)
2. Download `swiss-army-knife-card.js`
3. Create directory: `www/community/swiss-army-knife-card/`
4. Copy the file to this directory

#### Step 2: Add to Resources

1. Go to **Settings** → **Dashboards** → **Resources**
2. Click **"Add Resource"**
3. Add:
   - **URL**: `/local/community/swiss-army-knife-card/swiss-army-knife-card.js`
   - **Resource Type**: `JavaScript Module`

## 🔧 Configuration

### Basic Setup

After installation, you can start using the card in your Lovelace dashboards:

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
          fill: lightblue
        - type: text
          position: [50, 50]
          text: '[[sensor.temperature.state]]°C'
          font_size: 16
```

### Advanced Configuration

For advanced usage, consider downloading the example configurations:

1. **Example Cards**: [Functional Card Examples](https://github.com/AmoebeLabs/swiss-army-knife-card/tree/master/examples)
2. **Themes**: [Material 3 Themes](https://github.com/AmoebeLabs/material3-themes-manual)
3. **Templates**: [Layout Templates](https://github.com/AmoebeLabs/swiss-army-knife-card/tree/master/templates)

## 🚀 Quick Start Examples

### Example 1: Simple Temperature Display

```yaml
type: custom:swiss-army-knife-card
entities:
  - entity: sensor.living_room_temperature
layout:
  aspectratio: 1/1
  toolsets:
    - position: [50, 50]
      tools:
        - type: circle
          position: [50, 50]
          radius: 45
          stroke: var(--primary-color)
          stroke_width: 2
          fill: none
        - type: text
          position: [50, 30]
          text: '[[sensor.living_room_temperature.state]]°'
          font_size: 24
          font_weight: bold
        - type: text
          position: [50, 70]
          text: 'Living Room'
          font_size: 12
          fill: var(--secondary-text-color)
```

### Example 2: Multi-Entity Status Card

```yaml
type: custom:swiss-army-knife-card
entities:
  - entity: light.living_room
  - entity: sensor.living_room_temperature
  - entity: sensor.living_room_humidity
layout:
  aspectratio: 3/1
  toolsets:
    - position: [16.67, 50]
      tools:
        - type: icon
          position: [50, 30]
          icon: mdi:lightbulb
          size: 30
          fill: >
            [[[ if (entities.light.living_room.state === 'on') return 'gold';
                return 'var(--disabled-text-color)'; ]]]
        - type: text
          position: [50, 70]
          text: '[[light.living_room.state]]'
          font_size: 12
    - position: [50, 50]
      tools:
        - type: text
          position: [50, 30]
          text: '[[sensor.living_room_temperature.state]]°C'
          font_size: 18
        - type: text
          position: [50, 70]
          text: 'Temperature'
          font_size: 10
    - position: [83.33, 50]
      tools:
        - type: text
          position: [50, 30]
          text: '[[sensor.living_room_humidity.state]]%'
          font_size: 18
        - type: text
          position: [50, 70]
          text: 'Humidity'
          font_size: 10
```

## 🔄 Migration from v2.x

If you're upgrading from version 2.x:

### Automatic Migration

Most configurations will work without changes. The v3.x maintains backward compatibility.

### Manual Updates (if needed)

1. **Import Statements**: No changes needed for YAML configurations
2. **Tool Names**: All existing tool names remain the same
3. **Properties**: Existing properties are supported

### New Features in v3.x

- **TypeScript Support**: Better development experience
- **Performance**: Improved rendering and reduced bundle size
- **Error Handling**: Better error messages and debugging
- **Build System**: Modern Vite-based build for faster updates

## 🛠️ Troubleshooting

### Common Issues

#### Card Not Loading

**Symptoms**: Card shows "Custom element doesn't exist" or blank
**Solutions**:

1. Check if the resource is properly added to Lovelace
2. Verify the file path is correct
3. Clear browser cache (Ctrl+Shift+R)
4. Restart Home Assistant

#### Configuration Errors

**Symptoms**: Card shows error messages
**Solutions**:

1. Validate your YAML syntax
2. Check entity names exist in your HA instance
3. Verify tool properties are correct
4. Check browser console for detailed errors

#### Performance Issues

**Symptoms**: Slow loading or high memory usage
**Solutions**:

1. Reduce the number of tools per card
2. Use simpler animations
3. Optimize entity update intervals
4. Update to the latest version

### Debug Mode

Enable debug mode for detailed logging:

```yaml
type: custom:swiss-army-knife-card
dev:
  debug: true
  performance: true
# ... rest of configuration
```

### Browser Compatibility

Supported browsers:

- **Chrome**: 88+
- **Firefox**: 85+
- **Safari**: 14+
- **Edge**: 88+

## 📚 Next Steps

After installation:

1. **Read the Documentation**: [swiss-army-knife-card-manual.amoebelabs.com](https://swiss-army-knife-card-manual.amoebelabs.com/)
2. **Explore Examples**: Check the [functional card examples](https://swiss-army-knife-card-manual.amoebelabs.com/design/example-set-functional-cards/)
3. **Join the Community**: [GitHub Discussions](https://github.com/AmoebeLabs/swiss-army-knife-card/discussions)
4. **Report Issues**: [GitHub Issues](https://github.com/AmoebeLabs/swiss-army-knife-card/issues)

## 🆘 Support

Need help? Here are your options:

1. **Documentation**: Comprehensive guide with examples
2. **GitHub Discussions**: Community support and questions
3. **GitHub Issues**: Bug reports and feature requests
4. **Home Assistant Community**: Forum discussions

---

**Happy customizing!** 🎨
