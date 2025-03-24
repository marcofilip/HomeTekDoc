const express = require('express');
const router = express.Router();

// Assumiamo che "db" sia lo stesso oggetto sqlite3 in uso
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const dbPath = path.join(__dirname, "database.db");
const db = new sqlite3.Database(dbPath);

// Creazione della tabella feedback (se non esiste)
db.run(`
  CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    technician_id INTEGER NOT NULL,
    customer_id INTEGER NOT NULL,
    rating INTEGER CHECK(rating BETWEEN 1 AND 5) NOT NULL,
    comment TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (technician_id) REFERENCES technicians(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES auth_users(id) ON DELETE CASCADE
  )
`, (err) => {
  if (err) {
    console.error("Errore nella creazione della tabella feedback:", err);
  } else {
    console.log("Tabella feedback pronta");
  }
});

// Endpoint per inviare un feedback
router.post("/feedback", (req, res) => {
  const { technician_id, rating, comment } = req.body;
  // Assumiamo che il customer_id sia presente nella sessione (cliente autenticato)
  const customer_id = req.session && req.session.user ? req.session.user.id : null;
  if (!customer_id) {
    return res.status(401).json({ error: "Autenticazione richiesta" });
  }
  if (!technician_id || !rating) {
    return res.status(400).json({ error: "Technician ID e rating sono obbligatori" });
  }
  
  const query = `
    INSERT INTO feedback (technician_id, customer_id, rating, comment)
    VALUES (?, ?, ?, ?)
  `;
  db.run(query, [technician_id, customer_id, rating, comment || ''], function(err) {
    if (err) {
      console.error("Errore nell'inserimento del feedback:", err);
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: "Feedback inviato con successo", feedbackId: this.lastID });
  });
});

// Endpoint per ottenere i feedback per un tecnico
router.get("/feedback/:technicianId", (req, res) => {
  const technicianId = req.params.technicianId;
  const query = `
    SELECT id, technician_id, customer_id, rating, comment, timestamp
    FROM feedback
    WHERE technician_id = ?
    ORDER BY timestamp DESC
  `;
  db.all(query, [technicianId], (err, rows) => {
    if (err) {
      console.error("Errore nel recupero dei feedback:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ feedback: rows });
  });
});

module.exports = router;