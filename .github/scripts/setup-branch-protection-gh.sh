#!/bin/bash

# GitHub Branch Protection Setup Script using GitHub CLI
# Sets up branch protection rules for the SAK Card project

echo "Setting up branch protection rules..."

# Create a temporary JSON file for the protection rules
cat > /tmp/branch-protection.json << 'EOF'
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "CI/CD Pipeline",
      "Unit Tests",
      "E2E Tests",
      "Security Scanning",
      "Build Process"
    ]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 2,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "require_last_push_approval": true
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
EOF

# Apply branch protection to master branch
gh api repos/markwoitaszek/swiss-army-knife-card/branches/master/protection --method PUT --input /tmp/branch-protection.json

# Apply branch protection to modernization-analysis branch
gh api repos/markwoitaszek/swiss-army-knife-card/branches/modernization-analysis/protection --method PUT --input /tmp/branch-protection.json

# Clean up
rm /tmp/branch-protection.json

echo "✅ Branch protection setup complete!"
