# Production 401 Fix Guide

## Problem Analysis
Your production app is receiving **v1.0 tokens** but the API validation is configured for **v2.0 tokens**.

### Token Differences

#### Production Token (v1.0):
```json
{
  "aud": "api://c5c396ca-0c88-4b8f-a847-9b9b31827cd3",
  "iss": "https://sts.windows.net/fd43752b-e167-4f25-b0db-f9ecb9fcd0ab/",
  "ver": "1.0",
  "scp": "user_impersonation"
}
```

#### Your Working Demo Token (v2.0):
```json
{
  "aud": "bd0701b9-be23-4127-8be8-cddaaf1353b8",
  "iss": "https://login.microsoftonline.com/67833c88-ae70-47d5-9d4b-646556fc45ca/v2.0",
  "ver": "2.0",
  "scp": "access_as_user"
}
```

---

## Solution Options

### Option 1: Update API to Accept BOTH v1.0 and v2.0 Tokens (RECOMMENDED)

Update the production API's JWT validation to accept both token versions:

```javascript
// In your production API's protected function
function verifyToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, getKey, {
      // Accept both audience formats
      audience: [clientId, `api://${clientId}`],
      
      // Accept BOTH v1.0 and v2.0 issuers
      issuer: [
        `https://sts.windows.net/${tenantId}/`,           // v1.0
        `https://login.microsoftonline.com/${tenantId}/v2.0`  // v2.0
      ],
      
      algorithms: ['RS256']
    }, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
}
```

### Option 2: Force Production App to Use v2.0 Tokens

Update the production Azure AD App Registration:

#### Step 1: Set Access Token Version
```bash
# Get the app object ID
az ad app show --id c5c396ca-0c88-4b8f-a847-9b9b31827cd3 --query "id" -o tsv

# Update to v2.0
az rest --method PATCH \
  --uri "https://graph.microsoft.com/v1.0/applications/OBJECT_ID_HERE" \
  --body '{"api":{"requestedAccessTokenVersion":2}}'
```

#### Step 2: Update the SPA's MSAL Configuration
Ensure the authority uses `/v2.0` endpoint:
```javascript
export const msalConfig = {
  auth: {
    clientId: "c5c396ca-0c88-4b8f-a847-9b9b31827cd3",
    authority: "https://login.microsoftonline.com/fd43752b-e167-4f25-b0db-f9ecb9fcd0ab", // v2.0 endpoint
    // NOT: "https://login.windows.net/..." // v1.0 endpoint
  }
};
```

#### Step 3: Update API Scope Name
Change from `user_impersonation` to a more descriptive name:
```javascript
export const apiRequest = {
  scopes: ["api://c5c396ca-0c88-4b8f-a847-9b9b31827cd3/user_impersonation"]
};
```

---

## Quick Diagnostic Commands

### Check Production App Registration Settings:
```bash
# Check token version
az ad app show --id c5c396ca-0c88-4b8f-a847-9b9b31827cd3 \
  --query "{accessTokenVersion:api.requestedAccessTokenVersion, identifierUris:identifierUris, scopes:api.oauth2PermissionScopes[0].value}" \
  --output json
```

### Check if v2.0 Endpoint is Being Used:
Look at the production SPA's `authConfig.js`:
- ✅ Good: `https://login.microsoftonline.com/{tenantId}`
- ❌ Bad: `https://login.windows.net/{tenantId}` or `https://sts.windows.net/{tenantId}`

---

## Testing Steps

1. **Deploy the updated API validation** (accepting both v1.0 and v2.0)
2. **Test with existing token** - should work immediately
3. **Optional:** Migrate to v2.0 tokens for consistency
4. **Monitor logs** to see which token version is being used

---

## Expected Results After Fix

### With Option 1 (Accept Both):
- ✅ Existing v1.0 tokens work immediately
- ✅ v2.0 tokens also work
- ✅ No breaking changes for users

### With Option 2 (Force v2.0):
- ⚠️ Users need to re-authenticate
- ✅ Standardized on v2.0 tokens
- ✅ Better future-proofing

---

## Key Configuration Checklist

For Production App (`c5c396ca-0c88-4b8f-a847-9b9b31827cd3`):

- [ ] App Registration: Access token version set to 2 (or API accepts both v1.0/v2.0)
- [ ] App Registration: Application ID URI = `api://c5c396ca-0c88-4b8f-a847-9b9b31827cd3`
- [ ] App Registration: API scope exposed = `user_impersonation`
- [ ] App Registration: ID token & Access token issuance enabled
- [ ] SPA: MSAL authority uses `login.microsoftonline.com` (not `login.windows.net`)
- [ ] API: JWT validation accepts correct issuer format(s)
- [ ] API: JWT validation accepts correct audience format(s)
- [ ] CORS: Production SPA domain in allowed origins

---

## Need More Help?

Run this command to see your production app's current configuration:
```bash
az ad app show --id c5c396ca-0c88-4b8f-a847-9b9b31827cd3 --output json > production_app_config.json
```

Compare with your working demo app configuration to spot differences.
