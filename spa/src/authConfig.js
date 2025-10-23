// MSAL Configuration
// Replace these values with your actual Azure AD app registration details

export const msalConfig = {
  auth: {
    clientId: "bd0701b9-be23-4127-8be8-cddaaf1353b8", // SPA app registration client ID
    authority: "https://login.microsoftonline.com/67833c88-ae70-47d5-9d4b-646556fc45ca", // Tenant ID
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case 0: // LogLevel.Error
            console.error(message);
            break;
          case 1: // LogLevel.Warning
            console.warn(message);
            break;
          case 2: // LogLevel.Info
            console.info(message);
            break;
          case 3: // LogLevel.Verbose
            console.debug(message);
            break;
        }
      },
    },
  },
};

// Add scopes here for your API
export const loginRequest = {
  scopes: ["openid", "profile", "User.Read", "api://bd0701b9-be23-4127-8be8-cddaaf1353b8/access_as_user"], // Single app reg scope
};

export const apiRequest = {
  scopes: ["api://bd0701b9-be23-4127-8be8-cddaaf1353b8/access_as_user"], // Single app reg scope
  account: null,
};

// API Configuration
export const apiConfig = {
  baseUrl: "https://api-aad-auth-prchugh-2086596099.azurewebsites.net/api", // Azure Function API - NOW WORKING!
  protectedEndpoint: "/protected",
};