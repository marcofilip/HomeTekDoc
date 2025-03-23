const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const dbPath = path.join(__dirname, "database.db");

// Initialize database connection
let db = new sqlite3.Database(dbPath, (err) => {
  if (err) return console.error("Technician database connection error:", err.message);
  console.log("Connected to technician database at:", dbPath);

  // Create the technicians table if it doesn't exist
  db.run(
    `CREATE TABLE IF NOT EXISTS technicians (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      auth_user_id INTEGER,
      specializzazione TEXT NOT NULL,
      esperienza_anni INTEGER,
      tariffa_oraria REAL,
      disponibilita TEXT,
      note TEXT,
      FOREIGN KEY (auth_user_id) REFERENCES auth_users(id) ON DELETE CASCADE
    )`,
    (err) => {
      if (err) {
        console.error("Error creating technicians table:", err);
      } else {
        console.log("Technicians table is ready");
      }
    }
  );
});

// Create a new technician profile
const createTechnician = (technicianData, callback) => {
  const {
    auth_user_id,
    specializzazione,
    esperienza_anni,
    tariffa_oraria,
    disponibilita,
    note
  } = technicianData;

  const query = `
    INSERT INTO technicians 
    (auth_user_id, specializzazione, esperienza_anni, tariffa_oraria, disponibilita, note)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(
    query,
    [auth_user_id, specializzazione, esperienza_anni, tariffa_oraria, disponibilita, note],
    function(err) {
      callback(err, this.lastID);
    }
  );
};

// Get all technicians with their user info
const getAllTechnicians = (callback) => {
  const query = `
    SELECT t.*, u.nome, u.email, u.citta, u.indirizzo 
    FROM technicians t
    JOIN auth_users u ON t.auth_user_id = u.id
  `;
  
  db.all(query, [], callback);
};

// Get technicians filtered by specialization
const getTechniciansBySpecialization = (specializzazione, callback) => {
  const query = `
    SELECT t.*, u.nome, u.email, u.citta, u.indirizzo 
    FROM technicians t
    JOIN auth_users u ON t.auth_user_id = u.id
    WHERE t.specializzazione LIKE ?
  `;
  
  db.all(query, [`%${specializzazione}%`], callback);
};

// Get a single technician by ID
const getTechnicianById = (id, callback) => {
  const query = `
    SELECT t.*, u.nome, u.email, u.citta, u.indirizzo 
    FROM technicians t
    JOIN auth_users u ON t.auth_user_id = u.id
    WHERE t.id = ?
  `;
  
  db.get(query, [id], callback);
};

// Update a technician
const updateTechnician = (id, technicianData, callback) => {
  const {
    specializzazione,
    esperienza_anni,
    tariffa_oraria,
    disponibilita,
    note
  } = technicianData;

  const query = `
    UPDATE technicians 
    SET specializzazione = ?, esperienza_anni = ?, tariffa_oraria = ?, disponibilita = ?, note = ?
    WHERE id = ?
  `;

  db.run(
    query,
    [specializzazione, esperienza_anni, tariffa_oraria, disponibilita, note, id],
    function(err) {
      callback(err, this.changes);
    }
  );
};

// Delete a technician
const deleteTechnician = (id, callback) => {
  const query = `DELETE FROM technicians WHERE id = ?`;
  
  db.run(query, [id], function(err) {
    callback(err, this.changes);
  });
};

module.exports = {
  createTechnician,
  getAllTechnicians,
  getTechniciansBySpecialization,
  getTechnicianById,
  updateTechnician,
  deleteTechnician
};
