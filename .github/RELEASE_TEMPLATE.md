# Release v{VERSION}

## 🎯 Overview

This release brings {OVERVIEW_DESCRIPTION}.

## ✨ What's New

### 🚀 New Features
- {NEW_FEATURE_1}
- {NEW_FEATURE_2}

### 🔧 Improvements
- {IMPROVEMENT_1}
- {IMPROVEMENT_2}

### 🐛 Bug Fixes
- {BUG_FIX_1}
- {BUG_FIX_2}

### 🔄 Breaking Changes
- {BREAKING_CHANGE_1}
- {BREAKING_CHANGE_2}

## 📦 Installation

### HACS (Recommended)
1. Open HACS in your Home Assistant instance
2. Go to "Frontend" section
3. Search for "Swiss Army Knife Custom Card"
4. Click "Download" and restart Home Assistant
5. Add the card to your Lovelace resources (if not auto-added)

### Manual Installation
1. Download `swiss-army-knife-card.js` from the [latest release](https://github.com/AmoebeLabs/swiss-army-knife-card/releases/latest)
2. Copy to `www/community/swiss-army-knife-card/`
3. Add to your Lovelace resources:
   ```yaml
   resources:
     - url: /hacsfiles/swiss-army-knife-card/swiss-army-knife-card.js
       type: module
   ```

## 🔄 Migration Guide

### From v2.x to v3.x
- {MIGRATION_STEP_1}
- {MIGRATION_STEP_2}

### Configuration Changes
- {CONFIG_CHANGE_1}
- {CONFIG_CHANGE_2}

## 🧪 Testing

This release has been tested with:
- Home Assistant Core: {HA_VERSION_MIN} - {HA_VERSION_MAX}
- Frontend: {FRONTEND_VERSION}
- Browsers: Chrome 100+, Firefox 100+, Safari 15+, Edge 100+

## 📊 Performance

- Bundle size: {BUNDLE_SIZE}
- Build time: {BUILD_TIME}
- Memory usage: {MEMORY_USAGE}
- Load time: {LOAD_TIME}

## 🐛 Known Issues

- {KNOWN_ISSUE_1}
- {KNOWN_ISSUE_2}

## 🙏 Contributors

Thanks to all contributors who made this release possible:
- {CONTRIBUTOR_1}
- {CONTRIBUTOR_2}

## 📚 Documentation

- [Installation Guide](https://swiss-army-knife-card-manual.amoebelabs.com/start/installation/)
- [Configuration Reference](https://swiss-army-knife-card-manual.amoebelabs.com/configuration/introduction/)
- [Tools Reference](https://swiss-army-knife-card-manual.amoebelabs.com/tools/introduction/)
- [Examples](https://swiss-army-knife-card-manual.amoebelabs.com/examples/introduction/)

## 🔗 Links

- [Documentation](https://swiss-army-knife-card-manual.amoebelabs.com/)
- [GitHub Repository](https://github.com/AmoebeLabs/swiss-army-knife-card)
- [Issues](https://github.com/AmoebeLabs/swiss-army-knife-card/issues)
- [Discussions](https://github.com/AmoebeLabs/swiss-army-knife-card/discussions)

---

**Full Changelog**: [v{PREVIOUS_VERSION}...v{VERSION}](https://github.com/AmoebeLabs/swiss-army-knife-card/compare/v{PREVIOUS_VERSION}...v{VERSION})
