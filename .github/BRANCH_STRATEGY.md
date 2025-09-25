# Branch Management Strategy

## Overview

This document outlines the branch management strategy for the SAK Card modernization project.

## Branch Structure

```
master (main branch)
├── modernization-analysis (foundation setup - current)
└── phase-1-foundation (Phase 1 merge target)

Future branches (created on-demand):
├── phase-2-core-features (created when Phase 1 is complete)
├── phase-3-advanced-features (created when Phase 2 is complete)
└── phase-4-polish-release (created when Phase 3 is complete)
```

## Branch Types

### 1. Main Branches

- **`master`**: Production-ready code
- **`modernization-analysis`**: Foundation setup and project management

### 2. Phase Branches

- **`phase-1-foundation`**: Target for Phase 1 features (created now)
- **`phase-2-core-features`**: Target for Phase 2 features (created when Phase 1 is complete)
- **`phase-3-advanced-features`**: Target for Phase 3 features (created when Phase 2 is complete)
- **`phase-4-polish-release`**: Target for Phase 4 features (created when Phase 3 is complete)

### 3. Feature Branches

- **`feature/[issue-number]-[description]`**: Individual feature work
- **`bugfix/[issue-number]-[description]`**: Bug fixes
- **`hotfix/[description]`**: Critical fixes

## Workflow

### Starting Work on an Issue

1. **Create Feature Branch**:

   ```bash
   git checkout phase-1-foundation
   git pull origin phase-1-foundation
   git checkout -b feature/2-lit3-migration
   ```

2. **Work on Feature**:
   - Make commits with descriptive messages
   - Reference issue numbers in commit messages
   - Keep commits focused and atomic

3. **Create Pull Request**:
   - Target the appropriate phase branch
   - Link to the related issue
   - Request reviews from team members

4. **Merge Strategy**:
   - Use "Squash and merge" for feature branches
   - Use "Merge commit" for phase branches

### Phase Completion

1. **Complete All Phase Issues**:
   - All issues in the phase are closed
   - All pull requests are merged
   - All tests are passing

2. **Create Phase Pull Request**:

   ```bash
   git checkout master
   git checkout -b merge/phase-1-foundation
   git merge phase-1-foundation
   ```

3. **Phase Review**:
   - Comprehensive testing
   - Documentation review
   - Performance validation
   - Security review

4. **Merge to Master**:
   - Merge phase branch to master
   - Create release tag
   - Update documentation

5. **Create Next Phase Branch**:
   ```bash
   # After Phase 1 is complete and merged to master
   git checkout master
   git pull origin master
   git checkout -b phase-2-core-features
   git push origin phase-2-core-features
   ```

### On-Demand Phase Branch Creation

**Why Create Phase Branches On-Demand?**
- ✅ **Avoids merge conflicts**: No outdated branches to sync
- ✅ **Cleaner history**: Each phase starts with latest completed work
- ✅ **Simpler maintenance**: No need to update multiple branches
- ✅ **Better isolation**: Each phase is self-contained

**When to Create Phase Branches:**
- **Phase 2**: Create `phase-2-core-features` when Phase 1 is complete
- **Phase 3**: Create `phase-3-advanced-features` when Phase 2 is complete  
- **Phase 4**: Create `phase-4-polish-release` when Phase 3 is complete

**Creation Process:**
```bash
# Example: Creating Phase 2 branch after Phase 1 completion
git checkout master
git pull origin master
git checkout -b phase-2-core-features
git push origin phase-2-core-features

# Update project board to reflect new phase branch
# Move Phase 2 issues to "To Do" column
```

## Branch Protection Rules

### Phase Branches

- Require pull request reviews (2 reviewers)
- Require status checks to pass
- Require branches to be up to date
- Allow force pushes (for rebasing)

### Master Branch

- Require pull request reviews (2 reviewers)
- Require status checks to pass
- Require branches to be up to date
- Require conversation resolution
- Restrict pushes to matching branches

## Naming Conventions

### Feature Branches

- `feature/[issue-number]-[kebab-case-description]`
- Examples:
  - `feature/2-lit3-migration`
  - `feature/3-typescript-implementation`
  - `feature/7-core-tool-components`

### Bug Fix Branches

- `bugfix/[issue-number]-[kebab-case-description]`
- Examples:
  - `bugfix/21-performance-optimization`
  - `bugfix/18-test-coverage-improvement`

### Hotfix Branches

- `hotfix/[kebab-case-description]`
- Examples:
  - `hotfix/security-vulnerability`
  - `hotfix/critical-build-failure`

## Commit Message Format

```
type(scope): description

[optional body]

[optional footer]

Closes #issue-number
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build process or auxiliary tool changes

### Examples

```
feat(tools): implement circle tool component

Adds the circle tool component with support for:
- Entity state display
- Custom styling
- Interactive features

Closes #7
```

```
fix(build): resolve TypeScript compilation errors

Fixes type errors in the main component:
- Add proper type definitions
- Fix property binding issues
- Update decorator usage

Closes #3
```

## Branch Lifecycle

### Feature Branch Lifecycle

1. **Create** from appropriate phase branch
2. **Develop** feature with regular commits
3. **Test** locally and ensure CI passes
4. **Review** via pull request
5. **Merge** to phase branch
6. **Delete** feature branch

### Phase Branch Lifecycle

1. **Create** from modernization-analysis
2. **Accumulate** completed features
3. **Test** phase integration
4. **Review** phase completion
5. **Merge** to master
6. **Tag** release version
7. **Archive** or keep for reference

## Best Practices

### Do's

- ✅ Create feature branches from the correct phase branch
- ✅ Use descriptive branch names
- ✅ Write clear commit messages
- ✅ Reference issues in commits and PRs
- ✅ Keep feature branches focused
- ✅ Regularly sync with phase branch
- ✅ Delete merged feature branches

### Don'ts

- ❌ Work directly on phase branches
- ❌ Create feature branches from master
- ❌ Merge phase branches without review
- ❌ Leave feature branches open indefinitely
- ❌ Force push to shared branches
- ❌ Mix unrelated changes in one branch

## Emergency Procedures

### Hotfix Process

1. Create hotfix branch from master
2. Implement fix with minimal changes
3. Test thoroughly
4. Create PR to master
5. Merge and tag release
6. Backport to active phase branches

### Rollback Process

1. Identify problematic commit
2. Create revert branch from master
3. Revert problematic changes
4. Test revert thoroughly
5. Create PR to master
6. Merge and tag release

## Tools and Automation

### GitHub Actions

- **CI/CD Pipeline**: Runs on all branches
- **Branch Protection**: Enforces review requirements
- **Automated Testing**: Runs on all pull requests
- **Release Automation**: Handles versioning and tagging

### Git Hooks

- **Pre-commit**: Runs linting and formatting
- **Commit-msg**: Validates commit message format
- **Pre-push**: Runs tests before pushing

## Monitoring and Metrics

### Branch Health

- Track branch age and activity
- Monitor merge frequency
- Measure review cycle time
- Track test coverage per branch

### Quality Metrics

- Code review coverage
- Test coverage percentage
- Build success rate
- Deployment frequency

## Getting Help

### Resources

- [Git Flow Documentation](https://nvie.com/posts/a-successful-git-branching-model/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Conventional Commits](https://www.conventionalcommits.org/)

### Support

- Create an issue for branch strategy questions
- Tag @maintainers for urgent branch issues
- Use project discussions for strategy discussions
