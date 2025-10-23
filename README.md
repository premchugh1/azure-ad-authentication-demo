# 🔐 Azure AD Authentication Demo - Complete Solution

**A production-ready Azure AD authentication solution that resolves common 401 errors and simplifies OAuth2 implementation.**

![Azure AD Auth](https://img.shields.io/badge/Azure%20AD-Authentication-0078d4) ![React](https://img.shields.io/badge/React-18.x-61dafb) ![Azure Functions](https://img.shields.io/badge/Azure-Functions-0062ad) ![Node.js](https://img.shields.io/badge/Node.js-18.x-339933) ![Status](https://img.shields.io/badge/Status-Production%20Ready-success)

## 📖 **Overview**

This repository provides a **complete, working example** of Azure AD authentication using the **single app registration pattern**. It demonstrates secure authentication flow between a React SPA and Azure Functions API, resolving common implementation challenges.

### 🎯 **Problems This Solves**

- ✅ **401 Unauthorized errors** - Proper token validation and CORS configuration
- ✅ **AADSTS650052 errors** - Service principal and permission issues
- ✅ **Complex dual app registration** - Simplified single app registration pattern
- ✅ **CORS issues** - Cross-origin configuration for SPA + API
- ✅ **Token validation problems** - Secure JWT processing
- ✅ **Authentication flow debugging** - Visual step-by-step tracking

## 🚀 **Live Demo**

**Try the working solution immediately:**

- **🌐 Frontend (SPA)**: https://spa-aad-auth-prchugh-95597944.azurewebsites.net
- **🔌 Backend (API)**: https://api-aad-auth-prchugh-2086596099.azurewebsites.net/api/protected

## 📸 **Screenshots**

### Authentication Flow Visualization
![Authentication Flow](https://via.placeholder.com/800x400/0078d4/ffffff?text=Authentication+Flow+Screenshot)
*Real-time step-by-step authentication process with color-coded status indicators*

### Token Management Interface
![Token Display](https://via.placeholder.com/800x300/28a745/ffffff?text=Token+Management+Screenshot)
*JWT token display with claims inspection and validation details*

### API Response Visualization
![API Response](https://via.placeholder.com/800x350/17a2b8/ffffff?text=API+Response+Screenshot)
*Successful API call response with user information and token details*

### Error Debugging Interface
![Debug Interface](https://via.placeholder.com/800x300/dc3545/ffffff?text=Debug+Interface+Screenshot)
*Comprehensive error logging and troubleshooting information*

## 🏗️ **Architecture**

```
┌─────────────────┐    OAuth2 PKCE Flow    ┌─────────────────┐
│   React SPA     │ ────────────────────► │   Azure AD      │
│  (Frontend)     │                        │   (Identity)    │
│                 │                        │                 │
└─────────────────┘                        └─────────────────┘
         │                                           │
         │ Bearer Token (JWT)                        │
         ▼                                           │
┌─────────────────┐    Token Validation    ┌─────────────────┐
│ Azure Functions │ ◄─────────────────────┤ Single App Reg  │
│    (API)        │                        │   (Resource)    │
│                 │                        │                 │
└─────────────────┘                        └─────────────────┘
```

### 🔑 **Single App Registration Pattern**
- **One Azure AD app registration** serves as both authentication client AND API resource
- **Simplified configuration** with fewer moving parts
- **Reduced complexity** while maintaining OAuth2 security standards
- **Easier troubleshooting** with single point of configuration

## 📁 **Project Structure**

```
azure-ad-authentication-demo/
├── 📂 spa/                           # React Single Page Application
│   ├── 📂 src/
│   │   ├── 📄 authConfig.js          # MSAL configuration
│   │   ├── 📄 App.js                 # Authentication UI & flow
│   │   └── 📄 index.js               # Application entry point
│   ├── 📄 package.json               # Dependencies & scripts
│   └── 📄 README.md                  # SPA documentation
├── 📂 api-test/                      # Azure Functions Backend
│   ├── 📂 src/functions/
│   │   └── 📄 protected.js           # JWT validation endpoint
│   ├── 📄 local.settings.json        # Local development config
│   ├── 📄 package.json               # Dependencies
│   └── 📄 host.json                  # Function runtime config
├── 📂 docs/                          # Additional documentation
├── 📄 README.md                      # This file
├── 📄 SETUP_FOR_DEVELOPERS.md        # Detailed setup guide
└── 📄 TROUBLESHOOTING.md             # Common issues & solutions
```

## 🚀 **Quick Start (5 Minutes)**

### **Prerequisites**
- Azure subscription with app registration permissions
- Node.js 18+ installed
- Git installed
- VS Code (recommended)

### **1. Clone Repository**
```bash
git clone https://github.com/premchugh1/azure-ad-authentication-demo.git
cd azure-ad-authentication-demo
```

### **2. Set Up Azure AD App Registration**

#### Create Single App Registration:
```bash
# Install Azure CLI if not already installed
az login

# Create app registration
az ad app create --display-name "MyApp-AAD-Auth" \
  --identifier-uris "api://$(uuidgen)" \
  --spa-redirect-uris "http://localhost:3000" "https://your-spa-domain.com"
```

#### Configure API Permissions:
```bash
# Get your app registration ID
APP_ID=$(az ad app list --display-name "MyApp-AAD-Auth" --query "[0].appId" -o tsv)

# Expose API scope
az ad app update --id $APP_ID --set api.oauth2PermissionScopes='[{
  "id":"'$(uuidgen)'",
  "isEnabled":true,
  "type":"User",
  "adminConsentDescription":"Access API",
  "adminConsentDisplayName":"Access API", 
  "userConsentDescription":"Access API",
  "userConsentDisplayName":"Access API",
  "value":"access_as_user"
}]'

# Grant self-permission
az ad app permission grant --id $APP_ID --api $APP_ID --scope access_as_user
```

### **3. Configure Application**

#### Frontend Configuration (`spa/src/authConfig.js`):
```javascript
export const msalConfig = {
  auth: {
    clientId: "YOUR_APP_CLIENT_ID",           // Replace with your app ID
    authority: "https://login.microsoftonline.com/YOUR_TENANT_ID",
    redirectUri: window.location.origin,
  }
};

export const apiRequest = {
  scopes: ["api://YOUR_APP_CLIENT_ID/access_as_user"]  // Replace with your app ID
};

export const apiConfig = {
  baseUrl: "http://localhost:7071/api",     // Local development
  protectedEndpoint: "/protected",
};
```

#### Backend Configuration (`api-test/local.settings.json`):
```json
{
  "Values": {
    "TENANT_ID": "YOUR_TENANT_ID",
    "API_CLIENT_ID": "YOUR_APP_CLIENT_ID"
  }
}
```

### **4. Install Dependencies & Run**

#### Start Backend:
```bash
cd api-test
npm install
func start
```

#### Start Frontend:
```bash
cd spa
npm install
npm start
```

### **5. Test Authentication Flow**
1. Open http://localhost:3000
2. Click "Login with Azure AD"
3. Complete authentication
4. Click "Call Protected API"
5. Verify successful response

## 🔧 **Configuration Details**

### **Azure AD App Registration Settings**

| Setting | Value | Purpose |
|---------|-------|---------|
| **Application Type** | Single Page Application | Enables PKCE flow |
| **Redirect URIs** | `http://localhost:3000`, `https://your-domain.com` | Allowed callback URLs |
| **Identifier URI** | `api://YOUR_CLIENT_ID` | API resource identifier |
| **Exposed Scope** | `access_as_user` | Permission for API access |
| **Token Configuration** | Access tokens, ID tokens | Enable token issuance |

### **Frontend (React + MSAL.js)**

#### Key Features:
- **OAuth2 PKCE Flow** - Secure authentication for SPAs
- **Automatic Token Refresh** - Seamless user experience
- **Visual Flow Tracking** - Real-time authentication progress
- **Error Handling** - Comprehensive error display and logging
- **Token Inspection** - JWT claims parsing and validation

#### Core Dependencies:
```json
{
  "@azure/msal-browser": "^3.x",
  "@azure/msal-react": "^2.x",
  "react": "^18.x"
}
```

### **Backend (Azure Functions + Node.js)**

#### Key Features:
- **JWT Token Validation** - Secure API endpoint protection
- **CORS Configuration** - Cross-origin request support
- **User Claims Extraction** - Token payload processing
- **Error Responses** - Detailed authentication failure information
- **Environment Configuration** - Flexible deployment settings

#### Core Dependencies:
```json
{
  "@azure/functions": "^4.x",
  "jsonwebtoken": "^9.x",
  "jwks-client": "^4.x"
}
```

## 🧪 **Authentication Flow Details**

### **Step-by-Step Process**

1. **🔄 Initial State** - Application loads, checks for existing authentication
2. **🔑 Login Initiated** - User clicks login, MSAL redirects to Azure AD
3. **✅ Login Completed** - User authenticates, receives authorization code
4. **🎟️ Token Acquisition** - MSAL exchanges code for access token
5. **🎯 Token Acquired** - Access token stored securely in browser
6. **🌐 API Call** - Frontend sends request with Bearer token
7. **🔒 Token Validation** - Backend validates JWT signature and claims
8. **✅ Success Response** - API returns protected data

### **Security Features**

- **🔐 PKCE (Proof Key for Code Exchange)** - Prevents authorization code interception
- **🎫 JWT Token Validation** - Cryptographic signature verification
- **⏰ Token Expiration Handling** - Automatic refresh before expiry
- **🛡️ CORS Protection** - Controlled cross-origin access
- **📋 Claims Validation** - Audience, issuer, and expiration checks

## 🛠️ **Troubleshooting Guide**

### **Common Issues & Solutions**

| Issue | Symptoms | Solution |
|-------|----------|----------|
| **401 Unauthorized** | API returns 401 status | Verify token audience matches API client ID |
| **AADSTS650052** | Service principal error | Run `az ad sp create --id YOUR_CLIENT_ID` |
| **CORS Errors** | Blocked cross-origin requests | Configure Function App CORS settings |
| **Token Expired** | Authentication fails silently | MSAL handles refresh automatically |
| **Invalid Redirect URI** | AADSTS50011 error | Verify redirect URI in app registration |
| **Missing Scopes** | Access denied | Ensure API permissions granted and consented |

### **Debug Tools**

#### Built-in Debugging Features:
- **📊 Real-time Flow Tracking** - Visual authentication progress
- **🔍 Token Inspector** - JWT claims parsing and display
- **📝 Activity Logging** - Detailed operation logs
- **⚠️ Error Analysis** - Comprehensive error messages and solutions

#### External Tools:
- **JWT.io** - Token decoding and validation
- **Browser DevTools** - Network request inspection
- **Azure Portal** - App registration verification
- **Azure Function Logs** - Backend error analysis

## 📈 **Production Deployment**

### **Azure Static Web Apps (Frontend)**
```bash
# Build production assets
npm run build

# Deploy to Azure Static Web Apps
az staticwebapp create \
  --name "my-spa-app" \
  --resource-group "my-resource-group" \
  --source "build" \
  --location "East US 2"
```

### **Azure Functions (Backend)**
```bash
# Deploy Function App
func azure functionapp publish my-function-app --javascript

# Set production environment variables
az functionapp config appsettings set \
  --name "my-function-app" \
  --resource-group "my-resource-group" \
  --settings TENANT_ID="your-tenant-id" API_CLIENT_ID="your-client-id"
```

### **Production Checklist**

- [ ] Update redirect URIs for production domain
- [ ] Configure custom domain and SSL certificate
- [ ] Enable Application Insights monitoring
- [ ] Set up automated backup and recovery
- [ ] Configure CI/CD pipeline
- [ ] Enable security monitoring and alerts
- [ ] Review and test disaster recovery procedures

## 🤝 **Contributing**

We welcome contributions! Please see our contributing guidelines:

### **How to Contribute**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### **Areas for Contribution**
- 🐛 Bug fixes and improvements
- 📚 Documentation enhancements
- 🎨 UI/UX improvements
- 🔧 Additional authentication providers
- 🧪 Test coverage expansion
- 🌐 Internationalization support

## 📚 **Additional Resources**

### **Official Documentation**
- [Azure AD Documentation](https://docs.microsoft.com/azure/active-directory/)
- [MSAL.js Documentation](https://docs.microsoft.com/azure/active-directory/develop/msal-overview)
- [Azure Functions Documentation](https://docs.microsoft.com/azure/azure-functions/)

### **Related Projects**
- [Microsoft Graph SDK](https://github.com/microsoftgraph/msgraph-sdk-javascript)
- [Azure SDK for JavaScript](https://github.com/Azure/azure-sdk-for-js)
- [MSAL Browser Samples](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/samples)

### **Community Support**
- [Stack Overflow - Azure AD](https://stackoverflow.com/questions/tagged/azure-active-directory)
- [Microsoft Q&A - Azure AD](https://docs.microsoft.com/answers/topics/azure-active-directory.html)
- [Azure Functions Community](https://github.com/Azure/Azure-Functions)

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⭐ **Why This Solution Works**

✅ **Production Ready** - Deployed and tested on Azure infrastructure  
✅ **Security First** - Follows Microsoft best practices and OAuth2 standards  
✅ **Developer Friendly** - Comprehensive documentation and debugging tools  
✅ **Community Tested** - Resolves real-world authentication challenges  
✅ **Scalable Architecture** - Suitable for small apps to enterprise solutions  

---

## 🙋‍♂️ **Support & Contact**

**Created by**: [Prem Chugh](https://github.com/premchugh1)  
**Purpose**: Resolve Azure AD authentication implementation challenges  
**Status**: ✅ Production tested and community validated

For questions, issues, or support:
1. 📋 Check the [Issues](https://github.com/premchugh1/azure-ad-authentication-demo/issues) page
2. 📖 Review the [Troubleshooting Guide](TROUBLESHOOTING.md)
3. 🧪 Test against the [Live Demo](https://spa-aad-auth-prchugh-95597944.azurewebsites.net)
4. 💬 Start a [Discussion](https://github.com/premchugh1/azure-ad-authentication-demo/discussions)

**⚡ Quick Help**: The live demo is always available for immediate testing and comparison with your implementation!

---

<div align="center">

**Made with ❤️ for the developer community**

[⭐ Star this repository](https://github.com/premchugh1/azure-ad-authentication-demo/stargazers) if it helped you solve Azure AD authentication challenges!

</div>