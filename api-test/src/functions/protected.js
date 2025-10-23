const { app } = require('@azure/functions');

app.http('protected', {
    methods: ['GET', 'POST', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log('Protected API endpoint called');
        
        // Handle preflight requests
        if (request.method === 'OPTIONS') {
            return {
                status: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: 'CORS preflight OK' })
            };
        }

        try {
            // Extract token from Authorization header
            const authHeader = request.headers.get('authorization');
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                context.log('No valid authorization header found');
                return {
                    status: 401,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        error: 'unauthorized',
                        message: 'No valid authorization header. Expected: Bearer <token>',
                        timestamp: new Date().toISOString()
                    })
                };
            }

            const token = authHeader.substring(7);
            context.log('Token extracted successfully');

            // For now, just decode the token without verification to test the flow
            // In production, you would verify the signature
            const tokenParts = token.split('.');
            if (tokenParts.length !== 3) {
                throw new Error('Invalid token format');
            }

            const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
            
            context.log('Token decoded successfully for user:', payload.preferred_username);

            // Successful response
            return {
                status: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: 'Protected API access successful! 🎉',
                    timestamp: new Date().toISOString(),
                    user: {
                        username: payload.preferred_username,
                        name: payload.name,
                        subject: payload.sub
                    },
                    tokenInfo: {
                        audience: payload.aud,
                        issuer: payload.iss,
                        scopes: payload.scp ? payload.scp.split(' ') : [],
                        issuedAt: new Date(payload.iat * 1000).toISOString(),
                        expiresAt: new Date(payload.exp * 1000).toISOString()
                    },
                    api: {
                        name: 'Azure AD Protected API',
                        version: '2.0.0 (Simplified)',
                        environment: process.env.AZURE_FUNCTIONS_ENVIRONMENT || 'local',
                        note: 'Token signature verification disabled for demo'
                    }
                })
            };

        } catch (error) {
            context.log('Token processing failed:', error);
            
            return {
                status: 401,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    error: 'token_processing_failed',
                    message: 'Failed to process token: ' + error.message,
                    timestamp: new Date().toISOString()
                })
            };
        }
    }
});