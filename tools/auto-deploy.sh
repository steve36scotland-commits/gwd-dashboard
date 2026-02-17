#!/bin/bash
# GWD Dashboard Auto-Deploy Script
# Usage: ./tools/auto-deploy.sh "commit message"

REPO_DIR="/Users/user/.openclaw/workspace"
COMMIT_MSG="${1:-'Dashboard auto-update'}"

cd "$REPO_DIR" || exit 1

# Check if there are changes
if git diff --quiet && git diff --staged --quiet; then
    echo "✅ No changes to deploy"
    exit 0
fi

# Add dashboard and related files
git add gwd-dashboard.html GWD-Company-Profile.md GWD-Employee-Directory.md memory/ logs/decisions/ 2>/dev/null

# Commit
git commit -m "$COMMIT_MSG" || exit 0

# Push to trigger GitHub Pages deploy
git push origin main

echo "✅ Deployed! Site updating at:"
echo "   https://steve36scotland-commits.github.io/gwd-dashboard/gwd-dashboard.html"
