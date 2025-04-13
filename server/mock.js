const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const mockDbPath = path.join(__dirname, "mock.db");

console.log("Mock Database path:", mockDbPath);

let mockDb = new sqlite3.Database(mockDbPath, (err) => {
  if (err) return console.error("Mock Database connection error:", err.message);
  console.log("Connected to SQLite mock database at:", mockDbPath);
  initializeDatabase();
});

function initializeDatabase() {
  mockDb.serialize(() => {
    createTables((err) => {
      if (err) {
        console.error("Failed to create tables:", err);
        return;
      }
      checkAndPopulate();
    });
  });
}

function checkAndPopulate() {
  mockDb.get("SELECT COUNT(*) as count FROM auth_users", [], (err, row) => {
    if (err) {
      console.error("Error checking user count:", err);
      return;
    }
    if (row && row.count === 0) {
      console.log("Mock database appears empty. Populating...");
      populateAllData();
    } else {
      console.log(
        `Mock database already has ${row.count} users. Skipping population.`
      );
    }
  });
}

function createTables(callback) {
  let pending = 4;
  const done = (err) => {
    if (err) {
      console.error("Error during table creation:", err.message);
      if (callback) callback(err);
      callback = null;
      return;
    }
    pending--;
    if (pending === 0 && callback) {
      console.log("All mock tables checked/created.");
      callback(null);
    }
  };

  mockDb.run(
    `CREATE TABLE IF NOT EXISTS auth_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT,
        nome TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        citta TEXT NOT NULL,
        indirizzo TEXT NOT NULL,
        telefono TEXT NOT NULL,
        role TEXT CHECK(role IN ('cliente', 'tecnico', 'admin')) NOT NULL,
        google_id TEXT NULL UNIQUE,
        mod_count INTEGER DEFAULT 0,
        mod_reset INTEGER DEFAULT NULL
    )`,
    (err) => {
      if (err) console.error("Error creating auth_users table:", err);
      else console.log("auth_users table ready.");
      done(err);
    }
  );

  mockDb.run(
    `CREATE TABLE IF NOT EXISTS technicians (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        auth_user_id INTEGER UNIQUE,
        specializzazione TEXT NOT NULL CHECK(length(specializzazione) <= 250),
        esperienza_anni INTEGER CHECK(esperienza_anni >= 0 AND esperienza_anni < 50),
        tariffa_oraria REAL CHECK(tariffa_oraria >= 0 AND tariffa_oraria < 1000000),
        disponibilita TEXT CHECK(length(disponibilita) <= 250),
        note TEXT CHECK(length(note) <= 500),
        certificazioni TEXT,
        foto TEXT,
        latitudine REAL,
        longitudine REAL,
        FOREIGN KEY (auth_user_id) REFERENCES auth_users(id) ON DELETE CASCADE
    )`,
    (err) => {
      if (err) console.error("Error creating technicians table:", err);
      else console.log("technicians table ready.");
      done(err);
    }
  );

  mockDb.run(
    `
      CREATE TABLE IF NOT EXISTS assistenza (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL,
        technician_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        urgente INTEGER DEFAULT 0,
        status TEXT DEFAULT 'da iniziare' CHECK(status IN ('da iniziare', 'in corso', 'completato', 'annullata')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES auth_users(id) ON DELETE CASCADE,
        FOREIGN KEY (technician_id) REFERENCES technicians(id) ON DELETE CASCADE
      )
    `,
    (err) => {
      if (err) console.error("Error creating assistenza table:", err);
      else console.log("assistenza table ready.");
      done(err);
    }
  );

  mockDb.run(
    `CREATE TABLE IF NOT EXISTS feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        technician_id INTEGER NOT NULL,
        customer_id INTEGER NOT NULL,
        assistenza_id INTEGER, -- NUOVA COLONNA
        rating INTEGER CHECK(rating BETWEEN 1 AND 5) NOT NULL,
        comment TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (technician_id) REFERENCES technicians(id) ON DELETE CASCADE,
        FOREIGN KEY (customer_id) REFERENCES auth_users(id) ON DELETE CASCADE,
        FOREIGN KEY (assistenza_id) REFERENCES assistenza(id) ON DELETE SET NULL -- O CASCADE
          )
    `,
    (err) => {
      if (err) console.error("Error creating feedback table:", err);
      else console.log("feedback table ready.");
      done(err);
    }
  );
}

