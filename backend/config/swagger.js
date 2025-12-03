const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'PrintVik BOS API',
            version: '1.0.0',
            description: 'Backend API documentation for PrintVik Business Operating System',
            contact: {
                name: 'PrintVik Support',
                email: 'support@printvik.com',
            },
        },
        servers: [
            {
                url: 'http://localhost:5001',
                description: 'Development Server',
            },
            {
                url: 'http://localhost:5000',
                description: 'Fallback Server',
            },
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                BearerAuth: [],
            },
        ],
    },
    apis: ['./routes/*.js', './controllers/*.js', './controllers/admin/*.js'], // Files containing annotations
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
