const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const dbPath = path.join(__dirname, "database.db");
const NodeGeocoder = require("node-geocoder");

// Configure geocoder with Nominatim
const geocoder = NodeGeocoder({
  provider: "openstreetmap",
  httpAdapter: "https",
});

// Initialize database connection
let db = new sqlite3.Database(dbPath, (err) => {
  if (err)
    return console.error("Technician database connection error:", err.message);
  console.log("Connected to technician database at:", dbPath);

  // Create the technicians table if it doesn't exist
  db.run(
    `CREATE TABLE IF NOT EXISTS technicians (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      auth_user_id INTEGER,
      specializzazione TEXT NOT NULL CHECK(length(specializzazione) <= 250),
      esperienza_anni INTEGER CHECK(esperienza_anni >= 0 AND esperienza_anni < 50),
      tariffa_oraria REAL CHECK(tariffa_oraria >= 0 AND tariffa_oraria < 1000000),
      disponibilita TEXT CHECK(length(disponibilita) <= 250),
      note TEXT CHECK(length(note) <= 500),
      certificazioni TEXT,            -- Nuovo campo opzionale
      foto TEXT,                      -- Nuovo campo opzionale: URL o percorso della foto
      latitudine REAL,                -- verrà impostato dal geocoder
      longitudine REAL,               -- verrà impostato dal geocoder
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

// Modify getindirizzoUtente to accept a dbConnection:
const getindirizzoUtente = (dbConnection, auth_user_id, callback) => {
  const query = `SELECT citta, indirizzo FROM auth_users WHERE id = ?`;
  dbConnection.get(query, [auth_user_id], (err, row) => {
    if (err) return callback(err);
    if (!row) return callback(new Error("Utente non trovato"));
    const indirizzoCompleto = `${row.indirizzo}, ${row.citta}`;
    callback(null, indirizzoCompleto);
  });
};

// Update createTechnician to accept the db connection as first argument:
const createTechnician = (dbConnection, technicianData, callback) => {
  const {
    auth_user_id,
    specializzazione,
    esperienza_anni,
    tariffa_oraria,
    disponibilita,
    note,
  } = technicianData;

  getindirizzoUtente(dbConnection, auth_user_id, (err, indirizzoCompleto) => {
    if (err) return callback(err);

    geocoder
      .geocode(indirizzoCompleto)
      .then((res) => {
        let latitudine = null;
        let longitudine = null;
        if (res && res.length > 0) {
          latitudine = res[0].latitude;
          longitudine = res[0].longitude;
        } else {
          console.warn("Geocoding fallito per indirizzo:", indirizzoCompleto);
        }
        const query = `
          INSERT INTO technicians 
            (auth_user_id, specializzazione, esperienza_anni, tariffa_oraria, disponibilita, note, certificazioni, foto, latitudine, longitudine)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        dbConnection.run(
          query,
          [
            auth_user_id,
            specializzazione,
            esperienza_anni,
            tariffa_oraria,
            disponibilita,
            note,
            technicianData.certificazioni,
            technicianData.foto,
            latitudine,
            longitudine,
          ],
          function (err) {
            callback(err, this.lastID);
          }
        );
      })
      .catch((err) => {
        console.error("Errore geocoding:", err);
        callback(err);
      });
  });
};

// Get all technicians with their user info
const getAllTechnicians = (callback, dbConnection) => {
  const query = `
    SELECT t.id AS tecnico_id, t.auth_user_id,
           u.nome, u.email, u.citta, u.indirizzo,
           t.specializzazione, t.esperienza_anni, t.tariffa_oraria,
           t.disponibilita, t.note, t.certificazioni, t.foto,
           t.latitudine, t.longitudine
    FROM technicians t
    JOIN auth_users u ON t.auth_user_id = u.id
  `;
  dbConnection.all(query, [], (err, rows) => {
    if (err) {
      return callback(err);
    }
    // Assicuriamoci che ogni oggetto abbia le chiavi corrette che corrispondono a techHeaders
    const technicians = rows.map(row => ({
      id: row.tecnico_id,
      auth_user_id: row.auth_user_id,
      nome: row.nome,
      email: row.email,
      citta: row.citta,
      indirizzo: row.indirizzo,
      specializzazione: row.specializzazione,
      esperienza_anni: row.esperienza_anni,
      tariffa_oraria: row.tariffa_oraria,
      disponibilita: row.disponibilita,
      note: row.note,
      certificazioni: row.certificazioni,
      foto: row.foto,
      latitudine: row.latitudine,
      longitudine: row.longitudine,
    }));
    callback(null, technicians);
  });
};

// Get technicians filtered by specialization
const getTechniciansBySpecialization = (specializzazione, callback) => {
  const query = `
    SELECT t.*, u.nome, u.email, u.citta, u.indirizzo, t.latitudine, t.longitudine
    FROM technicians t
    JOIN auth_users u ON t.auth_user_id = u.id
    WHERE t.specializzazione LIKE ?
  `;

  db.all(query, [`%${specializzazione}%`], callback);
};

