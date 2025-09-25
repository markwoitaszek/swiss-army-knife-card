# Installation Guide

This guide will help you install the Swiss Army Knife (SAK) custom card for Home Assistant using the recommended method (HACS) or manual installation.

## Prerequisites

- Home Assistant 2023.1.0 or later
- HACS (Home Assistant Community Store) installed (recommended)
- Basic understanding of Home Assistant configuration

## Method 1: HACS Installation (Recommended)

### Step 1: Install HACS (if not already installed)

1. Go to [HACS Installation Guide](https://hacs.xyz/docs/installation/manual)
2. Follow the installation instructions for your Home Assistant setup
3. Restart Home Assistant after installation

### Step 2: Add SAK Repository

1. Open HACS in your Home Assistant sidebar
2. Click on **Frontend**
3. Click the three dots menu (⋮) in the top right
4. Select **Custom repositories**
5. Add the repository:
   - **Repository**: `AmoebeLabs/swiss-army-knife-card`
   - **Category**: `Lovelace`
6. Click **Add**

### Step 3: Install SAK

1. Search for "Swiss Army Knife" in HACS
2. Click on the **Swiss Army Knife custom card**
3. Click **Download**
4. Restart Home Assistant

### Step 4: Add Resource

1. Go to **Settings** → **Devices & Services** → **Helpers**
2. Click **Create Helper** → **Lovelace Resources**
3. Add the resource:
   - **URL**: `/hacsfiles/swiss-army-knife-card/swiss-army-knife-card.js`
   - **Resource type**: `JavaScript Module`
4. Click **Create**

## Method 2: Manual Installation

### Step 1: Download the Card

1. Go to the [SAK Releases](https://github.com/AmoebeLabs/swiss-army-knife-card/releases)
2. Download the latest `swiss-army-knife-card.js` file
3. Place it in your Home Assistant `www` folder

### Step 2: Add Resource

1. Go to **Settings** → **Devices & Services** → **Helpers**
2. Click **Create Helper** → **Lovelace Resources**
3. Add the resource:
   - **URL**: `/local/swiss-army-knife-card.js`
   - **Resource type**: `JavaScript Module`
4. Click **Create**

## Method 3: One-Click Installation (Future)

> **Note**: This feature is planned for Phase 2 of the modernization plan.

The future version will include:
- One-click installation from the Home Assistant UI
- Automatic dependency management
- Built-in update notifications

## Post-Installation Setup

### Step 1: Add Templates (Required)

SAK requires template files to function properly. You need to add these to your `configuration.yaml`:

```yaml
# Add to configuration.yaml
sak_sys_templates:
  !include www/community/swiss-army-knife-card/sak_templates.yaml

sak_user_templates:
  !include lovelace/sak_templates/sak_templates.yaml
```

### Step 2: Create Template Directory

1. Create the directory: `config/lovelace/sak_templates/`
2. Create an empty `sak_templates.yaml` file in that directory

### Step 3: Restart Home Assistant

Restart Home Assistant to load the new configuration.

## Verification

### Test Installation

1. Go to any Lovelace dashboard
2. Click the three dots menu (⋮) → **Edit Dashboard**
3. Click **+ Add Card**
4. Search for "Swiss Army Knife"
5. If you see the card option, installation was successful

### Basic Test Card

Add this minimal configuration to test:

```yaml
type: custom:swiss-army-knife-card
entities:
  - entity: sensor.example
layout:
  toolsets:
    - toolset: test
      position:
        cx: 50
        cy: 50
      tools:
        - type: circle
          id: test_circle
          position:
            cx: 50
            cy: 50
            radius: 20
```

## Troubleshooting

### Common Issues

**Card not appearing in card picker:**
- Verify the resource was added correctly
- Check that the file path is correct
- Restart Home Assistant

**Templates not loading:**
- Ensure the template files exist
- Check the file paths in `configuration.yaml`
- Verify YAML syntax is correct

**JavaScript errors in browser console:**
- Check browser console for specific error messages
- Verify all dependencies are installed
- Try clearing browser cache

### Getting Help

If you encounter issues:

1. Check the [Troubleshooting Guide](../reference/troubleshooting.md)
2. Search [GitHub Issues](https://github.com/AmoebeLabs/swiss-army-knife-card/issues)
3. Ask for help in [GitHub Discussions](https://github.com/AmoebeLabs/swiss-army-knife-card/discussions)

## Next Steps

Now that SAK is installed:

1. Read the [Quick Start Guide](quick-start.md) to create your first card
2. Explore the [Tool Reference](../user-guides/tool-reference.md) to see all available tools
3. Check out the [Examples Gallery](../user-guides/examples.md) for inspiration

## Uninstallation

### HACS Method

1. Go to HACS → Frontend
2. Find "Swiss Army Knife custom card"
3. Click the three dots menu (⋮) → **Remove**
4. Remove the resource from Lovelace Resources
5. Remove template configuration from `configuration.yaml`
6. Restart Home Assistant

### Manual Method

1. Delete the `swiss-army-knife-card.js` file from your `www` folder
2. Remove the resource from Lovelace Resources
3. Remove template configuration from `configuration.yaml`
4. Restart Home Assistant