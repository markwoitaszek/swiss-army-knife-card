# Basic Configuration

This guide covers the fundamental concepts and configuration options for the Swiss Army Knife (SAK) custom card. Understanding these basics will help you create more complex and sophisticated cards.

## Configuration Structure

### Top-Level Configuration

Every SAK card starts with these essential elements:

```yaml
type: custom:swiss-army-knife-card
entities: []           # Data sources
layout: {}             # Visual structure
aspectratio: "1/1"     # Card proportions (optional)
theme: "default"       # Theme name (optional)
```

### Entities Section

Entities define the data sources for your card:

```yaml
entities:
  - entity: sensor.temperature
    name: "Living Room Temp"
    icon: mdi:thermometer
    unit: "°C"
    attribute: "temperature"
    secondary_info: "last_changed"
```

**Entity Properties:**
- `entity`: The Home Assistant entity ID (required)
- `name`: Display name (optional, defaults to entity name)
- `icon`: Icon to use (optional, defaults to entity icon)
- `unit`: Unit of measurement (optional)
- `attribute`: Specific attribute to use (optional)
- `secondary_info`: Additional information to display (optional)

### Layout Section

The layout defines the visual structure of your card:

```yaml
layout:
  aspectratio: "16/9"        # Card proportions
  styles:                    # Global styles
    card:
      background: "#f0f0f0"
  toolsets:                  # Groups of tools
    - toolset: main
      position:
        cx: 50               # Center X (0-100%)
        cy: 50               # Center Y (0-100%)
        scale: 1.0           # Scale factor
        rotate: 0            # Rotation in degrees
      styles:                # Toolset-specific styles
        background: "#ffffff"
      tools: []              # Individual tools
```

## Understanding Toolsets

### Toolset Structure

Toolsets are groups of related tools that share positioning and styling:

```yaml
toolset: main
position:
  cx: 50                    # Center X position (0-100%)
  cy: 50                    # Center Y position (0-100%)
  scale: 1.0                # Scale factor (0.1-5.0)
  rotate: 0                 # Rotation in degrees
  scale_x: 1.0              # X-axis scale (optional)
  scale_y: 1.0              # Y-axis scale (optional)
  rotate_x: 0               # X-axis rotation (optional)
  rotate_y: 0               # Y-axis rotation (optional)
styles:                     # Toolset-specific styles
  background: "#ffffff"
  border: "1px solid #ccc"
tools: []                   # Array of tools
```

### Positioning System

SAK uses a percentage-based positioning system:

- **0%** = Left/Top edge
- **50%** = Center
- **100%** = Right/Bottom edge

```yaml
# Examples
position:
  cx: 25    # 25% from left edge
  cy: 75    # 75% from top edge
```

### Scaling and Rotation

```yaml
position:
  scale: 1.5        # 150% size
  rotate: 45        # 45 degrees clockwise
  scale_x: 2.0      # Double width
  scale_y: 0.5      # Half height
```

## Understanding Tools

### Tool Structure

Every tool follows this basic structure:

```yaml
type: circle              # Tool type (required)
id: unique_id             # Unique identifier (required)
position:                 # Position within toolset
  cx: 50                  # Center X (0-100%)
  cy: 50                  # Center Y (0-100%)
  radius: 20              # Size (tool-specific)
entity_index: 0           # Which entity to use (optional)
show:                     # Display options
  style: colorstop        # Visual style
styles:                   # Custom styles (optional)
  fill: "#ff0000"
classes:                  # CSS classes (optional)
  tool: "custom-class"
animations:               # State-based animations (optional)
  active:
    state: "on"
    styles:
      tool: "fill: #00ff00;"
user_actions:             # Interaction handlers (optional)
  tap_action:
    actions:
      - action: call-service
        service: light.toggle
```

### Entity Index

The `entity_index` property links tools to entities:

```yaml
entities:
  - entity: sensor.temperature    # Index 0
  - entity: sensor.humidity       # Index 1
  - entity: light.living_room     # Index 2

tools:
  - type: circle
    entity_index: 0               # Uses sensor.temperature
  - type: text
    entity_index: 1               # Uses sensor.humidity
  - type: icon
    entity_index: 2               # Uses light.living_room
```

## Visual Styles

### Show Styles

Tools support different visual styles:

```yaml
show:
  style: default          # Default appearance
  style: fixedcolor       # Single color
  style: colorstop        # Color based on value
  style: colorstops       # Multiple color stops
  style: colorstopgradient # Gradient between stops
  style: minmaxgradient   # Gradient between min/max
```

### Fixed Color Style

```yaml
show:
  style: fixedcolor
color: "#ff0000"          # Red color
```

### Color Stop Style

```yaml
show:
  style: colorstop
colorstops:
  colors:
    0: "#0000ff"          # Blue at 0
    50: "#ffff00"         # Yellow at 50
    100: "#ff0000"        # Red at 100
```

### Color Stop Gradient Style

```yaml
show:
  style: colorstopgradient
colorstops:
  colors:
    0: "#0000ff"
    100: "#ff0000"
```

## Animations

### Animation Structure

Animations change appearance based on entity state:

