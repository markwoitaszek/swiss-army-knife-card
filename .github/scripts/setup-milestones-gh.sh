#!/bin/bash

# GitHub Milestones Setup Script using GitHub CLI
# Creates all the milestones for the SAK Card modernization project

echo "Creating milestones using GitHub CLI..."

# Phase 1: Foundation
gh api repos/markwoitaszek/swiss-army-knife-card/milestones --method POST --field title="Phase 1: Foundation" --field description="Lit 3.x migration, TypeScript implementation, architecture refactoring, and build system modernization" --field due_on="2024-02-15T00:00:00Z" --field state="open"

# Phase 2: Core Features
gh api repos/markwoitaszek/swiss-army-knife-card/milestones --method POST --field title="Phase 2: Core Features" --field description="Core tool functionality and features implementation" --field due_on="2024-03-15T00:00:00Z" --field state="open"

# Phase 3: Advanced Features
gh api repos/markwoitaszek/swiss-army-knife-card/milestones --method POST --field title="Phase 3: Advanced Features" --field description="Advanced features and integrations" --field due_on="2024-04-15T00:00:00Z" --field state="open"

# Phase 4: Polish & Release
gh api repos/markwoitaszek/swiss-army-knife-card/milestones --method POST --field title="Phase 4: Polish & Release" --field description="Final polish and release preparation" --field due_on="2024-05-15T00:00:00Z" --field state="open"

echo "✅ Milestone setup complete!"
