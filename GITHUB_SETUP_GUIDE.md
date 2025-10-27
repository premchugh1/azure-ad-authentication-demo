# GitHub Repository Setup Guide

## 🎯 Goal
Create a new GitHub repository named "Azure-AD-Authentication-Demo" and push your current code.

## 📋 Prerequisites Required

### 1. Install Git for Windows
**Download**: https://git-scm.com/download/win

**Installation Steps**:
1. Download Git for Windows installer
2. Run the installer with default settings
3. Restart VS Code after installation
4. Verify installation: Open new PowerShell terminal and run `git --version`

### 2. Install GitHub CLI (Optional but Recommended)
**Download**: https://cli.github.com/

**Installation Steps**:
1. Download GitHub CLI installer for Windows
2. Run the installer
3. Restart VS Code
4. Authenticate: `gh auth login`

---

## 🚀 Method 1: Using GitHub CLI (Easiest - After Installing Git & GitHub CLI)

### Step 1: Initialize Git Repository
```powershell
cd C:\Users\prchugh\AzureADApp
git init
```

### Step 2: Create .gitignore File
```powershell
# Create .gitignore to exclude unnecessary files
@"
node_modules/
.funcignore
local.settings.json
.DS_Store
.vscode/
*.log
dist/
build/
.env
.env.local
"@ | Out-File -FilePath .gitignore -Encoding utf8
```

### Step 3: Add All Files
```powershell
git add .
```

### Step 4: Create Initial Commit
```powershell
git commit -m "Initial commit: Azure AD Authentication Demo with React SPA and Azure Functions"
```

### Step 5: Create GitHub Repository and Push
```powershell
# Authenticate with GitHub (one-time setup)
gh auth login

# Create repository and push
gh repo create Azure-AD-Authentication-Demo --public --source=. --remote=origin --push
```

**Alternative: Create as Private Repository**
```powershell
gh repo create Azure-AD-Authentication-Demo --private --source=. --remote=origin --push
```

---

## 🖱️ Method 2: Using GitHub Web Interface (Manual - After Installing Git)

### Step 1: Initialize Git Repository
```powershell
cd C:\Users\prchugh\AzureADApp
git init
```

### Step 2: Create .gitignore File
```powershell
@"
node_modules/
.funcignore
local.settings.json
.DS_Store
.vscode/
*.log
dist/
build/
.env
.env.local
"@ | Out-File -FilePath .gitignore -Encoding utf8
```

### Step 3: Add and Commit Files
```powershell
git add .
git commit -m "Initial commit: Azure AD Authentication Demo with React SPA and Azure Functions"
```

### Step 4: Create GitHub Repository (Web Browser)
1. Go to: https://github.com/new
2. **Repository name**: `Azure-AD-Authentication-Demo`
3. **Description**: "Production-ready Azure AD authentication solution with React SPA and Azure Functions API"
4. **Visibility**: Choose Public or Private
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

### Step 5: Push to GitHub
```powershell
# Set default branch name to main (if not already)
git branch -M main

# Add GitHub remote (replace YOUR_USERNAME with your actual GitHub username)
git remote add origin https://github.com/premchugh1/Azure-AD-Authentication-Demo.git

# Push code to GitHub
git push -u origin main
```

**If prompted for credentials**:
- Username: `premchugh1`
- Password: Use a **Personal Access Token** (not your GitHub password)
  - Create token at: https://github.com/settings/tokens
  - Select scopes: `repo`, `workflow`

---

## 🔐 Method 3: Using SSH (Advanced - After Installing Git)

### Step 1: Generate SSH Key (if you don't have one)
```powershell
ssh-keygen -t ed25519 -C "your_email@example.com"
# Press Enter for default location
# Enter passphrase (optional)
```

### Step 2: Add SSH Key to SSH Agent
```powershell
# Start ssh-agent
Start-Service ssh-agent

# Add your SSH key
ssh-add $env:USERPROFILE\.ssh\id_ed25519
```

### Step 3: Add SSH Key to GitHub
```powershell
# Copy SSH public key to clipboard
Get-Content $env:USERPROFILE\.ssh\id_ed25519.pub | Set-Clipboard
```

Then:
1. Go to: https://github.com/settings/keys
2. Click "New SSH key"
3. Title: "Windows PC"
4. Paste the key from clipboard
5. Click "Add SSH key"

### Step 4: Initialize and Push
```powershell
cd C:\Users\prchugh\AzureADApp
git init

# Create .gitignore
@"
node_modules/
.funcignore
local.settings.json
.DS_Store
.vscode/
*.log
dist/
build/
.env
.env.local
"@ | Out-File -FilePath .gitignore -Encoding utf8

# Add and commit
git add .
git commit -m "Initial commit: Azure AD Authentication Demo"

# Set branch to main
git branch -M main

# Add remote using SSH
git remote add origin git@github.com:premchugh1/Azure-AD-Authentication-Demo.git

# Push
git push -u origin main
```

---

## ✅ Verification Steps

After pushing, verify your repository:

1. **Check Repository URL**: https://github.com/premchugh1/Azure-AD-Authentication-Demo
2. **Verify Files**: README.md, spa/, api-test/ folders should be visible
3. **Check .gitignore**: node_modules/ should NOT be in the repository
4. **Review Commits**: Initial commit should show all files

---

## 🛠️ Common Issues & Solutions

### Issue: "git: command not found"
**Solution**: Install Git for Windows and restart VS Code

### Issue: "Permission denied (publickey)"
**Solution**: Use HTTPS method or set up SSH key properly

### Issue: "Repository already exists"
**Solution**: 
```powershell
# Remove existing remote and re-add
git remote remove origin
git remote add origin https://github.com/premchugh1/Azure-AD-Authentication-Demo.git
git push -u origin main
```

### Issue: "Large files in repository"
**Solution**: Ensure .gitignore is created BEFORE `git add .`
```powershell
# If already added, remove from staging
git rm -r --cached node_modules/
git commit -m "Remove node_modules from tracking"
```

### Issue: "Authentication failed"
**Solution**: Use Personal Access Token instead of password
1. Go to: https://github.com/settings/tokens
2. Generate new token (classic)
3. Select `repo` scope
4. Copy token and use as password when prompted

---

## 📝 Next Steps After Pushing

1. **Add Repository Description** (GitHub web interface)
2. **Add Topics/Tags**: azure, azure-ad, authentication, react, azure-functions, oauth2
3. **Enable GitHub Pages** (for documentation)
4. **Set up Branch Protection** (if collaborating)
5. **Add LICENSE file** (MIT recommended)
6. **Configure GitHub Actions** (CI/CD pipeline)

---

## 🎉 Repository Successfully Created!

Once pushed, your repository will be available at:
**https://github.com/premchugh1/Azure-AD-Authentication-Demo**

Share this URL with:
- 📋 Your README.md
- 💼 Your portfolio
- 👥 The developer community
- 📚 Stack Overflow answers about Azure AD authentication

---

## 🆘 Need Help?

If you encounter issues:
1. Ensure Git is properly installed: `git --version`
2. Check GitHub authentication: `gh auth status` (if using GitHub CLI)
3. Review error messages carefully
4. Check network connectivity to github.com

**Quick Test**:
```powershell
# Test Git installation
git --version

# Test GitHub connectivity
Test-NetConnection github.com -Port 443
```

---

**Created**: October 24, 2025
**For**: Azure AD Authentication Demo Repository Setup
**Author**: GitHub Copilot Assistant