function populateAllData() {
  const geocoderInstance = require('node-geocoder')({
    provider: 'openstreetmap',
    httpAdapter: 'https'
  });
  processUsers(geocoderInstance, () => {
    populateFeedbackSamples();
    populateAssistanceSamples();
  });
}

async function processUsers(geocoder, callback) {
  const mockUsers = [
    [
      "MarioX",
      "mario123",
      "Mario Rossi",
      "mario@gmail.com",
      "Roma",
      "Via Marini 4",
      "1234567890",
      "cliente",
    ],
    [
      "LuigiY",
      "luigi123",
      "Luigi Verdi",
      "luigi@hotmail.com",
      "Milano",
      "Via Luigino 5",
      "0987654321",
      "tecnico",
    ],
    [
      "GiorgioZ",
      "giorgio123",
      "Giorgio Bianchi",
      "giorgio@yahoo.it",
      "Napoli",
      "Via Giorgino 6",
      "1122334455",
      "admin",
    ],
    [
      "AnnaB",
      "anna123",
      "Anna Bianchi",
      "anna@gmail.com",
      "Firenze",
      "Via Dante 23",
      "3334445555",
      "cliente",
    ],
    [
      "CarloC",
      "carlo123",
      "Carlo Conti",
      "carlo@outlook.com",
      "Bologna",
      "Via Emilia 45",
      "6667778888",
      "cliente",
    ],
    [
      "DanielaD",
      "daniela123",
      "Daniela Dori",
      "daniela@gmail.com",
      "Torino",
      "Corso Francia 67",
      "1112223333",
      "cliente",
    ],
    [
      "ElenaE",
      "elena123",
      "Elena Esposito",
      "elena@yahoo.com",
      "Venezia",
      "Campo San Polo 12",
      "4445556666",
      "cliente",
    ],
    [
      "FabioF",
      "fabio123",
      "Fabio Ferrari",
      "fabio@gmail.com",
      "Genova",
      "Via Roma 78",
      "7778889999",
      "cliente",
    ],
    [
      "GiuliaG",
      "giulia123",
      "Giulia Galli",
      "giulia@outlook.com",
      "Palermo",
      "Via Maqueda 34",
      "2223334444",
      "cliente",
    ],
    [
      "HectorH",
      "hector123",
      "Hector Hernandez",
      "hector@gmail.com",
      "Catania",
      "Via Etnea 56",
      "5556667777",
      "cliente",
    ],
    [
      "IreneI",
      "irene123",
      "Irene Innocenti",
      "irene@yahoo.it",
      "Bari",
      "Via Sparano 90",
      "8889990000",
      "cliente",
    ],
    [
      "LorenzoL",
      "lorenzo123",
      "Lorenzo Lombardi",
      "lorenzo@gmail.com",
      "Cagliari",
      "Via Manno 23",
      "3334445566",
      "cliente",
    ],
    [
      "MarcaM",
      "marca123",
      "Marco Marchi",
      "marco@gmail.com",
      "Pisa",
      "Via Borgo 45",
      "6667778899",
      "tecnico",
    ],
    [
      "NicolaN",
      "nicola123",
      "Nicola Neri",
      "nicola@outlook.com",
      "Verona",
      "Via Mazzini 12",
      "1112223344",
      "tecnico",
    ],
    [
      "OscarO",
      "oscar123",
      "Oscar Olivieri",
      "oscar@gmail.com",
      "Padova",
      "Via Garibaldi 78",
      "4445556677",
      "tecnico",
    ],
    [
      "PaolaP",
      "paola123",
      "Paola Pisani",
      "paola@yahoo.com",
      "Trento",
      "Via Duomo 34",
      "7778889900",
      "tecnico",
    ],
    [
      "QuintoQ",
      "quinto123",
      "Quinto Quaranta",
      "quinto@gmail.com",
      "Trieste",
      "Via Carducci 56",
      "2223334455",
      "tecnico",
    ],
    [
      "RosaR",
      "rosa123",
      "Rosa Ricci",
      "rosa@outlook.com",
      "Siena",
      "Via dei Banchi 90",
      "5556667788",
      "tecnico",
    ],
    [
      "SergioS",
      "sergio123",
      "Sergio Santini",
      "sergio@gmail.com",
      "Parma",
      "Strada Repubblica 23",
      "8889990011",
      "tecnico",
    ],
    [
      "TeresaT",
      "teresa123",
      "Teresa Totti",
      "teresa@yahoo.it",
      "Lucca",
      "Via Fillungo 45",
      "3334445577",
      "tecnico",
    ],
    [
      "UmbertoU",
      "umberto123",
      "Umberto Urbani",
      "umberto@gmail.com",
      "Livorno",
      "Via Grande 12",
      "6667778800",
      "tecnico",
    ],
  ];

  const insertUser = (user) => {
    return new Promise((resolve, reject) => {
      mockDb.run(
        `INSERT OR IGNORE INTO auth_users (username, password, nome, email, citta, indirizzo, telefono, role)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        user,
        function (err) {
          if (err) {
            console.error("Error inserting mock user:", user[0], err.message);
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  };

  await Promise.all(mockUsers.map((user) => insertUser(user).catch((e) => e)));
  console.log("Finished inserting/checking all users.");

  mockDb.all(
    `SELECT id, username, citta, indirizzo FROM auth_users WHERE role = 'tecnico'`,
    [],
    async (err, tecniciAuth) => {
      if (err) {
        console.error('Error retrieving technicians auth data:', err);
        if (callback) callback();
        return;
      }
      console.log('Geocoding technicians for profile creation:', tecniciAuth);

      const specializations = [
        "Informatica",
        "Elettronica",
        "Elettrodomestici",
        "Audio/Video",
        "Smartphone",
        "Networking",
        "Computer",
        "Televisori",
        "Impianti Hi-Fi",
        "Domotica",
      ];

      // Use for...of to properly use await
      for (const [index, techAuth] of tecniciAuth.entries()) {
        const spec = specializations[index % specializations.length];
        const exp = Math.floor(Math.random() * 20) + 1;
        const rate = Math.floor(Math.random() * 30) + 20;
        const avail = [
          "Lun-Ven 9-18",
          "Lun-Sab 8-20",
          "Mar-Dom 10-19",
          "Tutti i giorni 9-21",
        ][index % 4];
        const note = `Specialista in ${spec} con esperienza pluriennale.`;

        let latitudine = null;
        let longitudine = null;
        const indirizzoCompleto = `${techAuth.indirizzo}, ${techAuth.citta}`;

        try {
          // Call the geocoder
          const geocodeResult = await geocoder.geocode(indirizzoCompleto);
          if (geocodeResult && geocodeResult.length > 0) {
            latitudine = geocodeResult[0].latitude;
            longitudine = geocodeResult[0].longitude;
            console.log(`Geocoded ${techAuth.username} (${indirizzoCompleto}): [${latitudine}, ${longitudine}]`);
          } else {
            console.warn(`Geocoding failed for ${techAuth.username} at ${indirizzoCompleto}. Skipping coordinates.`);
          }
        } catch (geocodeErr) {
          console.error(`Geocoding error for ${techAuth.username} at ${indirizzoCompleto}:`, geocodeErr.message);
          // Continue without coordinates if geocoding fails
        }

        // Insert into DB with the obtained coordinates (or null)
        await new Promise((resolve, reject) => {
          mockDb.run(
            `INSERT OR IGNORE INTO technicians 
             (auth_user_id, specializzazione, esperienza_anni, tariffa_oraria, disponibilita, note, certificazioni, foto, latitudine, longitudine)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              techAuth.id,
              spec,
              exp,
              rate,
              avail,
              note,
              `Certificato ${spec}`,
              "",
              latitudine,
              longitudine,
            ],
            function (err) {
              if (err) {
                console.error(
                  `Error inserting technician profile for ${techAuth.username}:`,
                  err.message
                );
                reject(err);
              } else {
                if (this.changes > 0) {
                  // console.log(`Technician profile for ${techAuth.username} inserted/updated.`);
                }
                resolve();
              }
            }
          );
        });
      } // End for...of loop

      console.log("Finished processing technician profiles.");
      if (callback) callback(); // Call main callback after processing all technicians
    }
  );
}

