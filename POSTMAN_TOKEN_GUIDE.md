# Postman API Testing Guide

## Quick Token Acquisition

### Option 1: Postman Built-in OAuth 2.0 (Recommended)

1. Open Postman → New Request
2. Authorization Tab → Type: OAuth 2.0
3. Click "Get New Access Token"
4. Fill in these details:

```
Token Name: Azure AD API Token
Grant Type: Authorization Code (With PKCE)
Callback URL: https://oauth.pstmn.io/v1/callback
Auth URL: https://login.microsoftonline.com/67833c88-ae70-47d5-9d4b-646556fc45ca/oauth2/v2.0/authorize
Access Token URL: https://login.microsoftonline.com/67833c88-ae70-47d5-9d4b-646556fc45ca/oauth2/v2.0/token
Client ID: bd0701b9-be23-4127-8be8-cddaaf1353b8
Scope: api://bd0701b9-be23-4127-8be8-cddaaf1353b8/access_as_user openid profile
```

5. Click "Request Token" → Browser login → Token acquired!

---

## PowerShell Script to Get Token

Save this as `get-token.ps1`:

```powershell
# Step 1: Get device code
$tenantId = "67833c88-ae70-47d5-9d4b-646556fc45ca"
$clientId = "bd0701b9-be23-4127-8be8-cddaaf1353b8"
$scope = "api://$clientId/access_as_user"

$body = @{
    client_id = $clientId
    scope = $scope
}

Write-Host "`n=== STEP 1: Get Device Code ===" -ForegroundColor Cyan
$deviceCodeResponse = Invoke-RestMethod -Method Post -Uri "https://login.microsoftonline.com/$tenantId/oauth2/v2.0/devicecode" -Body $body

Write-Host "`n📱 Open browser and go to:" -ForegroundColor Yellow
Write-Host $deviceCodeResponse.verification_uri -ForegroundColor Green
Write-Host "`n🔑 Enter this code:" -ForegroundColor Yellow
Write-Host $deviceCodeResponse.user_code -ForegroundColor Green -BackgroundColor Black

Write-Host "`nWaiting for you to complete authentication..." -ForegroundColor Cyan
Write-Host "Press any key after you've entered the code in the browser..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Step 2: Poll for token
Write-Host "`n=== STEP 2: Getting Token ===" -ForegroundColor Cyan
$tokenBody = @{
    grant_type = "urn:ietf:params:oauth:grant-type:device_code"
    client_id = $clientId
    device_code = $deviceCodeResponse.device_code
}

$maxAttempts = 10
$attempt = 0

do {
    $attempt++
    Start-Sleep -Seconds 3
    Write-Host "Attempt $attempt/$maxAttempts..." -ForegroundColor Gray
    
    try {
        $tokenResponse = Invoke-RestMethod -Method Post -Uri "https://login.microsoftonline.com/$tenantId/oauth2/v2.0/token" -Body $tokenBody -ErrorAction Stop
        break
    } catch {
        if ($attempt -ge $maxAttempts) {
            Write-Host "❌ Timeout. Please try again." -ForegroundColor Red
            exit
        }
    }
} while ($attempt -lt $maxAttempts)

if ($tokenResponse) {
    Write-Host "`n✅ Token acquired successfully!" -ForegroundColor Green
    Write-Host "`n📋 Access Token (copy this):" -ForegroundColor Yellow
    Write-Host $tokenResponse.access_token -ForegroundColor White
    
    # Save to file
    $tokenResponse.access_token | Out-File -FilePath "token.txt" -Encoding utf8
    Write-Host "`n💾 Token saved to: token.txt" -ForegroundColor Cyan
    
    # Decode and show claims
    $parts = $tokenResponse.access_token.Split('.')
    $payload = $parts[1]
    $padding = 4 - ($payload.Length % 4)
    if ($padding -ne 4) { $payload += '=' * $padding }
    $decoded = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($payload))
    
    Write-Host "`n🔍 Token Claims:" -ForegroundColor Yellow
    $decoded | ConvertFrom-Json | ConvertTo-Json -Depth 5
}
```

**Run it:**
```powershell
cd C:\Users\prchugh\AzureADApp
.\get-token.ps1
```

---

## Test API Requests in Postman

### Request 1: Test with Valid Token

```
Method: GET
URL: https://api-aad-auth-prchugh-2086596099.azurewebsites.net/api/protected

