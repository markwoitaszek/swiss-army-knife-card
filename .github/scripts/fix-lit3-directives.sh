#!/bin/bash

# Script to add Lit 3.x directive replacements to all tool files

set -e

echo "Adding Lit 3.x directive replacements to tool files..."

# Find all tool files that need the replacements
TOOL_FILES=$(find src -name "*-tool.js" -not -name "main.js")

for file in $TOOL_FILES; do
    echo "Processing $file..."
    
    # Check if the file already has the replacement functions
    if grep -q "function classMap" "$file"; then
        echo "  ✓ Already has replacement functions"
        continue
    fi
    
    # Add the replacement functions after the imports
    sed -i '' '/^import Merge from/a\
\
// Simple replacements for Lit 3.x compatibility\
function classMap(classes) {\
  if (!classes) return '\'''\'';\
  return Object.entries(classes)\
    .filter(([_, value]) => value)\
    .map(([key, _]) => key)\
    .join('\'' '\'');\
}\
\
function styleMap(styles) {\
  if (!styles) return '\'''\'';\
  return Object.entries(styles)\
    .filter(([_, value]) => value != null && value !== '\'''\'')\
    .map(([key, value]) => `${key}: ${value}`)\
    .join('\''; '\'');\
}\
' "$file"
    
    echo "  ✓ Added replacement functions"
done

echo "✅ All tool files updated with Lit 3.x directive replacements"
