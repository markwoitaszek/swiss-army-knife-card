# GitHub Project Management Setup Scripts

This directory contains scripts to automate the setup of GitHub project management features.

## Prerequisites

1. **GitHub CLI**: Install and authenticate with GitHub CLI
   ```bash
   gh auth login
   ```

2. **Node.js**: Ensure Node.js is installed
   ```bash
   node --version
   ```

3. **GitHub Token**: Set up a GitHub token with appropriate permissions
   ```bash
   export GITHUB_TOKEN=your_github_token_here
   ```

## Setup Scripts

### 1. Labels Setup
Creates all the labels needed for the project.

```bash
node .github/scripts/setup-labels.js
```

**Labels Created:**
- Priority labels (critical, high, medium, low)
- Type labels (bug, feature, enhancement, documentation, refactor, test)
- Phase labels (foundation, core, advanced, polish)
- Component labels (build, tools, ui, testing, docs, ci-cd)
- Status labels (needs-triage, needs-design, needs-approval, blocked, duplicate)

### 2. Milestones Setup
Creates all the milestones for the modernization project.

```bash
node .github/scripts/setup-milestones.js
```

**Milestones Created:**
- Phase 1: Foundation (2024-02-15)
- Phase 2: Core Features (2024-03-15)
- Phase 3: Advanced Features (2024-04-15)
- Phase 4: Polish & Release (2024-05-15)

### 3. Branch Protection Setup
Sets up branch protection rules for main branches.

```bash
node .github/scripts/setup-branch-protection.js
```

**Protection Rules:**
- Requires 2 approving reviews
- Requires status checks to pass
- Requires branches to be up to date
- Requires conversation resolution
- Restricts pushes to matching branches

## Manual Setup Steps

### 1. Create Project Board
1. Go to your repository on GitHub
2. Click "Projects" tab
3. Click "New project"
4. Choose "Table" view
5. Name: "SAK Card Modernization"
6. Description: "Project management board for Swiss Army Knife Card modernization and development"

### 2. Set Up Project Columns
Add these columns in order:
1. **Backlog** - New issues and ideas
2. **To Do** - Ready to work on
3. **In Progress** - Currently being worked on
4. **In Review** - Pull requests under review
5. **Testing** - Ready for testing
6. **Done** - Completed items

### 3. Configure Automation Rules
In the project board settings, add these automation rules:

#### Auto-assign to Project
- When issue is created → Add to "Backlog" column
- When PR is created → Add to "In Review" column

#### Auto-move based on Status
- When issue is assigned → Move to "To Do"
- When PR is ready for review → Move to "In Review"
- When PR is merged → Move to "Done"

#### Auto-label based on Content
- Issues with "bug" in title → Add `type: bug` label
- Issues with "feature" in title → Add `type: feature` label
- PRs targeting main branch → Add `phase: foundation` label

## Running All Scripts

To run all setup scripts at once:

```bash
# Set up GitHub token
export GITHUB_TOKEN=your_github_token_here

# Run all setup scripts
node .github/scripts/setup-labels.js
node .github/scripts/setup-milestones.js
node .github/scripts/setup-branch-protection.js
```

## Verification

After running the scripts, verify the setup:

1. **Check Labels**: Go to Issues → Labels to see all created labels
2. **Check Milestones**: Go to Issues → Milestones to see all created milestones
3. **Check Branch Protection**: Go to Settings → Branches to see protection rules
4. **Check Project Board**: Go to Projects to see the board structure

## Troubleshooting

### Common Issues

1. **Authentication Error**: Make sure you're logged in with GitHub CLI
   ```bash
   gh auth status
   ```

2. **Permission Error**: Ensure your GitHub token has the necessary permissions:
   - `repo` (full repository access)
   - `admin:org` (if setting up organization-level features)

3. **Rate Limit**: If you hit rate limits, wait a few minutes and try again

### Getting Help

- Check the GitHub API documentation
- Review the script error messages
- Ensure all prerequisites are met
- Verify your GitHub token permissions

## Next Steps

After running the setup scripts:

1. **Create your first issues** using the templates
2. **Set up project automation rules** manually
3. **Configure team access** and permissions
4. **Start using the project board** for issue tracking
5. **Set up notifications** for project updates
