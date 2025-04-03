const NodeGeocoder = require("node-geocoder");

const getindirizzoUtente = (auth_user_id, callback, dbConnection) => { 
  const query = `SELECT citta, indirizzo FROM auth_users WHERE id = ?`;
  dbConnection.get(query, [auth_user_id], (err, row) => {
    if (err) return callback(err);
    if (!row) return callback(new Error("Utente non trovato"));
    const indirizzoCompleto = `${row.indirizzo}, ${row.citta}`;
    callback(null, indirizzoCompleto);
  });
};

const createTechnician = (technicianData, geocoderInstance, callback, dbConnection) => { // dbConnection e geocoderInstance aggiunti
  const {
    auth_user_id,
    specializzazione,
    esperienza_anni,
    tariffa_oraria,
    disponibilita,
    note,
    certificazioni, // Aggiunti per completezza
    foto,         // Aggiunti per completezza
  } = technicianData;

  getindirizzoUtente(auth_user_id, (err, indirizzoCompleto) => {
    if (err) return callback(err);

    geocoderInstance // Usa l'istanza passata
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
        dbConnection.run( // Usa dbConnection
          query,
          [
            auth_user_id,
            specializzazione,
            esperienza_anni,
            tariffa_oraria,
            disponibilita,
            note,
            certificazioni, // Usa il valore passato
            foto,         // Usa il valore passato
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
        // Anche se il geocoding fallisce, potremmo voler creare il tecnico senza coordinate
         const query = `
          INSERT INTO technicians 
            (auth_user_id, specializzazione, esperienza_anni, tariffa_oraria, disponibilita, note, certificazioni, foto, latitudine, longitudine)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL) -- Lat/Lon come NULL
        `;
         dbConnection.run(
           query,
           [
             auth_user_id, specializzazione, esperienza_anni, tariffa_oraria, disponibilita, note, certificazioni, foto
           ],
           function(insertErr) {
              callback(insertErr, this.lastID); // Ritorna l'errore di inserimento, se presente
           }
         );
         // callback(err); // Ritorna l'errore del geocoding se si preferisce bloccare la creazione
      });
  }, dbConnection); // Passa dbConnection a getindirizzoUtente
};

