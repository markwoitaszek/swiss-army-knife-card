# Examples Gallery

This gallery showcases real-world examples of the Swiss Army Knife (SAK) custom card in action. Each example includes the complete configuration and explains the design choices.

## 🏠 Home Dashboard Examples

### Temperature and Humidity Card

A comprehensive weather card showing temperature, humidity, and trends.

```yaml
type: custom:swiss-army-knife-card
entities:
  - entity: sensor.living_room_temperature
    name: "Living Room"
  - entity: sensor.living_room_humidity
    name: "Humidity"
layout:
  aspectratio: "16/9"
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
            width: 95
            height: 90
          show:
            style: fixedcolor
          color: "#f5f5f5"
          styles:
            fill: "var(--card-background-color)"
            stroke: "var(--divider-color)"
            stroke-width: 1
            rx: 8
        
        # Temperature circle
        - type: circle
          id: temp_circle
          position:
            cx: 30
            cy: 50
            radius: 25
          entity_index: 0
          show:
            style: colorstop
          colorstops:
            colors:
              -10: "#0000ff"   # Very cold
              0: "#0080ff"     # Cold
              10: "#00ff80"    # Cool
              20: "#80ff00"    # Mild
              30: "#ffff00"    # Warm
              40: "#ff8000"    # Hot
              50: "#ff0000"    # Very hot
        
        # Temperature value
        - type: state
          id: temp_value
          position:
            cx: 30
            cy: 50
            size: 16
          entity_index: 0
          show:
            style: default
        
        # Temperature unit
        - type: text
          id: temp_unit
          position:
            cx: 30
            cy: 65
            size: 12
          text: "°C"
          show:
            style: default
        
        # Humidity bar
        - type: rectangle
          id: humidity_bg
          position:
            cx: 70
            cy: 40
            width: 20
            height: 40
          show:
            style: fixedcolor
          color: "#e0e0e0"
          styles:
            rx: 10
        
        # Humidity fill
        - type: rectangle
          id: humidity_fill
          position:
            cx: 70
            cy: 60
            width: 20
            height: 40
          entity_index: 1
          show:
            style: colorstop
          colorstops:
            colors:
              0: "#0000ff"     # Dry
              25: "#00ff00"    # Normal
              50: "#ffff00"    # Humid
              75: "#ff8000"    # Very humid
              100: "#ff0000"   # Extremely humid
        
        # Humidity value
        - type: state
          id: humidity_value
          position:
            cx: 70
            cy: 25
            size: 14
          entity_index: 1
          show:
            style: default
        
        # Humidity label
        - type: text
          id: humidity_label
          position:
            cx: 70
            cy: 15
            size: 10
          text: "Humidity"
          show:
            style: default
        
        # Temperature trend
        - type: sparkline
          id: temp_trend
          position:
            cx: 50
            cy: 80
            width: 80
            height: 15
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

### Smart Light Control

An interactive light control with brightness, color, and status.

```yaml
type: custom:swiss-army-knife-card
entities:
  - entity: light.living_room
layout:
  aspectratio: "1/1"
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
            radius: 45
          show:
            style: fixedcolor
          color: "#f0f0f0"
          styles:
            stroke: "var(--divider-color)"
            stroke-width: 2
        
        # Light status circle
        - type: circle
          id: light_status
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
          animations:
            pulse:
              state: "on"
              classes:
                tool: "pulse"
        
        # Light icon
        - type: icon
          id: light_icon
          position:
            cx: 50
            cy: 50
            size: 24
          entity_index: 0
          show:
            style: colorstop
          colorstops:
            colors:
              "off": "#666666"
              "on": "#000000"
        
        # Brightness slider
        - type: slider
          id: brightness_slider
          position:
            cx: 50
            cy: 80
            width: 60
            height: 6
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
        
        # Tap to toggle
        - type: circle
          id: toggle_area
          position:
            cx: 50
            cy: 50
            radius: 35
          show:
            style: fixedcolor
          color: "transparent"
          user_actions:
            tap_action:
              haptic: light
              actions:
                - action: call-service
                  service: light.toggle
```

### Energy Monitoring Dashboard

A comprehensive energy monitoring card showing consumption, production, and trends.

```yaml
type: custom:swiss-army-knife-card
entities:
  - entity: sensor.energy_consumption
  - entity: sensor.energy_production
  - entity: sensor.energy_battery
