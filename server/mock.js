const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const mockDbPath = path.join(__dirname, 'mock.db');
console.log('Mock Database path:', mockDbPath);

let mockDb = new sqlite3.Database(mockDbPath, (err) => {
    if (err) return console.error('Mock Database connection error:', err.message);
    console.log('Connected to SQLite mock database at:', mockDbPath);
});

// Create auth_users table with the same structure as the real database
mockDb.run(`CREATE TABLE IF NOT EXISTS auth_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    citta TEXT NOT NULL,
    indirizzo TEXT NOT NULL,
    telefono TEXT NOT NULL,
    role TEXT CHECK(role IN ('cliente', 'tecnico', 'admin')) NOT NULL,
    mod_count INTEGER DEFAULT 0,
    mod_reset INTEGER DEFAULT NULL
)`, (err) => {
    if (err) {
        console.error('Error creating auth_users table in mock database:', err);
    } else {
        console.log('auth_users table in mock database is ready');
        const mockUsers = [
            ['MarioX', 'mario123', 'Mario', 'mario@gmail.com', 'Mariona', 'Via Marini 4', '1234567890', 'cliente'],
            ['LuigiY', 'luigi123', 'Luigi', 'luigi@hotmail.com', 'Luigioni', 'Via Luigino 5', '0987654321', 'tecnico'],
            ['GiorgioZ', 'giorgio123', 'Giorgio', 'giorgio@yahoo.it', 'Giorgione', 'Via Giorgino 6', '1122334455', 'admin']
        ];
        mockUsers.forEach(user => {
            mockDb.run(`INSERT INTO auth_users (username, password, nome, email, citta, indirizzo, telefono, role) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, user, (err) => {
                if (err) {
                    console.error('Error inserting mock user:', err);
                } else {
                    console.log('Mock user inserted successfully');
                }
            });
        });

        // Create technicians table with the same constraints as the real database
        mockDb.run(`CREATE TABLE IF NOT EXISTS technicians (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            auth_user_id INTEGER,
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
        )`, (err) => {
            if (err) {
                console.error('Error creating technicians table in mock database:', err);
            } else {
                console.log('technicians table in mock database is ready');

                // Insert example technician data
                const mockTechnicians = [
                    [2, 'Idraulico', 5, 30.5, 'Lun-Ven 8-18', 'Esperto in impianti idraulici', 'Certificazione Idraulica', 'https://example.com/photo.jpg', 45.4642, 9.1900],
                ];
                mockTechnicians.forEach(tech => {
                    mockDb.run(`INSERT INTO technicians (auth_user_id, specializzazione, esperienza_anni, 
                                tariffa_oraria, disponibilita, note, certificazioni, foto, latitudine, longitudine)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, tech, (err) => {
                        if (err) {
                            console.error('Error inserting mock technician:', err);
                        } else {
                            console.log('Mock technician inserted successfully');
                        }
                    });
                });
            }
        });

        // Create feedback table
        mockDb.run(`
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
            console.error("Error creating feedback table in mock database:", err);
          } else {
            console.log("Mock feedback table is ready");
            // Insert sample feedback
            mockDb.run(`INSERT INTO feedback (technician_id, customer_id, rating, comment) 
                      VALUES (1, 1, 5, 'Ottimo servizio!')`, (err) => {
              if (err) {
                console.error('Error inserting mock feedback:', err);
              } else {
                console.log('Mock feedback inserted successfully');
              }
            });
          }
        });

        // Create assistenza table
        mockDb.run(`
          CREATE TABLE IF NOT EXISTS assistenza (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER NOT NULL,
            description TEXT,
            urgente INTEGER DEFAULT 0,
            status TEXT DEFAULT 'in attesa',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (customer_id) REFERENCES auth_users(id) ON DELETE CASCADE
          )
        `, (err) => {
          if (err) {
            console.error("Error creating assistenza table in mock database:", err);
          } else {
            console.log("Mock assistenza table is ready");
            // Insert sample assistance request
            mockDb.run(`INSERT INTO assistenza (customer_id, description, urgente) 
                      VALUES (1, 'Problema con il computer', 1)`, (err) => {
              if (err) {
                console.error('Error inserting mock assistance request:', err);
              } else {
                console.log('Mock assistance request inserted successfully');
              }
            });
          }
        });
    }
});

module.exports = mockDb;
