# 🔐 Azure AD Authentication Test Solution

A complete working example of Azure AD authentication using React SPA + Azure Functions with **single app registration pattern**.

![Azure AD Auth Flow](https://img.shields.io/badge/Azure%20AD-Authentication-blue) ![React](https://img.shields.io/badge/React-SPA-61DAFB) ![Azure Functions](https://img.shields.io/badge/Azure-Functions-0062AD) ![Status](https://img.shields.io/badge/Status-Working-green)

## � Problem Solved

This project resolves common Azure AD authentication issues:
- ✅ **401 Unauthorized errors**
- ✅ **AADSTS650052 errors** 
- ✅ **CORS issues** with SPA + API
- ✅ **Complex dual app registration** setup
- ✅ **Token validation** problems

## 🚀 Live Demo

- **Frontend (SPA)**: https://spa-aad-auth-prchugh-95597944.azurewebsites.net
- **Backend (API)**: https://api-aad-auth-prchugh-2086596099.azurewebsites.net/api/protected

## 🏗️ Architecture

```
┌─────────────────┐    OAuth2 PKCE     ┌─────────────────┐
│   React SPA     │ ──────────────────► │   Azure AD      │
│  (Frontend)     │                     │   (Identity)    │
└─────────────────┘                     └─────────────────┘
         │                                        │
         │ Bearer Token                           │
         ▼                                        │
┌─────────────────┐    JWT Validation   ┌─────────────────┐
│ Azure Functions │ ◄──────────────────┤ Single App Reg  │
│    (API)        │                     │    (Resource)   │
└─────────────────┘                     └─────────────────┘
```

## 📁 Project Structure

```
AzureADApp/
├── spa/                          # React Frontend
│   ├── src/
│   │   ├── authConfig.js        # MSAL configuration  
│   │   └── App.js               # Authentication flow UI
│   └── package.json
├── api-test/                     # Azure Functions Backend
│   ├── src/functions/
│   │   └── protected.js         # JWT validation endpoint
│   ├── local.settings.json      # Local development config
│   └── package.json
├── infrastructure/               # Azure deployment scripts
├── SETUP_FOR_SATISH.md         # Detailed troubleshooting guide
└── README.md                    # This file
```

## 🔑 Key Authentication Components

### Frontend (React + MSAL.js)
- **Authentication**: OAuth2 with PKCE flow
- **Token Management**: Automatic refresh handling
- **UI**: Step-by-step flow visualization

### Backend (Azure Functions)
- **Token Validation**: JWT decoding and validation
- **CORS**: Proper cross-origin configuration
- **Error Handling**: Detailed error responses

### Azure AD Configuration
- **Single App Registration**: Simplified setup
- **API Scope**: `access_as_user`
- **Redirect URIs**: Development + Production

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/azure-ad-auth-demo.git
cd azure-ad-auth-demo
```

### 2. Frontend Setup
```bash
cd spa
npm install
npm start
```

### 3. Backend Setup
```bash
cd ../api-test
npm install
func start
```

### 4. Configure Azure AD
Update `spa/src/authConfig.js` with your:
- Client ID
- Tenant ID  
- API scopes

## 🔧 Configuration Details

### Azure AD App Registration
```javascript
Client ID: "your-client-id"
Tenant ID: "your-tenant-id"
Identifier URI: "api://your-client-id"
Exposed Scope: "access_as_user"
```

### Frontend Configuration
```javascript
// spa/src/authConfig.js
export const msalConfig = {
  auth: {
    clientId: "your-client-id",
    authority: "https://login.microsoftonline.com/your-tenant-id"
  }
};

export const apiRequest = {
  scopes: ["api://your-client-id/access_as_user"]
};
```

### Backend Configuration
```json
// api-test/local.settings.json
{
  "Values": {
    "TENANT_ID": "your-tenant-id",
    "API_CLIENT_ID": "your-client-id"
  }
}
```

## 🧪 Testing Authentication Flow

1. **Access Frontend**: Open SPA URL in browser
2. **Login**: Click "Login with Azure AD" 
3. **Authenticate**: Complete Azure AD flow
4. **Get Token**: Access token automatically acquired
5. **Call API**: Click "Call Protected API"
6. **Verify Response**: Check successful API response

### Expected API Response
```json
{
  "message": "Protected API access successful! 🎉",
  "user": {
    "username": "user@domain.com",
    "name": "User Name"
  },
  "tokenInfo": {
    "audience": "your-client-id",
    "scopes": ["access_as_user"],
    "expiresAt": "2025-10-23T..."
  }
}
```

## 🛠️ Troubleshooting 401 Errors

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Missing Authorization Header | Frontend not sending token | Check `Authorization: Bearer <token>` |
| Invalid Token Format | Malformed JWT | Verify token has 3 parts (header.payload.signature) |
| Token Audience Mismatch | Wrong API client ID | Ensure `payload.aud` matches `API_CLIENT_ID` |
| Expired Token | Token past expiration | MSAL handles refresh automatically |
| Missing Scopes | Insufficient permissions | Verify API permissions granted |

### Debug Tools
- **Browser DevTools**: Check Network tab for request headers
- **JWT Decoder**: Use https://jwt.io to inspect token claims
- **Azure Logs**: Monitor Function App logs for validation errors

## 📋 Prerequisites

- **Node.js** 18+ 
- **Azure CLI** (for deployment)
- **Azure Functions Core Tools** v4
- **Azure AD Tenant** with app registration permissions

## 🌐 Deployment

### Frontend (Azure Static Web Apps)
```bash
cd spa
npm run build
# Deploy build folder to Azure Static Web Apps
```

### Backend (Azure Functions)
```bash
cd api-test
func azure functionapp publish your-function-app-name
```

## 📚 Additional Resources

- **Detailed Setup Guide**: [SETUP_FOR_SATISH.md](./SETUP_FOR_SATISH.md)
- **Azure AD Documentation**: [Microsoft Docs](https://docs.microsoft.com/azure/active-directory/)
- **MSAL.js Guide**: [MSAL Documentation](https://docs.microsoft.com/azure/active-directory/develop/msal-overview)

## 🎯 Why This Solution Works

✅ **Single App Registration**: Eliminates complex dual-app setup  
✅ **Proper CORS**: Cross-origin requests handled correctly  
✅ **JWT Validation**: Secure token verification  
✅ **Error Handling**: Detailed debugging information  
✅ **Production Ready**: Deployed and tested on Azure  

## 📞 Support

For questions or issues:
1. Check the [detailed troubleshooting guide](./SETUP_FOR_SATISH.md)
2. Test against the [live demo](https://spa-aad-auth-prchugh-95597944.azurewebsites.net)
3. Compare configuration with working examples

---

**Created by**: Prem (prchugh)  
**Purpose**: Resolve Azure AD authentication 401 errors  
**Pattern**: Single App Registration OAuth2 flow  
**Status**: ✅ Production tested and working
# In PowerShell (run as administrator if needed)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\infrastructure\deploy-azure-resources.ps1
```

### 2. Update Configuration
After deployment completes, update `spa\src\authConfig.js` with the output values:
```javascript
clientId: "your-spa-client-id-from-output",
authority: "https://login.microsoftonline.com/your-tenant-id",
// ... and API client ID in scopes
```

### 3. Test Locally
```powershell
# Terminal 1: Start SPA
cd spa
npm start
# Opens http://localhost:3000

# Terminal 2: Start API (if testing locally)
cd api
func start
# API available at http://localhost:7071
```

### 4. Test Authentication
1. Click **"Login with Azure AD"**
2. Complete authentication
3. Watch the real-time flow visualization
4. Click **"Call Protected API"**
5. Verify successful response

