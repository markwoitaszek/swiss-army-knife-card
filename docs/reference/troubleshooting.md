# Troubleshooting Guide

This guide helps you diagnose and resolve common issues with the Swiss Army Knife (SAK) custom card.

## 🚨 Common Issues

### Card Not Displaying

**Symptoms:**
- Card shows as "Custom element not found"
- Blank card area
- Error in browser console

**Solutions:**

1. **Check Resource Installation**
   ```bash
   # Verify the resource is added correctly
   # Go to Settings → Devices & Services → Helpers → Lovelace Resources
   # Ensure the resource URL is correct:
   # /hacsfiles/swiss-army-knife-card/swiss-army-knife-card.js
   ```

2. **Verify File Path**
   ```bash
   # For HACS installation:
   /hacsfiles/swiss-army-knife-card/swiss-army-knife-card.js
   
   # For manual installation:
   /local/swiss-army-knife-card.js
   ```

3. **Check Browser Console**
   ```javascript
   // Look for errors like:
   // - "Failed to load resource"
   // - "Custom element not defined"
   // - "Module not found"
   ```

4. **Restart Home Assistant**
   ```bash
   # After adding resources, restart HA
   # Go to Settings → System → Restart
   ```

### Entity Not Found

**Symptoms:**
- Card shows "Entity not found"
- Missing data in tools
- Console errors about undefined entities

**Solutions:**

1. **Verify Entity ID**
   ```yaml
   # Check entity ID format
   entities:
     - entity: sensor.temperature  # ✅ Correct
     - entity: sensor.temp         # ❌ May not exist
   ```

2. **Use Entity Picker**
   ```yaml
   # In card editor, use the entity picker
   # Instead of typing manually
   ```

3. **Check Entity State**
   ```yaml
   # Go to Settings → Devices & Services → Entities
   # Search for your entity and verify it exists
   ```

4. **Test with Simple Entity**
   ```yaml
   # Try with a known working entity first
   entities:
     - entity: sun.sun  # This should always exist
   ```

### Configuration Errors

**Symptoms:**
- YAML validation errors
- Card not rendering
- Tools not displaying

**Solutions:**

1. **Check YAML Syntax**
   ```yaml
   # Common YAML issues:
   # - Missing colons
   # - Incorrect indentation
   # - Missing quotes around special characters
   
   # Use YAML validator:
   # https://www.yamllint.com/
   ```

2. **Validate Configuration**
   ```yaml
   # Ensure required fields are present:
   type: custom:swiss-army-knife-card  # ✅ Required
   entities: []                        # ✅ Required
   layout:                            # ✅ Required
     toolsets: []                     # ✅ Required
   ```

3. **Check Tool Configuration**
   ```yaml
   # Each tool needs:
   type: circle                       # ✅ Required
   id: unique_id                      # ✅ Required
   position:                          # ✅ Required
     cx: 50                          # ✅ Required
     cy: 50                          # ✅ Required
     radius: 20                      # ✅ Required for circle
   ```

4. **Use Configuration Examples**
   ```yaml
   # Start with a working example and modify gradually
   # See Examples Gallery for reference configurations
   ```

### Performance Issues

**Symptoms:**
- Slow rendering
- High CPU usage
- Browser freezing

**Solutions:**

1. **Reduce Tool Count**
   ```yaml
   # Limit the number of tools per card
   # Recommended: < 20 tools per card
   ```

2. **Optimize Animations**
   ```yaml
   # Reduce complex animations
   # Use simple color changes instead of complex effects
   ```

3. **Check Entity Updates**
   ```yaml
   # Limit entities that update frequently
   # Use appropriate update intervals
   ```

4. **Browser Optimization**
   ```bash
   # Clear browser cache
   # Disable browser extensions
   # Use hardware acceleration
   ```

### Styling Issues

**Symptoms:**
- Colors not displaying correctly
- Layout problems
- Inconsistent appearance

**Solutions:**

1. **Check Color Values**
   ```yaml
   # Use valid color formats:
   color: "#ff0000"        # ✅ Hex
   color: "rgb(255,0,0)"   # ✅ RGB
   color: "red"            # ✅ Named colors
   ```

2. **Verify CSS Syntax**
   ```yaml
   # In styles section:
   styles:
     tool: "fill: #ff0000; stroke: #000000; stroke-width: 2;"
   ```

3. **Check Theme Integration**
   ```yaml
   # Use theme variables:
   styles:
     tool: "fill: var(--primary-color);"
   ```

4. **Test in Different Themes**
   ```yaml
   # Test with both light and dark themes
   # Ensure contrast is sufficient
   ```

## 🔧 Advanced Troubleshooting

### Browser Console Debugging

1. **Enable Debug Mode**
   ```yaml
   # Add to card configuration:
   dev:
     debug: true
   ```

2. **Check Console Messages**
   ```javascript
   // Look for SAK-specific messages:
   // "SWISS-ARMY-KNIFE-CARD Version X.X.X"
   // "SAK - set hass"
   // "SAK - render"
   ```

3. **Monitor Performance**
   ```javascript
   // Enable performance monitoring:
   dev:
     performance: true
   ```

### Network Issues

1. **Check Resource Loading**
   ```bash
   # In browser DevTools → Network tab
   # Look for failed requests to:
   # - swiss-army-knife-card.js
   # - sak_templates.yaml
   ```

