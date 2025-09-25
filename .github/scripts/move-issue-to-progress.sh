#!/bin/bash

# Script to move a specific issue to "In Progress" column
# Usage: ./move-issue-to-progress.sh <issue-number>

set -e

ISSUE_NUMBER="$1"
PROJECT_NUMBER="7"  # Your project number

if [ -z "$ISSUE_NUMBER" ]; then
    echo "Usage: $0 <issue-number>"
    echo "Example: $0 2"
    exit 1
fi

echo "Moving issue #$ISSUE_NUMBER to In Progress column..."

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

IN_PROGRESS_COLUMN_ID=$(echo "$PROJECT_COLUMNS" | jq -r '.data.user.projectV2.columns.nodes[] | select(.name == "In Progress") | .id')

if [ "$IN_PROGRESS_COLUMN_ID" = "null" ] || [ -z "$IN_PROGRESS_COLUMN_ID" ]; then
    echo "Error: 'In Progress' column not found in project"
    exit 1
fi

echo "Found In Progress column ID: $IN_PROGRESS_COLUMN_ID"

# Get issue ID
ISSUE_ID=$(gh api graphql -f query='
  query($owner: String!, $repo: String!, $issueNumber: Int!) {
    repository(owner: $owner, name: $repo) {
      issue(number: $issueNumber) {
        id
        title
      }
    }
  }
' -f owner=markwoitaszek -f repo=swiss-army-knife-card -f issueNumber=$ISSUE_NUMBER | jq -r '.data.repository.issue.id')

if [ "$ISSUE_ID" = "null" ] || [ -z "$ISSUE_ID" ]; then
    echo "Error: Issue #$ISSUE_NUMBER not found"
    exit 1
fi

echo "Found issue ID: $ISSUE_ID"

# Add issue to project (if not already there)
gh api graphql -f query='
  mutation($projectId: ID!, $itemId: ID!) {
    addProjectV2ItemById(input: {projectId: $projectId, itemId: $itemId}) {
      item {
        id
      }
    }
  }
' -f projectId="PVT_kwDOBQqg5s4A" -f itemId="$ISSUE_ID" 2>/dev/null || true

# Move to In Progress column
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
' -f projectId="PVT_kwDOBQqg5s4A" -f itemId="$ISSUE_ID" -f columnId="$IN_PROGRESS_COLUMN_ID" 2>/dev/null || true

echo "✅ Issue #$ISSUE_NUMBER moved to In Progress column"
