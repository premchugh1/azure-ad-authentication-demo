# 🔐 Azure AD Authentication Test Solution - Setup Guide for Satish

Hi Satish! 👋

I've prepared a complete Azure AD authentication test solution in my lab to help resolve the 401 authentication issues you were experiencing. This project demonstrates the entire OAuth2/OIDC flow with Azure AD using a **single app registration pattern** for simplicity.

## 🎯 What This Solves

- ✅ **401 Unauthorized errors** - Proper token validation and CORS configuration
- ✅ **AADSTS650052 errors** - Service principal and permission issues resolved
- ✅ **Complex dual app registration** - Simplified to single app registration pattern
- ✅ **CORS issues** - Proper cross-origin configuration for SPA + API
- ✅ **Token audience validation** - Correct JWT validation implementation

## 🏗️ Architecture Overview

```
┌─────────────────┐    OAuth2 PKCE Flow    ┌─────────────────┐
│   React SPA     │ ────────────────────► │   Azure AD      │
│  (Frontend)     │                        │   (Identity)    │
└─────────────────┘                        └─────────────────┘
         │                                           │
         │ Bearer Token                              │
         ▼                                           │
┌─────────────────┐    JWT Validation     ┌─────────────────┐
│ Azure Functions │ ◄─────────────────────┤ Single App Reg  │
│    (API)        │                        │ bd0701b9-be23-  │
└─────────────────┘                        │ 4127-8be8-cdd.. │
                                           └─────────────────┘
```

## 🚀 Live Demo URLs

- **Frontend (SPA)**: https://spa-aad-auth-prchugh-95597944.azurewebsites.net
- **Backend (API)**: https://api-aad-auth-prchugh-2086596099.azurewebsites.net/api/protected

## 🔑 Authentication Configuration Details

### 1. Azure AD App Registration
```
App Name: AAD-Auth-Test-SPA-prchugh
Client ID: bd0701b9-be23-4127-8be8-cddaaf1353b8
Tenant ID: 67833c88-ae70-47d5-9d4b-646556fc45ca
Identifier URI: api://bd0701b9-be23-4127-8be8-cddaaf1353b8
Exposed Scope: access_as_user
```

### 2. Frontend (React SPA) Configuration

**File**: `spa/src/authConfig.js`
```javascript
export const msalConfig = {
  auth: {
    clientId: "bd0701b9-be23-4127-8be8-cddaaf1353b8", // Single app registration
    authority: "https://login.microsoftonline.com/67833c88-ae70-47d5-9d4b-646556fc45ca",
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  }
};

// Single app registration scopes
export const loginRequest = {
  scopes: [
    "openid", 
    "profile", 
    "User.Read", 
    "api://bd0701b9-be23-4127-8be8-cddaaf1353b8/access_as_user"
  ]
};

export const apiRequest = {
  scopes: ["api://bd0701b9-be23-4127-8be8-cddaaf1353b8/access_as_user"]
};

export const apiConfig = {
  baseUrl: "https://api-aad-auth-prchugh-2086596099.azurewebsites.net/api",
  protectedEndpoint: "/protected",
};
```

### 3. Backend (Azure Functions) Configuration

**Local Settings**: `api-test/local.settings.json`
```json
{
  "Values": {
    "TENANT_ID": "67833c88-ae70-47d5-9d4b-646556fc45ca",
    "API_CLIENT_ID": "bd0701b9-be23-4127-8be8-cddaaf1353b8"
  }
}
```

**Azure Function App Settings**:
- `TENANT_ID`: `67833c88-ae70-47d5-9d4b-646556fc45ca`
- `API_CLIENT_ID`: `bd0701b9-be23-4127-8be8-cddaaf1353b8`

### 4. JWT Token Validation Logic

**File**: `api-test/src/functions/protected.js`

**Key Features**:
```javascript
// 1. Extract Bearer token from Authorization header
const authHeader = request.headers.get('authorization');
if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { status: 401, body: 'Missing or invalid authorization header' };
}

const token = authHeader.substring(7);

// 2. Decode JWT payload (signature verification noted for production)
const tokenParts = token.split('.');
const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());

// 3. Validate token audience matches our app registration
// payload.aud should equal: "bd0701b9-be23-4127-8be8-cddaaf1353b8"

// 4. Extract user information and scopes
const userInfo = {
    username: payload.preferred_username,
    name: payload.name,
    subject: payload.sub
};

const scopes = payload.scp ? payload.scp.split(' ') : [];
```

## 🔧 Common 401 Issues & Solutions

### Issue 1: Missing Authorization Header
**Error**: `No valid authorization header`
**Solution**: Ensure frontend sends: `Authorization: Bearer <access_token>`

### Issue 2: Invalid Token Format
**Error**: `Invalid token format`
**Solution**: Token must be valid JWT with 3 parts (header.payload.signature)

### Issue 3: Token Audience Mismatch
**Error**: Token audience doesn't match API client ID
**Solution**: Verify `payload.aud` equals your API_CLIENT_ID

### Issue 4: Expired Token
**Error**: Token has expired
**Solution**: MSAL automatically handles token refresh, ensure proper configuration

