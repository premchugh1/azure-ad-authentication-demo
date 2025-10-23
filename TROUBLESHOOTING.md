# 🚨 Troubleshooting Guide

## 🎯 **Quick Diagnosis**

### **Is Your Issue Listed Here?**
- [401 Unauthorized Errors](#401-unauthorized-errors)
- [CORS Issues](#cors-issues)
- [Token Problems](#token-problems)
- [Authentication Flow Issues](#authentication-flow-issues)
- [Azure AD Errors](#azure-ad-errors)
- [Local Development Issues](#local-development-issues)

---

## 🔐 **401 Unauthorized Errors**

### **Symptom**: API returns 401 status code

#### **Root Cause Analysis**
```javascript
// Check these in browser DevTools Network tab:
// 1. Authorization header present?
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...

// 2. Token format correct (3 parts separated by dots)?
// 3. API endpoint receiving the request?
```

#### **Solutions**

##### **Missing Authorization Header**
```javascript
// ❌ Incorrect - Missing Authorization header
fetch('/api/protected', {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' }
});

// ✅ Correct - Include Authorization header
fetch('/api/protected', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});
```

##### **Token Audience Mismatch**
```bash
# Check token audience at https://jwt.io
# Audience (aud) claim should match your API_CLIENT_ID

# Verify your configuration:
echo "API_CLIENT_ID in local.settings.json: $API_CLIENT_ID"
echo "Client ID in authConfig.js: $CLIENT_ID"
# These should be the same for single app registration pattern
```

##### **Expired Token**
```javascript
// Check token expiration
const payload = JSON.parse(atob(token.split('.')[1]));
const expiry = new Date(payload.exp * 1000);
const now = new Date();

console.log('Token expires at:', expiry);
console.log('Current time:', now);
console.log('Token expired:', expiry < now);
```

---

## 🌐 **CORS Issues**

### **Symptom**: Browser blocks requests with CORS error

#### **Error Messages**
```
Access to fetch at 'https://api.domain.com/api/protected' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```

#### **Solutions**

##### **Local Development (Azure Functions)**
Update `api-test/host.json`:
```json
{
  "version": "2.0",
  "extensions": {
    "http": {
      "cors": {
        "allowedOrigins": ["http://localhost:3000", "https://your-spa-domain.com"],
        "allowedMethods": ["GET", "POST", "OPTIONS"],
        "allowedHeaders": ["Content-Type", "Authorization"],
        "allowCredentials": false
      }
    }
  }
}
```

##### **Azure Function App (Production)**
```bash
# Configure CORS via Azure CLI
az functionapp cors add \
  --resource-group "your-rg" \
  --name "your-function-app" \
  --allowed-origins "https://your-spa-domain.com"

# Or allow all during development (NOT recommended for production)
az functionapp cors add \
  --resource-group "your-rg" \
  --name "your-function-app" \
  --allowed-origins "*"
```

##### **Manual CORS Headers (Function Code)**
```javascript
// In your Azure Function
return {
  status: 200,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(response)
};
```

---

## 🎫 **Token Problems**

### **Token Acquisition Fails**

#### **Symptom**: MSAL throws error during token acquisition

##### **InteractionRequiredAuthError**
```javascript
// Solution: Use popup or redirect for interactive authentication
try {
  const response = await instance.acquireTokenSilent(tokenRequest);
} catch (error) {
  if (error instanceof InteractionRequiredAuthError) {
    // Fallback to interactive authentication
    const response = await instance.acquireTokenPopup(tokenRequest);
  }
}
```

##### **Invalid Scope**
```javascript
// ❌ Incorrect scope format
const tokenRequest = {
  scopes: ["access_as_user"]  // Missing api:// prefix
};

// ✅ Correct scope format
const tokenRequest = {
  scopes: ["api://bd0701b9-be23-4127-8be8-cddaaf1353b8/access_as_user"]
};
```

### **Token Validation Fails**

#### **Invalid Signature**
```javascript
// Enable proper token validation in production
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-client');

const client = jwksClient({
  jwksUri: `https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

// Verify token signature
jwt.verify(token, getKey, {
  audience: clientId,
  issuer: `https://login.microsoftonline.com/${tenantId}/v2.0`,
  algorithms: ['RS256']
}, (err, decoded) => {
  if (err) {
    console.error('Token validation failed:', err);
    return res.status(401).json({ error: 'Invalid token' });
  }
  // Token is valid
});
```

---

## 🔄 **Authentication Flow Issues**

### **Login Popup Blocked**

#### **Symptom**: Popup doesn't open or is immediately closed

##### **Solutions**
```javascript
// 1. Ensure user action triggers popup
button.addEventListener('click', async () => {
  // This works - direct user action
  await instance.loginPopup(loginRequest);
});

// 2. Check popup blocker settings
// 3. Use redirect flow as fallback
const loginRequest = {
  ...originalRequest,
  redirectUri: window.location.origin + '/redirect'
};
await instance.loginRedirect(loginRequest);
```

### **Infinite Redirect Loop**

#### **Symptom**: Application keeps redirecting to Azure AD

##### **Solution**
```javascript
// Check for redirect result on app load
useEffect(() => {
  instance.handleRedirectPromise()
    .then((response) => {
      if (response) {
        // Handle successful authentication
        console.log('Authentication successful');
      }
    })
    .catch((error) => {
      console.error('Authentication failed:', error);
    });
}, []);
```

---

## 🏢 **Azure AD Errors**

### **AADSTS650052**: The app needs access to a service

#### **Solution**
```bash
# Create service principal for your app registration
az ad sp create --id YOUR_CLIENT_ID

# Verify service principal exists
az ad sp show --id YOUR_CLIENT_ID
```

### **AADSTS50011**: Invalid redirect URI

#### **Solution**
```bash
# Add correct redirect URI to app registration
az ad app update --id YOUR_CLIENT_ID \
  --spa-redirect-uris "http://localhost:3000" "https://your-domain.com"

# Verify redirect URIs
az ad app show --id YOUR_CLIENT_ID \
  --query "spa.redirectUris"
```

### **AADSTS70001**: Application not found in directory

#### **Solution**
```bash
# Verify app registration exists
az ad app show --id YOUR_CLIENT_ID

# If not found, check if you're in correct tenant
az account show
az account set --subscription "correct-subscription-id"
```

---

## 💻 **Local Development Issues**

### **Function App Won't Start**

#### **Symptom**: `func start` fails

##### **Solutions**
```bash
# 1. Check Azure Functions Core Tools version
func --version
# Should be 4.x for this project

# 2. Install correct version
npm install -g azure-functions-core-tools@4 --unsafe-perm true

# 3. Check Node.js version
node --version
# Should be 18.x or higher

# 4. Clear npm cache
npm cache clean --force
```

### **React App Build Fails**

#### **Symptom**: `npm start` or `npm run build` fails

##### **Solutions**
```bash
# 1. Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# 2. Check for port conflicts
netstat -an | findstr 3000
# Kill process using port 3000 if needed

# 3. Update dependencies
npm update

# 4. Check for environment variable issues
# Ensure all REACT_APP_ variables are set correctly
```

### **Environment Variables Not Loading**

#### **Solutions**
```bash
# 1. Check .env.local file location (should be in spa/ directory)
ls spa/.env.local

# 2. Verify variable names start with REACT_APP_
# ❌ CLIENT_ID=... (won't work)
# ✅ REACT_APP_CLIENT_ID=... (works)

# 3. Restart development server after changing .env
npm start
```

---

## 🔍 **Debugging Tools**

### **Browser Developer Tools**

#### **Network Tab Checklist**
- [ ] API request shows in network tab
- [ ] Request has Authorization header
- [ ] Authorization header starts with "Bearer "
- [ ] Response status code and headers
- [ ] CORS headers present in response

#### **Console Errors**
```javascript
// Enable MSAL logging
const msalConfig = {
  // ... other config
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        console.log(`MSAL [${level}]: ${message}`);
      },
      piiLoggingEnabled: false,
      logLevel: LogLevel.Verbose
    }
  }
};
```

### **JWT Token Debugging**

#### **Online Tools**
- **jwt.io** - Decode and inspect JWT tokens
- **jwt-decode npm package** - Programmatic token decoding

#### **Token Inspection**
```javascript
// Decode token payload
function decodeToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('Token payload:', payload);
    console.log('Audience:', payload.aud);
    console.log('Scopes:', payload.scp);
    console.log('Expires:', new Date(payload.exp * 1000));
    return payload;
  } catch (error) {
    console.error('Invalid token format:', error);
    return null;
  }
}
```

### **Azure Function Debugging**

#### **Local Debugging**
```bash
# Run with verbose logging
func start --verbose

# Check function logs
func azure functionapp logstream YOUR_FUNCTION_APP_NAME
```

#### **Production Debugging**
```bash
# View live logs
az webapp log tail --name YOUR_FUNCTION_APP_NAME --resource-group YOUR_RG

# Download logs
az webapp log download --name YOUR_FUNCTION_APP_NAME --resource-group YOUR_RG
```

---

## 🆘 **Emergency Troubleshooting**

### **Nothing Works - Reset Everything**

```bash
# 1. Clean local environment
rm -rf spa/node_modules spa/package-lock.json
rm -rf api-test/node_modules api-test/package-lock.json
npm cache clean --force

# 2. Reinstall dependencies
cd spa && npm install
cd ../api-test && npm install

# 3. Verify Azure AD configuration
az ad app show --id YOUR_CLIENT_ID
az ad sp show --id YOUR_CLIENT_ID

# 4. Test with fresh browser session (incognito mode)
# 5. Check against live demo: https://spa-aad-auth-prchugh-95597944.azurewebsites.net
```

### **Compare with Working Demo**

If your implementation isn't working, compare with the live demo:
- **Frontend**: https://spa-aad-auth-prchugh-95597944.azurewebsites.net
- **API Test**: Use browser DevTools to see working requests/responses

---

## 📞 **Getting Help**

### **Before Asking for Help**
1. ✅ Check this troubleshooting guide
2. ✅ Test against the live demo
3. ✅ Check browser console for errors
4. ✅ Verify network requests in DevTools
5. ✅ Try in incognito/private browser window

### **When Reporting Issues**
Please include:
- Error messages (exact text)
- Browser and version
- Node.js version
- Steps to reproduce
- Network request details from DevTools
- Token payload (remove sensitive info)

### **Useful Commands for Issue Reports**
```bash
# Environment info
node --version
npm --version
func --version
az --version

# Project info
git status
git log --oneline -5
npm list --depth=0
```

Remember: The live demo is always available for comparison and testing! 🚀