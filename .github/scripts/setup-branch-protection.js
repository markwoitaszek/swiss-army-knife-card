#!/usr/bin/env node

/**
 * GitHub Branch Protection Setup Script
 * Sets up branch protection rules for the SAK Card project
 */

import { Octokit } from '@octokit/rest';

// Initialize Octokit
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const owner = 'markwoitaszek';
const repo = 'swiss-army-knife-card';

// Branch protection configuration
const branchProtection = {
  required_status_checks: {
    strict: true,
    contexts: [
      'CI/CD Pipeline',
      'Unit Tests',
      'E2E Tests',
      'Security Scanning',
      'Build Process'
    ]
  },
  enforce_admins: false,
  required_pull_request_reviews: {
    required_approving_review_count: 2,
    dismiss_stale_reviews: true,
    require_code_owner_reviews: false,
    require_last_push_approval: true
  },
  restrictions: null,
  allow_force_pushes: false,
  allow_deletions: false
};

async function setupBranchProtection() {
  console.log('Setting up branch protection rules...');

  try {
    await octokit.rest.repos.updateBranchProtection({
      owner,
      repo,
      branch: 'main',
      ...branchProtection
    });
    console.log('✅ Branch protection rules set up for main branch');
  } catch (error) {
    console.error('❌ Error setting up branch protection:', error.message);
  }

  // Also protect the modernization-analysis branch
  try {
    await octokit.rest.repos.updateBranchProtection({
      owner,
      repo,
      branch: 'modernization-analysis',
      ...branchProtection
    });
    console.log('✅ Branch protection rules set up for modernization-analysis branch');
  } catch (error) {
    console.error('❌ Error setting up branch protection for modernization-analysis:', error.message);
  }

  console.log('✅ Branch protection setup complete!');
}

// Run the script
setupBranchProtection().catch(console.error);
