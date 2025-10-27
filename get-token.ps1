# Get Azure AD Access Token for API Testing
# This script uses device code flow - easy for testing!

$tenantId = "67833c88-ae70-47d5-9d4b-646556fc45ca"
$clientId = "bd0701b9-be23-4127-8be8-cddaaf1353b8"
$scope = "api://$clientId/access_as_user"

Write-Host "`n╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Azure AD Token Acquisition for API Testing      ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Cyan

# Step 1: Get device code
Write-Host "`n[1/3] Requesting device code..." -ForegroundColor Yellow

$body = @{
    client_id = $clientId
    scope = $scope
}

try {
    $deviceCodeResponse = Invoke-RestMethod -Method Post -Uri "https://login.microsoftonline.com/$tenantId/oauth2/v2.0/devicecode" -Body $body
    
    Write-Host "`n✅ Device code received!" -ForegroundColor Green
    Write-Host "`n📱 AUTHENTICATION REQUIRED:" -ForegroundColor Yellow
    Write-Host "   1. Open your browser and navigate to: " -NoNewline
    Write-Host $deviceCodeResponse.verification_uri -ForegroundColor Cyan
    Write-Host "   2. Enter this code: " -NoNewline
    Write-Host $deviceCodeResponse.user_code -ForegroundColor Green -BackgroundColor Black
    Write-Host "`n⏱️  Code expires in $($deviceCodeResponse.expires_in) seconds`n" -ForegroundColor Gray
    
    # Step 2: Wait and poll for token
    Write-Host "[2/3] Waiting for authentication..." -ForegroundColor Yellow
    Write-Host "      (Complete the login in your browser)`n" -ForegroundColor Gray
    
    $tokenBody = @{
        grant_type = "urn:ietf:params:oauth:grant-type:device_code"
        client_id = $clientId
        device_code = $deviceCodeResponse.device_code
    }
    
    $maxAttempts = 30
    $attempt = 0
    $tokenResponse = $null
    
    do {
        $attempt++
        Start-Sleep -Seconds $deviceCodeResponse.interval
        
        Write-Host "." -NoNewline -ForegroundColor Gray
        
        try {
            $tokenResponse = Invoke-RestMethod -Method Post -Uri "https://login.microsoftonline.com/$tenantId/oauth2/v2.0/token" -Body $tokenBody -ErrorAction Stop
            break
        } catch {
            $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
            if ($errorResponse.error -eq "authorization_pending") {
                # Still waiting for user
                continue
            } else {
                Write-Host "`n`n❌ Error: $($errorResponse.error_description)" -ForegroundColor Red
                exit 1
            }
        }
    } while ($attempt -lt $maxAttempts)
    
    if (-not $tokenResponse) {
        Write-Host "`n`n❌ Timeout. Authentication took too long." -ForegroundColor Red
        exit 1
    }
    
    Write-Host "`n`n✅ Authentication successful!" -ForegroundColor Green
    
    # Step 3: Display and save token
    Write-Host "`n[3/3] Token acquired!" -ForegroundColor Yellow
    
    $accessToken = $tokenResponse.access_token
    
    # Decode token to show claims
    $parts = $accessToken.Split('.')
    $payload = $parts[1]
    $padding = 4 - ($payload.Length % 4)
    if ($padding -ne 4) { $payload += '=' * $padding }
    $decoded = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($payload))
    $claims = $decoded | ConvertFrom-Json
    
    Write-Host "`n╔════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║              TOKEN INFORMATION                     ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Green
    
    Write-Host "`n👤 User: " -NoNewline -ForegroundColor Cyan
    Write-Host $claims.name -ForegroundColor White
    
    Write-Host "📧 Email: " -NoNewline -ForegroundColor Cyan
    Write-Host $claims.preferred_username -ForegroundColor White
    
    Write-Host "🎯 Audience: " -NoNewline -ForegroundColor Cyan
    Write-Host $claims.aud -ForegroundColor White
    
    Write-Host "🔐 Scope: " -NoNewline -ForegroundColor Cyan
    Write-Host $claims.scp -ForegroundColor White
    
    $expiryTime = [DateTimeOffset]::FromUnixTimeSeconds($claims.exp).LocalDateTime
    Write-Host "⏰ Expires: " -NoNewline -ForegroundColor Cyan
    Write-Host $expiryTime.ToString("yyyy-MM-dd HH:mm:ss") -ForegroundColor White
    
    # Save token to file
    $tokenFile = Join-Path $PSScriptRoot "token.txt"
    $accessToken | Out-File -FilePath $tokenFile -Encoding utf8 -NoNewline
    
    Write-Host "`n💾 Token saved to: " -NoNewline -ForegroundColor Cyan
    Write-Host $tokenFile -ForegroundColor Yellow
    
    # Copy to clipboard if available
    try {
        Set-Clipboard -Value $accessToken
        Write-Host "📋 Token copied to clipboard!" -ForegroundColor Green
    } catch {
        # Clipboard not available
    }
    
    Write-Host "`n╔════════════════════════════════════════════════════╗" -ForegroundColor Magenta
    Write-Host "║           USE TOKEN IN POSTMAN                     ║" -ForegroundColor Magenta
    Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Magenta
    
    Write-Host "`n1. Open Postman" -ForegroundColor White
    Write-Host "2. Create GET request to:" -ForegroundColor White
    Write-Host "   https://api-aad-auth-prchugh-2086596099.azurewebsites.net/api/protected" -ForegroundColor Cyan
    Write-Host "3. Add header:" -ForegroundColor White
    Write-Host "   Key: " -NoNewline -ForegroundColor White
    Write-Host "Authorization" -ForegroundColor Yellow
    Write-Host "   Value: " -NoNewline -ForegroundColor White
    Write-Host "Bearer <paste-token-here>" -ForegroundColor Yellow
    Write-Host "4. Send request!" -ForegroundColor White
    
    Write-Host "`n╔════════════════════════════════════════════════════╗" -ForegroundColor Yellow
    Write-Host "║              ACCESS TOKEN                          ║" -ForegroundColor Yellow
    Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Yellow
    Write-Host $accessToken -ForegroundColor Gray
    Write-Host ""
    
} catch {
    Write-Host "`n❌ Error occurred: $_" -ForegroundColor Red
    exit 1
}
