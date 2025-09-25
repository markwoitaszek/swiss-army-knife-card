# Frequently Asked Questions (FAQ)

This FAQ addresses the most common questions about the Swiss Army Knife (SAK) custom card.

## 🚀 Installation & Setup

### Q: How do I install SAK?

**A:** SAK can be installed via HACS (recommended) or manually:

**HACS Installation:**
1. Install HACS if not already installed
2. Add SAK repository: `AmoebeLabs/swiss-army-knife-card`
3. Download and install
4. Add resource: `/hacsfiles/swiss-army-knife-card/swiss-army-knife-card.js`

**Manual Installation:**
1. Download `swiss-army-knife-card.js` from releases
2. Place in `www` folder
3. Add resource: `/local/swiss-army-knife-card.js`

See [Installation Guide](../getting-started/installation.md) for detailed steps.

### Q: Why do I need template files?

**A:** SAK requires template files to function properly. These files contain:
- System templates (included with installation)
- User templates (created by you)

Add to `configuration.yaml`:
```yaml
sak_sys_templates:
  !include www/community/swiss-army-knife-card/sak_templates.yaml

sak_user_templates:
  !include lovelace/sak_templates/sak_templates.yaml
```

### Q: The card shows "Custom element not found"

**A:** This means the resource isn't loaded properly:

1. **Check Resource URL**: Ensure it matches your installation method
2. **Restart Home Assistant**: Required after adding resources
3. **Check File Path**: Verify the file exists at the specified path
4. **Clear Browser Cache**: Sometimes needed for resource updates

### Q: Can I use SAK without HACS?

**A:** Yes! SAK can be installed manually:
1. Download the latest release from GitHub
2. Place the file in your `www` folder
3. Add the resource manually
4. Configure templates

However, HACS provides automatic updates and easier management.

## ⚙️ Configuration

### Q: Do I need to know YAML to use SAK?

**A:** Currently, yes. SAK is configured using YAML. However, the modernization plan includes:
- Config Flow for YAML-free configuration
- Visual configuration tools
- Drag-and-drop interface

For now, start with the [Examples Gallery](../user-guides/examples.md) and modify them.

### Q: How do I add multiple entities to a card?

**A:** Add multiple entities to the `entities` array:

```yaml
entities:
  - entity: sensor.temperature
  - entity: sensor.humidity
  - entity: light.living_room
```

Then reference them by index in tools:
```yaml
tools:
  - type: circle
    entity_index: 0  # Uses sensor.temperature
  - type: text
    entity_index: 1  # Uses sensor.humidity
```

### Q: What's the difference between `entity_index` and `entity_indexes`?

**A:**
- `entity_index`: Single entity (number)
- `entity_indexes`: Multiple entities (array)

```yaml
# Single entity
entity_index: 0

# Multiple entities
entity_indexes:
  - entity_index: 0
  - entity_index: 1
```

### Q: How do I make a tool interactive?

**A:** Add `user_actions` to your tool:

```yaml
- type: circle
  id: light_control
  user_actions:
    tap_action:
      haptic: light
      actions:
        - action: call-service
          service: light.toggle
```

## 🎨 Styling & Theming

### Q: How do I change colors based on entity state?

**A:** Use `colorstops` with the `colorstop` style:

```yaml
show:
  style: colorstop
colorstops:
  colors:
    "off": "#333333"
    "on": "#00ff00"
    "error": "#ff0000"
```

### Q: Can I use Home Assistant themes with SAK?

**A:** Yes! SAK integrates with HA themes:

```yaml
# Use specific theme
theme: "dark_blue"

# Use theme variables in styles
styles:
  tool: "fill: var(--primary-color);"
```

### Q: How do I create animations?

**A:** Use the `animations` property:

```yaml
animations:
  pulse:
    state: "on"
    classes:
      tool: "pulse"
    styles:
      tool: "fill: #00ff00;"
```

### Q: Why don't my custom styles work?

**A:** Check these common issues:

1. **CSS Syntax**: Ensure proper CSS syntax
2. **Property Names**: Use correct CSS property names
3. **Values**: Use valid CSS values
4. **Specificity**: CSS specificity might override your styles

## 🛠️ Tools & Functionality

### Q: What tools are available?

**A:** SAK provides 17 tools:

**Shape Tools:** circle, rectangle, ellipse, line, regular polygon
**Text Tools:** text, state, name, icon, badge
**Interactive Tools:** switch, range slider, circular slider
**Chart Tools:** sparkline, bar chart, horseshoe, segmented arc
**Specialized Tools:** user SVG, area

See [Tool Reference](../user-guides/tool-reference.md) for details.

### Q: How do I create a progress bar?

**A:** Use a rectangle tool with color stops:

```yaml
- type: rectangle
  id: progress_bar
  position:
    cx: 50
    cy: 50
    width: 80
    height: 10
  entity_index: 0
  show:
    style: colorstop
  colorstops:
    colors:
      0: "#ff0000"
      50: "#ffff00"
      100: "#00ff00"
```

### Q: How do I display entity history?

**A:** Use sparkline or bar chart tools:

```yaml
- type: sparkline
  id: temperature_trend
  position:
    cx: 50
    cy: 50
    width: 80
    height: 30
  entity_index: 0
  config:
    hours: 24
    show_fill: true
```

### Q: Can I use custom SVG icons?

