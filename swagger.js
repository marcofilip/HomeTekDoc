// swagger.js (nella root del progetto)
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'HomeTekDoc API', // Titolo aggiornato
            version: '1.0.0',
            description: 'API Documentation for HomeTekDoc application' // Descrizione aggiornata
        },
        servers: [
            {
                url: 'http://localhost:3000', // Assicurati corrisponda alla porta del backend
                description: 'Development server'
            }
            // Aggiungi altri server se necessario (es. produzione)
        ],
        // Aggiungi la definizione dei componenti di sicurezza se usi JWT o altro
        // components: {
        //   securitySchemes: {
        //     bearerAuth: {
        //       type: 'http',
        //       scheme: 'bearer',
        //       bearerFormat: 'JWT',
        //     }
        //   }
        // },
        // security: [{
        //   bearerAuth: []
        // }]
    },
    // --- INIZIO MODIFICA ---
    // Aggiorna l'array 'apis' per includere i file corretti
    apis: [
        path.join(__dirname, 'server/server.js'),     // Percorso per le route definite in server.js
        path.join(__dirname, 'server/feedback.js'),   // Percorso per le route definite in feedback.js
        path.join(__dirname, 'routes/*.js')        // Mantiene il percorso per eventuali route in /routes
    ],
    // --- FINE MODIFICA ---
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
};