layout:
  aspectratio: "16/9"
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
            width: 95
            height: 90
          show:
            style: fixedcolor
          color: "#f8f9fa"
          styles:
            fill: "var(--card-background-color)"
            stroke: "var(--divider-color)"
            stroke-width: 1
            rx: 8
        
        # Consumption bar
        - type: rectangle
          id: consumption_bg
          position:
            cx: 25
            cy: 70
            width: 40
            height: 30
          show:
            style: fixedcolor
          color: "#e0e0e0"
          styles:
            rx: 4
        
        # Consumption fill
        - type: rectangle
          id: consumption_fill
          position:
            cx: 25
            cy: 85
            width: 40
            height: 30
          entity_index: 0
          show:
            style: colorstop
          colorstops:
            colors:
              0: "#00ff00"
              50: "#ffff00"
              100: "#ff0000"
        
        # Consumption label
        - type: text
          id: consumption_label
          position:
            cx: 25
            cy: 55
            size: 12
          text: "Consumption"
          show:
            style: default
        
        # Consumption value
        - type: state
          id: consumption_value
          position:
            cx: 25
            cy: 45
            size: 14
          entity_index: 0
          show:
            style: default
        
        # Production bar
        - type: rectangle
          id: production_bg
          position:
            cx: 75
            cy: 70
            width: 40
            height: 30
          show:
            style: fixedcolor
          color: "#e0e0e0"
          styles:
            rx: 4
        
        # Production fill
        - type: rectangle
          id: production_fill
          position:
            cx: 75
            cy: 85
            width: 40
            height: 30
          entity_index: 1
          show:
            style: colorstop
          colorstops:
            colors:
              0: "#333333"
              100: "#00ff00"
        
        # Production label
        - type: text
          id: production_label
          position:
            cx: 75
            cy: 55
            size: 12
          text: "Production"
          show:
            style: default
        
        # Production value
        - type: state
          id: production_value
          position:
            cx: 75
            cy: 45
            size: 14
          entity_index: 1
          show:
            style: default
        
        # Battery level
        - type: horseshoe
          id: battery_level
          position:
            cx: 50
            cy: 30
            radius: 20
          entity_index: 2
          show:
            style: colorstop
          colorstops:
            colors:
              0: "#ff0000"
              25: "#ff8800"
              50: "#ffff00"
              75: "#88ff00"
              100: "#00ff00"
        
        # Battery value
        - type: state
          id: battery_value
          position:
            cx: 50
            cy: 30
            size: 12
          entity_index: 2
          show:
            style: default
        
        # Energy trend
        - type: sparkline
          id: energy_trend
          position:
            cx: 50
            cy: 85
            width: 80
            height: 10
          entity_index: 0
          show:
            style: colorstop
          colorstops:
            colors:
              0: "#00ff00"
              100: "#ff0000"
          config:
            hours: 24
            show_fill: true
            show_line: true
```

## 🚗 Vehicle Monitoring

### Car Status Dashboard

Monitor your electric vehicle's battery, charging status, and range.

```yaml
type: custom:swiss-army-knife-card
entities:
  - entity: sensor.tesla_battery_level
  - entity: binary_sensor.tesla_charging
  - entity: sensor.tesla_range
layout:
  aspectratio: "16/9"
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
            width: 95
            height: 90
          show:
            style: fixedcolor
          color: "#f8f9fa"
          styles:
            fill: "var(--card-background-color)"
            stroke: "var(--divider-color)"
            stroke-width: 1
            rx: 8
        
        # Battery circle
        - type: circle
          id: battery_circle
          position:
            cx: 30
            cy: 50
            radius: 30
          entity_index: 0
          show:
            style: colorstop
          colorstops:
            colors:
              0: "#ff0000"
              25: "#ff8800"
              50: "#ffff00"
              75: "#88ff00"
              100: "#00ff00"
          animations:
            charging:
              state: "on"
              entity_index: 1
              classes:
                tool: "pulse"
        
        # Battery percentage
        - type: state
          id: battery_percent
          position:
            cx: 30
            cy: 50
            size: 16
          entity_index: 0
          show:
            style: default
        
        # Battery label
        - type: text
          id: battery_label
          position:
            cx: 30
            cy: 35
            size: 12
          text: "Battery"
          show:
            style: default
        
        # Charging indicator
        - type: icon
          id: charging_icon
          position:
            cx: 30
            cy: 65
            size: 16
          icon: "mdi:lightning-bolt"
          entity_index: 1
          show:
            style: colorstop
          colorstops:
            colors:
              "off": "#666666"
              "on": "#00ff00"
          animations:
            charging:
              state: "on"
              classes:
                tool: "pulse"
        
        # Range display
        - type: rectangle
          id: range_bg
          position:
            cx: 70
            cy: 50
            width: 50
            height: 40
          show:
            style: fixedcolor
          color: "#e0e0e0"
          styles:
            rx: 4
        
        # Range value
        - type: state
          id: range_value
          position:
            cx: 70
            cy: 45
            size: 18
          entity_index: 2
          show:
            style: default
        
        # Range label
        - type: text
          id: range_label
          position:
            cx: 70
            cy: 60
            size: 12
          text: "Range (km)"
          show:
            style: default
        
        # Range bar
        - type: rectangle
          id: range_bar
          position:
            cx: 70
            cy: 70
            width: 50
            height: 8
          entity_index: 0
          show:
            style: colorstop
          colorstops:
            colors:
              0: "#ff0000"
              25: "#ff8800"
              50: "#ffff00"
              75: "#88ff00"
              100: "#00ff00"
          styles:
            rx: 4
