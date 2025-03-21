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
    role TEXT CHECK(role IN ('cliente', 'tecnico', 'admin')) NOT NULL
)`, (err) => {
    if (err) {
        console.error('Error creating auth_users table in mock database:', err);
    } else {
        console.log('auth_users table in mock database is ready');
        const mockUsers = [
            ['MarioX', 'mario123', 'Mario', 'mario@gmail.com', 'Mariona', 'Via Marini 4', 'cliente'],
            ['LuigiY', 'luigi123', 'Luigi', 'luigi@hotmail.com', 'Luigioni', 'Via Luigino 5', 'tecnico'],
            ['GiorgioZ', 'giorgio123', 'Giorgio', 'giorgio@yahoo.it', 'Giorgione', 'Via Giorgino 6', 'admin']
        ];
        mockUsers.forEach(user => {
            mockDb.run(`INSERT INTO auth_users (username, password, nome, email, citta, indirizzo, role) 
                        VALUES (?, ?, ?, ?, ?, ?, ?)`, user, (err) => {
                if (err) {
                    console.error('Error inserting mock user:', err);
                } else {
                    console.log('Mock user inserted successfully');
                }
            });
        });
    }
});

module.exports = mockDb;
