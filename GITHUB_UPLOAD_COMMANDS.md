# GitHub Upload Commands

## After creating your GitHub repository, run these commands:

### 1. Initialize Git Repository (if not already done)
```powershell
cd C:\Users\prchugh\AzureADApp
git init
```

### 2. Add all files to Git
```powershell
git add .
```

### 3. Create initial commit
```powershell
git commit -m "Initial commit: Azure AD Authentication Test Solution

- Complete React SPA with MSAL.js authentication
- Azure Functions API with JWT validation
- Single app registration pattern
- Working demo with CORS configuration
- Comprehensive documentation for troubleshooting 401 errors"
```

### 4. Add GitHub remote (replace YOUR_USERNAME and REPO_NAME)
```powershell
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
```

### 5. Push to GitHub
```powershell
git branch -M main
git push -u origin main
```

## Example with actual repository name:
If your GitHub username is `prchugh` and repository name is `azure-ad-auth-demo`:
```powershell
git remote add origin https://github.com/prchugh/azure-ad-auth-demo.git
git branch -M main
git push -u origin main
```

## Then share this link with Satish:
https://github.com/YOUR_USERNAME/REPO_NAME