Headers:
  Authorization: Bearer YOUR_TOKEN_HERE
  Content-Type: application/json
```

**Expected**: 200 OK with user info

---

### Request 2: Test without Token

```
Method: GET
URL: https://api-aad-auth-prchugh-2086596099.azurewebsites.net/api/protected

Headers:
  Content-Type: application/json
```

**Expected**: 401 Unauthorized
```json
{
  "error": "No authorization header",
  "message": "Authorization header is required",
  "hint": "Include Authorization: Bearer <token> in your request headers"
}
```

---

### Request 3: Test with Invalid Token

```
Method: GET
URL: https://api-aad-auth-prchugh-2086596099.azurewebsites.net/api/protected

Headers:
  Authorization: Bearer INVALID_TOKEN_HERE
  Content-Type: application/json
```

**Expected**: 401 Unauthorized
```json
{
  "error": "Invalid token",
  "details": "The provided token is malformed or invalid"
}
```

---

## Postman Collection JSON

Import this into Postman:

```json
{
  "info": {
    "name": "Azure AD Protected API Tests",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get Access Token",
      "request": {
        "auth": {
          "type": "oauth2",
          "oauth2": [
            {
              "key": "tokenName",
              "value": "Azure AD Token",
              "type": "string"
            },
            {
              "key": "grant_type",
              "value": "authorization_code_with_pkce",
              "type": "string"
            },
            {
              "key": "authUrl",
              "value": "https://login.microsoftonline.com/67833c88-ae70-47d5-9d4b-646556fc45ca/oauth2/v2.0/authorize",
              "type": "string"
            },
            {
              "key": "accessTokenUrl",
              "value": "https://login.microsoftonline.com/67833c88-ae70-47d5-9d4b-646556fc45ca/oauth2/v2.0/token",
              "type": "string"
            },
            {
              "key": "clientId",
              "value": "bd0701b9-be23-4127-8be8-cddaaf1353b8",
              "type": "string"
            },
            {
              "key": "scope",
              "value": "api://bd0701b9-be23-4127-8be8-cddaaf1353b8/access_as_user openid profile",
              "type": "string"
            },
            {
              "key": "redirect_uri",
              "value": "https://oauth.pstmn.io/v1/callback",
              "type": "string"
            }
          ]
        },
        "method": "GET",
        "header": [],
        "url": {
          "raw": "https://api-aad-auth-prchugh-2086596099.azurewebsites.net/api/protected",
          "protocol": "https",
          "host": ["api-aad-auth-prchugh-2086596099", "azurewebsites", "net"],
          "path": ["api", "protected"]
        }
      }
    },
    {
      "name": "Test Protected API - Valid Token",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{access_token}}",
            "type": "text"
          }
        ],
        "url": {
          "raw": "https://api-aad-auth-prchugh-2086596099.azurewebsites.net/api/protected",
          "protocol": "https",
          "host": ["api-aad-auth-prchugh-2086596099", "azurewebsites", "net"],
          "path": ["api", "protected"]
        }
      }
    },
    {
      "name": "Test Protected API - No Token",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "https://api-aad-auth-prchugh-2086596099.azurewebsites.net/api/protected",
          "protocol": "https",
          "host": ["api-aad-auth-prchugh-2086596099", "azurewebsites", "net"],
          "path": ["api", "protected"]
        }
      }
    }
  ]
}
```

---

## Troubleshooting

### Issue: "AADSTS50011: The redirect URI specified does not match"

**Solution:** Add Postman redirect URI to App Registration:
```
Azure Portal → App Registrations → AAD-Auth-Test-SPA-prchugh
→ Authentication → Add a platform → Single-page application
→ Redirect URI: https://oauth.pstmn.io/v1/callback
```

### Issue: "Invalid scope"

**Solution:** Ensure scope format is:
```
api://bd0701b9-be23-4127-8be8-cddaaf1353b8/access_as_user
```

### Issue: Token expires quickly

**Tokens expire in 1 hour.** Click "Get New Access Token" to refresh.
