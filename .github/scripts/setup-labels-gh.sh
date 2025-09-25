#!/bin/bash

# GitHub Labels Setup Script using GitHub CLI
# Creates all the labels needed for the SAK Card project

echo "Creating labels using GitHub CLI..."

# Priority Labels
gh api repos/markwoitaszek/swiss-army-knife-card/labels --method POST --field name="priority: high" --field color="ff9800" --field description="High priority issues"
gh api repos/markwoitaszek/swiss-army-knife-card/labels --method POST --field name="priority: medium" --field color="ffc107" --field description="Medium priority issues"
gh api repos/markwoitaszek/swiss-army-knife-card/labels --method POST --field name="priority: low" --field color="4caf50" --field description="Low priority issues"

# Type Labels
gh api repos/markwoitaszek/swiss-army-knife-card/labels --method POST --field name="type: bug" --field color="d73a4a" --field description="Bug reports"
gh api repos/markwoitaszek/swiss-army-knife-card/labels --method POST --field name="type: feature" --field color="0075ca" --field description="Feature requests"
gh api repos/markwoitaszek/swiss-army-knife-card/labels --method POST --field name="type: enhancement" --field color="a2eeef" --field description="Improvements to existing features"
gh api repos/markwoitaszek/swiss-army-knife-card/labels --method POST --field name="type: documentation" --field color="7057ff" --field description="Documentation updates"
gh api repos/markwoitaszek/swiss-army-knife-card/labels --method POST --field name="type: refactor" --field color="f9d0c4" --field description="Code refactoring"
gh api repos/markwoitaszek/swiss-army-knife-card/labels --method POST --field name="type: test" --field color="c5def5" --field description="Testing related"

# Phase Labels
gh api repos/markwoitaszek/swiss-army-knife-card/labels --method POST --field name="phase: foundation" --field color="e99695" --field description="Phase 1: Foundation items"
gh api repos/markwoitaszek/swiss-army-knife-card/labels --method POST --field name="phase: core" --field color="f9d0c4" --field description="Phase 2: Core features"
gh api repos/markwoitaszek/swiss-army-knife-card/labels --method POST --field name="phase: advanced" --field color="c5def5" --field description="Phase 3: Advanced features"
gh api repos/markwoitaszek/swiss-army-knife-card/labels --method POST --field name="phase: polish" --field color="d4c5f9" --field description="Phase 4: Polish & release"

# Component Labels
gh api repos/markwoitaszek/swiss-army-knife-card/labels --method POST --field name="component: build" --field color="f9d0c4" --field description="Build system"
gh api repos/markwoitaszek/swiss-army-knife-card/labels --method POST --field name="component: tools" --field color="c5def5" --field description="Tool components"
gh api repos/markwoitaszek/swiss-army-knife-card/labels --method POST --field name="component: ui" --field color="d4c5f9" --field description="User interface"
gh api repos/markwoitaszek/swiss-army-knife-card/labels --method POST --field name="component: testing" --field color="e99695" --field description="Testing framework"
gh api repos/markwoitaszek/swiss-army-knife-card/labels --method POST --field name="component: docs" --field color="f9d0c4" --field description="Documentation"
gh api repos/markwoitaszek/swiss-army-knife-card/labels --method POST --field name="component: ci-cd" --field color="c5def5" --field description="CI/CD pipeline"

# Status Labels
gh api repos/markwoitaszek/swiss-army-knife-card/labels --method POST --field name="status: needs-triage" --field color="ff9800" --field description="Needs initial review"
gh api repos/markwoitaszek/swiss-army-knife-card/labels --method POST --field name="status: needs-design" --field color="ffc107" --field description="Needs design work"
gh api repos/markwoitaszek/swiss-army-knife-card/labels --method POST --field name="status: needs-approval" --field color="2196f3" --field description="Needs approval"
gh api repos/markwoitaszek/swiss-army-knife-card/labels --method POST --field name="status: blocked" --field color="f44336" --field description="Blocked by other issues"
gh api repos/markwoitaszek/swiss-army-knife-card/labels --method POST --field name="status: duplicate" --field color="9e9e9e" --field description="Duplicate issue"

echo "✅ Label setup complete!"
