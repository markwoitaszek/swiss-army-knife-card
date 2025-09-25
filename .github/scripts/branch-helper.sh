#!/bin/bash

# Branch Helper Script for SAK Card Modernization
# This script helps manage branches according to our phase-based strategy

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    echo "Branch Helper Script for SAK Card Modernization"
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Available commands:"
    echo "  start <issue-number>    - Create and checkout a feature branch for an issue"
    echo "  finish <issue-number>   - Merge feature branch and cleanup"
    echo "  sync                    - Sync current branch with remote"
    echo "  status                  - Show current branch status"
    echo "  create-phase <phase>    - Create a new phase branch (e.g., phase-2-core-features)"
    echo ""
    echo "Examples:"
    echo "  $0 start 2              # Create feature/2-lit3-migration"
    echo "  $0 finish 2             # Merge and cleanup feature/2-lit3-migration"
    echo "  $0 sync                 # Sync current branch with remote"
    echo "  $0 status               # Show current branch info"
    echo "  $0 create-phase phase-2-core-features"
}

# Function to get issue title from GitHub
get_issue_title() {
    local issue_number=$1
    local title=$(gh issue view "$issue_number" --json title --jq '.title' 2>/dev/null || echo "")
    if [ -z "$title" ]; then
        echo "issue-$issue_number"
    else
        echo "$title" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-\|-$//g'
    fi
}

# Function to start work on an issue
start_issue() {
    local issue_number=$1
    
    if [ -z "$issue_number" ]; then
        print_error "Issue number is required"
        show_usage
        exit 1
    fi
    
    # Determine the current phase branch
    local current_branch=$(git branch --show-current)
    local phase_branch=""
    
    if [[ "$current_branch" == "phase-1-foundation" ]]; then
        phase_branch="phase-1-foundation"
    elif [[ "$current_branch" == "phase-2-core-features" ]]; then
        phase_branch="phase-2-core-features"
    elif [[ "$current_branch" == "phase-3-advanced-features" ]]; then
        phase_branch="phase-3-advanced-features"
    elif [[ "$current_branch" == "phase-4-polish-release" ]]; then
        phase_branch="phase-4-polish-release"
    else
        print_error "You must be on a phase branch to start work on an issue"
        print_status "Current branch: $current_branch"
        print_status "Available phase branches: phase-1-foundation, phase-2-core-features, phase-3-advanced-features, phase-4-polish-release"
        exit 1
    fi
    
    print_status "Starting work on issue #$issue_number from $phase_branch"
    
    # Get issue title and create branch name
    local issue_title=$(get_issue_title "$issue_number")
    local feature_branch="feature/$issue_number-$issue_title"
    
    print_status "Creating feature branch: $feature_branch"
    
    # Ensure we're on the phase branch and up to date
    git checkout "$phase_branch"
    git pull origin "$phase_branch"
    
    # Create and checkout feature branch
    git checkout -b "$feature_branch"
    
    # Move issue to In Progress (if project management is set up)
    print_status "Moving issue #$issue_number to In Progress..."
    if ./.github/scripts/move-issue-to-progress.sh "$issue_number" 2>/dev/null; then
        print_success "Issue #$issue_number moved to In Progress"
    else
        print_warning "Could not move issue to In Progress (project management not set up)"
    fi
    
    print_success "Created and checked out feature branch: $feature_branch"
    print_status "You can now start working on issue #$issue_number"
    print_status "When ready, create a PR targeting: $phase_branch"
}

# Function to finish work on an issue
finish_issue() {
    local issue_number=$1
    
    if [ -z "$issue_number" ]; then
        print_error "Issue number is required"
        show_usage
        exit 1
    fi
    
    local current_branch=$(git branch --show-current)
    
    if [[ ! "$current_branch" =~ ^feature/$issue_number- ]]; then
        print_error "You must be on a feature branch for issue #$issue_number"
        print_status "Current branch: $current_branch"
        exit 1
    fi
    
    print_status "Finishing work on issue #$issue_number"
    print_status "Current branch: $current_branch"
    
    # Check if there are uncommitted changes
    if ! git diff-index --quiet HEAD --; then
        print_warning "You have uncommitted changes. Please commit or stash them first."
        git status --short
        exit 1
    fi
    
    # Push the feature branch
    print_status "Pushing feature branch to remote..."
    git push origin "$current_branch"
    
    print_success "Feature branch pushed to remote: $current_branch"
    print_status "Next steps:"
    print_status "1. Create a Pull Request targeting the appropriate phase branch"
    print_status "2. Request reviews from team members"
    print_status "3. After PR is merged, run: $0 cleanup $issue_number"
}

