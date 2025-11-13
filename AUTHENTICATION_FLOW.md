# 🔐 Authentication Flow - OAuth 2.0 Authorization Code Flow with PKCE

## 📋 **OAuth2 Flow Type**

**Flow Used:** **Authorization Code Flow with PKCE (Proof Key for Code Exchange)**

- **Standard:** OAuth 2.0 RFC 7636
- **Purpose:** Secure authentication for Single Page Applications (SPAs)
- **Why PKCE:** Prevents authorization code interception attacks in public clients (browsers)
- **Token Type:** JWT (JSON Web Token) Bearer tokens

---

## 🎯 **Why This Flow?**

| Requirement | Solution |
|------------|----------|
| **Public Client (SPA)** | Cannot securely store client secrets | PKCE eliminates need for secrets |
| **Browser-Based** | Vulnerable to code interception | PKCE code_verifier prevents hijacking |
| **User Identity** | Need to know who is accessing API | ID token provides user claims |
| **API Authorization** | Need to secure API endpoints | Access token validates requests |
| **Token Security** | Tokens must be verifiable | JWT with cryptographic signatures |

---

## 📐 **Sequence Diagram**

```mermaid
sequenceDiagram
    participant User as 👤 User (Browser)
    participant SPA as 🌐 React SPA<br/>(MSAL.js)
    participant AAD as 🔐 Azure AD<br/>(Identity Provider)
    participant API as ⚡ Azure Functions<br/>(Protected API)
    participant JWKS as 🔑 JWKS Endpoint<br/>(Public Keys)

    Note over User,JWKS: 1️⃣ INITIAL PAGE LOAD
    User->>SPA: Navigate to app
    SPA->>SPA: Initialize MSAL
    SPA->>SPA: Check for cached tokens
    alt No cached tokens
        SPA->>User: Show "Login" button
    else Valid cached tokens
        SPA->>User: Show "Logged In" state
    end

    Note over User,JWKS: 2️⃣ USER INITIATES LOGIN
    User->>SPA: Click "Login with Azure AD"
    SPA->>SPA: Generate code_verifier (random)
    SPA->>SPA: Generate code_challenge = SHA256(code_verifier)
    SPA->>SPA: Build authorization URL with:<br/>- client_id<br/>- redirect_uri<br/>- response_type=code<br/>- scope<br/>- code_challenge<br/>- code_challenge_method=S256
    SPA->>AAD: Redirect to /authorize endpoint
    
    Note over User,JWKS: 3️⃣ AZURE AD AUTHENTICATION
    AAD->>User: Show login page
    User->>AAD: Enter credentials
    AAD->>AAD: Authenticate user
    AAD->>AAD: Verify MFA (if required)
    AAD->>AAD: Check consent for scopes
    AAD->>AAD: Generate authorization code
    AAD->>SPA: Redirect to redirect_uri with:<br/>- code (authorization code)<br/>- state (CSRF protection)

    Note over User,JWKS: 4️⃣ TOKEN EXCHANGE
    SPA->>SPA: Extract authorization code from URL
    SPA->>AAD: POST /token with:<br/>- code<br/>- client_id<br/>- redirect_uri<br/>- code_verifier<br/>- grant_type=authorization_code
    AAD->>AAD: Verify code_verifier matches code_challenge
    AAD->>AAD: Validate authorization code
    AAD->>AAD: Generate tokens
    AAD->>SPA: Return tokens:<br/>- access_token (JWT)<br/>- id_token (JWT)<br/>- refresh_token<br/>- expires_in
    SPA->>SPA: Cache tokens securely
    SPA->>SPA: Parse ID token for user info
    SPA->>User: Show authenticated state with user name

    Note over User,JWKS: 5️⃣ USER CALLS PROTECTED API
    User->>SPA: Click "Call Protected API"
    SPA->>SPA: Check token expiration
    alt Token expired or expiring soon
        SPA->>AAD: Silent token refresh (acquireTokenSilent)
        AAD->>SPA: Return new access_token
    end
    SPA->>SPA: Prepare API request
    SPA->>API: GET /api/protected<br/>Header: Authorization: Bearer <access_token>

    Note over User,JWKS: 6️⃣ API TOKEN VALIDATION
    API->>API: Extract Authorization header
    API->>API: Extract Bearer token
    API->>API: Decode JWT header (get kid)
    API->>JWKS: GET signing keys<br/>(cached 24 hours)
    JWKS->>API: Return public keys
    API->>API: Find key matching kid
    API->>API: Verify JWT signature with public key
    API->>API: Validate claims:<br/>- aud (audience) = API client_id<br/>- iss (issuer) = Azure AD tenant<br/>- exp (expiration) > now<br/>- nbf (not before) <= now
    
    alt ✅ Token Valid
        API->>API: Extract user claims (name, email, oid)
        API->>API: Generate response with user info
        API->>SPA: 200 OK + JSON response
        SPA->>User: Display API response with user data
    else ❌ Token Invalid/Expired
        API->>SPA: 401 Unauthorized + error details
        SPA->>User: Display error message
        SPA->>User: Prompt to re-authenticate
    end

    Note over User,JWKS: 7️⃣ AUTOMATIC TOKEN REFRESH (Background)
    loop Every token check
        SPA->>SPA: Check token expiration (before API calls)
        alt Token expires in < 5 minutes
            SPA->>AAD: acquireTokenSilent (refresh_token)
            AAD->>AAD: Validate refresh_token
            AAD->>SPA: Return new access_token
            SPA->>SPA: Update cached token
        end
    end

    Note over User,JWKS: 8️⃣ USER LOGOUT
    User->>SPA: Click "Logout"
    SPA->>SPA: Clear token cache
    SPA->>AAD: Redirect to /logout endpoint
    AAD->>AAD: Clear session
    AAD->>SPA: Redirect back to app
    SPA->>User: Show logged out state
```

