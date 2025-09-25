#!/usr/bin/env node

/**
 * GitHub Labels Setup Script
 * Creates all the labels needed for the SAK Card project
 */

const { Octokit } = require('@octokit/rest');

// Initialize Octokit
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const owner = 'markwoitaszek';
const repo = 'swiss-army-knife-card';

// Label definitions
const labels = [
  // Priority Labels
  { name: 'priority: critical', color: 'd73a4a', description: 'Critical issues that block development' },
  { name: 'priority: high', color: 'ff9800', description: 'High priority issues' },
  { name: 'priority: medium', color: 'ffc107', description: 'Medium priority issues' },
  { name: 'priority: low', color: '4caf50', description: 'Low priority issues' },

  // Type Labels
  { name: 'type: bug', color: 'd73a4a', description: 'Bug reports' },
  { name: 'type: feature', color: '0075ca', description: 'Feature requests' },
  { name: 'type: enhancement', color: 'a2eeef', description: 'Improvements to existing features' },
  { name: 'type: documentation', color: '7057ff', description: 'Documentation updates' },
  { name: 'type: refactor', color: 'f9d0c4', description: 'Code refactoring' },
  { name: 'type: test', color: 'c5def5', description: 'Testing related' },

  // Phase Labels
  { name: 'phase: foundation', color: 'e99695', description: 'Phase 1: Foundation items' },
  { name: 'phase: core', color: 'f9d0c4', description: 'Phase 2: Core features' },
  { name: 'phase: advanced', color: 'c5def5', description: 'Phase 3: Advanced features' },
  { name: 'phase: polish', color: 'd4c5f9', description: 'Phase 4: Polish & release' },

  // Component Labels
  { name: 'component: build', color: 'f9d0c4', description: 'Build system' },
  { name: 'component: tools', color: 'c5def5', description: 'Tool components' },
  { name: 'component: ui', color: 'd4c5f9', description: 'User interface' },
  { name: 'component: testing', color: 'e99695', description: 'Testing framework' },
  { name: 'component: docs', color: 'f9d0c4', description: 'Documentation' },
  { name: 'component: ci-cd', color: 'c5def5', description: 'CI/CD pipeline' },

  // Status Labels
  { name: 'status: needs-triage', color: 'ff9800', description: 'Needs initial review' },
  { name: 'status: needs-design', color: 'ffc107', description: 'Needs design work' },
  { name: 'status: needs-approval', color: '2196f3', description: 'Needs approval' },
  { name: 'status: blocked', color: 'f44336', description: 'Blocked by other issues' },
  { name: 'status: duplicate', color: '9e9e9e', description: 'Duplicate issue' },
];

async function createLabels() {
  console.log('Creating labels...');
  
  for (const label of labels) {
    try {
      await octokit.rest.issues.createLabel({
        owner,
        repo,
        name: label.name,
        color: label.color,
        description: label.description,
      });
      console.log(`✅ Created label: ${label.name}`);
    } catch (error) {
      if (error.status === 422) {
        console.log(`⚠️  Label already exists: ${label.name}`);
      } else {
        console.error(`❌ Error creating label ${label.name}:`, error.message);
      }
    }
  }
  
  console.log('✅ Label setup complete!');
}

// Run the script
createLabels().catch(console.error);
