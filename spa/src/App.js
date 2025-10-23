import React, { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { loginRequest, apiRequest, apiConfig } from './authConfig';

function App() {
  const { instance, accounts, inProgress } = useMsal();
  const [accessToken, setAccessToken] = useState(null);
  const [currentStep, setCurrentStep] = useState('initial');
  const [logs, setLogs] = useState([]);
  const [apiResponse, setApiResponse] = useState(null);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toISOString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
  };

  useEffect(() => {
    addLog('Application initialized', 'info');
    if (accounts.length > 0) {
      setCurrentStep('authenticated');
      addLog(`User already authenticated: ${accounts[0].username}`, 'success');
    }
  }, [accounts]);

  const handleLogin = async () => {
    try {
      setCurrentStep('login-initiated');
      addLog('Login initiated...', 'info');
      
      const loginResponse = await instance.loginPopup(loginRequest);
      
      setCurrentStep('login-completed');
      addLog(`Login successful for user: ${loginResponse.account.username}`, 'success');
      
      // Get tokens
      await acquireTokens(loginResponse.account);
      
    } catch (error) {
      addLog(`Login failed: ${error.message}`, 'error');
      setCurrentStep('login-failed');
      console.error(error);
    }
  };

  const acquireTokens = async (account) => {
    try {
      setCurrentStep('token-acquisition');
      addLog('Acquiring access token...', 'info');
      
      const tokenRequest = {
        ...apiRequest,
        account: account || accounts[0],
      };
      
      const tokenResponse = await instance.acquireTokenSilent(tokenRequest);
      setAccessToken(tokenResponse.accessToken);
      
      setCurrentStep('token-acquired');
      addLog('Tokens acquired successfully', 'success');
      
    } catch (error) {
      addLog(`Token acquisition failed: ${error.message}`, 'error');
      
      if (error.name === 'InteractionRequiredAuthError') {
        try {
          const tokenResponse = await instance.acquireTokenPopup(apiRequest);
          setAccessToken(tokenResponse.accessToken);
          setCurrentStep('token-acquired');
          addLog('Tokens acquired via popup', 'success');
        } catch (popupError) {
          addLog(`Popup token acquisition failed: ${popupError.message}`, 'error');
        }
      }
    }
  };

  const callApi = async () => {
    if (!accessToken) return;

    try {
      setCurrentStep('api-call-initiated');
      addLog('Making API call...', 'info');

      const response = await fetch(`${apiConfig.baseUrl}${apiConfig.protectedEndpoint}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setApiResponse(data);
        setCurrentStep('api-response');
        addLog('API call successful!', 'success');
      } else {
        throw new Error(`API call failed: ${response.status}`);
      }
    } catch (error) {
      addLog(`API call failed: ${error.message}`, 'error');
    }
  };

  const handleLogout = () => {
    instance.logoutPopup();
    setAccessToken(null);
    setApiResponse(null);
    setCurrentStep('initial');
    addLog('User logged out', 'info');
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🔐 Azure AD Authentication Test</h1>
      <p>This application demonstrates the complete Azure AD authentication flow using MSAL.js</p>
      
      {/* Authentication Status */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h2>Authentication Status</h2>
        {accounts.length > 0 ? (
          <div>
            <span style={{ color: 'green' }}>✅</span>
            <strong> Authenticated as:</strong> {accounts[0].username}
            <br />
            <button onClick={handleLogout} style={{ marginTop: '10px', padding: '8px 16px' }}>
              Logout
            </button>
          </div>
        ) : (
          <div>
            <span style={{ color: 'red' }}>❌</span>
            <strong> Not authenticated</strong>
            <br />
            <button 
              onClick={handleLogin} 
              disabled={inProgress !== 'none'}
              style={{ marginTop: '10px', padding: '8px 16px', backgroundColor: '#0078d4', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              {inProgress !== 'none' ? 'Logging in...' : 'Login with Azure AD'}
            </button>
          </div>
        )}
      </div>

      {/* Authentication Flow */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
        <h2>Authentication Flow Status</h2>
        <div>Current Step: <strong>{currentStep.replace('-', ' ').toUpperCase()}</strong></div>
        <div style={{ margin: '10px 0' }}>
          {['initial', 'login-initiated', 'login-completed', 'token-acquisition', 'token-acquired', 'api-call-initiated', 'api-response'].map(step => (
            <span 
              key={step}
              style={{ 
                display: 'inline-block',
                margin: '2px',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                backgroundColor: currentStep === step ? '#ffc107' : 
                                 ['initial', 'login-initiated', 'login-completed', 'token-acquisition', 'token-acquired', 'api-call-initiated', 'api-response'].indexOf(currentStep) > 
                                 ['initial', 'login-initiated', 'login-completed', 'token-acquisition', 'token-acquired', 'api-call-initiated', 'api-response'].indexOf(step) ? '#28a745' : '#e9ecef',
                color: currentStep === step ? 'black' : 
                       ['initial', 'login-initiated', 'login-completed', 'token-acquisition', 'token-acquired', 'api-call-initiated', 'api-response'].indexOf(currentStep) > 
                       ['initial', 'login-initiated', 'login-completed', 'token-acquisition', 'token-acquired', 'api-call-initiated', 'api-response'].indexOf(step) ? 'white' : 'black'
              }}
            >
              {step.replace('-', ' ')}
            </span>
          ))}
        </div>
      </div>

      {/* Token Display */}
      {accessToken && (
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '8px' }}>
          <h2>Access Token</h2>
          <div style={{ 
            backgroundColor: '#f8f9fa',
            padding: '10px',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '12px',
            wordBreak: 'break-all',
            maxHeight: '150px',
            overflow: 'auto'
          }}>
            {accessToken}
          </div>
          <button 
            onClick={callApi}
            style={{ 
              marginTop: '10px', 
              padding: '8px 16px', 
              backgroundColor: '#28a745', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px' 
            }}
          >
            Call Protected API
          </button>
        </div>
      )}

      {/* API Response */}
      {apiResponse && (
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#d4edda', borderRadius: '8px' }}>
          <h2>API Response</h2>
          <pre style={{ backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
            {JSON.stringify(apiResponse, null, 2)}
          </pre>
        </div>
      )}

      {/* Activity Log */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h2>Activity Log</h2>
        <div style={{ maxHeight: '200px', overflow: 'auto', border: '1px solid #ddd', borderRadius: '4px' }}>
          {logs.map((log, index) => (
            <div 
              key={index} 
              style={{ 
                padding: '4px 8px', 
                borderBottom: '1px solid #eee',
                backgroundColor: log.type === 'error' ? '#ffe6e6' : 
                                log.type === 'success' ? '#e6ffe6' : 
                                log.type === 'warning' ? '#fff3e0' : 'white',
                fontSize: '12px'
              }}
            >
              <strong>[{new Date(log.timestamp).toLocaleTimeString()}]</strong> {log.message}
            </div>
          ))}
        </div>
      </div>

      {/* Troubleshooting */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#ffebee', borderRadius: '8px' }}>
        <h2>🔧 Quick Troubleshooting</h2>
        <ul style={{ fontSize: '14px' }}>
          <li><strong>Login fails:</strong> Check that your app registration redirect URIs include this domain</li>
          <li><strong>Token acquisition fails:</strong> Verify API permissions are granted and consented</li>
          <li><strong>API call fails:</strong> Currently configured for localhost:7071 - start local Function App</li>
          <li><strong>401 errors:</strong> Check that API client ID matches token audience</li>
          <li><strong>AADSTS650052 error:</strong> API app registration needs a service principal - run: <code>az ad sp create --id [API_CLIENT_ID]</code></li>
          <li><strong>Admin consent required:</strong> Grant permissions with: <code>az ad app permission admin-consent --id [SPA_CLIENT_ID]</code></li>
          <li><strong>CORS errors:</strong> ✅ Fixed - Azure Function App CORS is configured</li>
        </ul>
      </div>
    </div>
  );
}

export default App;