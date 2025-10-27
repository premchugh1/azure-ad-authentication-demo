import React from 'react';

const AuthFlowDiagram = ({ currentStep }) => {
  const steps = [
    { id: 'initial', icon: '🔄', title: 'Initial State', description: 'Application loaded, ready for authentication' },
    { id: 'login-initiated', icon: '🔑', title: 'Login Initiated', description: 'Redirecting to Azure AD for authentication' },
    { id: 'login-completed', icon: '✅', title: 'Login Completed', description: 'User authenticated successfully' },
    { id: 'token-acquisition', icon: '🎟️', title: 'Token Acquisition', description: 'Acquiring access token for API calls' },
    { id: 'token-acquired', icon: '🎯', title: 'Token Acquired', description: 'Access token received and stored' },
    { id: 'api-call', icon: '🌐', title: 'API Call', description: 'Calling protected API with bearer token' },
    { id: 'api-success', icon: '✨', title: 'Success', description: 'API call completed successfully' },
    { id: 'api-failed', icon: '❌', title: 'API Failed', description: 'API call failed - check logs' },
    { id: 'login-failed', icon: '❌', title: 'Login Failed', description: 'Authentication failed' },
  ];

  const getStepClass = (stepId) => {
    if (stepId === currentStep) return 'flow-step active';
    
    const stepIndex = steps.findIndex(s => s.id === stepId);
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    
    if (stepId.includes('failed')) {
      return stepId === currentStep ? 'flow-step failed' : 'flow-step';
    }
    
    if (currentIndex > stepIndex) {
      return 'flow-step completed';
    }
    
    return 'flow-step';
  };

  return (
    <div className="section">
      <h2>Authentication Flow Sequence</h2>
      <p>Real-time visualization of the Azure AD authentication process:</p>
      <div className="flow-diagram">
        {steps.map(step => (
          <div key={step.id} className={getStepClass(step.id)}>
            <div className="step-icon">{step.icon}</div>
            <div className="step-content">
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuthFlowDiagram;
