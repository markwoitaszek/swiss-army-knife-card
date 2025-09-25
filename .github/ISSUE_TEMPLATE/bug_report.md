---
name: Bug Report
about: Create a report to help us improve
title: '[BUG] '
labels: ['bug', 'needs-triage']
assignees: ''
---

## 🐛 Bug Report

**Before filing this bug, please ensure:**
- [ ] You have checked the [troubleshooting guide](https://github.com/AmoebeLabs/swiss-army-knife-card/blob/main/docs/reference/troubleshooting.md)
- [ ] You have searched existing issues to avoid duplicates
- [ ] You have tested with the latest version
- [ ] This is not a configuration issue

## 📋 Bug Information

### Swiss Army Knife Version
<!-- Please provide the version you are using -->
- Version:
- Installation method: [HACS/Manual]
- Home Assistant version:

### Bug Description
<!-- A clear and concise description of what the bug is -->

### Steps to Reproduce
<!-- Steps to reproduce the behavior -->
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

### Expected Behavior
<!-- A clear and concise description of what you expected to happen -->

### Actual Behavior
<!-- A clear and concise description of what actually happened -->

### Screenshots
<!-- If applicable, add screenshots to help explain your problem -->

## 🔧 Environment

### Desktop Browser
- OS: [e.g. Windows 11, macOS 13, Ubuntu 22.04]
- Browser: [e.g. Chrome 120, Firefox 121, Safari 17]
- Version:

### Mobile Device
- Device: [e.g. iPhone 15, Samsung Galaxy S24]
- OS: [e.g. iOS 17, Android 14]
- Browser: [e.g. Safari, Chrome, Samsung Internet]
- Version:

### Home Assistant
- Version:
- Installation type: [e.g. Home Assistant OS, Docker, Core]
- Frontend version:

## 📝 Configuration

```yaml
# Please provide your SAK configuration (remove sensitive data)
type: custom:swiss-army-knife-card
entities:
  - entity: sensor.example
layout:
  toolsets:
    - toolset: main
      position:
        cx: 50
        cy: 50
      tools:
        - type: circle
          id: example
          position:
            cx: 50
            cy: 50
            radius: 20
          entity_index: 0
```

## 🚨 Error Information

### Browser Console
<!-- Any error messages from browser console -->
```
Paste console errors here
```

### Home Assistant Logs
<!-- Any relevant Home Assistant logs -->
```
Paste HA logs here
```

### Network Tab
<!-- Any failed network requests -->
- Failed requests:
- Status codes:

## 🔍 Additional Context

<!-- Add any other context about the problem here -->

## 💡 Suggested Solution

<!-- If you have ideas on how to fix this bug, please describe them -->

## 📊 Impact Assessment

- [ ] Critical - Card doesn't work at all
- [ ] High - Major functionality broken
- [ ] Medium - Minor functionality affected
- [ ] Low - Cosmetic issue only

## 🏷️ Labels

<!-- The following labels will be automatically applied -->
- `bug`
- `needs-triage`