```

## 🏥 Health Monitoring

### Fitness Tracker

Monitor your daily fitness metrics including steps, heart rate, and calories.

```yaml
type: custom:swiss-army-knife-card
entities:
  - entity: sensor.daily_steps
  - entity: sensor.heart_rate
  - entity: sensor.calories_burned
layout:
  aspectratio: "1/1"
  toolsets:
    - toolset: main
      position:
        cx: 50
        cy: 50
      tools:
        # Background
        - type: circle
          id: bg_circle
          position:
            cx: 50
            cy: 50
            radius: 45
          show:
            style: fixedcolor
          color: "#f0f0f0"
          styles:
            stroke: "var(--divider-color)"
            stroke-width: 2
        
        # Steps circle
        - type: circle
          id: steps_circle
          position:
            cx: 50
            cy: 50
            radius: 35
          entity_index: 0
          show:
            style: colorstop
          colorstops:
            colors:
              0: "#ff0000"
              2500: "#ff8800"
              5000: "#ffff00"
              7500: "#88ff00"
              10000: "#00ff00"
        
        # Steps value
        - type: state
          id: steps_value
          position:
            cx: 50
            cy: 45
            size: 14
          entity_index: 0
          show:
            style: default
        
        # Steps label
        - type: text
          id: steps_label
          position:
            cx: 50
            cy: 35
            size: 10
          text: "Steps"
          show:
            style: default
        
        # Heart rate
        - type: icon
          id: heart_icon
          position:
            cx: 30
            cy: 70
            size: 16
          icon: "mdi:heart"
          entity_index: 1
          show:
            style: colorstop
          colorstops:
            colors:
              0: "#0000ff"
              60: "#00ff00"
              100: "#ffff00"
              120: "#ff8800"
              150: "#ff0000"
        
        # Heart rate value
        - type: state
          id: heart_value
          position:
            cx: 30
            cy: 80
            size: 10
          entity_index: 1
          show:
            style: default
        
        # Calories
        - type: icon
          id: calories_icon
          position:
            cx: 70
            cy: 70
            size: 16
          icon: "mdi:fire"
          entity_index: 2
          show:
            style: colorstop
          colorstops:
            colors:
              0: "#0000ff"
              500: "#00ff00"
              1000: "#ffff00"
              1500: "#ff8800"
              2000: "#ff0000"
        
        # Calories value
        - type: state
          id: calories_value
          position:
            cx: 70
            cy: 80
            size: 10
          entity_index: 2
          show:
            style: default
```

## 🏭 Industrial Monitoring

### Server Room Monitoring

Monitor server room temperature, humidity, and equipment status.

```yaml
type: custom:swiss-army-knife-card
entities:
  - entity: sensor.server_room_temperature
  - entity: sensor.server_room_humidity
  - entity: binary_sensor.server_room_fire_alarm
  - entity: binary_sensor.server_room_door
layout:
  aspectratio: "16/9"
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
            width: 95
            height: 90
          show:
            style: fixedcolor
          color: "#f8f9fa"
          styles:
            fill: "var(--card-background-color)"
            stroke: "var(--divider-color)"
            stroke-width: 1
            rx: 8
        
        # Temperature gauge
        - type: horseshoe
          id: temp_gauge
          position:
            cx: 25
            cy: 40
            radius: 20
          entity_index: 0
          show:
            style: colorstop
          colorstops:
            colors:
              15: "#0000ff"    # Too cold
              20: "#00ff00"    # Optimal
              25: "#ffff00"    # Warm
              30: "#ff8800"    # Hot
              35: "#ff0000"    # Critical
        
        # Temperature value
        - type: state
          id: temp_value
          position:
            cx: 25
            cy: 40
            size: 12
          entity_index: 0
          show:
            style: default
        
        # Temperature label
        - type: text
          id: temp_label
          position:
            cx: 25
            cy: 25
            size: 10
          text: "Temp"
          show:
            style: default
        
        # Humidity gauge
        - type: horseshoe
          id: humidity_gauge
          position:
            cx: 75
            cy: 40
            radius: 20
          entity_index: 1
          show:
            style: colorstop
          colorstops:
            colors:
              0: "#0000ff"     # Too dry
              30: "#00ff00"    # Optimal
              50: "#ffff00"    # Humid
              70: "#ff8800"    # Very humid
              100: "#ff0000"   # Critical
        
        # Humidity value
        - type: state
          id: humidity_value
          position:
            cx: 75
            cy: 40
            size: 12
          entity_index: 1
          show:
            style: default
        
        # Humidity label
        - type: text
          id: humidity_label
          position:
            cx: 75
            cy: 25
            size: 10
          text: "Humidity"
          show:
            style: default
        
        # Fire alarm
        - type: circle
          id: fire_alarm
          position:
            cx: 25
            cy: 75
            radius: 8
          entity_index: 2
          show:
            style: colorstop
          colorstops:
            colors:
              "off": "#00ff00"
              "on": "#ff0000"
          animations:
            alarm:
              state: "on"
              classes:
                tool: "pulse"
        
        # Fire alarm label
        - type: text
          id: fire_label
          position:
            cx: 25
            cy: 85
            size: 8
          text: "Fire"
          show:
            style: default
        
        # Door status
        - type: circle
          id: door_status
          position:
            cx: 75
            cy: 75
            radius: 8
          entity_index: 3
          show:
            style: colorstop
          colorstops:
            colors:
              "off": "#00ff00"  # Closed
              "on": "#ff8800"   # Open
        
        # Door label
        - type: text
          id: door_label
          position:
            cx: 75
            cy: 85
            size: 8
          text: "Door"
          show:
            style: default
