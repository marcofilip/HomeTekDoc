// server/feedback.js
const express = require('express');

module.exports = function (dbConnection) { // Funzione che accetta db
  const router = express.Router();

  // Rimosso: Creazione tabella feedback, va fatta in mock.js

  // Endpoint per inviare un feedback
  router.post("/feedback", (req, res) => {
    const { technician_id, rating, comment } = req.body;
    const customer_id = req.session && req.session.user ? req.session.user.id : null; // Assicurati che auth middleware sia usato prima di questo router in server.js

    if (!customer_id) {
      return res.status(401).json({ error: "Autenticazione richiesta" });
    }
    if (!technician_id || !rating) {
      return res.status(400).json({ error: "Technician ID e rating sono obbligatori" });
    }

    // Validazione aggiuntiva per rating
    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
         return res.status(400).json({ error: "Rating deve essere un numero tra 1 e 5" });
    }

    const query = `
      INSERT INTO feedback (technician_id, customer_id, rating, comment)
      VALUES (?, ?, ?, ?)
    `;
    dbConnection.run(query, [technician_id, customer_id, numRating, comment || ''], function(err) { // Usa dbConnection
      if (err) {
        console.error("Errore nell'inserimento del feedback:", err);
        // Potrebbe fallire per FOREIGN KEY constraint se technician_id o customer_id non validi
        return res.status(500).json({ error: "Impossibile salvare il feedback: " + err.message });
      }
      res.status(201).json({ message: "Feedback inviato con successo", feedbackId: this.lastID });
    });
  });

  // Endpoint per ottenere i feedback per un tecnico
  router.get("/feedback/:technicianId", (req, res) => {
    const technicianId = req.params.technicianId;
    // Validazione ID
     if (!technicianId || isNaN(Number(technicianId))) {
         return res.status(400).json({ error: "Technician ID non valido" });
     }

    // Query per recuperare anche il nome del cliente
    const query = `
      SELECT f.id, f.technician_id, f.customer_id, f.rating, f.comment, f.timestamp, u.nome as customer_name
      FROM feedback f
      JOIN auth_users u ON f.customer_id = u.id
      WHERE f.technician_id = ?
      ORDER BY f.timestamp DESC
    `;
    dbConnection.all(query, [technicianId], (err, rows) => { // Usa dbConnection
      if (err) {
        console.error("Errore nel recupero dei feedback:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ feedback: rows });
    });
  });

  return router; // Restituisci il router configurato
};