function populateFeedbackSamples() {
  console.log("Populating sample feedback...");
  mockDb.get(
    "SELECT id FROM technicians ORDER BY RANDOM() LIMIT 1",
    (err, tech) => {
      if (err || !tech)
        return console.error("Cannot find tech for feedback", err);
      mockDb.get(
        "SELECT id FROM auth_users WHERE role='cliente' ORDER BY RANDOM() LIMIT 1",
        (err, client) => {
          if (err || !client)
            return console.error("Cannot find client for feedback", err);
          mockDb.run(
            `INSERT INTO feedback (technician_id, customer_id, rating, comment)
                      VALUES (?, ?, 5, 'Ottimo servizio mock!')`,
            [tech.id, client.id],
            (err) => {
              if (err) console.error("Error inserting mock feedback:", err);
              else console.log("Mock feedback inserted successfully");
            }
          );
        }
      );
    }
  );
}

function populateAssistanceSamples() {
  console.log("Populating sample assistance requests...");
  mockDb.get(
    "SELECT id FROM technicians ORDER BY RANDOM() LIMIT 1",
    (err, tech) => {
      if (err || !tech)
        return console.error("Cannot find tech for assistance sample", err);
      mockDb.get(
        "SELECT id FROM auth_users WHERE role='cliente' ORDER BY RANDOM() LIMIT 1",
        (err, client) => {
          if (err || !client)
            return console.error(
              "Cannot find client for assistance sample",
              err
            );

          mockDb.run(
            `INSERT INTO assistenza (customer_id, technician_id, title, description, urgente, status)
                      VALUES (?, ?, 'Computer non si accende', 'Il mio PC fisso non dà segni di vita', 1, 'da iniziare')`,
            [client.id, tech.id],
            (err) => {
              if (err)
                console.error("Error inserting mock assistance request:", err);
              else
                console.log(
                  "Mock assistance request (da iniziare) inserted successfully"
                );
            }
          );

          mockDb.get(
            "SELECT id FROM technicians ORDER BY RANDOM() LIMIT 1",
            (err, tech2) => {
              if (err || !tech2) return;
              mockDb.get(
                "SELECT id FROM auth_users WHERE role='cliente' ORDER BY RANDOM() LIMIT 1",
                (err, client2) => {
                  if (err || !client2) return;
                  mockDb.run(
                    `INSERT INTO assistenza (customer_id, technician_id, title, description, urgente, status)
                              VALUES (?, ?, 'Problema Stampante', 'Non stampa più a colori', 0, 'in corso')`,
                    [client2.id, tech2.id],
                    (err) => {
                      if (err)
                        console.error(
                          "Error inserting mock assistance request 2:",
                          err
                        );
                      else
                        console.log(
                          "Mock assistance request (in corso) inserted successfully"
                        );
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
}

module.exports = mockDb;