```yaml
animations:
  animation_name:
    state: "on"                    # State condition
    operator: "=="                 # Comparison operator
    classes:                       # CSS classes to apply
      tool: "pulse"
    styles:                        # CSS styles to apply
      tool: "fill: #00ff00;"
    reuse: false                  # Whether to merge with other animations
```

### State Conditions

```yaml
# String comparison
state: "on"
operator: "=="

# Numeric comparison
state: "25"
operator: ">"

# Multiple operators
operator: ">="    # Greater than or equal
operator: "<="    # Less than or equal
operator: "!="    # Not equal
```

### Animation Examples

```yaml
animations:
  # Light on/off
  light_on:
    state: "on"
    styles:
      tool: "fill: #ffff00;"
  
  # Temperature hot
  temperature_hot:
    state: "30"
    operator: ">"
    classes:
      tool: "pulse"
    styles:
      tool: "fill: #ff4444;"
  
  # Battery low
  battery_low:
    state: "20"
    operator: "<="
    classes:
      tool: "blink"
    styles:
      tool: "fill: #ff0000;"
```

## User Actions

### Tap Actions

Handle user interactions:

```yaml
user_actions:
  tap_action:
    haptic: light              # Haptic feedback
    actions:
      - action: more-info      # Show more info dialog
      - action: navigate       # Navigate to view
        navigation_path: "/lovelace/1"
      - action: call-service   # Call Home Assistant service
        service: light.toggle
        service_data:
          entity_id: light.living_room
      - action: fire-dom-event # Fire custom event
        browser_mod:
          service: browser_mod.popup
          data:
            title: "Hello"
            content: "World"
```

### Action Types

| Action | Purpose | Example |
|--------|---------|---------|
| `more-info` | Show entity details | `{ action: more-info }` |
| `navigate` | Navigate to view | `{ action: navigate, navigation_path: "/lovelace/1" }` |
| `call-service` | Call HA service | `{ action: call-service, service: light.toggle }` |
| `fire-dom-event` | Fire custom event | `{ action: fire-dom-event, browser_mod: {...} }` |

## Styling and Theming

### Custom Styles

Apply custom CSS styles:

```yaml
styles:
  tool: "fill: #ff0000; stroke: #000000; stroke-width: 2;"
  card: "background: linear-gradient(45deg, #ff0000, #0000ff);"
```

### CSS Classes

Apply CSS classes for advanced styling:

```yaml
classes:
  tool: "custom-tool-class"
  card: "custom-card-class"
```

### Theme Integration

Use Home Assistant themes:

```yaml
theme: "dark_blue"    # Use specific theme
# or
theme: "default"      # Use default theme
```

## Common Patterns

### Temperature Display

```yaml
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
          id: bg
          position:
            cx: 50
            cy: 50
            radius: 40
          show:
            style: fixedcolor
          color: "#f0f0f0"
        
        # Temperature circle
        - type: circle
          id: temp
          position:
            cx: 50
            cy: 50
            radius: 30
          entity_index: 0
          show:
            style: colorstop
          colorstops:
            colors:
              0: "#0000ff"
              25: "#00ff00"
              50: "#ffff00"
              75: "#ff8800"
              100: "#ff0000"
        
        # Temperature text
        - type: state
          id: temp_text
          position:
            cx: 50
            cy: 50
            size: 16
          entity_index: 0
```

### Status Light

```yaml
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
          id: status
          position:
            cx: 50
            cy: 50
            radius: 25
          entity_index: 0
          show:
            style: colorstop
          colorstops:
            colors:
              "off": "#333333"
              "on": "#ffff00"
          user_actions:
            tap_action:
              actions:
                - action: call-service
                  service: light.toggle
```

### Progress Bar

```yaml
entities:
  - entity: sensor.battery_level
layout:
  toolsets:
    - toolset: main
      position:
        cx: 50
        cy: 50
      tools:
        # Background
        - type: rectangle
          id: bg
          position:
            cx: 50
            cy: 50
            width: 80
            height: 10
          show:
            style: fixedcolor
          color: "#333333"
        
        # Progress
        - type: rectangle
          id: progress
          position:
            cx: 10
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

## Best Practices

### Organization

1. **Use descriptive IDs**: `temp_circle` instead of `circle1`
2. **Group related tools**: Keep related tools in the same toolset
3. **Comment complex configurations**: Add comments for clarity

### Performance

1. **Limit entity count**: Use only necessary entities
2. **Optimize animations**: Avoid complex animations on many tools
3. **Use appropriate styles**: Choose efficient visual styles

### Accessibility

1. **Provide meaningful names**: Use descriptive entity names
2. **Consider color contrast**: Ensure readability
3. **Add tap actions**: Make interactive elements clear

## Next Steps

Now that you understand the basics:

1. **Explore Tools**: See the [Tool Reference](../user-guides/tool-reference.md)
2. **Learn Theming**: Read the [Theming Guide](../user-guides/theming.md)
3. **See Examples**: Browse the [Examples Gallery](../user-guides/examples.md)
4. **Advanced Config**: Learn about [Advanced Configuration](../user-guides/configuration.md)