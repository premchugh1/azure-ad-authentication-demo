# Azure AD Authentication Test Solution

This workspace contains a comprehensive Azure AD authentication test solution with:

## Project Structure
- `spa/` - Single Page Application (React + MSAL.js)
- `api/` - Azure Function API with JWT validation
- `infrastructure/` - Azure deployment scripts and templates

## Technologies Used
- Frontend: React with MSAL.js for Azure AD authentication
- Backend: Azure Functions with JWT validation
- Infrastructure: PowerShell scripts for App Service and Function App
- Authentication: Microsoft Entra ID (Azure AD)

## Key Features
- Step-by-step authentication flow visualization
- Token display and validation
- Bearer token API calls
- Comprehensive troubleshooting
- Real-time status indicators
- Azure infrastructure automation

## Getting Started
1. Run `.\infrastructure\deploy-azure-resources.ps1` to deploy Azure infrastructure
2. Update `spa\src\authConfig.js` with the deployment output values
3. Use VS Code task "Start SPA Development Server" to run locally
4. Test the complete authentication flow

## Available Tasks
- Start SPA Development Server
- Build SPA
- Install SPA Dependencies
- Install API Dependencies

This solution is ready to deploy and test Azure AD authentication flows.