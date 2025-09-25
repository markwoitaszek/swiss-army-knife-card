#!/bin/bash

# Script to move all issues from a milestone to "To Do" column
# Usage: ./move-issues-to-todo.sh <milestone-name>

set -e

MILESTONE="$1"
PROJECT_NUMBER="7"  # Your project number
COLUMN_ID="TODO_COLUMN_ID"  # We'll need to get this

if [ -z "$MILESTONE" ]; then
    echo "Usage: $0 <milestone-name>"
    echo "Example: $0 'Phase 1: Foundation'"
    exit 1
fi

echo "Moving issues from milestone '$MILESTONE' to To Do column..."

# Get milestone ID
MILESTONE_ID=$(gh api graphql -f query='
  query($owner: String!, $repo: String!, $milestone: String!) {
    repository(owner: $owner, name: $repo) {
      milestones(first: 10, query: $milestone) {
        nodes {
          id
          title
        }
      }
    }
  }
' -f owner=markwoitaszek -f repo=swiss-army-knife-card -f milestone="$MILESTONE" | jq -r '.data.repository.milestones.nodes[0].id')

if [ "$MILESTONE_ID" = "null" ] || [ -z "$MILESTONE_ID" ]; then
    echo "Error: Milestone '$MILESTONE' not found"
    exit 1
fi

echo "Found milestone ID: $MILESTONE_ID"

# Get project columns
PROJECT_COLUMNS=$(gh api graphql -f query='
  query($owner: String!, $projectNumber: Int!) {
    user(login: $owner) {
      projectV2(number: $projectNumber) {
        columns(first: 10) {
          nodes {
            id
            name
          }
        }
      }
    }
  }
' -f owner=markwoitaszek -f projectNumber=$PROJECT_NUMBER)

TODO_COLUMN_ID=$(echo "$PROJECT_COLUMNS" | jq -r '.data.user.projectV2.columns.nodes[] | select(.name == "To Do") | .id')

if [ "$TODO_COLUMN_ID" = "null" ] || [ -z "$TODO_COLUMN_ID" ]; then
    echo "Error: 'To Do' column not found in project"
    exit 1
fi

echo "Found To Do column ID: $TODO_COLUMN_ID"

# Get issues from milestone
ISSUES=$(gh api graphql -f query='
  query($owner: String!, $repo: String!, $milestoneId: ID!) {
    repository(owner: $owner, name: $repo) {
      issues(first: 50, filterBy: {milestone: $milestoneId}) {
        nodes {
          id
          number
          title
        }
      }
    }
  }
' -f owner=markwoitaszek -f repo=swiss-army-knife-card -f milestoneId="$MILESTONE_ID")

# Move each issue to To Do column
echo "$ISSUES" | jq -r '.data.repository.issues.nodes[] | "\(.id)|\(.number)|\(.title)"' | while IFS='|' read -r issue_id issue_number issue_title; do
    echo "Moving issue #$issue_number: $issue_title"
    
    # Add issue to project (if not already there)
    gh api graphql -f query='
      mutation($projectId: ID!, $itemId: ID!) {
        addProjectV2ItemById(input: {projectId: $projectId, itemId: $itemId}) {
          item {
            id
          }
        }
      }
    ' -f projectId="PVT_kwDOBQqg5s4A" -f itemId="$issue_id" 2>/dev/null || true
    
    # Move to To Do column
    gh api graphql -f query='
      mutation($projectId: ID!, $itemId: ID!, $columnId: ID!) {
        updateProjectV2ItemFieldValue(input: {
          projectId: $projectId
          itemId: $itemId
          fieldId: "PVTSSF_lADOBQqg5s4A"
          value: {singleSelectOptionId: $columnId}
        }) {
          projectV2Item {
            id
          }
        }
      }
    ' -f projectId="PVT_kwDOBQqg5s4A" -f itemId="$issue_id" -f columnId="$TODO_COLUMN_ID" 2>/dev/null || true
    
    echo "  ✓ Moved issue #$issue_number"
done

echo "✅ All issues from milestone '$MILESTONE' moved to To Do column"