const getAllTechnicians = (callback, dbConnection) => { // dbConnection aggiunto alla fine
  const query = `
    SELECT t.id AS tecnico_id, t.auth_user_id,
           u.nome, u.email, u.citta, u.indirizzo, u.telefono, -- Aggiunto telefono se serve
           t.specializzazione, t.esperienza_anni, t.tariffa_oraria,
           t.disponibilita, t.note, t.certificazioni, t.foto,
           t.latitudine, t.longitudine
    FROM technicians t
    JOIN auth_users u ON t.auth_user_id = u.id
  `;
  dbConnection.all(query, [], (err, rows) => { // Usa dbConnection
    if (err) {
      return callback(err);
    }
    const technicians = rows.map(row => ({
      id: row.tecnico_id,
      auth_user_id: row.auth_user_id,
      nome: row.nome,
      email: row.email,
      citta: row.citta,
      indirizzo: row.indirizzo,
      telefono: row.telefono, // Mappato
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

const getTechniciansBySpecialization = (specializzazione, callback, dbConnection) => { // dbConnection aggiunto alla fine
  const query = `
    SELECT t.*, u.nome, u.email, u.citta, u.indirizzo, u.telefono, t.latitudine, t.longitudine
    FROM technicians t
    JOIN auth_users u ON t.auth_user_id = u.id
    WHERE t.specializzazione LIKE ?
  `;
  dbConnection.all(query, [`%${specializzazione}%`], callback); // Usa dbConnection
};

const getTechnicianById = (id, callback, dbConnection) => { // dbConnection aggiunto alla fine
  const query = `
    SELECT t.id AS tecnico_id, t.auth_user_id,
           u.nome, u.email, u.citta, u.indirizzo, u.telefono, -- Aggiunto telefono
           t.specializzazione, t.esperienza_anni, t.tariffa_oraria,
           t.disponibilita, t.note, t.certificazioni, t.foto,
           t.latitudine, t.longitudine
    FROM technicians t
    JOIN auth_users u ON t.auth_user_id = u.id
    WHERE t.id = ?
  `;
  dbConnection.get(query, [id], (err, row) => { // Usa dbConnection
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
      telefono: row.telefono, // Mappato
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

const updateTechnician = (id, technicianData, geocoderInstance, callback, dbConnection) => { // dbConnection e geocoderInstance aggiunti
  const {
    specializzazione,
    esperienza_anni,
    tariffa_oraria,
    disponibilita,
    note,
    auth_user_id, // Necessario per ottenere l'indirizzo aggiornato
    certificazioni,
    foto,
  } = technicianData;

  // Recupera l'indirizzo attuale dell'utente associato al tecnico
  getindirizzoUtente(auth_user_id, (err, indirizzoCompleto) => {
    if (err) {
       // Se non troviamo l'utente, potremmo comunque aggiornare senza geocoding?
       // O restituire l'errore? Restituiamo l'errore per ora.
      console.error("Errore nel recuperare indirizzo per update:", err);
      return callback(err);
    }

    geocoderInstance // Usa l'istanza passata
      .geocode(indirizzoCompleto)
      .then((res) => {
        let latitudine = null;
        let longitudine = null;
        if (res && res.length > 0) {
          latitudine = res[0].latitude;
          longitudine = res[0].longitude;
        } else {
          console.warn(`Update: Geocoding fallito per indirizzo: ${indirizzoCompleto}`);
        }

        const query = `
          UPDATE technicians
          SET specializzazione = ?, esperienza_anni = ?, tariffa_oraria = ?,
              disponibilita = ?, note = ?, certificazioni = ?, foto = ?,
              latitudine = ?, longitudine = ?
          WHERE id = ?
        `;

        dbConnection.run( // Usa dbConnection
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
        console.error("Errore geocoding durante update:", err);
         // Anche qui, potremmo decidere di aggiornare comunque senza lat/lon
         const query = `
          UPDATE technicians
          SET specializzazione = ?, esperienza_anni = ?, tariffa_oraria = ?,
              disponibilita = ?, note = ?, certificazioni = ?, foto = ?,
              latitudine = NULL, longitudine = NULL
          WHERE id = ?
        `;
         dbConnection.run(
           query,
           [ specializzazione, esperienza_anni, tariffa_oraria, disponibilita, note, certificazioni || "", foto || "", id ],
           function (updateErr) {
             callback(updateErr, this.changes);
           }
         );
        // callback(err); // Ritorna errore geocoding se preferito
      });
  }, dbConnection); // Passa dbConnection a getindirizzoUtente
};

const deleteTechnician = (id, callback, dbConnection) => { // dbConnection aggiunto alla fine
  const query = `DELETE FROM technicians WHERE id = ?`;
  dbConnection.run(query, [id], function (err) { // Usa dbConnection
    callback(err, this.changes);
  });
};

const getTechniciansAdvanced = (filters, callback, dbConnection) => { // dbConnection aggiunto alla fine
  let baseQuery = `
    SELECT t.id AS tecnico_id, t.auth_user_id,
           u.nome, u.email, u.citta, u.indirizzo, u.telefono, -- Aggiunto telefono
           t.specializzazione, t.esperienza_anni, t.tariffa_oraria,
           t.disponibilita, t.note, t.certificazioni, t.foto,
           t.latitudine, t.longitudine,
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

  // Aggiungiamo un controllo per evitare query su tecnici senza coordinate valide
  whereClauses.push("t.latitudine IS NOT NULL AND t.longitudine IS NOT NULL");

  if (whereClauses.length > 0) {
    baseQuery += " WHERE " + whereClauses.join(" AND ");
  }

  // Spostato GROUP BY prima di HAVING
  // baseQuery += " GROUP BY t.id"; // Rimosso GROUP BY, non necessario qui se non si aggregano i feedback direttamente

  let havingClauses = [];
  if (filters.min_rating) {
    havingClauses.push("avg_rating >= ?");
    params.push(Number(filters.min_rating));
  }
   if (filters.max_distance) {
     havingClauses.push("distance <= ?");
     params.push(Number(filters.max_distance));
   }

  if (havingClauses.length > 0) {
      baseQuery += " HAVING " + havingClauses.join(" AND ");
  }

  // Aggiungiamo un ordinamento per distanza come default
  baseQuery += " ORDER BY distance ASC";


  dbConnection.all(baseQuery, params, (err, rows) => { // Usa dbConnection
     if (err) {
         return callback(err);
     }
       // Riformattiamo i risultati come fatto in getAllTechnicians
       const technicians = rows.map(row => ({
           id: row.tecnico_id,
           auth_user_id: row.auth_user_id,
           nome: row.nome,
           email: row.email,
           citta: row.citta,
           indirizzo: row.indirizzo,
           telefono: row.telefono,
           specializzazione: row.specializzazione,
           esperienza_anni: row.esperienza_anni,
           tariffa_oraria: row.tariffa_oraria,
           disponibilita: row.disponibilita,
           note: row.note,
           certificazioni: row.certificazioni,
           foto: row.foto,
           latitudine: row.latitudine,
           longitudine: row.longitudine,
           distance: row.distance, // Includi distanza e rating
           avg_rating: row.avg_rating
       }));
       callback(null, technicians);
  });
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