// Get technician by id with full info
const getTechnicianById = (id, callback, dbConnection) => {
  const query = `
    SELECT t.id AS tecnico_id, t.auth_user_id,
           u.nome, u.email, u.citta, u.indirizzo,
           t.specializzazione, t.esperienza_anni, t.tariffa_oraria,
           t.disponibilita, t.note, t.certificazioni, t.foto,
           t.latitudine, t.longitudine
    FROM technicians t
    JOIN auth_users u ON t.auth_user_id = u.id
    WHERE t.id = ?
  `;
  dbConnection.get(query, [id], (err, row) => {
    if (err) {
      return callback(err);
    }
    if (!row) {
      return callback(null, null);
    }
    const technician = {
      id: row.tecnico_id,
      auth_user_id: row.auth_user_id,
      nome: row.nome,
      email: row.email,
      citta: row.citta,
      indirizzo: row.indirizzo,
      specializzazione: row.specializzazione,
      esperienza_anni: row.esperienza_anni,
      tariffa_oraria: row.tariffa_oraria,
      disponibilita: row.disponibilita,
      note: row.note,
      certificazioni: row.certificazioni,
      foto: row.foto,
      latitudine: row.latitudine,
      longitudine: row.longitudine,
    };
    callback(null, technician);
  });
};

// Update a technician
const updateTechnician = (id, technicianData, callback, dbConnection = null) => {
  const connection = dbConnection || db;

  const {
    specializzazione,
    esperienza_anni,
    tariffa_oraria,
    disponibilita,
    note,
    auth_user_id,
    certificazioni,
    foto,
  } = technicianData;

  getindirizzoUtente(connection, auth_user_id, (err, indirizzoCompleto) => {
    if (err) {
      return callback(err);
    }

    geocoder
      .geocode(indirizzoCompleto)
      .then((res) => {
        let latitudine = null;
        let longitudine = null;
        if (res && res.length > 0) {
          latitudine = res[0].latitude;
          longitudine = res[0].longitude;
        } else {
          console.warn(`Geocoding fallito per indirizzo: ${indirizzoCompleto}`);
        }

        const query = `
          UPDATE technicians
          SET specializzazione = ?, esperienza_anni = ?, tariffa_oraria = ?, 
              disponibilita = ?, note = ?, certificazioni = ?, foto = ?,
              latitudine = ?, longitudine = ?
          WHERE id = ?
        `;

        connection.run(
          query,
          [
            specializzazione,
            esperienza_anni,
            tariffa_oraria,
            disponibilita,
            note,
            certificazioni || "", 
            foto || "", 
            latitudine,
            longitudine,
            id,
          ],
          function (err) {
            callback(err, this.changes);
          }
        );
      })
      .catch((err) => {
        console.error("Errore geocoding:", err);
        callback(err);
      });
  });
};

// Delete a technician
const deleteTechnician = (id, callback) => {
  const query = `DELETE FROM technicians WHERE id = ?`;

  db.run(query, [id], function (err) {
    callback(err, this.changes);
  });
};

const getTechniciansAdvanced = (filters, callback) => {
  // Costruzione dinamica della query e degli array di parametri
  let baseQuery = `
    SELECT t.*, u.nome, u.email, u.citta, u.indirizzo,
           (6371 * acos( cos( radians(?) ) * cos( radians(t.latitudine) ) *
           cos( radians(t.longitudine) - radians(?)) + sin(radians(?)) *
           sin(radians(t.latitudine)) )) AS distance,
           IFNULL((
             SELECT AVG(rating) FROM feedback WHERE technician_id = t.id
           ), 0) AS avg_rating
    FROM technicians t
    JOIN auth_users u ON t.auth_user_id = u.id
  `;
  const params = [
    Number(filters.client_lat),
    Number(filters.client_lng),
    Number(filters.client_lat),
  ];
  let whereClauses = [];

  if (filters.specializzazione) {
    whereClauses.push("t.specializzazione LIKE ?");
    params.push(`%${filters.specializzazione}%`);
  }
  if (filters.disponibilita) {
    whereClauses.push("t.disponibilita LIKE ?");
    params.push(`%${filters.disponibilita}%`);
  }

  if (whereClauses.length > 0) {
    baseQuery += " WHERE " + whereClauses.join(" AND ");
  }

  baseQuery += " GROUP BY t.id";

  if (filters.min_rating) {
    baseQuery += " HAVING avg_rating >= ?";
    params.push(Number(filters.min_rating));
  }
  if (filters.max_distance) {
    // Se si usa HAVING per il filtro distanza
    baseQuery += filters.min_rating ? " AND" : " HAVING";
    baseQuery += " distance <= ?";
    params.push(Number(filters.max_distance));
  }

  // Esegui la query:
  db.all(baseQuery, params, callback);
};

module.exports = {
  createTechnician,
  getAllTechnicians,
  getTechniciansBySpecialization,
  getTechnicianById,
  updateTechnician,
  deleteTechnician,
  getTechniciansAdvanced,
};