---

## 🔄 **Detailed Step-by-Step Flow**

### **Phase 1: Initialization & PKCE Setup** 🚀

#### Step 1.1: User Lands on Application
```
Browser → React SPA
- Application loads
- MSAL.js initializes with msalConfig
- Checks localStorage/sessionStorage for cached tokens
```

#### Step 1.2: PKCE Parameters Generated
```javascript
// Happens when user clicks "Login"
const code_verifier = generateRandomString(128); // High-entropy random string
const code_challenge = base64URLEncode(SHA256(code_verifier));
const code_challenge_method = "S256"; // SHA-256 hashing
```

**Example:**
```
code_verifier: "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"
code_challenge: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM"
```

---

### **Phase 2: Authorization Request** 🔑

#### Step 2.1: Redirect to Azure AD
```
React SPA → Azure AD Authorization Endpoint
GET https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/authorize
```

**Query Parameters:**
```
client_id: bd0701b9-be23-4127-8be8-cddaaf1353b8
response_type: code
redirect_uri: https://spa-aad-auth-prchugh-95597944.azurewebsites.net
scope: openid profile email api://bd0701b9-be23-4127-8be8-cddaaf1353b8/access_as_user
state: {random_state_value}  // CSRF protection
code_challenge: E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM
code_challenge_method: S256
```

#### Step 2.2: User Authentication
```
Azure AD:
1. Presents login page
2. User enters username/password
3. Performs MFA if required
4. Checks user consent for requested scopes
5. Generates authorization code
6. Stores code_challenge with authorization code
```

#### Step 2.3: Authorization Code Returned
```
Azure AD → React SPA (redirect)
https://spa-aad-auth-prchugh-95597944.azurewebsites.net/?code={authorization_code}&state={state}
```

**Example URL:**
```
https://spa-aad-auth-prchugh-95597944.azurewebsites.net/
  ?code=0.AXoAiDyDZ3Cu1Ue9tGRlVvxFyrkBB73jviEnixiN2q8T04l6AHY
  &state=eyJpZCI6IjEyMzQ1Njc4OTAiLCJ0cyI6MTYzNTA4ODAwMH0
```