**A:** Yes! Use the user SVG tool:

```yaml
- type: usersvg
  id: custom_icon
  position:
    cx: 50
    cy: 50
    width: 30
    height: 30
  svg: |
    <svg viewBox="0 0 24 24">
      <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
    </svg>
```

## 🔧 Advanced Usage

### Q: How do I create responsive layouts?

**A:** Use percentage-based positioning and scaling:

```yaml
position:
  cx: 50    # Center horizontally
  cy: 50    # Center vertically
  scale: 1.0 # Scale factor
```

### Q: Can I use templates in SAK?

**A:** Yes! SAK supports template variables:

```yaml
text: "{{ states('sensor.temperature') }}°C"
```

### Q: How do I handle multiple states?

**A:** Use `entity_indexes` for multiple entities:

```yaml
entity_indexes:
  - entity_index: 0
  - entity_index: 1
```

### Q: Can I create conditional displays?

**A:** Use animations with state conditions:

```yaml
animations:
  show_when_on:
    state: "on"
    styles:
      tool: "opacity: 1;"
  hide_when_off:
    state: "off"
    styles:
      tool: "opacity: 0;"
```

## 🐛 Troubleshooting

### Q: My card isn't updating

**A:** Check these common causes:

1. **Entity State**: Verify entity is updating in HA
2. **Entity Index**: Ensure correct `entity_index`
3. **Configuration**: Check for YAML errors
4. **Browser Cache**: Clear browser cache

### Q: Colors aren't changing

**A:** Verify your color configuration:

1. **Color Format**: Use valid hex colors (`#ff0000`)
2. **State Values**: Ensure state values match color stops
3. **Show Style**: Use `colorstop` style for dynamic colors

### Q: Performance is slow

**A:** Optimize your configuration:

1. **Reduce Tools**: Limit number of tools per card
2. **Simplify Animations**: Use simple color changes
3. **Limit Entities**: Use only necessary entities
4. **Check Updates**: Avoid entities that update too frequently

### Q: Card looks different on mobile

**A:** This is expected behavior:

1. **Responsive Design**: SAK adapts to different screen sizes
2. **Touch Interactions**: Mobile has different interaction patterns
3. **Performance**: Mobile may have different performance characteristics

## 🔮 Future Features

### Q: What's coming in the modernization?

**A:** The modernization plan includes:

**Phase 1:** Lit 3.x migration, TypeScript, modern build system
**Phase 2:** One-click HACS installation, automatic updates
**Phase 3:** Config Flow, YAML-free configuration
**Phase 4:** Visual configuration tools, drag-and-drop interface
**Phase 5:** Accessibility, internationalization, comprehensive testing

### Q: Will my current configurations still work?

**A:** Yes! The modernization includes:

- Backward compatibility layer
- Migration tools
- Gradual transition path
- Legacy support during transition

### Q: When will the new features be available?

**A:** The modernization is planned in phases:

- **Phase 1:** 4-6 weeks (Foundation)
- **Phase 2:** 2-3 weeks (HACS Integration)
- **Phase 3:** 3-4 weeks (Config Flow)
- **Phase 4:** 6-8 weeks (Visual Tools)
- **Phase 5:** 4-5 weeks (Hardening)

### Q: How can I contribute to the modernization?

**A:** We welcome contributions:

1. **Code Contributions**: See [Contributing Guide](../developer/contributing.md)
2. **Testing**: Help test new features
3. **Documentation**: Improve documentation
4. **Feedback**: Provide feedback on new features

## 📚 Getting Help

### Q: Where can I get help?

**A:** Multiple support channels:

1. **GitHub Issues**: [Report bugs](https://github.com/AmoebeLabs/swiss-army-knife-card/issues)
2. **GitHub Discussions**: [Ask questions](https://github.com/AmoebeLabs/swiss-army-knife-card/discussions)
3. **Home Assistant Community**: [HA Forums](https://community.home-assistant.io/)
4. **Documentation**: [User Manual](../user-guides/user-manual.md)

### Q: How do I report a bug?

**A:** Use the GitHub issue template:

1. **Check Existing Issues**: Search for similar problems
2. **Provide Details**: Include configuration, error messages, steps to reproduce
3. **Include Environment**: HA version, browser, OS
4. **Add Screenshots**: Visual issues are easier to understand

### Q: Can I request new features?

**A:** Yes! Feature requests are welcome:

1. **Check Existing Requests**: Search for similar features
2. **Describe Use Case**: Explain why the feature is needed
3. **Provide Examples**: Show how it would work
4. **Consider Alternatives**: Check if current tools can achieve the goal

## 📄 License & Legal

### Q: What license does SAK use?

**A:** SAK is licensed under the MIT License, which allows:
- Commercial use
- Modification
- Distribution
- Private use

### Q: Can I use SAK in commercial projects?

**A:** Yes! The MIT License allows commercial use.

### Q: Do I need to credit SAK?

**A:** While not required by the license, crediting SAK is appreciated:
- Link to the project
- Mention in documentation
- Share your creations

---

**Still have questions?** Check the [Troubleshooting Guide](troubleshooting.md) or ask in [GitHub Discussions](https://github.com/AmoebeLabs/swiss-army-knife-card/discussions).

**Last Updated**: December 2024  
**Version**: 3.0.0 (Modernization Phase)