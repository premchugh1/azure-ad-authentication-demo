# 🛠️ Developer Setup Guide

## 📋 **Prerequisites**

### **Required Software**
- **Node.js 18+** - [Download](https://nodejs.org/)
- **Azure CLI** - [Install Guide](https://docs.microsoft.com/cli/azure/install-azure-cli)
- **Git** - [Download](https://git-scm.com/)
- **VS Code** (recommended) - [Download](https://code.visualstudio.com/)

### **Azure Requirements**
- Azure subscription with Contributor access
- Azure AD tenant with app registration permissions
- PowerShell or Bash terminal

## 🚀 **Step-by-Step Setup**

### **1. Environment Preparation**

```bash
# Verify prerequisites
node --version    # Should be 18+
az --version     # Should be latest
git --version    # Should be 2.x+

# Login to Azure
az login
az account show  # Verify correct subscription
```

### **2. Clone and Setup Project**

```bash
# Clone repository
git clone https://github.com/premchugh1/azure-ad-authentication-demo.git
cd azure-ad-authentication-demo

# Install dependencies
cd spa && npm install
cd ../api-test && npm install
cd ..
```

### **3. Azure AD Configuration**

#### **Create App Registration**
```bash
# Set variables
APP_NAME="MyCompany-AAD-Auth-$(date +%s)"
REDIRECT_URI="http://localhost:3000"

# Create app registration
APP_ID=$(az ad app create \
  --display-name "$APP_NAME" \
  --spa-redirect-uris "$REDIRECT_URI" \
  --query appId -o tsv)

echo "Created App Registration: $APP_ID"

# Get tenant ID
TENANT_ID=$(az account show --query tenantId -o tsv)
echo "Tenant ID: $TENANT_ID"
```

#### **Configure API Exposure**
```bash
# Generate unique scope ID
SCOPE_ID=$(uuidgen)

# Expose API scope
az ad app update --id $APP_ID --set api.oauth2PermissionScopes="[{
  \"id\":\"$SCOPE_ID\",
  \"isEnabled\":true,
  \"type\":\"User\",
  \"adminConsentDescription\":\"Access API on behalf of the user\",
  \"adminConsentDisplayName\":\"Access API\",
  \"userConsentDescription\":\"Access API on your behalf\",
  \"userConsentDisplayName\":\"Access API\",
  \"value\":\"access_as_user\"
}]"

# Set identifier URI
az ad app update --id $APP_ID --identifier-uris "api://$APP_ID"

# Grant self-permission
az ad app permission grant --id $APP_ID --api $APP_ID --scope access_as_user
```

### **4. Application Configuration**

#### **Frontend Configuration**
Create `.env.local` in `spa/` directory:
```bash
# spa/.env.local
REACT_APP_CLIENT_ID=$APP_ID
REACT_APP_TENANT_ID=$TENANT_ID
REACT_APP_API_BASE_URL=http://localhost:7071/api
```

#### **Backend Configuration**
Update `api-test/local.settings.json`:
```json
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "TENANT_ID": "YOUR_TENANT_ID",
    "API_CLIENT_ID": "YOUR_APP_CLIENT_ID"
  }
}
```

### **5. Run Applications**

#### **Terminal 1 - Backend (Azure Functions)**
```bash
cd api-test
func start
# Should start on http://localhost:7071
```

#### **Terminal 2 - Frontend (React SPA)**
```bash
cd spa
npm start
# Should start on http://localhost:3000
```

### **6. Test Authentication Flow**

1. Open http://localhost:3000
2. Click "Login with Azure AD"
3. Complete authentication in popup
4. Click "Call Protected API"
5. Verify successful response

## 🔧 **Development Tips**

### **VS Code Extensions**
- Azure Functions
- Azure Account
- REST Client
- GitLens
- ES7+ React/Redux/React-Native snippets

### **Debugging Configuration**

#### **VS Code launch.json**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug React App",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/spa/node_modules/.bin/react-scripts",
      "args": ["start"],
      "env": {
        "BROWSER": "none"
      }
    },
    {
      "name": "Debug Azure Functions",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/api-test/node_modules/.bin/func",
      "args": ["start"],
      "cwd": "${workspaceFolder}/api-test"
    }
  ]
}
```

### **Environment Variables Reference**

#### **Frontend (.env.local)**
| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_CLIENT_ID` | Azure AD App Registration ID | `bd0701b9-be23-4127-8be8-cddaaf1353b8` |
| `REACT_APP_TENANT_ID` | Azure AD Tenant ID | `67833c88-ae70-47d5-9d4b-646556fc45ca` |
| `REACT_APP_API_BASE_URL` | API endpoint base URL | `http://localhost:7071/api` |

#### **Backend (local.settings.json)**
| Variable | Description | Example |
|----------|-------------|---------|
| `TENANT_ID` | Azure AD Tenant ID | `67833c88-ae70-47d5-9d4b-646556fc45ca` |
| `API_CLIENT_ID` | App Registration ID (same as client) | `bd0701b9-be23-4127-8be8-cddaaf1353b8` |

## 🧪 **Testing**

### **Unit Tests**
```bash
# Frontend tests
cd spa
npm test

# Backend tests
cd api-test
npm test
```

### **Integration Tests**
```bash
# Start both applications
npm run start:all

# Run end-to-end tests
npm run test:e2e
```

### **Manual Testing Checklist**
- [ ] Authentication popup opens
- [ ] User can login successfully
- [ ] Access token is acquired
- [ ] API call succeeds with token
- [ ] User information is displayed
- [ ] Logout works correctly
- [ ] Token refresh handles expiration

## 🚀 **Deployment**

### **Azure Static Web Apps (Frontend)**
```bash
# Build production
cd spa
npm run build

# Deploy to Azure
az staticwebapp create \
  --name "my-auth-spa" \
  --resource-group "my-rg" \
  --source "build" \
  --location "East US 2" \
  --sku "Free"
```

### **Azure Functions (Backend)**
```bash
# Create Function App
az functionapp create \
  --resource-group "my-rg" \
  --consumption-plan-location "East US 2" \
  --runtime node \
  --runtime-version 18 \
  --functions-version 4 \
  --name "my-auth-api" \
  --storage-account "mystorageaccount"

# Deploy functions
cd api-test
func azure functionapp publish my-auth-api

# Set environment variables
az functionapp config appsettings set \
  --name "my-auth-api" \
  --resource-group "my-rg" \
  --settings \
  TENANT_ID="$TENANT_ID" \
  API_CLIENT_ID="$APP_ID"
```

### **Update Production URLs**
After deployment, update your app registration:
```bash
# Add production redirect URI
az ad app update --id $APP_ID \
  --spa-redirect-uris "http://localhost:3000" "https://your-spa-domain.com"

# Update frontend configuration for production API URL
# Update REACT_APP_API_BASE_URL to your Function App URL
```

## 📋 **Common Development Issues**

### **CORS Errors**
```bash
# For local development, ensure Function App allows localhost
# Add to api-test/host.json:
{
  "version": "2.0",
  "extensions": {
    "http": {
      "cors": {
        "allowedOrigins": ["http://localhost:3000"],
        "allowedMethods": ["GET", "POST", "OPTIONS"],
        "allowedHeaders": ["Content-Type", "Authorization"]
      }
    }
  }
}
```

### **Token Acquisition Fails**
1. Verify app registration redirect URIs
2. Check browser popup blockers
3. Ensure correct tenant and client IDs
4. Verify API permissions are granted

### **API Returns 401**
1. Check token audience matches API client ID
2. Verify token hasn't expired
3. Ensure Authorization header format: `Bearer <token>`
4. Check Azure Function logs for validation errors

## 🔄 **Development Workflow**

### **Daily Development**
1. Pull latest changes: `git pull origin main`
2. Install any new dependencies: `npm install`
3. Start backend: `cd api-test && func start`
4. Start frontend: `cd spa && npm start`
5. Make changes and test
6. Commit and push: `git add . && git commit -m "description" && git push`

### **Feature Development**
1. Create feature branch: `git checkout -b feature/my-feature`
2. Implement feature with tests
3. Test locally with both applications running
4. Create pull request for review
5. Merge to main after approval

This setup guide provides everything needed for developers to get started with Azure AD authentication development!