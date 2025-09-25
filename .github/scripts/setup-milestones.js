#!/usr/bin/env node

/**
 * GitHub Milestones Setup Script
 * Creates all the milestones for the SAK Card modernization project
 */

const { Octokit } = require('@octokit/rest');

// Initialize Octokit
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const owner = 'markwoitaszek';
const repo = 'swiss-army-knife-card';

// Milestone definitions
const milestones = [
  {
    title: 'Phase 1: Foundation',
    description: 'Lit 3.x migration, TypeScript implementation, architecture refactoring, and build system modernization',
    due_on: '2024-02-15T00:00:00Z',
    state: 'open'
  },
  {
    title: 'Phase 2: Core Features',
    description: 'Core tool functionality and features implementation',
    due_on: '2024-03-15T00:00:00Z',
    state: 'open'
  },
  {
    title: 'Phase 3: Advanced Features',
    description: 'Advanced features and integrations',
    due_on: '2024-04-15T00:00:00Z',
    state: 'open'
  },
  {
    title: 'Phase 4: Polish & Release',
    description: 'Final polish and release preparation',
    due_on: '2024-05-15T00:00:00Z',
    state: 'open'
  }
];

async function createMilestones() {
  console.log('Creating milestones...');
  
  for (const milestone of milestones) {
    try {
      await octokit.rest.issues.createMilestone({
        owner,
        repo,
        title: milestone.title,
        description: milestone.description,
        due_on: milestone.due_on,
        state: milestone.state,
      });
      console.log(`✅ Created milestone: ${milestone.title}`);
    } catch (error) {
      if (error.status === 422) {
        console.log(`⚠️  Milestone already exists: ${milestone.title}`);
      } else {
        console.error(`❌ Error creating milestone ${milestone.title}:`, error.message);
      }
    }
  }
  
  console.log('✅ Milestone setup complete!');
}

// Run the script
createMilestones().catch(console.error);