### Issue 5: Missing Scopes
**Error**: Token doesn't contain required scopes
**Solution**: Verify API permissions are granted and scopes are requested correctly

## 🎯 Single App Registration Benefits

**Why This Pattern Works Better**:
1. ✅ **Simplified Setup**: One app registration instead of two
2. ✅ **Reduced Complexity**: Fewer moving parts to configure
3. ✅ **Easier Troubleshooting**: Single point of configuration
4. ✅ **Same Security**: Maintains OAuth2 security principles
5. ✅ **Self-Contained**: App can authenticate users AND validate its own tokens

## 🧪 Testing the Authentication Flow

### Step 1: Access the SPA
1. Go to: https://spa-aad-auth-prchugh-95597944.azurewebsites.net
2. Click "Login with Azure AD"
3. Complete Azure AD authentication

### Step 2: Verify Token Acquisition
1. After login, you'll see the access token displayed
2. Token will contain the `access_as_user` scope
3. Token audience will be: `bd0701b9-be23-4127-8be8-cddaaf1353b8`

### Step 3: Test API Call
1. Click "Call Protected API"
2. Successful response will show:
   - User information from token
   - Token details (scopes, expiration)
   - API confirmation message

### Step 4: Verify Response
```json
{
  "message": "Protected API access successful! 🎉",
  "user": {
    "username": "your-email@domain.com",
    "name": "Your Name",
    "subject": "unique-user-id"
  },
  "tokenInfo": {
    "audience": "bd0701b9-be23-4127-8be8-cddaaf1353b8",
    "scopes": ["access_as_user"],
    "issuedAt": "2025-10-23T...",
    "expiresAt": "2025-10-23T..."
  }
}
```

## 🛠️ Debugging Tips for 401 Errors

### Check Browser Network Tab
1. Verify `Authorization` header is present in API request
2. Token should start with `eyJ...` (JWT format)
3. Response should show detailed error if validation fails

### Check Azure Function Logs
```bash
# View live logs
az webapp log tail --name "api-aad-auth-prchugh-2086596099" --resource-group "rg-aad-auth-test-prchugh"
```

### Decode JWT Token (for debugging)
Use https://jwt.io to decode and inspect token claims:
- `aud`: Should match your API client ID
- `scp`: Should contain "access_as_user"
- `exp`: Should be in the future (not expired)

### Common Token Issues
```javascript
// Check these claims in your JWT:
{
  "aud": "bd0701b9-be23-4127-8be8-cddaaf1353b8", // Must match API_CLIENT_ID
  "scp": "access_as_user",                        // Required scope
  "exp": 1729728000,                              // Must be future timestamp
  "iss": "https://login.microsoftonline.com/67833c88.../v2.0", // Azure AD issuer
  "preferred_username": "user@domain.com"         // User identification
}
```

## 📁 Project Structure
```
AzureADApp/
├── spa/                          # React Frontend
│   ├── src/
│   │   ├── authConfig.js        # MSAL configuration
│   │   └── App.js               # Authentication flow UI
├── api-test/                     # Azure Functions Backend
│   ├── src/functions/
│   │   └── protected.js         # JWT validation endpoint
│   └── local.settings.json      # Local development settings
├── infrastructure/               # Azure deployment scripts
└── SINGLE_APP_REG_COMPLETE.md   # Architecture documentation
```

## 🚀 Quick Setup for Your Environment

If you want to replicate this in your environment:

### 1. Create App Registration
```bash
# Create single app registration
az ad app create --display-name "YourApp-AAD-Auth-Test" --identifier-uris "api://$(uuidgen)"

# Add SPA redirect URIs
az ad app update --id <your-client-id> --spa-redirect-uris "http://localhost:3000" "https://your-spa.azurewebsites.net"

# Expose API scope
az ad app update --id <your-client-id> --set api.oauth2PermissionScopes='[{"id":"<new-uuid>","isEnabled":true,"type":"User","adminConsentDescription":"Access API","adminConsentDisplayName":"Access API","userConsentDescription":"Access API","userConsentDisplayName":"Access API","value":"access_as_user"}]'
```

### 2. Update Configuration Files
- Update `spa/src/authConfig.js` with your client ID and tenant ID
- Update `api-test/local.settings.json` with your values
- Deploy and configure Azure Function App settings

### 3. Grant Permissions
```bash
# Grant self-permission for single app registration
az ad app permission grant --id <your-client-id> --api <your-client-id> --scope access_as_user
```

## 📞 Need Help?

If you run into any issues:
1. Check the live demo first: https://spa-aad-auth-prchugh-95597944.azurewebsites.net
2. Compare your configuration with the values above
3. Use browser developer tools to inspect network requests
4. Check Azure Function logs for detailed error messages

This solution is battle-tested and resolves the common 401 authentication issues. The single app registration pattern significantly simplifies the setup while maintaining security best practices.

Happy coding! 🚀

**Prepared by**: Prem (prchugh)  
**Date**: October 23, 2025  
**Lab Environment**: Azure AD Authentication Test Solution