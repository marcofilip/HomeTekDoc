// server/feedback.js
const express = require('express');

module.exports = function (dbConnection) { // Funzione che accetta db
  const router = express.Router();

  // Rimosso: Creazione tabella feedback, va fatta in mock.js

  // Endpoint per inviare un feedback
  router.post("/feedback", (req, res) => {
    // Aggiungi assistenza_id al destructuring
    const { technician_id, rating, comment, assistenza_id } = req.body;
    const customer_id = req.session?.user?.id; // Usa optional chaining

    if (!customer_id) {
      return res.status(401).json({ error: "Autenticazione richiesta" });
    }
    // Aggiungi controllo per assistenza_id
    if (!technician_id || !rating || !assistenza_id) {
      return res.status(400).json({ error: "Technician ID, rating e ID assistenza sono obbligatori" });
    }
    if (isNaN(Number(assistenza_id))) {
         return res.status(400).json({ error: "ID assistenza non valido" });
    }

    // Validazione aggiuntiva per rating
    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
         return res.status(400).json({ error: "Rating deve essere un numero tra 1 e 5" });
    }

    // Query aggiornata per includere assistenza_id
    const query = `
      INSERT INTO feedback (technician_id, customer_id, rating, comment, assistenza_id)
      VALUES (?, ?, ?, ?, ?)
    `;
    // Parametri aggiornati
    dbConnection.run(query, [technician_id, customer_id, numRating, comment || '', Number(assistenza_id)], function(err) {
      if (err) {
        console.error("Errore nell'inserimento del feedback:", err);
        if (err.message.includes("FOREIGN KEY constraint failed")) {
            // Può fallire per technician_id, customer_id o assistenza_id non validi
            return res.status(400).json({ error: "ID Tecnico, Cliente o Assistenza non validi." });
        }
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

    // Query per recuperare anche il nome del cliente e il titolo assistenza
    const query = `
      SELECT f.id, f.technician_id, f.customer_id, f.rating, f.comment, f.timestamp,
             u.nome as customer_name,
             a.title as assistenza_title -- Aggiunto titolo assistenza
      FROM feedback f
      JOIN auth_users u ON f.customer_id = u.id
      LEFT JOIN assistenza a ON f.assistenza_id = a.id -- LEFT JOIN nel caso assistenza_id sia NULL
      WHERE f.technician_id = ?
      ORDER BY f.timestamp DESC
    `;
    dbConnection.all(query, [technicianId], (err, rows) => {
      if (err) {
        console.error("Errore nel recupero dei feedback:", err);
        return res.status(500).json({ error: err.message });
      }
      // Mappa anche il titolo assistenza se presente
      const feedbackList = rows.map(row => ({
            ...row,
            assistenza_title: row.assistenza_title || 'N/A'
      }));
      res.json({ feedback: feedbackList });
    });
  });

  return router; // Restituisci il router configurato
};