2. **Verify HACS Installation**
   ```bash
   # Check HACS is working:
   # - Go to HACS → Frontend
   # - Verify SAK is listed and updated
   ```

3. **Test Manual Installation**
   ```bash
   # If HACS fails, try manual installation
   # Download from GitHub releases
   ```

### Template Issues

1. **Check Template Files**
   ```yaml
   # Verify template files exist:
   sak_sys_templates:
     !include www/community/swiss-army-knife-card/sak_templates.yaml
   
   sak_user_templates:
     !include lovelace/sak_templates/sak_templates.yaml
   ```

2. **Create Template Directory**
   ```bash
   # Create the directory:
   mkdir -p config/lovelace/sak_templates/
   touch config/lovelace/sak_templates/sak_templates.yaml
   ```

3. **Check Template Syntax**
   ```yaml
   # Ensure template files are valid YAML
   # Use YAML validator to check syntax
   ```

## 🐛 Error Messages

### Common Error Messages

**"Custom element not found"**
```yaml
# Solution: Check resource installation
# Verify the resource URL is correct
# Restart Home Assistant
```

**"Entity not found"**
```yaml
# Solution: Verify entity ID
# Use entity picker in card editor
# Check entity exists in HA
```

**"Invalid configuration"**
```yaml
# Solution: Check YAML syntax
# Validate required fields
# Use configuration examples
```

**"Template not found"**
```yaml
# Solution: Check template files
# Create missing directories
# Verify template syntax
```

### Browser Console Errors

**"Failed to load resource"**
```javascript
// Check network connectivity
// Verify file paths
// Check file permissions
```

**"Module not found"**
```javascript
// Verify resource installation
// Check file paths
// Restart Home Assistant
```

**"TypeError: Cannot read property"**
```javascript
// Check entity configuration
// Verify entity exists
// Check entity state
```

## 🔍 Diagnostic Tools

### Built-in Debugging

1. **Enable Debug Mode**
   ```yaml
   dev:
     debug: true
     performance: true
   ```

2. **Check Console Output**
   ```javascript
   // Look for debug messages
   // Monitor performance metrics
   // Check for error messages
   ```

### External Tools

1. **YAML Validator**
   - [YAML Lint](https://www.yamllint.com/)
   - [Online YAML Parser](https://yaml-online-parser.appspot.com/)

2. **Home Assistant Tools**
   - Developer Tools → States
   - Developer Tools → Services
   - Developer Tools → Templates

3. **Browser DevTools**
   - Console tab for errors
   - Network tab for resource loading
   - Performance tab for profiling

## 📋 Troubleshooting Checklist

### Before Reporting Issues

- [ ] **Check Installation**
  - [ ] Resource is added correctly
  - [ ] File path is correct
  - [ ] Home Assistant restarted

- [ ] **Verify Configuration**
  - [ ] YAML syntax is valid
  - [ ] Required fields are present
  - [ ] Entity IDs are correct

- [ ] **Test Basic Functionality**
  - [ ] Simple card works
  - [ ] Entity exists in HA
  - [ ] Browser console is clean

- [ ] **Check Environment**
  - [ ] Home Assistant version is supported
  - [ ] Browser is up to date
  - [ ] No conflicting custom cards

### Information to Include

When reporting issues, include:

1. **Environment Details**
   ```yaml
   Home Assistant Version: 2023.12.0
   SAK Version: 2.5.1
   Browser: Chrome 120.0.0.0
   OS: Windows 11
   ```

2. **Configuration**
   ```yaml
   # Your SAK configuration (remove sensitive data)
   type: custom:swiss-army-knife-card
   entities:
     - entity: sensor.example
   # ... rest of config
   ```

3. **Error Messages**
   ```javascript
   // Copy error messages from browser console
   // Include stack traces if available
   ```

4. **Steps to Reproduce**
   ```markdown
   1. Go to dashboard
   2. Add SAK card
   3. Configure with entities
   4. See error
   ```

## 🆘 Getting Help

### Community Support

1. **GitHub Issues**
   - [Report bugs](https://github.com/AmoebeLabs/swiss-army-knife-card/issues)
   - [Request features](https://github.com/AmoebeLabs/swiss-army-knife-card/issues)
   - [Ask questions](https://github.com/AmoebeLabs/swiss-army-knife-card/discussions)

2. **Home Assistant Community**
   - [HA Forums](https://community.home-assistant.io/)
   - [Discord](https://discord.gg/c5DvZ4e)
   - [Reddit](https://reddit.com/r/homeassistant)

3. **Documentation**
   - [User Manual](../user-guides/user-manual.md)
   - [Tool Reference](../user-guides/tool-reference.md)
   - [Examples Gallery](../user-guides/examples.md)

### Professional Support

For complex issues or custom development:

- **GitHub Sponsors**: Support the project
- **Custom Development**: Contact maintainers
- **Consulting**: Professional HA services

## 📚 Related Documentation

- [Installation Guide](../getting-started/installation.md) - Installation troubleshooting
- [Configuration Guide](../user-guides/configuration.md) - Configuration issues
- [Tool Reference](../user-guides/tool-reference.md) - Tool-specific problems
- [FAQ](faq.md) - Frequently asked questions

---

**Last Updated**: December 2024  
**Version**: 3.0.0 (Modernization Phase)