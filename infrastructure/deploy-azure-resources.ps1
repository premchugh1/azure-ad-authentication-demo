# Azure AD Authentication Test - Infrastructure Deployment Script (PowerShell)
# This script creates all necessary Azure resources for the authentication test

# Variables - Update these with your values
$RESOURCE_GROUP = "rg-aad-auth-test-prchugh"
$LOCATION = "East US"
$APP_SERVICE_PLAN = "asp-aad-auth-test-prchugh"
$WEB_APP_NAME = "spa-aad-auth-prchugh-$(Get-Random)"
$FUNCTION_APP_NAME = "api-aad-auth-prchugh-$(Get-Random)"
$STORAGE_ACCOUNT = "staaadprchugh$(Get-Random -Maximum 999999)"
$SPA_CLIENT_ID_NAME = "spa-aad-auth-test-prchugh"
$API_CLIENT_ID_NAME = "api-aad-auth-test-prchugh"

Write-Host "🚀 Starting Azure AD Authentication Test Infrastructure Deployment" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# Check if Azure CLI is logged in
try {
    $account = az account show --query id -o tsv 2>$null
    if (-not $account) {
        Write-Host "❌ Please login to Azure CLI first: az login" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Please login to Azure CLI first: az login" -ForegroundColor Red
    exit 1
}

# Get current subscription info
$SUBSCRIPTION_ID = az account show --query id -o tsv
$TENANT_ID = az account show --query tenantId -o tsv
Write-Host "✅ Using subscription: $SUBSCRIPTION_ID" -ForegroundColor Green
Write-Host "✅ Using tenant: $TENANT_ID" -ForegroundColor Green

# Create Resource Group
Write-Host "📦 Creating Resource Group: $RESOURCE_GROUP" -ForegroundColor Yellow
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create App Service Plan
Write-Host "🏗️ Creating App Service Plan: $APP_SERVICE_PLAN" -ForegroundColor Yellow
az appservice plan create --name $APP_SERVICE_PLAN --resource-group $RESOURCE_GROUP --location $LOCATION --sku B1 --is-linux

# Create Web App for SPA
Write-Host "🌐 Creating Web App for SPA: $WEB_APP_NAME" -ForegroundColor Yellow
az webapp create --name $WEB_APP_NAME --resource-group $RESOURCE_GROUP --plan $APP_SERVICE_PLAN --runtime "NODE:18-lts"

# Create Storage Account for Function App
Write-Host "💾 Creating Storage Account: $STORAGE_ACCOUNT" -ForegroundColor Yellow
az storage account create --name $STORAGE_ACCOUNT --resource-group $RESOURCE_GROUP --location $LOCATION --sku Standard_LRS

# Create Function App
Write-Host "⚡ Creating Function App: $FUNCTION_APP_NAME" -ForegroundColor Yellow
az functionapp create --name $FUNCTION_APP_NAME --resource-group $RESOURCE_GROUP --storage-account $STORAGE_ACCOUNT --runtime node --runtime-version 18 --functions-version 4 --os-type Linux

# Get App URLs
$WEB_APP_URL = "https://$WEB_APP_NAME.azurewebsites.net"
$FUNCTION_APP_URL = "https://$FUNCTION_APP_NAME.azurewebsites.net"

Write-Host "📋 Infrastructure created successfully!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host "SPA Web App: $WEB_APP_URL" -ForegroundColor Cyan
Write-Host "API Function App: $FUNCTION_APP_URL" -ForegroundColor Cyan
Write-Host "Resource Group: $RESOURCE_GROUP" -ForegroundColor Cyan
Write-Host ""

# Create App Registrations
Write-Host "🔐 Creating Azure AD App Registrations" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# Create SPA App Registration
Write-Host "Creating SPA App Registration: $SPA_CLIENT_ID_NAME" -ForegroundColor Yellow
$SPA_APP_REG = az ad app create --display-name $SPA_CLIENT_ID_NAME --spa-redirect-uris $WEB_APP_URL "http://localhost:3000" --query appId -o tsv
Write-Host "✅ SPA App Registration created: $SPA_APP_REG" -ForegroundColor Green

# Create API App Registration
Write-Host "Creating API App Registration: $API_CLIENT_ID_NAME" -ForegroundColor Yellow
$API_APP_REG = az ad app create --display-name $API_CLIENT_ID_NAME --identifier-uris "api://$API_APP_REG" --query appId -o tsv
Write-Host "✅ API App Registration created: $API_APP_REG" -ForegroundColor Green

# Configure Function App environment variables
Write-Host "⚙️ Configuring Function App environment variables" -ForegroundColor Yellow
az functionapp config appsettings set --name $FUNCTION_APP_NAME --resource-group $RESOURCE_GROUP --settings API_CLIENT_ID=$API_APP_REG TENANT_ID=$TENANT_ID TOKEN_ISSUER="https://login.microsoftonline.com/$TENANT_ID/v2.0" JWKS_URI="https://login.microsoftonline.com/$TENANT_ID/discovery/v2.0/keys"

# Enable CORS for Function App
Write-Host "🔧 Configuring CORS for Function App" -ForegroundColor Yellow
az functionapp cors add --name $FUNCTION_APP_NAME --resource-group $RESOURCE_GROUP --allowed-origins $WEB_APP_URL "http://localhost:3000"

Write-Host ""
Write-Host "🎉 Deployment Complete!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Configuration Summary:" -ForegroundColor Cyan
Write-Host "------------------------" -ForegroundColor Cyan
Write-Host "Resource Group: $RESOURCE_GROUP"
Write-Host "SPA Web App: $WEB_APP_URL"
Write-Host "API Function App: $FUNCTION_APP_URL"
Write-Host "SPA Client ID: $SPA_APP_REG"
Write-Host "API Client ID: $API_APP_REG"
Write-Host "Tenant ID: $TENANT_ID"
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Update spa/src/authConfig.js with the client IDs and tenant ID"
Write-Host "2. Deploy your SPA code to the Web App"
Write-Host "3. Deploy your Function App code"
Write-Host "4. Test the authentication flow"
Write-Host ""
Write-Host "🔧 Configuration Files to Update:" -ForegroundColor Yellow
Write-Host "- spa/src/authConfig.js: Replace YOUR_SPA_CLIENT_ID with $SPA_APP_REG"
Write-Host "- spa/src/authConfig.js: Replace YOUR_API_CLIENT_ID with $API_APP_REG"
Write-Host "- spa/src/authConfig.js: Replace YOUR_TENANT_ID with $TENANT_ID"
Write-Host ""

# Save configuration to file
$config = @{
    resourceGroup = $RESOURCE_GROUP
    location = $LOCATION
    spaWebApp = @{
        name = $WEB_APP_NAME
        url = $WEB_APP_URL
    }
    apiFunctionApp = @{
        name = $FUNCTION_APP_NAME
        url = $FUNCTION_APP_URL
    }
    appRegistrations = @{
        spa = @{
            clientId = $SPA_APP_REG
            name = $SPA_CLIENT_ID_NAME
        }
        api = @{
            clientId = $API_APP_REG
            name = $API_CLIENT_ID_NAME
        }
    }
    tenantId = $TENANT_ID
    subscriptionId = $SUBSCRIPTION_ID
}

$config | ConvertTo-Json -Depth 3 | Out-File -FilePath "infrastructure/deployment-config.json" -Encoding UTF8
Write-Host "💾 Configuration saved to: infrastructure/deployment-config.json" -ForegroundColor Green