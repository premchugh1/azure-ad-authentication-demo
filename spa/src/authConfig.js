// MSAL Configuration for Azure AD Authentication
// This file contains the configuration for Microsoft Authentication Library (MSAL)

export const msalConfig = {
  auth: {
    clientId: "bd0701b9-be23-4127-8be8-cddaaf1353b8", // Your App Registration Client ID
    authority: "https://login.microsoftonline.com/67833c88-ae70-47d5-9d4b-646556fc45ca", // Your Tenant ID
    redirectUri: window.location.origin, // Redirect URI after authentication
    postLogoutRedirectUri: window.location.origin, // Redirect URI after logout
  },
  cache: {
    cacheLocation: "sessionStorage", // Store cache in session storage
    storeAuthStateInCookie: false, // Set to true for IE11 or Edge
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case "Error":
            console.error(message);
            return;
          case "Info":
            console.info(message);
            return;
          case "Verbose":
            console.debug(message);
            return;
          case "Warning":
            console.warn(message);
            return;
        }
      },
    },
  },
};

// Login request configuration
export const loginRequest = {
  scopes: ["openid", "profile", "email"], // Default scopes for user authentication
};

// API request configuration for protected API calls
// Using single app registration pattern - same client ID for both SPA and API
export const apiRequest = {
  scopes: ["api://bd0701b9-be23-4127-8be8-cddaaf1353b8/access_as_user"], // API scope
};

// API configuration
export const apiConfig = {
  baseUrl: process.env.REACT_APP_API_BASE_URL || "https://api-aad-auth-prchugh-2086596099.azurewebsites.net/api",
  protectedEndpoint: "/protected",
  testEndpoint: "/test",
};
