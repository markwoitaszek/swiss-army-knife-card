# Quick Start Guide

Get up and running with the Swiss Army Knife (SAK) custom card in just 5 minutes! This guide will walk you through creating your first SAK card.

## Prerequisites

- SAK installed (see [Installation Guide](installation.md))
- At least one sensor or entity in your Home Assistant
- Basic understanding of Lovelace dashboards

## Step 1: Create Your First Card

### Using the Card Editor

1. Go to any Lovelace dashboard
2. Click the three dots menu (⋮) → **Edit Dashboard**
3. Click **+ Add Card**
4. Search for "Swiss Army Knife" and select it
5. Click **Take Control** to use the visual editor

### Basic Configuration

For your first card, we'll create a simple circle that shows a sensor value:

```yaml
type: custom:swiss-army-knife-card
entities:
  - entity: sensor.your_sensor_here
layout:
  toolsets:
    - toolset: main
      position:
        cx: 50
        cy: 50
      tools:
        - type: circle
          id: sensor_circle
          position:
            cx: 50
            cy: 50
            radius: 30
          entity_index: 0
          show:
            style: colorstop
          colorstops:
            colors:
              0: "#ff0000"
              50: "#ffff00"
              100: "#00ff00"
```

## Step 2: Understanding the Structure

### Card Components

A SAK card consists of:

1. **Entities**: The data sources (sensors, switches, etc.)
2. **Layout**: The visual structure
3. **Toolsets**: Groups of tools
4. **Tools**: Individual visual elements

### Basic Structure

```yaml
type: custom:swiss-army-knife-card
entities:                    # Data sources
  - entity: sensor.temperature
layout:                      # Visual structure
  toolsets:                  # Groups of tools
    - toolset: main          # Toolset name
      position:              # Toolset position
        cx: 50               # Center X (percentage)
        cy: 50               # Center Y (percentage)
      tools:                 # Individual tools
        - type: circle       # Tool type
          # ... tool configuration
```

## Step 3: Add Text and Icons

Let's enhance your card with text and an icon:

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
        # Background circle
        - type: circle
          id: bg_circle
          position:
            cx: 50
            cy: 50
            radius: 40
          show:
            style: fixedcolor
          color: "#f0f0f0"
        
        # Value circle
        - type: circle
          id: value_circle
          position:
            cx: 50
            cy: 50
            radius: 30
          entity_index: 0
          show:
            style: colorstop
          colorstops:
            colors:
              0: "#ff0000"
              50: "#ffff00"
              100: "#00ff00"
        
        # Temperature icon
        - type: icon
          id: temp_icon
          position:
            cx: 50
            cy: 35
            size: 20
          icon: mdi:thermometer
          entity_index: 0
        
        # Temperature value
        - type: state
          id: temp_value
          position:
            cx: 50
            cy: 65
            size: 16
          entity_index: 0
          show:
            style: default
```

## Step 4: Add Animations

Make your card more dynamic with animations:

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
          id: value_circle
          position:
            cx: 50
            cy: 50
            radius: 30
          entity_index: 0
          show:
            style: colorstop
          colorstops:
            colors:
              0: "#ff0000"
              50: "#ffff00"
              100: "#00ff00"
          animations:
            hot:
              state: ">30"
              classes:
                tool: "pulse"
              styles:
                tool: "fill: #ff4444;"
            cold:
              state: "<10"
              classes:
                tool: "shiver"
              styles:
                tool: "fill: #4444ff;"
```

## Step 5: Add Interactions

Make your card interactive:

```yaml
type: custom:swiss-army-knife-card
entities:
  - entity: light.living_room
layout:
  toolsets:
    - toolset: main
      position:
        cx: 50
        cy: 50
      tools:
        - type: circle
          id: light_circle
          position:
            cx: 50
            cy: 50
            radius: 35
          entity_index: 0
          show:
            style: colorstop
          colorstops:
            colors:
              "off": "#333333"
              "on": "#ffff00"
          user_actions:
            tap_action:
              haptic: light
              actions:
                - action: call-service
                  service: light.toggle
```

## Step 6: Test Your Card

1. Save your configuration
2. Check that the card appears correctly
3. Test interactions (tap, hover)
4. Verify animations work as expected

## Common First-Time Issues

### Card Not Displaying

**Problem**: Card shows as "Custom element not found"
**Solution**: 
- Verify the resource is added correctly
- Check browser console for errors
- Restart Home Assistant

### Entity Not Found

**Problem**: Card shows "Entity not found"
**Solution**:
- Verify the entity ID is correct
- Check that the entity exists in Home Assistant
- Use the entity picker in the card editor

### Styling Issues

**Problem**: Card looks wrong or colors don't work
**Solution**:
- Check YAML syntax
- Verify color values are valid
- Use the visual editor for complex styling

## Next Steps

Now that you have your first SAK card working:

1. **Explore Tools**: Check out the [Tool Reference](../user-guides/tool-reference.md) to see all available tools
2. **Learn Theming**: Read the [Theming Guide](../user-guides/theming.md) for advanced styling
3. **See Examples**: Browse the [Examples Gallery](../user-guides/examples.md) for inspiration
4. **Advanced Config**: Learn about [Advanced Configuration](../user-guides/configuration.md)

## Quick Reference

### Essential Tools

| Tool | Purpose | Example Use |
|------|---------|-------------|
| `circle` | Circular shapes | Temperature indicators, status lights |
| `rectangle` | Rectangular shapes | Progress bars, backgrounds |
| `text` | Text display | Labels, values, descriptions |
| `icon` | Icons | Entity icons, status indicators |
| `state` | Entity state | Current values, status text |

### Common Patterns

**Temperature Card**:
```yaml
- type: circle
  show:
    style: colorstop
  colorstops:
    colors:
      0: "#0000ff"    # Cold
      25: "#00ff00"   # Warm
      50: "#ffff00"   # Hot
```

**Status Light**:
```yaml
- type: circle
  show:
    style: colorstop
  colorstops:
    colors:
      "off": "#333333"
      "on": "#00ff00"
```

**Progress Bar**:
```yaml
- type: rectangle
  show:
    style: colorstop
  colorstops:
    colors:
      0: "#ff0000"
      100: "#00ff00"
```

## Getting Help

If you need assistance:

1. Check the [Troubleshooting Guide](../reference/troubleshooting.md)
2. Search [GitHub Issues](https://github.com/AmoebeLabs/swiss-army-knife-card/issues)
3. Ask in [GitHub Discussions](https://github.com/AmoebeLabs/swiss-army-knife-card/discussions)

---

**Congratulations!** You've created your first SAK card. Now explore the full power of the Swiss Army Knife custom card!