```

## 🎨 Creative Examples

### Minimalist Clock

A clean, minimalist clock display.

```yaml
type: custom:swiss-army-knife-card
entities:
  - entity: sensor.time
layout:
  aspectratio: "1/1"
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
            radius: 45
          show:
            style: fixedcolor
          color: "#ffffff"
          styles:
            stroke: "#e0e0e0"
            stroke-width: 2
        
        # Time display
        - type: state
          id: time_display
          position:
            cx: 50
            cy: 50
            size: 20
          entity_index: 0
          show:
            style: default
          styles:
            font-family: "monospace"
            font-weight: "bold"
```

### Animated Loading Spinner

A custom loading spinner with animation.

```yaml
type: custom:swiss-army-knife-card
entities:
  - entity: binary_sensor.system_loading
layout:
  aspectratio: "1/1"
  toolsets:
    - toolset: main
      position:
        cx: 50
        cy: 50
      tools:
        # Spinner circle
        - type: circle
          id: spinner
          position:
            cx: 50
            cy: 50
            radius: 20
          entity_index: 0
          show:
            style: colorstop
          colorstops:
            colors:
              "off": "#e0e0e0"
              "on": "#1976d2"
          animations:
            spin:
              state: "on"
              classes:
                tool: "spin"
          styles:
            stroke: "var(--primary-color)"
            stroke-width: 4
            fill: "none"
            stroke-dasharray: "60 20"
        
        # Loading text
        - type: text
          id: loading_text
          position:
            cx: 50
            cy: 75
            size: 12
          text: "Loading..."
          entity_index: 0
          show:
            style: colorstop
          colorstops:
            colors:
              "off": "#999999"
              "on": "#1976d2"
```

## 🎯 Best Practices from Examples

### Design Principles

1. **Consistent Spacing**
   - Use consistent margins and padding
   - Align elements on a grid
   - Maintain visual hierarchy

2. **Color Harmony**
   - Use color stops for data visualization
   - Maintain consistency across similar elements
   - Consider accessibility and contrast

3. **Information Hierarchy**
   - Most important information should be prominent
   - Use size, color, and position to guide attention
   - Group related information together

### Performance Considerations

1. **Limit Entity Count**
   - Use only necessary entities
   - Combine related data when possible
   - Cache frequently accessed data

2. **Optimize Animations**
   - Use simple animations for better performance
   - Avoid complex animations on many elements
   - Consider reduced motion preferences

3. **Efficient Rendering**
   - Use appropriate tool types for the data
   - Minimize DOM complexity
   - Optimize for mobile devices

### Accessibility Features

1. **Color and Contrast**
   - Ensure sufficient color contrast
   - Don't rely solely on color for information
   - Provide alternative visual cues

2. **Interactive Elements**
   - Make interactive areas large enough
   - Provide clear visual feedback
   - Use appropriate haptic feedback

3. **Text and Labels**
   - Use clear, descriptive labels
   - Provide context for values
   - Use appropriate font sizes

## 📚 Related Documentation

- [Tool Reference](tool-reference.md) - Complete tool documentation
- [Theming Guide](theming.md) - Advanced styling techniques
- [Configuration Guide](configuration.md) - Advanced configuration
- [Troubleshooting](../reference/troubleshooting.md) - Common issues

---

**Last Updated**: December 2024  
**Version**: 3.0.0 (Modernization Phase)