#!/bin/bash
# Security check script to find potential secrets before committing

echo "🔍 Checking for potential secrets in tracked files..."
echo ""

# Patterns to search for
PATTERNS=(
  "password.*@.*\..*\.neon\.tech"
  "password.*@.*\.aivencloud\.com"
  "npg_[a-zA-Z0-9]+"
  "AVNS_[a-zA-Z0-9_]+"
  "ssk_[a-zA-Z0-9]+"
  "pck_[a-zA-Z0-9]+"
)

FOUND_SECRETS=0

# Check staged files
echo "📋 Checking staged files..."
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM)

if [ -z "$STAGED_FILES" ]; then
  echo "  No files staged for commit"
else
  for file in $STAGED_FILES; do
    if [ -f "$file" ]; then
      for pattern in "${PATTERNS[@]}"; do
        if grep -qE "$pattern" "$file" 2>/dev/null; then
          echo "  ⚠️  FOUND in $file: $pattern"
          FOUND_SECRETS=1
        fi
      done
    fi
  done
fi

echo ""
echo "📁 Checking uncommitted changes..."
MODIFIED_FILES=$(git diff --name-only --diff-filter=ACM)

if [ -z "$MODIFIED_FILES" ]; then
  echo "  No modified files"
else
  for file in $MODIFIED_FILES; do
    if [ -f "$file" ]; then
      for pattern in "${PATTERNS[@]}"; do
        if grep -qE "$pattern" "$file" 2>/dev/null; then
          echo "  ⚠️  FOUND in $file: $pattern"
          FOUND_SECRETS=1
        fi
      done
    fi
  done
fi

echo ""
echo "🔒 Checking .env file is ignored..."
if git check-ignore .env >/dev/null 2>&1; then
  echo "  ✅ .env is properly ignored"
else
  echo "  ❌ WARNING: .env is NOT ignored!"
  FOUND_SECRETS=1
fi

if git ls-files | grep -q "^\.env$"; then
  echo "  ❌ WARNING: .env is tracked by git!"
  FOUND_SECRETS=1
fi

echo ""
if [ $FOUND_SECRETS -eq 0 ]; then
  echo "✅ No secrets detected! Safe to commit."
  exit 0
else
  echo "❌ POTENTIAL SECRETS DETECTED! Review before committing."
  exit 1
fi
