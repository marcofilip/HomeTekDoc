// swagger.js (nella root del progetto)
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const path = require("path");

const swaggerOptions = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info: {
            title: "HomeTekDoc API", // Titolo aggiornato
            version: "1.0.0",
            description: "API Documentation for HomeTekDoc application", // Descrizione aggiornata
        },
        servers: [
            {
                url: "http://localhost:3000", // Assicurati corrisponda alla porta del backend
                description: "Development server",
            },
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
        path.join(__dirname, "server.js"), // Points to /app/server.js
        path.join(__dirname, "feedback.js"), // Points to /app/feedback.js
        path.join(__dirname, "routes", "*.js"), // Points to /app/routes/*.js
    ],
    // --- FINE MODIFICA ---
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = (app) => {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
};