---

### **Phase 3: Token Exchange** 🎟️

#### Step 3.1: Exchange Code for Tokens
```
React SPA → Azure AD Token Endpoint
POST https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token
```

**POST Body:**
```
grant_type: authorization_code
client_id: bd0701b9-be23-4127-8be8-cddaaf1353b8
code: {authorization_code_from_step_2}
redirect_uri: https://spa-aad-auth-prchugh-95597944.azurewebsites.net
code_verifier: dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk
```

#### Step 3.2: Azure AD Validates PKCE
```
Azure AD:
1. Retrieve stored code_challenge for this authorization code
2. Hash the provided code_verifier: SHA256(code_verifier)
3. Compare: hash == code_challenge ✅
4. If match, proceed; otherwise reject
```

**Security Check:**
```
Stored:  code_challenge = "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM"
Computed: SHA256(code_verifier) = "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM"
Result: ✅ MATCH → Issue tokens
```

#### Step 3.3: Tokens Issued
```json
{
  "token_type": "Bearer",
  "expires_in": 3599,
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGci...",
  "id_token": "eyJ0eXAiOiJKV1QiLCJhbGci...",
  "refresh_token": "0.AXoAiDyDZ3Cu1Ue9tGRl..."
}
```

---

### **Phase 4: Token Storage & Parsing** 💾

#### Step 4.1: MSAL.js Caches Tokens
```javascript
// MSAL stores in browser storage
{
  "access_token": {
    "credential_type": "AccessToken",
    "secret": "eyJ0eXAiOiJKV1QiLCJhbGci...",
    "expires_on": "1698765432",
    "extended_expires_on": "1698769032"
  },
  "id_token": { /* ... */ },
  "refresh_token": { /* ... */ }
}
```

#### Step 4.2: ID Token Decoded
```javascript
// ID Token Claims (JWT payload)
{
  "aud": "bd0701b9-be23-4127-8be8-cddaaf1353b8",
  "iss": "https://login.microsoftonline.com/67833c88-ae70-47d5-9d4b-646556fc45ca/v2.0",
  "iat": 1698761832,
  "exp": 1698765432,
  "name": "Prem Chugh",
  "preferred_username": "prem.chugh@example.com",
  "oid": "12345678-1234-1234-1234-123456789012",
  "tid": "67833c88-ae70-47d5-9d4b-646556fc45ca",
  "ver": "2.0"
}
```

---

### **Phase 5: API Call with Access Token** 🌐

#### Step 5.1: Prepare API Request
```javascript
// React SPA code
const callProtectedApi = async () => {
  // Get token (with automatic silent refresh if needed)
  const response = await msalInstance.acquireTokenSilent({
    scopes: ["api://bd0701b9-be23-4127-8be8-cddaaf1353b8/access_as_user"],
    account: accounts[0]
  });

  // Call API with token
  const apiResponse = await fetch(
    'https://api-aad-auth-prchugh-2086596099.azurewebsites.net/api/protected',
    {
      headers: {
        'Authorization': `Bearer ${response.accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  );
};
```

#### Step 5.2: HTTP Request to API
```
GET /api/protected HTTP/1.1
Host: api-aad-auth-prchugh-2086596099.azurewebsites.net
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ik1yNS1BVWliZ...
Content-Type: application/json
```

---

### **Phase 6: API Token Validation** 🔒

#### Step 6.1: Extract and Decode Token Header
```javascript
// Azure Functions API code
const token = req.headers.get('authorization').split(' ')[1];

// Decode JWT header (without verification yet)
const header = JSON.parse(base64Decode(token.split('.')[0]));
// header = { "typ": "JWT", "alg": "RS256", "kid": "Mr5-AUibg..." }
```

#### Step 6.2: Fetch Public Signing Key
```javascript
// Get JWKS (JSON Web Key Set) from Azure AD
const jwksUri = `https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`;