# Function to cleanup after PR is merged
cleanup_issue() {
    local issue_number=$1
    
    if [ -z "$issue_number" ]; then
        print_error "Issue number is required"
        show_usage
        exit 1
    fi
    
    # Find the feature branch
    local feature_branch=$(git branch -a | grep "feature/$issue_number-" | sed 's/.*\///' | head -1)
    
    if [ -z "$feature_branch" ]; then
        print_error "No feature branch found for issue #$issue_number"
        exit 1
    fi
    
    print_status "Cleaning up feature branch: $feature_branch"
    
    # Switch to the phase branch
    local current_branch=$(git branch --show-current)
    if [[ "$current_branch" == "$feature_branch" ]]; then
        # Determine phase branch from remote
        local phase_branch=$(git branch -r | grep -E "(phase-1-foundation|phase-2-core-features|phase-3-advanced-features|phase-4-polish-release)" | head -1 | sed 's/origin\///')
        git checkout "$phase_branch"
        git pull origin "$phase_branch"
    fi
    
    # Delete local feature branch
    git branch -d "$feature_branch" 2>/dev/null || print_warning "Local branch $feature_branch not found or already deleted"
    
    # Delete remote feature branch
    git push origin --delete "$feature_branch" 2>/dev/null || print_warning "Remote branch $feature_branch not found or already deleted"
    
    print_success "Cleaned up feature branch: $feature_branch"
}

# Function to sync current branch
sync_branch() {
    local current_branch=$(git branch --show-current)
    
    print_status "Syncing branch: $current_branch"
    
    git fetch origin
    git pull origin "$current_branch"
    
    print_success "Branch synced with remote: $current_branch"
}

# Function to show branch status
show_status() {
    local current_branch=$(git branch --show-current)
    local remote_branch="origin/$current_branch"
    
    echo "Branch Status:"
    echo "=============="
    echo "Current branch: $current_branch"
    
    if git show-ref --verify --quiet "refs/remotes/$remote_branch"; then
        local ahead=$(git rev-list --count "$current_branch" ^"$remote_branch" 2>/dev/null || echo "0")
        local behind=$(git rev-list --count "$remote_branch" ^"$current_branch" 2>/dev/null || echo "0")
        
        echo "Remote branch: $remote_branch"
        echo "Ahead of remote: $ahead commits"
        echo "Behind remote: $behind commits"
        
        if [ "$ahead" -gt 0 ] || [ "$behind" -gt 0 ]; then
            print_warning "Branch is not in sync with remote"
        else
            print_success "Branch is in sync with remote"
        fi
    else
        print_warning "No remote branch found for $current_branch"
    fi
    
    echo ""
    echo "Recent commits:"
    git log --oneline -5
}

# Function to create a new phase branch
create_phase_branch() {
    local phase_name=$1
    
    if [ -z "$phase_name" ]; then
        print_error "Phase name is required"
        print_status "Example: $0 create-phase phase-2-core-features"
        exit 1
    fi
    
    # Validate phase name format
    if [[ ! "$phase_name" =~ ^phase-[1-4]-(foundation|core-features|advanced-features|polish-release)$ ]]; then
        print_error "Invalid phase name format"
        print_status "Valid formats:"
        print_status "  phase-1-foundation"
        print_status "  phase-2-core-features"
        print_status "  phase-3-advanced-features"
        print_status "  phase-4-polish-release"
        exit 1
    fi
    
    print_status "Creating phase branch: $phase_name"
    
    # Ensure we're on master and up to date
    git checkout master
    git pull origin master
    
    # Create the phase branch
    git checkout -b "$phase_name"
    git push origin "$phase_name"
    
    # Move issues from milestone to To Do (if project management is set up)
    local milestone_name=""
    case "$phase_name" in
        "phase-1-foundation")
            milestone_name="Phase 1: Foundation"
            ;;
        "phase-2-core-features")
            milestone_name="Phase 2: Core Features"
            ;;
        "phase-3-advanced-features")
            milestone_name="Phase 3: Advanced Features"
            ;;
        "phase-4-polish-release")
            milestone_name="Phase 4: Polish & Release"
            ;;
    esac
    
    if [ -n "$milestone_name" ]; then
        print_status "Moving issues from milestone '$milestone_name' to To Do..."
        if ./.github/scripts/move-issues-to-todo.sh "$milestone_name" 2>/dev/null; then
            print_success "Issues from milestone '$milestone_name' moved to To Do"
        else
            print_warning "Could not move issues to To Do (project management not set up)"
        fi
    fi
    
    print_success "Created phase branch: $phase_name"
    print_status "You can now start working on issues for this phase"
    print_status "Use: $0 start <issue-number> to begin work on an issue"
}

# Main script logic
case "$1" in
    "start")
        start_issue "$2"
        ;;
    "finish")
        finish_issue "$2"
        ;;
    "cleanup")
        cleanup_issue "$2"
        ;;
    "sync")
        sync_branch
        ;;
    "status")
        show_status
        ;;
    "create-phase")
        create_phase_branch "$2"
        ;;
    *)
        show_usage
        exit 1
        ;;
esac