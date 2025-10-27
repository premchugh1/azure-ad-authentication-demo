const { app } = require('@azure/functions');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const tenantId = process.env.TENANT_ID;
const clientId = process.env.API_CLIENT_ID;

// JWKS client to get signing keys from Azure AD
const client = jwksClient({
  jwksUri: `https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`,
  cache: true,
  cacheMaxAge: 86400000 // 24 hours
});

// Function to get the signing key
function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err);
      return;
    }
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

// Function to verify JWT token
function verifyToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, getKey, {
      audience: [clientId, `api://${clientId}`], // Accept both formats
      issuer: `https://login.microsoftonline.com/${tenantId}/v2.0`,
      algorithms: ['RS256']
    }, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
}

app.http('protected', {
  methods: ['GET', 'POST', 'OPTIONS'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    context.log('Protected endpoint called');

    // Handle preflight CORS requests
    if (request.method === 'OPTIONS') {
      return {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400'
        }
      };
    }

    try {
      // Get authorization header
      const authHeader = request.headers.get('authorization');
      
      if (!authHeader) {
        context.log('No authorization header found');
        return {
          status: 401,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          jsonBody: {
            error: 'No authorization header',
            message: 'Authorization header is required',
            hint: 'Include Authorization: Bearer <token> in your request headers'
          }
        };
      }

      // Extract token from Bearer scheme
      const parts = authHeader.split(' ');
      if (parts.length !== 2 || parts[0] !== 'Bearer') {
        context.log('Invalid authorization header format');
        return {
          status: 401,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          jsonBody: {
            error: 'Invalid authorization header',
            message: 'Authorization header must be in format: Bearer <token>'
          }
        };
      }

      const token = parts[1];
      context.log('Token received, attempting validation...');
      
      // Verify and decode the token
      const decoded = await verifyToken(token);
      context.log('Token validated successfully');
      context.log('User:', decoded.name || decoded.preferred_username);

      // Return success response with user information
      return {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        jsonBody: {
          message: 'Authentication successful! You have accessed a protected endpoint.',
          user: {
            name: decoded.name,
            email: decoded.preferred_username || decoded.upn,
            oid: decoded.oid,
            tid: decoded.tid
          },
          tokenInfo: {
            audience: decoded.aud,
            issuer: decoded.iss,
            scopes: decoded.scp || decoded.roles,
            expiresAt: new Date(decoded.exp * 1000).toISOString(),
            issuedAt: new Date(decoded.iat * 1000).toISOString()
          },
          timestamp: new Date().toISOString(),
          environment: {
            tenantId: tenantId,
            clientId: clientId
          }
        }
      };
      
    } catch (error) {
      context.log('Token validation failed:', error.message);
      
      // Provide detailed error information
      let errorMessage = 'Token validation failed';
      let errorDetails = error.message;

      if (error.name === 'TokenExpiredError') {
        errorMessage = 'Token has expired';
        errorDetails = 'Please log in again to get a new token';
      } else if (error.name === 'JsonWebTokenError') {
        errorMessage = 'Invalid token';
        errorDetails = 'The provided token is malformed or invalid';
      }

      return {
        status: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        jsonBody: {
          error: errorMessage,
          details: errorDetails,
          hint: 'Ensure you are using a valid access token from Azure AD',
          configuration: {
            expectedAudience: [clientId, `api://${clientId}`],
            expectedIssuer: `https://login.microsoftonline.com/${tenantId}/v2.0`
          }
        }
      };
    }
  }
});