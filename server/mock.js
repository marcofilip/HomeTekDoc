const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const mockDbPath = path.join(__dirname, 'mock.db');
console.log('Mock Database path:', mockDbPath);

let mockDb = new sqlite3.Database(mockDbPath, (err) => {
    if (err) return console.error('Mock Database connection error:', err.message);
    console.log('Connected to SQLite mock database at:', mockDbPath);
});

mockDb.run(`CREATE TABLE IF NOT EXISTS auth_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    citta TEXT NOT NULL,
    indirizzo TEXT NOT NULL,
    telefono TEXT NOT NULL,
    role TEXT CHECK(role IN ('cliente', 'tecnico', 'admin')) NOT NULL
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

        // Creazione della tabella technicians nella mock database
        mockDb.run(`CREATE TABLE IF NOT EXISTS technicians (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            auth_user_id INTEGER,
            specializzazione TEXT NOT NULL,
            esperienza_anni INTEGER,
            tariffa_oraria REAL,
            disponibilita TEXT,
            note TEXT,
            latitudine REAL,
            longitudine REAL,
            FOREIGN KEY (auth_user_id) REFERENCES auth_users(id) ON DELETE CASCADE
        )`, (err) => {
            if (err) {
                console.error('Error creating technicians table in mock database:', err);
            } else {
                console.log('technicians table in mock database is ready');

                // Inserimento di dati di esempio per i tecnici
                // Assumiamo che l'utente "LuigiY" (role tecnico) abbia id=2 nella tabella auth_users
                const mockTechnicians = [
                    [2, 'Idraulico', 5, 30.5, 'Lun-Ven 8-18', 'Esperto in impianti idraulici', 45.4642, 9.1900],
                    // Aggiungi eventualmente altri record di esempio...
                ];
                mockTechnicians.forEach(tech => {
                    mockDb.run(`INSERT INTO technicians (auth_user_id, specializzazione, esperienza_anni, tariffa_oraria, disponibilita, note, latitudine, longitudine)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, tech, (err) => {
                        if (err) {
                            console.error('Error inserting mock technician:', err);
                        } else {
                            console.log('Mock technician inserted successfully');
                        }
                    });
                });
            }
        });
    }
});

module.exports = mockDb;
