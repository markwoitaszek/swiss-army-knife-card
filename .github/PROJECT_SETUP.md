# GitHub Project Management Setup

## Project Board Structure

### Columns (in order):
1. **Backlog** - New issues and ideas
2. **To Do** - Ready to work on
3. **In Progress** - Currently being worked on
4. **In Review** - Pull requests under review
5. **Testing** - Ready for testing
6. **Done** - Completed items

### Milestones

#### Phase 1: Foundation (Current)
- **Target Date**: 2024-02-15
- **Description**: Lit 3.x migration, TypeScript implementation, architecture refactoring
- **Issues**: 
  - [ ] Migrate to Lit 3.x
  - [ ] Implement TypeScript
  - [ ] Refactor architecture
  - [ ] Set up modern build system

#### Phase 2: Core Features
- **Target Date**: 2024-03-15
- **Description**: Core tool functionality and features
- **Issues**:
  - [ ] Implement core tools
  - [ ] Add new tool types
  - [ ] Improve performance
  - [ ] Add accessibility features

#### Phase 3: Advanced Features
- **Target Date**: 2024-04-15
- **Description**: Advanced features and integrations
- **Issues**:
  - [ ] Add advanced tools
  - [ ] Implement themes
  - [ ] Add animations
  - [ ] Performance optimizations

#### Phase 4: Polish & Release
- **Target Date**: 2024-05-15
- **Description**: Final polish and release preparation
- **Issues**:
  - [ ] Documentation updates
  - [ ] Final testing
  - [ ] Release preparation
  - [ ] HACS integration

### Labels

#### Priority Labels
- `priority: critical` - Critical issues that block development
- `priority: high` - High priority issues
- `priority: medium` - Medium priority issues
- `priority: low` - Low priority issues

#### Type Labels
- `type: bug` - Bug reports
- `type: feature` - Feature requests
- `type: enhancement` - Improvements to existing features
- `type: documentation` - Documentation updates
- `type: refactor` - Code refactoring
- `type: test` - Testing related

#### Phase Labels
- `phase: foundation` - Phase 1 items
- `phase: core` - Phase 2 items
- `phase: advanced` - Phase 3 items
- `phase: polish` - Phase 4 items

#### Component Labels
- `component: build` - Build system
- `component: tools` - Tool components
- `component: ui` - User interface
- `component: testing` - Testing framework
- `component: docs` - Documentation
- `component: ci-cd` - CI/CD pipeline

#### Status Labels
- `status: needs-triage` - Needs initial review
- `status: needs-design` - Needs design work
- `status: needs-approval` - Needs approval
- `status: blocked` - Blocked by other issues
- `status: duplicate` - Duplicate issue

### Automation Rules

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

### Branch Protection Rules

#### Main Branch Protection
- Require pull request reviews (2 reviewers)
- Require status checks to pass
- Require branches to be up to date
- Require conversation resolution
- Restrict pushes to matching branches

#### Required Status Checks
- CI/CD Pipeline
- Unit Tests
- E2E Tests
- Security Scanning
- Build Process

### Issue Templates

#### Bug Report Template
- Swiss Army Knife version
- Bug description
- Steps to reproduce
- Expected behavior
- Screenshots
- Environment details

#### Feature Request Template
- Feature description
- Use case
- Proposed solution
- Alternatives considered
- Additional context

#### Security Vulnerability Template
- Vulnerability description
- Impact assessment
- Steps to reproduce
- Suggested fix
- Contact information

### Pull Request Template
- Description of changes
- Type of change
- Testing performed
- Screenshots
- Checklist
- Related issues

## Setup Instructions

1. **Create Project Board** (manual)
2. **Set up Columns** (manual)
3. **Create Milestones** (manual)
4. **Add Labels** (manual)
5. **Configure Branch Protection** (manual)
6. **Set up Automation Rules** (manual)

## Automation Scripts

Use the provided scripts in `.github/scripts/` to automate:
- Label management
- Milestone creation
- Project board setup
- Branch protection configuration
