# Tool Reference

The Swiss Army Knife (SAK) custom card provides 17 different tools for creating custom visualizations. This reference guide covers all available tools, their properties, and usage examples.

## 📋 Tool Categories

### Shape Tools
- [Circle Tool](#circle-tool)
- [Rectangle Tool](#rectangle-tool)
- [Ellipse Tool](#ellipse-tool)
- [Line Tool](#line-tool)
- [Regular Polygon Tool](#regular-polygon-tool)

### Text and Display Tools
- [Text Tool](#text-tool)
- [State Tool](#state-tool)
- [Name Tool](#name-tool)
- [Icon Tool](#icon-tool)
- [Badge Tool](#badge-tool)

### Interactive Tools
- [Switch Tool](#switch-tool)
- [Range Slider Tool](#range-slider-tool)
- [Circular Slider Tool](#circular-slider-tool)

### Chart and Data Tools
- [Sparkline Tool](#sparkline-tool)
- [Bar Chart Tool](#bar-chart-tool)
- [Horseshoe Tool](#horseshoe-tool)
- [Segmented Arc Tool](#segmented-arc-tool)

### Specialized Tools
- [User SVG Tool](#user-svg-tool)
- [Area Tool](#area-tool)

## 🔧 Common Tool Properties

All tools share these common properties:

```yaml
type: tool_type              # Tool type (required)
id: unique_id                # Unique identifier (required)
position:                    # Position within toolset
  cx: 50                     # Center X (0-100%)
  cy: 50                     # Center Y (0-100%)
  # Tool-specific size properties
entity_index: 0              # Which entity to use (optional)
show:                        # Display options
  style: colorstop           # Visual style
styles:                      # Custom styles (optional)
  fill: "#ff0000"
classes:                     # CSS classes (optional)
  tool: "custom-class"
animations:                  # State-based animations (optional)
  active:
    state: "on"
    styles:
      tool: "fill: #00ff00;"
user_actions:                # Interaction handlers (optional)
  tap_action:
    actions:
      - action: call-service
        service: light.toggle
```

## 🔵 Shape Tools

### Circle Tool

Creates circular shapes for indicators, status lights, and progress displays.

**Properties:**
```yaml
type: circle
position:
  cx: 50          # Center X (0-100%)
  cy: 50          # Center Y (0-100%)
  radius: 20      # Radius (0-100%)
```

**Example:**
```yaml
- type: circle
  id: temperature_circle
  position:
    cx: 50
    cy: 50
    radius: 30
  entity_index: 0
  show:
    style: colorstop
  colorstops:
    colors:
      0: "#0000ff"    # Cold
      25: "#00ff00"   # Cool
      50: "#ffff00"   # Warm
      75: "#ff8800"   # Hot
      100: "#ff0000"  # Very hot
```

**Use Cases:**
- Temperature indicators
- Status lights
- Progress circles
- Background elements

### Rectangle Tool

Creates rectangular shapes for progress bars, backgrounds, and containers.

**Properties:**
```yaml
type: rectangle
position:
  cx: 50          # Center X (0-100%)
  cy: 50          # Center Y (0-100%)
  width: 80       # Width (0-100%)
  height: 10      # Height (0-100%)
```

**Example:**
```yaml
- type: rectangle
  id: battery_bar
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
      0: "#ff0000"    # Empty
      25: "#ff8800"   # Low
      50: "#ffff00"   # Medium
      75: "#88ff00"   # Good
      100: "#00ff00"  # Full
```

**Use Cases:**
- Progress bars
- Battery indicators
- Background containers
- Status indicators

### Ellipse Tool

Creates elliptical shapes for oval indicators and decorative elements.

**Properties:**
```yaml
type: ellipse
position:
  cx: 50          # Center X (0-100%)
  cy: 50          # Center Y (0-100%)
  rx: 40          # Horizontal radius (0-100%)
  ry: 20          # Vertical radius (0-100%)
```

**Example:**
```yaml
- type: ellipse
  id: humidity_oval
  position:
    cx: 50
    cy: 50
    rx: 35
    ry: 15
  entity_index: 0
  show:
    style: colorstop
  colorstops:
    colors:
      0: "#0000ff"    # Dry
      50: "#00ff00"   # Normal
      100: "#ff0000"  # Humid
```

**Use Cases:**
- Humidity indicators
- Decorative elements
- Oval progress indicators
- Background shapes

### Line Tool

Creates straight lines for dividers, connections, and decorative elements.

**Properties:**
```yaml
type: line
position:
  x1: 10          # Start X (0-100%)
  y1: 50          # Start Y (0-100%)
  x2: 90          # End X (0-100%)
  y2: 50          # End Y (0-100%)
```

**Example:**
```yaml
- type: line
  id: divider_line
  position:
    x1: 10
    y1: 50
    x2: 90
    y2: 50
  show:
    style: fixedcolor
  color: "#cccccc"
  styles:
    stroke-width: 2
```

**Use Cases:**
- Dividers
- Connection lines
- Decorative elements
- Progress indicators

### Regular Polygon Tool

Creates regular polygons (triangles, squares, hexagons, etc.) for geometric indicators.

**Properties:**
```yaml
type: regpoly
position:
  cx: 50          # Center X (0-100%)
  cy: 50          # Center Y (0-100%)
  radius: 20      # Radius (0-100%)
  sides: 6        # Number of sides (3-12)
```

**Example:**
```yaml
- type: regpoly
  id: hexagon_indicator
  position:
    cx: 50
    cy: 50
    radius: 25
    sides: 6
  entity_index: 0
  show:
    style: colorstop
  colorstops:
    colors:
      "off": "#333333"
      "on": "#00ff00"
```

**Use Cases:**
- Status indicators
- Decorative elements
- Geometric progress indicators
- Custom shapes

## 📝 Text and Display Tools

### Text Tool

Displays static text labels and descriptions.

**Properties:**
```yaml
type: text
position:
  cx: 50          # Center X (0-100%)
  cy: 50          # Center Y (0-100%)
  size: 16        # Font size (8-32)
text: "Label"     # Text content
```

**Example:**
```yaml
- type: text
  id: temperature_label
  position:
    cx: 50
    cy: 30
    size: 14
  text: "Temperature"
  show:
    style: fixedcolor
  color: "#333333"
```

**Use Cases:**
- Labels
- Descriptions
- Static text
- Headers

### State Tool

Displays the current state value of an entity.

**Properties:**
```yaml
type: state
position:
  cx: 50          # Center X (0-100%)
  cy: 50          # Center Y (0-100%)
  size: 16        # Font size (8-32)
entity_index: 0   # Entity to display
```

**Example:**
```yaml
- type: state
  id: temperature_value
  position:
    cx: 50
    cy: 70
    size: 18
  entity_index: 0
  show:
    style: default
```

**Use Cases:**
- Current values
- Status text
- Numeric displays
- State information

### Name Tool

Displays the friendly name of an entity.

**Properties:**
```yaml
type: name
position:
  cx: 50          # Center X (0-100%)
  cy: 50          # Center Y (0-100%)
  size: 16        # Font size (8-32)
entity_index: 0   # Entity to display
```

**Example:**
```yaml
- type: name
  id: entity_name
  position:
    cx: 50
    cy: 20
    size: 14
  entity_index: 0
  show:
    style: default
```

**Use Cases:**
- Entity names
- Labels
- Titles
- Headers

### Icon Tool

Displays the icon associated with an entity or a custom icon.

**Properties:**
```yaml
type: icon
position:
  cx: 50          # Center X (0-100%)
  cy: 50          # Center Y (0-100%)
  size: 20        # Icon size (8-40)
entity_index: 0   # Entity to display (optional)
icon: "mdi:home"  # Custom icon (optional)
```

**Example:**
```yaml
- type: icon
  id: temperature_icon
  position:
    cx: 50
    cy: 40
    size: 24
  entity_index: 0
  show:
    style: colorstop
  colorstops:
    colors:
      0: "#0000ff"    # Cold
      50: "#ffff00"   # Warm
      100: "#ff0000"  # Hot
```

**Use Cases:**
- Entity icons
- Status indicators
- Decorative icons
- Visual cues

### Badge Tool

Displays a badge with text or numbers for notifications and status.

**Properties:**
```yaml
type: badge
position:
  cx: 50          # Center X (0-100%)
  cy: 50          # Center Y (0-100%)
  size: 20        # Badge size (8-40)
text: "5"         # Badge text
entity_index: 0   # Entity to display (optional)
```

**Example:**
```yaml
- type: badge
  id: notification_badge
  position:
    cx: 80
    cy: 20
    size: 16
  entity_index: 0
  show:
    style: colorstop
  colorstops:
    colors:
      "0": "#cccccc"
      "1": "#ff0000"
```

**Use Cases:**
- Notifications
- Counters
- Status badges
- Alerts

## 🎛️ Interactive Tools

### Switch Tool

Creates an interactive switch for toggling entities.

**Properties:**
```yaml
type: switch
position:
  cx: 50          # Center X (0-100%)
  cy: 50          # Center Y (0-100%)
  size: 30        # Switch size (20-50)
entity_index: 0   # Entity to control
```

**Example:**
```yaml
- type: switch
  id: light_switch
  position:
    cx: 50
    cy: 50
    size: 35
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

**Use Cases:**
- Light controls
- Switch toggles
- Binary controls
- On/off indicators

### Range Slider Tool

Creates a horizontal slider for controlling numeric values.

**Properties:**
```yaml
type: slider
position:
  cx: 50          # Center X (0-100%)
  cy: 50          # Center Y (0-100%)
  width: 80       # Slider width (40-100%)
  height: 10      # Slider height (5-20)
entity_index: 0   # Entity to control
```

**Example:**
```yaml
- type: slider
  id: brightness_slider
  position:
    cx: 50
    cy: 50
    width: 80
    height: 8
  entity_index: 0
  show:
    style: colorstop
  colorstops:
    colors:
      0: "#000000"
      100: "#ffffff"
  user_actions:
    tap_action:
      actions:
        - action: call-service
          service: light.turn_on
          service_data:
            brightness_pct: "{{ value }}"
```

**Use Cases:**
- Brightness controls
- Volume sliders
- Temperature settings
- Percentage controls

### Circular Slider Tool

Creates a circular slider for controlling numeric values.

**Properties:**
```yaml
type: circslider
position:
  cx: 50          # Center X (0-100%)
  cy: 50          # Center Y (0-100%)
  radius: 30      # Slider radius (20-50)
entity_index: 0   # Entity to control
```

**Example:**
```yaml
- type: circslider
  id: temperature_control
  position:
    cx: 50
    cy: 50
    radius: 35
  entity_index: 0
  show:
    style: colorstop
  colorstops:
    colors:
      0: "#0000ff"    # Cold
      50: "#ffff00"   # Warm
      100: "#ff0000"  # Hot
  user_actions:
    tap_action:
      actions:
        - action: call-service
          service: climate.set_temperature
          service_data:
            temperature: "{{ value }}"
```

**Use Cases:**
- Temperature controls
- Circular progress
- Rotary controls
- Percentage displays

## 📊 Chart and Data Tools

### Sparkline Tool

Creates a sparkline chart showing historical data trends.

**Properties:**
```yaml
type: sparkline
position:
  cx: 50          # Center X (0-100%)
  cy: 50          # Center Y (0-100%)
  width: 80       # Chart width (40-100%)
  height: 40      # Chart height (20-60)
entity_index: 0   # Entity to display
```

**Example:**
```yaml
- type: sparkline
  id: temperature_trend
  position:
    cx: 50
    cy: 50
    width: 80
    height: 30
  entity_index: 0
  show:
    style: colorstop
  colorstops:
    colors:
      0: "#0000ff"
      100: "#ff0000"
  config:
    hours: 24
    show_fill: true
    show_line: true
```

**Use Cases:**
- Temperature trends
- Usage patterns
- Historical data
- Performance metrics

### Bar Chart Tool

Creates a bar chart showing historical data in bars.

**Properties:**
```yaml
type: bar
position:
  cx: 50          # Center X (0-100%)
  cy: 50          # Center Y (0-100%)
  width: 80       # Chart width (40-100%)
  height: 40      # Chart height (20-60)
entity_index: 0   # Entity to display
```

**Example:**
```yaml
- type: bar
  id: energy_usage
  position:
    cx: 50
    cy: 50
    width: 80
    height: 35
  entity_index: 0
  show:
    style: colorstop
  colorstops:
    colors:
      0: "#00ff00"
      50: "#ffff00"
      100: "#ff0000"
  config:
    hours: 24
    barhours: 2
    show_bars: true
```

**Use Cases:**
- Energy usage
- Consumption patterns
- Hourly data
- Statistical displays

### Horseshoe Tool

Creates a horseshoe-shaped progress indicator.

**Properties:**
```yaml
type: horseshoe
position:
  cx: 50          # Center X (0-100%)
  cy: 50          # Center Y (0-100%)
  radius: 30      # Horseshoe radius (20-50)
entity_index: 0   # Entity to display
```

**Example:**
```yaml
- type: horseshoe
  id: battery_level
  position:
    cx: 50
    cy: 50
    radius: 35
  entity_index: 0
  show:
    style: colorstop
  colorstops:
    colors:
      0: "#ff0000"    # Empty
      25: "#ff8800"   # Low
      50: "#ffff00"   # Medium
      75: "#88ff00"   # Good
      100: "#00ff00"  # Full
```

**Use Cases:**
- Battery levels
- Progress indicators
- Circular progress
- Status displays

### Segmented Arc Tool

Creates a segmented arc for multi-state indicators.

**Properties:**
```yaml
type: segarc
position:
  cx: 50          # Center X (0-100%)
  cy: 50          # Center Y (0-100%)
  radius: 30      # Arc radius (20-50)
entity_index: 0   # Entity to display
```

**Example:**
```yaml
- type: segarc
  id: multi_state_indicator
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
      "idle": "#ffff00"
      "active": "#00ff00"
      "error": "#ff0000"
```

**Use Cases:**
- Multi-state indicators
- Status displays
- Mode indicators
- Complex states

## 🎨 Specialized Tools

### User SVG Tool

Allows embedding custom SVG content.

**Properties:**
```yaml
type: usersvg
position:
  cx: 50          # Center X (0-100%)
  cy: 50          # Center Y (0-100%)
  width: 40       # SVG width (20-80)
  height: 40      # SVG height (20-80)
svg: "<svg>...</svg>"  # SVG content
```

**Example:**
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
  show:
    style: colorstop
  colorstops:
    colors:
      "off": "#333333"
      "on": "#00ff00"
```

**Use Cases:**
- Custom icons
- Complex graphics
- Brand elements
- Unique indicators

### Area Tool

Displays the area/room information of an entity.

**Properties:**
```yaml
type: area
position:
  cx: 50          # Center X (0-100%)
  cy: 50          # Center Y (0-100%)
  size: 16        # Font size (8-32)
entity_index: 0   # Entity to display
```

**Example:**
```yaml
- type: area
  id: room_name
  position:
    cx: 50
    cy: 80
    size: 12
  entity_index: 0
  show:
    style: default
```

**Use Cases:**
- Room names
- Area information
- Location displays
- Context information

## 🎨 Visual Styles

### Show Styles

All tools support these visual styles:

```yaml
show:
  style: default          # Default appearance
  style: fixedcolor       # Single color
  style: colorstop        # Color based on value
  style: colorstops       # Multiple color stops
  style: colorstopgradient # Gradient between stops
  style: minmaxgradient   # Gradient between min/max
```

### Color Stop Examples

**Temperature Gradient:**
```yaml
colorstops:
  colors:
    0: "#0000ff"    # Cold (blue)
    25: "#00ff00"   # Cool (green)
    50: "#ffff00"   # Warm (yellow)
    75: "#ff8800"   # Hot (orange)
    100: "#ff0000"  # Very hot (red)
```

**Status Colors:**
```yaml
colorstops:
  colors:
    "off": "#333333"
    "on": "#00ff00"
    "error": "#ff0000"
    "warning": "#ffff00"
```

**Battery Levels:**
```yaml
colorstops:
  colors:
    0: "#ff0000"    # Empty
    25: "#ff8800"   # Low
    50: "#ffff00"   # Medium
    75: "#88ff00"   # Good
    100: "#00ff00"  # Full
```

## 🎭 Animations

### Animation Examples

**Pulse Animation:**
```yaml
animations:
  pulse:
    state: "on"
    classes:
      tool: "pulse"
    styles:
      tool: "fill: #00ff00;"
```

**Color Change:**
```yaml
animations:
  active:
    state: "active"
    styles:
      tool: "fill: #ff0000; stroke: #000000;"
```

**Size Change:**
```yaml
animations:
  hover:
    state: "hover"
    styles:
      tool: "transform: scale(1.1);"
```

## 🎯 Best Practices

### Tool Selection

1. **Choose the right tool for the job**
   - Use circles for status indicators
   - Use rectangles for progress bars
   - Use text for labels and values

2. **Consider the data type**
   - Numeric values: circles, rectangles, sliders
   - Text values: text, state, name tools
   - Binary states: switches, circles with color stops

3. **Think about user interaction**
   - Add tap actions for interactive elements
   - Use appropriate visual feedback
   - Consider accessibility

### Performance Tips

1. **Limit the number of tools**
   - Use only necessary tools
   - Combine related information
   - Optimize for mobile devices

2. **Use efficient styles**
   - Prefer `colorstop` over complex gradients
   - Use `fixedcolor` for static elements
   - Avoid excessive animations

3. **Optimize entity usage**
   - Use only required entities
   - Cache entity states when possible
   - Minimize state updates

## 📚 Related Documentation

- [Basic Configuration](../getting-started/basic-configuration.md) - Configuration fundamentals
- [Theming Guide](theming.md) - Advanced styling
- [Examples Gallery](examples.md) - Real-world examples
- [Troubleshooting](../reference/troubleshooting.md) - Common issues

---

**Last Updated**: December 2024  
**Version**: 3.0.0 (Modernization Phase)