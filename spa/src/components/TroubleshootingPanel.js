import React from 'react';

const TroubleshootingPanel = ({ apiError, accounts, accessToken }) => {
  const commonIssues = [
    {
      title: "401 Unauthorized Error",
      symptoms: "API returns 401 status code",
      solutions: [
        "Verify the token audience (aud) matches the API_CLIENT_ID",
        "Ensure the Authorization header is present with 'Bearer' prefix",
        "Check if the token has expired",
        "Confirm API_CLIENT_ID in backend matches CLIENT_ID in frontend",
      ],
      code: `// In authConfig.js, make sure:
export const apiRequest = {
  scopes: ["api://YOUR_CLIENT_ID/access_as_user"]
};`
    },
    {
      title: "CORS Error",
      symptoms: "Browser blocks request with CORS policy error",
      solutions: [
        "Add your SPA origin to Function App CORS settings",
        "Verify host.json has correct CORS configuration for local development",
        "Check if API endpoint is publicly accessible",
      ],
      code: `// Check your scopes in authConfig.js:
export const apiConfig = {
  baseUrl: "https://your-api.azurewebsites.net/api",
  protectedEndpoint: "/protected"
};`
    },
    {
      title: "AADSTS650052 Error",
      symptoms: "The app needs access to a service",
      solutions: [
        "Create service principal for your app registration",
        "Grant admin consent for API permissions",
        "Verify app registration has exposed API scope",
      ],
      code: `# Run in Azure CLI:
az ad sp create --id YOUR_CLIENT_ID
az ad app permission grant --id YOUR_CLIENT_ID --api YOUR_CLIENT_ID`
    },
    {
      title: "Token Expired",
      symptoms: "Authentication works initially but fails after some time",
      solution: "Implement token refresh logic using MSAL's acquireTokenSilent method. Tokens typically expire after 1 hour.",
      code: `// MSAL automatically refreshes tokens with acquireTokenSilent
const tokenResponse = await instance.acquireTokenSilent({
  ...apiRequest,
  account: accounts[0]
});`
    },
    {
      title: "Invalid Tenant",
      symptoms: "AADSTS90002: Tenant not found",
      solution: "Verify the tenant ID in your configuration matches your Azure AD tenant.",
      code: `// Check tenant ID in authConfig.js:
authority: "https://login.microsoftonline.com/YOUR_TENANT_ID"`
    },
    {
      title: "Invalid Client ID",
      symptoms: "AADSTS700016: Application not found",
      solution: "Verify the client ID in authConfig.js matches the Application (client) ID from your app registration in Azure portal.",
      code: `// In authConfig.js:
clientId: "YOUR_CLIENT_ID" // Must match Azure AD App Registration`
    }
  ];

  if (!apiError && accounts.length > 0 && accessToken) {
    return null; // Don't show troubleshooting if everything is working
  }

  return (
    <div className="section">
      <h2>🔧 Troubleshooting</h2>
      
      {apiError && (
        <div className="troubleshooting">
          <h3>Current Issue Detected</h3>
          <p><strong>Error Message:</strong> {apiError}</p>
          
          {apiError.includes('401') && (
            <div>
              <h4>Possible Causes:</h4>
              <ul>
                <li>Token audience mismatch - Check API_CLIENT_ID configuration</li>
                <li>Missing Authorization header</li>
                <li>Token expired or invalid</li>
                <li>Backend JWT validation failing</li>
              </ul>
              <h4>Quick Fixes:</h4>
              <div className="code-block">
                {`// 1. Verify authConfig.js:
export const apiRequest = {
  scopes: ["api://bd0701b9-be23-4127-8be8-cddaaf1353b8/access_as_user"]
};

// 2. Check api-test/local.settings.json:
{
  "API_CLIENT_ID": "bd0701b9-be23-4127-8be8-cddaaf1353b8",
  "TENANT_ID": "67833c88-ae70-47d5-9d4b-646556fc45ca"
}`}
              </div>
            </div>
          )}

          {apiError.toLowerCase().includes('cors') && (
            <div>
              <h4>CORS Configuration Required:</h4>
              <ul>
                <li>Add {window.location.origin} to Azure Function App CORS settings</li>
                <li>Verify host.json has CORS configuration</li>
                <li>Check browser console for detailed CORS error</li>
              </ul>
              <div className="code-block">
                {`// In api-test/host.json:
{
  "extensions": {
    "http": {
      "cors": {
        "allowedOrigins": ["${window.location.origin}"]
      }
    }
  }
}`}
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <h3>Common Issues & Solutions</h3>
        {commonIssues.map((issue, index) => (
          <details key={index} style={{ marginBottom: '15px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold', padding: '10px', background: '#f9fafb', borderRadius: '5px' }}>
              {issue.title}
            </summary>
            <div style={{ padding: '15px', background: '#ffffff', border: '1px solid #e5e7eb', borderTop: 'none', borderRadius: '0 0 5px 5px' }}>
              <p><strong>Symptoms:</strong> {issue.symptoms}</p>
              {issue.solutions && (
                <>
                  <strong>Solutions:</strong>
                  <ul>
                    {issue.solutions.map((solution, idx) => (
                      <li key={idx}>{solution}</li>
                    ))}
                  </ul>
                </>
              )}
              {issue.solution && <p><strong>Solution:</strong> {issue.solution}</p>}
              {issue.code && (
                <div className="code-block">
                  {issue.code}
                </div>
              )}
            </div>
          </details>
        ))}
      </div>

      <div style={{ marginTop: '20px', padding: '15px', background: '#eff6ff', borderRadius: '8px' }}>
        <h3>📚 Additional Resources</h3>
        <ul>
          <li><a href="https://jwt.io" target="_blank" rel="noopener noreferrer">JWT.io - Decode your access token</a></li>
          <li><a href="https://github.com/premchugh1/azure-ad-authentication-demo" target="_blank" rel="noopener noreferrer">GitHub Repository - Documentation</a></li>
          <li><a href="https://docs.microsoft.com/azure/active-directory/develop/v2-oauth2-auth-code-flow" target="_blank" rel="noopener noreferrer">Azure AD OAuth2 Documentation</a></li>
          <li>Use Azure portal's "Authentication" blade to test sign-in</li>
          <li>Check Azure Function logs for backend errors</li>
        </ul>
      </div>
    </div>
  );
};

export default TroubleshootingPanel;
