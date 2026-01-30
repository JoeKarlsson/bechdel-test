#!/bin/bash

# Update Static Site Script
# This script exports MongoDB data and commits it to the gh-pages branch
#
# Usage:
#   ./scripts/update-static-site.sh
#
# Prerequisites:
#   - MongoDB accessible (either local or via SSH tunnel)
#   - MONGODB_URI environment variable set (or uses default localhost)
#
# Example with SSH tunnel to homelab:
#   ssh -L 27017:localhost:27017 root@192.168.0.x -N &
#   MONGODB_URI=mongodb://localhost:27017/bechdelTest ./scripts/update-static-site.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "=== Bechdel Test Static Site Updater ==="
echo ""

# Check if we're in the right directory
cd "$PROJECT_DIR"

# Store current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"

# Step 1: Export data from MongoDB
echo ""
echo "Step 1: Exporting data from MongoDB..."
npm run export-data

# Check if films.json was created
if [ ! -f "src/app/data/films.json" ]; then
    echo "Error: films.json was not created"
    exit 1
fi

# Get film count
FILM_COUNT=$(node -e "console.log(JSON.parse(require('fs').readFileSync('src/app/data/films.json')).length)")
echo "Exported $FILM_COUNT films"

# Step 2: Switch to gh-pages branch
echo ""
echo "Step 2: Switching to gh-pages branch..."
git stash push -m "auto-stash before gh-pages update" -- src/app/data/films.json 2>/dev/null || true
git checkout gh-pages

# Step 3: Apply the films.json from stash
echo ""
echo "Step 3: Updating films.json..."
git stash pop 2>/dev/null || {
    # If stash pop fails, we need to get the file from main
    git checkout "$CURRENT_BRANCH" -- src/app/data/films.json
}

# Step 4: Commit and push
echo ""
echo "Step 4: Committing changes..."
if git diff --quiet src/app/data/films.json 2>/dev/null; then
    echo "No changes to films.json"
else
    git add src/app/data/films.json
    git commit -m "chore: update films data ($FILM_COUNT films)

Updated via update-static-site.sh script"

    echo ""
    echo "Step 5: Pushing to remote..."
    git push origin gh-pages

    echo ""
    echo "=== Done! ==="
    echo "GitHub Actions will now deploy the updated site."
    echo "Check progress at: https://github.com/JoeKarlsson/bechdel-test/actions"
fi

# Step 6: Return to original branch
echo ""
echo "Returning to $CURRENT_BRANCH branch..."
git checkout "$CURRENT_BRANCH"

echo ""
echo "Update complete!"