// Response contains public keys
{
  "keys": [
    {
      "kty": "RSA",
      "use": "sig",
      "kid": "Mr5-AUibg...",
      "x5t": "Mr5-AUibg...",
      "n": "0vx7agoebGcQSuuPiLJXZptN9nndrQmbXEps2aiAFbWhM78LhWx...",
      "e": "AQAB",
      "x5c": ["MIIC+DCCAeCgAwIBAgIJAKZ..."]
    }
  ]
}

// Find key matching token's 'kid'
const signingKey = keys.find(key => key.kid === header.kid);
```

#### Step 6.3: Verify JWT Signature
```javascript
// Using jsonwebtoken library
jwt.verify(token, signingKey.publicKey, {
  audience: [clientId, `api://${clientId}`],
  issuer: `https://login.microsoftonline.com/${tenantId}/v2.0`,
  algorithms: ['RS256']
}, (err, decoded) => {
  if (err) {
    // Token invalid: signature mismatch, expired, wrong audience, etc.
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  // Token valid - extract user info
  const user = {
    name: decoded.name,
    email: decoded.preferred_username,
    oid: decoded.oid
  };
});
```

**Signature Verification Process:**
```
1. Extract signature from token (3rd part of JWT)
2. Recreate signature using:
   - Token header + payload
   - Public key from JWKS
   - RS256 algorithm
3. Compare signatures
4. If match ✅ → Token is authentic (issued by Azure AD)
   If no match ❌ → Token is forged/tampered
```

#### Step 6.4: Validate Claims
```javascript
// Claims validation (done by jwt.verify)
{
  "aud": "bd0701b9-be23-4127-8be8-cddaaf1353b8", // ✅ Must match our API client_id
  "iss": "https://login.microsoftonline.com/{tenant}/v2.0", // ✅ Must be our tenant
  "exp": 1698765432, // ✅ Must be > current time
  "nbf": 1698761832, // ✅ Must be <= current time
  "scp": "access_as_user", // ✅ Must have required scope
  "oid": "12345678-...", // User's unique ID
  "name": "Prem Chugh", // User's display name
  "preferred_username": "prem.chugh@example.com" // User's email
}
```

#### Step 6.5: Return Response
```javascript
// Token valid - return 200 with user info
return {
  status: 200,
  jsonBody: {
    message: 'Authentication successful!',
    user: {
      name: decoded.name,
      email: decoded.preferred_username,
      oid: decoded.oid
    },
    tokenInfo: {
      audience: decoded.aud,
      issuer: decoded.iss,
      scopes: decoded.scp
    }
  }
};
```

---

### **Phase 7: Automatic Token Refresh** 🔄

#### Step 7.1: Token Expiration Check
```javascript
// MSAL automatically checks before API calls
const tokenExpiration = cachedToken.expiresOn;
const now = Date.now() / 1000;
const timeUntilExpiry = tokenExpiration - now;

if (timeUntilExpiry < 300) { // Less than 5 minutes
  // Trigger silent refresh
}
```

#### Step 7.2: Silent Token Acquisition
```javascript
// MSAL uses hidden iframe or refresh token
msalInstance.acquireTokenSilent({
  scopes: ["api://bd0701b9-be23-4127-8be8-cddaaf1353b8/access_as_user"],
  account: accounts[0]
}).then(response => {
  // New access token obtained
  // Cache updated automatically
}).catch(error => {
  // Silent refresh failed - require interactive login
  msalInstance.acquireTokenPopup({
    scopes: ["api://bd0701b9-be23-4127-8be8-cddaaf1353b8/access_as_user"]
  });
});
```

#### Step 7.3: Refresh Token Exchange
```
React SPA → Azure AD Token Endpoint
POST https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token

Body:
grant_type: refresh_token
client_id: bd0701b9-be23-4127-8be8-cddaaf1353b8
refresh_token: {refresh_token_from_cache}
scope: api://bd0701b9-be23-4127-8be8-cddaaf1353b8/access_as_user
```

---

## 🔐 **Security Mechanisms**

### **1. PKCE Protection**
```
Attack Scenario: Attacker intercepts authorization code
Without PKCE: Attacker exchanges code for tokens ❌
With PKCE: Attacker needs code_verifier (only in SPA memory) ✅
```

### **2. State Parameter (CSRF Protection)**
```
SPA generates: state = "abc123xyz"
Azure AD returns: state = "abc123xyz"
SPA validates: returned state == original state ✅
```

### **3. JWT Signature Verification**
```
Token Components:
- Header: {"alg": "RS256", "kid": "..."}
- Payload: {"aud": "...", "iss": "...", ...}
- Signature: RSA-SHA256(header + payload, Azure AD private key)

Verification:
1. API fetches Azure AD public key (matching 'kid')
2. Decrypts signature using public key
3. Compares with hash of header + payload
4. Match ✅ = Token authentic | No match ❌ = Token forged
```

### **4. Token Expiration**
```
Access Token: 1 hour lifetime (exp claim)
Refresh Token: 90 days (rolling window)
Checks: Every API call validates exp > now
```

### **5. Audience Validation**
```
Token 'aud' claim must equal:
- bd0701b9-be23-4127-8be8-cddaaf1353b8 OR
- api://bd0701b9-be23-4127-8be8-cddaaf1353b8

Prevents: Token reuse across different APIs
```

---

## 📊 **Token Lifecycle**

```
┌──────────────────────────────────────────────────────────────┐
│                     TOKEN LIFECYCLE                          │
└──────────────────────────────────────────────────────────────┘

1. ISSUANCE (at login)
   ├─ Access Token (expires in 1 hour)
   ├─ ID Token (expires in 1 hour)
   └─ Refresh Token (expires in 90 days, rolling)

2. ACTIVE USAGE (0-55 minutes)
   ├─ API calls use access token
   ├─ No refresh needed
   └─ Fast performance (no network calls to Azure AD)

3. REFRESH WINDOW (55-60 minutes)
   ├─ MSAL detects approaching expiration
   ├─ Silent refresh triggered automatically
   ├─ New access token obtained
   └─ User unaware (seamless experience)

4. EXPIRATION (60+ minutes, no refresh)
   ├─ Access token rejected by API (401)
   ├─ MSAL attempts silent refresh
   ├─ If refresh token valid: New tokens ✅
   └─ If refresh token expired: Interactive login required ❌

5. LOGOUT
   ├─ Tokens removed from cache
   ├─ Azure AD session cleared
   └─ User must re-authenticate
```

---

## ✅ **Flow Summary**

| Phase | Actor | Action | Result |
|-------|-------|--------|--------|
| **1. Init** | User | Visits application | SPA loads, checks cached tokens |
| **2. Login** | User | Clicks login button | PKCE parameters generated |
| **3. Auth** | Azure AD | User authenticates | Authorization code issued |
| **4. Exchange** | SPA | Exchanges code + code_verifier | Access token, ID token, refresh token |
| **5. Storage** | MSAL | Caches tokens | Tokens stored in browser |
| **6. API Call** | SPA | Calls API with access token | Bearer token sent in header |
| **7. Validation** | API | Verifies JWT signature & claims | User identity confirmed |
| **8. Response** | API | Returns protected data | User sees personalized content |
| **9. Refresh** | MSAL | Auto-refreshes before expiry | Seamless token renewal |
| **10. Logout** | User | Clicks logout | Tokens cleared, session ended |

---

## 🎯 **Key Takeaways**

✅ **Flow Type:** OAuth 2.0 Authorization Code Flow with PKCE  
✅ **Why PKCE:** Secures SPAs without client secrets  
✅ **Tokens:** JWT access tokens with RS256 signatures  
✅ **Validation:** Cryptographic signature + claims verification  
✅ **Security:** PKCE, state parameter, audience validation, signature verification  
✅ **UX:** Automatic token refresh for seamless experience  
✅ **Standards:** Follows RFC 7636 (PKCE) and RFC 6749 (OAuth 2.0)  

---

**Created:** October 28, 2025  
**For:** Azure AD Authentication Demo  
**Author:** GitHub Copilot Assistant
