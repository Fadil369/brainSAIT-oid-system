#!/bin/bash

# Set strict error handling
set -e

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 GitHub Repository Setup for BrainSAIT OID System${NC}"
echo "============================================================="

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git is not installed. Please install Git first.${NC}"
    exit 1
fi

# Check if git user is configured
if [ -z "$(git config --global user.name)" ] || [ -z "$(git config --global user.email)" ]; then
    echo -e "${YELLOW}⚠️ Git user not fully configured. Setting up temporary identity...${NC}"
    
    # Prompt for user details if not already configured
    if [ -z "$(git config --global user.name)" ]; then
        read -p "Enter your name for Git commits: " GIT_NAME
        git config --global user.name "$GIT_NAME"
    fi
    
    if [ -z "$(git config --global user.email)" ]; then
        read -p "Enter your email for Git commits: " GIT_EMAIL
        git config --global user.email "$GIT_EMAIL"
    fi
fi

# Initialize git repository if not already done
if [ ! -d .git ]; then
    echo -e "${GREEN}➡️ Initializing Git repository...${NC}"
    git init
fi

# Check current branch name
CURRENT_BRANCH=$(git branch --show-current)

# If the current branch is empty or not main, switch to main
if [ -z "$CURRENT_BRANCH" ] || [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${GREEN}➡️ Setting up main branch...${NC}"
    
    # Check if we have any commits yet
    if git rev-parse --verify HEAD >/dev/null 2>&1; then
        # If there's already a 'main' branch, switch to it, otherwise rename the current branch
        if git show-ref --verify --quiet refs/heads/main; then
            git checkout main
        else
            git branch -m "$CURRENT_BRANCH" main
        fi
    else
        git checkout -b main
    fi
fi

# Add all files to git
echo -e "${GREEN}➡️ Adding files to Git...${NC}"
git add .

# Check if there are changes to commit
if git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}⚠️ No changes to commit${NC}"
else
    # Commit changes
    echo -e "${GREEN}➡️ Committing initial codebase...${NC}"
    git commit -m "Initial commit: BrainSAIT OID Badge Management System"
fi

# Prompt to create GitHub repository
echo -e "${BLUE}📦 GitHub Repository Creation${NC}"
echo "----------------------------------------"
echo -e "${YELLOW}You need to create a repository on GitHub. Choose an option:${NC}"
echo "1. Create through GitHub website"
echo "2. Use GitHub CLI (if installed)"
read -p "Select option (1/2): " REPO_OPTION

case $REPO_OPTION in
    1)
        echo -e "${CYAN}📝 Please follow these steps:${NC}"
        echo "1. Go to https://github.com/new"
        echo "2. Name your repository 'brainSAIT-oid-system'"
        echo "3. Choose public or private visibility as needed"
        echo "4. DO NOT initialize with README, .gitignore, or license"
        echo "5. Click 'Create repository'"
        echo "6. Copy the repository URL"
        
        read -p "Enter the GitHub repository URL: " REPO_URL
        
        # Extract username and repo name from URL
        if [[ $REPO_URL =~ github\.com[:/]([^/]+)/([^/]+)\.git$ ]] || [[ $REPO_URL =~ github\.com[:/]([^/]+)/([^/]+)$ ]]; then
            USERNAME="${BASH_REMATCH[1]}"
            REPO_NAME="${BASH_REMATCH[2]}"
        else
            echo -e "${RED}❌ Invalid GitHub URL format. Expected: https://github.com/username/repo.git${NC}"
            exit 1
        fi
        ;;
    2)
        if ! command -v gh &> /dev/null; then
            echo -e "${RED}❌ GitHub CLI not installed. Please install it or use option 1.${NC}"
            exit 1
        fi
        
        read -p "Enter repository name [brainSAIT-oid-system]: " REPO_NAME
        REPO_NAME=${REPO_NAME:-brainSAIT-oid-system}
        
        read -p "Make repository private? (y/n): " PRIVATE_CHOICE
        if [[ $PRIVATE_CHOICE == "y" ]]; then
            PRIVATE_FLAG="--private"
        else
            PRIVATE_FLAG="--public"
        fi
        
        echo -e "${GREEN}➡️ Creating GitHub repository...${NC}"
        gh repo create "$REPO_NAME" $PRIVATE_FLAG --source=. --remote=origin
        
        # Get username from the remote URL
        REMOTE_URL=$(git remote get-url origin)
        if [[ $REMOTE_URL =~ github\.com[:/]([^/]+)/([^/]+)\.git$ ]]; then
            USERNAME="${BASH_REMATCH[1]}"
        else
            USERNAME="your-username"
        fi
        ;;
    *)
        echo -e "${RED}❌ Invalid option selected.${NC}"
        exit 1
        ;;
esac

# If we need to add the remote manually (option 1)
if [[ $REPO_OPTION == "1" ]]; then
    # Add the remote repository
    echo -e "${GREEN}➡️ Adding remote repository...${NC}"
    git remote add origin "$REPO_URL"
fi

# Push to GitHub
echo -e "${GREEN}➡️ Pushing code to GitHub...${NC}"
git push -u origin main

echo -e "${GREEN}✅ Setup complete!${NC}"
echo "============================================================="
echo -e "${BLUE}Repository details:${NC}"
echo "- GitHub URL: https://github.com/$USERNAME/$REPO_NAME"
echo "- Main branch: main"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Share the repository URL with your team"
echo "2. Set up branch protection rules if needed"
echo "3. Configure GitHub Actions by going to the Actions tab"
echo "4. Add collaborators from repository settings"
echo ""
echo -e "${CYAN}To clone this repository on another machine:${NC}"
echo "git clone https://github.com/$USERNAME/$REPO_NAME.git"
echo ""
echo -e "${PURPLE}Happy coding! 🎉${NC}"
