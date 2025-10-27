import React, { useState } from 'react';
import { apiConfig } from '../authConfig';

const ApiTest = ({ isAuthenticated, onCallApi, apiResponse, apiError, accessToken }) => {
  const [showToken, setShowToken] = useState(false);

  const decodeJWT = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      return null;
    }
  };

  const tokenPayload = accessToken ? decodeJWT(accessToken) : null;

  return (
    <div className="section">
      <h2>API Test</h2>
      
      {!isAuthenticated ? (
        <p className="warning">⚠️ Please login first to test the API</p>
      ) : (
        <>
          <p>Click the button below to call the protected API endpoint:</p>
          <button onClick={onCallApi} className="btn btn-success">
            Call Protected API
          </button>
          
          {accessToken && (
            <div style={{ marginTop: '20px' }}>
              <button 
                onClick={() => setShowToken(!showToken)} 
                className="btn btn-secondary"
              >
                {showToken ? 'Hide' : 'Show'} Access Token
              </button>
              
              {showToken && (
                <div className="token-display">
                  <h4>Access Token:</h4>
                  <p style={{ fontSize: '0.75em', wordBreak: 'break-all' }}>
                    {accessToken}
                  </p>
                  
                  {tokenPayload && (
                    <>
                      <h4 style={{ marginTop: '15px' }}>Token Claims:</h4>
                      <pre style={{ textAlign: 'left', fontSize: '0.85em' }}>
                        {JSON.stringify(tokenPayload, null, 2)}
                      </pre>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {apiResponse && (
            <div className="api-response">
              <h3>✅ API Response (Success)</h3>
              <pre style={{ textAlign: 'left', fontSize: '0.9em' }}>
                {JSON.stringify(apiResponse, null, 2)}
              </pre>
            </div>
          )}

          {apiError && (
            <div className="api-error">
              <h3>❌ API Error</h3>
              <p><strong>Error:</strong> {apiError}</p>
              <p><strong>Endpoint:</strong> {`${apiConfig.baseUrl}${apiConfig.protectedEndpoint}`}</p>
              <p className="muted">Check the troubleshooting section below for solutions</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ApiTest;
