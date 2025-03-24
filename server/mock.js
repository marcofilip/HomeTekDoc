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
            ['MarioX', 'mario123', 'Mario Rossi', 'mario@gmail.com', 'Roma', 'Via Marini 4', '1234567890', 'cliente'],
            ['LuigiY', 'luigi123', 'Luigi Verdi', 'luigi@hotmail.com', 'Milano', 'Via Luigino 5', '0987654321', 'tecnico'],
            ['GiorgioZ', 'giorgio123', 'Giorgio Bianchi', 'giorgio@yahoo.it', 'Napoli', 'Via Giorgino 6', '1122334455', 'admin'],
            ['AnnaB', 'anna123', 'Anna Bianchi', 'anna@gmail.com', 'Firenze', 'Via Dante 23', '3334445555', 'cliente'],
            ['CarloC', 'carlo123', 'Carlo Conti', 'carlo@outlook.com', 'Bologna', 'Via Emilia 45', '6667778888', 'cliente'],
            ['DanielaD', 'daniela123', 'Daniela Dori', 'daniela@gmail.com', 'Torino', 'Corso Francia 67', '1112223333', 'cliente'],
            ['ElenaE', 'elena123', 'Elena Esposito', 'elena@yahoo.com', 'Venezia', 'Campo San Polo 12', '4445556666', 'cliente'],
            ['FabioF', 'fabio123', 'Fabio Ferrari', 'fabio@gmail.com', 'Genova', 'Via Roma 78', '7778889999', 'cliente'],
            ['GiuliaG', 'giulia123', 'Giulia Galli', 'giulia@outlook.com', 'Palermo', 'Via Maqueda 34', '2223334444', 'cliente'],
            ['HectorH', 'hector123', 'Hector Hernandez', 'hector@gmail.com', 'Catania', 'Via Etnea 56', '5556667777', 'cliente'],
            ['IreneI', 'irene123', 'Irene Innocenti', 'irene@yahoo.it', 'Bari', 'Via Sparano 90', '8889990000', 'cliente'],
            ['LorenzoL', 'lorenzo123', 'Lorenzo Lombardi', 'lorenzo@gmail.com', 'Cagliari', 'Via Manno 23', '3334445566', 'cliente'],
            ['MarcaM', 'marca123', 'Marco Marchi', 'marco@gmail.com', 'Pisa', 'Via Borgo 45', '6667778899', 'tecnico'],
            ['NicolaN', 'nicola123', 'Nicola Neri', 'nicola@outlook.com', 'Verona', 'Via Mazzini 12', '1112223344', 'tecnico'],
            ['OscarO', 'oscar123', 'Oscar Olivieri', 'oscar@gmail.com', 'Padova', 'Via Garibaldi 78', '4445556677', 'tecnico'],
            ['PaolaP', 'paola123', 'Paola Pisani', 'paola@yahoo.com', 'Trento', 'Via Duomo 34', '7778889900', 'tecnico'],
            ['QuintoQ', 'quinto123', 'Quinto Quaranta', 'quinto@gmail.com', 'Trieste', 'Via Carducci 56', '2223334455', 'tecnico'],
            ['RosaR', 'rosa123', 'Rosa Ricci', 'rosa@outlook.com', 'Siena', 'Via dei Banchi 90', '5556667788', 'tecnico'],
            ['SergioS', 'sergio123', 'Sergio Santini', 'sergio@gmail.com', 'Parma', 'Strada Repubblica 23', '8889990011', 'tecnico'],
            ['TeresaT', 'teresa123', 'Teresa Totti', 'teresa@yahoo.it', 'Lucca', 'Via Fillungo 45', '3334445577', 'tecnico'],
            ['UmbertoU', 'umberto123', 'Umberto Urbani', 'umberto@gmail.com', 'Livorno', 'Via Grande 12', '6667778800', 'tecnico']
        ];

        // Insert all users
        const insertUser = (user) => {
            return new Promise((resolve, reject) => {
                mockDb.run(`INSERT OR IGNORE INTO auth_users (username, password, nome, email, citta, indirizzo, telefono, role) 
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, user, function(err) {
                    if (err) {
                        console.error('Error inserting mock user:', err);
                        reject(err);
                    } else {
                        console.log(`Mock user ${user[0]} inserted or already exists`);
                        resolve(this.lastID);
                    }
                });
            });
        };

        // Process all users sequentially
        const processUsers = async () => {
            for (const user of mockUsers) {
                try {
                    await insertUser(user);
                } catch (err) {
                    console.error(`Failed to insert user ${user[0]}:`, err);
                }
            }
            
            // After inserting users, insert technicians
            mockDb.all(`SELECT id, username, citta, indirizzo FROM auth_users WHERE role = 'tecnico'`, [], (err, tecnici) => {
                if (err) {
                    console.error('Error retrieving technicians:', err);
                    return;
                }
                
                console.log('Retrieved technicians for profile creation:', tecnici);
                
                // Define specializations and more data for each technician
                const specializations = [
                    'Informatica', 'Elettronica', 'Elettrodomestici', 'Audio/Video', 
                    'Smartphone', 'Networking', 'Computer', 'Televisori', 
                    'Impianti Hi-Fi', 'Domotica'
                ];
                
                // Create technician profiles for each user with 'tecnico' role
                tecnici.forEach((tech, index) => {
                    const spec = specializations[index % specializations.length];
                    const exp = Math.floor(Math.random() * 20) + 1; // 1-20 years
                    const rate = (Math.floor(Math.random() * 30) + 20); // €20-€50
                    const avail = ['Lun-Ven 9-18', 'Lun-Sab 8-20', 'Mar-Dom 10-19', 'Tutti i giorni 9-21'][index % 4];
                    const note = `Specialista in ${spec} con esperienza pluriennale.`;
                    
                    // Random coordinates near the city center (rough approximation for Italy)
                    const baseLatitude = 41.9 + (Math.random() * 3 - 1.5); // Roughly centered on Italy
                    const baseLongitude = 12.5 + (Math.random() * 3 - 1.5);
                    
                    mockDb.run(`INSERT OR IGNORE INTO technicians 
                                (auth_user_id, specializzazione, esperienza_anni, tariffa_oraria, disponibilita, note, certificazioni, foto, latitudine, longitudine)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
                                [tech.id, spec, exp, rate, avail, note, `Certificato ${spec}`, '', baseLatitude, baseLongitude], 
                                function(err) {
                        if (err) {
                            console.error(`Error inserting technician profile for ${tech.username}:`, err);
                        } else {
                            console.log(`Technician profile for ${tech.username} inserted successfully`);
                        }
                    });
                });
            });
        };

        // Start user processing
        processUsers();

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

        // Update the feedback and assistenza sample data

        // Add more sample feedback entries
        mockDb.all("SELECT id FROM technicians LIMIT 5", [], (err, techs) => {
            if (err) {
                console.error('Error retrieving technicians for feedback:', err);
                return;
            }
            
            mockDb.all("SELECT id FROM auth_users WHERE role = 'cliente' LIMIT 5", [], (err, clients) => {
                if (err) {
                    console.error('Error retrieving clients for feedback:', err);
                    return;
                }
                
                // Create multiple feedback entries
                for (let i = 0; i < Math.min(techs.length, clients.length); i++) {
                    const rating = Math.floor(Math.random() * 5) + 1; // 1-5 rating
                    const comment = [`Ottimo servizio!`, `Molto professionale`, `Veloce ed efficiente`, 
                                   `Consigliatissimo`, `Ha risolto il problema in poco tempo`][i % 5];
                    
                    mockDb.run(`INSERT INTO feedback (technician_id, customer_id, rating, comment) 
                              VALUES (?, ?, ?, ?)`, [techs[i].id, clients[i].id, rating, comment], (err) => {
                        if (err) {
                            console.error('Error inserting mock feedback:', err);
                        } else {
                            console.log(`Mock feedback from client ${clients[i].id} to technician ${techs[i].id} inserted`);
                        }
                    });
                }
            });
        });

        // Add more sample assistance requests with different statuses
        mockDb.all("SELECT id FROM auth_users WHERE role = 'cliente' LIMIT 10", [], (err, clients) => {
            if (err) {
                console.error('Error retrieving clients for assistance requests:', err);
                return;
            }
            
            const problems = [
                'Problema con il computer',
                'TV non si accende',
                'Smartphone bloccato',
                'Connessione internet instabile',
                'Stampante non funziona',
                'Console di gioco guasta',
                'Tablet lento',
                'Problemi con l\'audio',
                'Elettrodomestico non funzionante',
                'Router da configurare'
            ];
            
            const statuses = ['in attesa', 'in corso', 'completata'];
            
            clients.forEach((client, index) => {
                const description = problems[index % problems.length];
                const urgent = index % 3 === 0 ? 1 : 0; // Every 3rd request is urgent
                const status = statuses[index % statuses.length];
                
                mockDb.run(`INSERT INTO assistenza (customer_id, description, urgente, status) 
                          VALUES (?, ?, ?, ?)`, [client.id, description, urgent, status], (err) => {
                    if (err) {
                        console.error('Error inserting mock assistance request:', err);
                    } else {
                        console.log(`Mock assistance request for client ${client.id} inserted`);
                    }
                });
            });
        });
    }
});

module.exports = mockDb;
