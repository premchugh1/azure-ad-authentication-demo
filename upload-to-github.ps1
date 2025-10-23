# Quick GitHub Upload Script
# Run this script to upload your Azure AD Authentication project to GitHub

Write-Host "🚀 Azure AD Authentication Project - GitHub Upload" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

# Check if git is installed
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git is not installed. Please install Git first:" -ForegroundColor Red
    Write-Host "   Download from: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

# Check if we're in the right directory
if (-not (Test-Path "spa") -or -not (Test-Path "api-test")) {
    Write-Host "❌ Please run this script from the AzureADApp directory" -ForegroundColor Red
    exit 1
}

Write-Host "📁 Current directory: $(Get-Location)" -ForegroundColor Green

# Initialize git repository
Write-Host "🔧 Initializing Git repository..." -ForegroundColor Yellow
git init

# Add all files
Write-Host "📝 Adding all files to Git..." -ForegroundColor Yellow
git add .

# Create commit
Write-Host "💾 Creating initial commit..." -ForegroundColor Yellow
git commit -m "Initial commit: Complete Azure AD Authentication Solution

✅ React SPA with MSAL.js authentication
✅ Azure Functions API with JWT validation  
✅ Single app registration pattern
✅ Working demo deployed to Azure
✅ Comprehensive 401 error troubleshooting guide
✅ Step-by-step setup documentation

Resolves common Azure AD authentication issues:
- 401 Unauthorized errors
- AADSTS650052 errors  
- CORS issues with SPA + API
- Complex dual app registration setup
- Token validation problems

Live Demo: 
- SPA: https://spa-aad-auth-prchugh-95597944.azurewebsites.net
- API: https://api-aad-auth-prchugh-2086596099.azurewebsites.net/api/protected

Created by: Prem (prchugh)
Purpose: Help Satish resolve Azure AD authentication 401 errors"

Write-Host "✅ Git repository initialized and files committed!" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "===============" -ForegroundColor Cyan
Write-Host "1. Go to GitHub.com and create a new repository"
Write-Host "2. Repository name: azure-ad-authentication-demo" -ForegroundColor Yellow
Write-Host "3. Make it PUBLIC so Satish can access it" -ForegroundColor Yellow
Write-Host "4. DON'T initialize with README (we have our own)" -ForegroundColor Yellow
Write-Host ""
Write-Host "5. After creating the repository, run these commands:" -ForegroundColor Green
Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/azure-ad-authentication-demo.git" -ForegroundColor White
Write-Host "   git branch -M main" -ForegroundColor White
Write-Host "   git push -u origin main" -ForegroundColor White
Write-Host ""
Write-Host "📋 Replace YOUR_USERNAME with your actual GitHub username" -ForegroundColor Yellow
Write-Host ""
Write-Host "🎯 Then share this link with Satish:" -ForegroundColor Cyan
Write-Host "   https://github.com/YOUR_USERNAME/azure-ad-authentication-demo" -ForegroundColor Green
Write-Host ""
Write-Host "📄 Key files for Satish to check:" -ForegroundColor Cyan
Write-Host "   - SETUP_FOR_SATISH.md (complete troubleshooting guide)" -ForegroundColor White
Write-Host "   - README.md (project documentation)" -ForegroundColor White
Write-Host "   - spa/src/authConfig.js (frontend configuration)" -ForegroundColor White
Write-Host "   - api-test/src/functions/protected.js (backend validation)" -ForegroundColor White
Write-Host ""
Write-Host "🧪 Live demo URLs to test immediately:" -ForegroundColor Cyan
Write-Host "   - Frontend: https://spa-aad-auth-prchugh-95597944.azurewebsites.net" -ForegroundColor Green
Write-Host "   - API: https://api-aad-auth-prchugh-2086596099.azurewebsites.net/api/protected" -ForegroundColor Green

Write-Host ""
Write-Host "🎉 Ready to upload! Follow the steps above." -ForegroundColor Green