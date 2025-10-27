import React, { useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { loginRequest, apiRequest, apiConfig } from './authConfig';
import AuthFlowDiagram from './components/AuthFlowDiagram';
import ApiTest from './components/ApiTest';
import TroubleshootingPanel from './components/TroubleshootingPanel';
import './App.css';

function App() {
  const { instance, accounts, inProgress } = useMsal();
  const [apiResponse, setApiResponse] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [currentStep, setCurrentStep] = useState('initial');
  const [activityLog, setActivityLog] = useState([]);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setActivityLog(prev => [...prev, { timestamp, message, type }]);
  };

  const handleLogin = async () => {
    try {
      setCurrentStep('login-initiated');
      addLog('Login initiated - Opening Azure AD popup...', 'info');
      
      const response = await instance.loginPopup(loginRequest);
      
      setCurrentStep('login-completed');
      addLog(`Login successful! Welcome ${response.account.name}`, 'success');
      
      setCurrentStep('token-acquisition');
      addLog('Acquiring access token...', 'info');
      
      const tokenResponse = await instance.acquireTokenSilent({
        ...apiRequest,
        account: response.account,
      });
      
      setAccessToken(tokenResponse.accessToken);
      setCurrentStep('token-acquired');
      addLog('Access token acquired successfully', 'success');
      
    } catch (error) {
      console.error('Login error:', error);
      setCurrentStep('login-failed');
      addLog(`Login failed: ${error.message}`, 'error');
      setApiError(error.message);
    }
  };

  const handleLogout = () => {
    instance.logoutPopup();
    setApiResponse(null);
    setAccessToken(null);
    setApiError(null);
    setCurrentStep('initial');
    addLog('Logged out successfully', 'info');
  };

  const callProtectedApi = async () => {
    if (accounts.length === 0) {
      addLog('Please login first', 'warning');
      return;
    }

    try {
      setCurrentStep('api-call');
      addLog('Calling protected API...', 'info');
      setApiError(null);

      const tokenResponse = await instance.acquireTokenSilent({
        ...apiRequest,
        account: accounts[0],
      });

      setAccessToken(tokenResponse.accessToken);
      addLog('Token acquired, sending request...', 'info');

      const response = await fetch(
        `${apiConfig.baseUrl}${apiConfig.protectedEndpoint}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${tokenResponse.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setApiResponse(data);
      setCurrentStep('api-success');
      addLog('API call successful!', 'success');
      
    } catch (error) {
      console.error('API call error:', error);
      setApiError(error.message);
      setCurrentStep('api-failed');
      addLog(`API call failed: ${error.message}`, 'error');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Azure AD Authentication Test</h1>
        <p>This application demonstrates the complete Azure AD authentication flow using MSAL.js</p>
      </header>

      {/* Authentication Status */}
      <div className="section">
        <h2>Authentication Status</h2>
        {accounts.length > 0 ? (
          <div className="user-info">
            <p className="success">✅ Authenticated</p>
            <p><strong>User:</strong> {accounts[0].name}</p>
            <p><strong>Email:</strong> {accounts[0].username}</p>
            <button onClick={handleLogout} className="btn btn-secondary">
              Logout
            </button>
          </div>
        ) : (
          <div>
            <p className="warning">⚠️ Not authenticated</p>
            <button 
              onClick={handleLogin} 
              disabled={inProgress !== 'none'}
              className="btn btn-primary"
            >
              {inProgress !== 'none' ? 'Loading...' : 'Login with Azure AD'}
            </button>
          </div>
        )}
      </div>

      {/* Authentication Flow Diagram */}
      <AuthFlowDiagram currentStep={currentStep} />

      {/* API Test Section */}
      <ApiTest 
        isAuthenticated={accounts.length > 0}
        onCallApi={callProtectedApi}
        apiResponse={apiResponse}
        apiError={apiError}
        accessToken={accessToken}
      />

      {/* Activity Log */}
      <div className="section">
        <h2>Activity Log</h2>
        <div className="activity-log">
          {activityLog.length === 0 ? (
            <p className="muted">No activity yet...</p>
          ) : (
            activityLog.map((log, index) => (
              <div key={index} className={`log-entry log-${log.type}`}>
                <span className="timestamp">[{log.timestamp}]</span> {log.message}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Troubleshooting Panel */}
      <TroubleshootingPanel 
        apiError={apiError}
        accounts={accounts}
        accessToken={accessToken}
      />

      <footer className="App-footer">
        <p>Azure AD Authentication Demo - Single App Registration Pattern</p>
        <p className="muted">
          Production endpoints: 
          <a href="https://spa-aad-auth-prchugh-95597944.azurewebsites.net" target="_blank" rel="noopener noreferrer"> SPA</a> | 
          <a href="https://api-aad-auth-prchugh-2086596099.azurewebsites.net/api/protected" target="_blank" rel="noopener noreferrer"> API</a>
        </p>
      </footer>
    </div>
  );
}

export default App;
