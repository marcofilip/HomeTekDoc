const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const express = require('express');
const session = require('express-session');
const app = express();
const swaggerSetup = require('../swagger');
const exampleRouter = require('../routes/example');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const port = 3000;

const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:8080",
        methods: ["GET", "POST"],
        credentials: true
    }
});

let connectedUsers = 0;

io.on('connection', (socket) => {
    connectedUsers++;
    io.emit('userCount', connectedUsers);

    socket.on('chat message', (msg) => {
        io.emit('chat message', {
            text: msg.text,
            username: msg.username,
            timestamp: new Date()
        });
    });

    socket.on('disconnect', () => {
        connectedUsers--;
        io.emit('userCount', connectedUsers);
    });
});

app.use(cors({
    origin: 'http://localhost:8080',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    },
    store: new session.MemoryStore()
}));
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, {
        body: req.body,
        headers: req.headers,
    });
    next();
});

const auth = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }
    return res.status(401).json({ error: 'Unauthorized' });
};

// Uncomment the following line to use the actual database
const dbPath = path.join(__dirname, 'database.db');

// Uncomment the following lines to use the mock database
// const dbPath = path.join(__dirname, 'mock.db');
// const db = require('./mock');

// Comment the following block if using the mock database module
console.log('Database path:', dbPath);

let db = new sqlite3.Database(dbPath, (err) => {
    if (err) return console.error('Database connection error:', err.message);
    console.log('Connected to SQLite database at:', dbPath);
});

db.run(`CREATE TABLE IF NOT EXISTS auth_users (
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
        console.error('Error creating auth_users table:', err);
    } else {
        console.log('auth_users table is ready');
        db.get("SELECT * FROM auth_users WHERE username = 'admin'", [], (err, row) => {
            if (err) {
                console.error('Error checking admin user:', err);
            } else if (!row) {
                db.run(`INSERT INTO auth_users (username, password, nome, email, citta, indirizzo, role) 
                       VALUES ('admin', 'GreatestAdmin3v3r', 'Admin', 'admin@gmail.com', 'AdminLandia', 'Administrator', 'admin')`,
                    (err) => {
                        if (err) {
                            console.error('Error creating admin user:', err);
                        } else {
                            console.log('Admin user created successfully');
                        }
                    });
            }
        });
    }
});


app.post('/auth/register', (req, res) => {
    console.log('Received registration request:', req.body);
    const { username, password, nome, email, citta, indirizzo, role } = req.body;

    if (!username || !password || !nome || !email || !citta || !indirizzo || !role) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const query = `
        INSERT INTO auth_users (username, password, nome, email, citta, indirizzo, role)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(query, [username, password, nome, email, citta, indirizzo, role], function (err) {
        if (err) {
            console.error('Registration error:', err);
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ error: 'Username already exists' });
            }
            return res.status(500).json({ error: err.message });
        }
        console.log('User registered successfully');
        res.json({ message: 'User registered successfully' });
    });
});

// server/server.js

app.post('/auth/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    db.get('SELECT * FROM auth_users WHERE username = ? AND password = ?',
        [username, password],
        (err, user) => {
            if (err) {
                console.error('Login error:', err);
                return res.status(500).json({ error: err.message });
            }
            if (!user) {
                console.log('Invalid login attempt');
                return res.status(401).json({ error: 'Invalid username or password' });
            }

            // Set session data
            req.session.user = {
                username: user.username,
                isAdmin: user.role === 'admin',
                role: user.role
            };

            // Optionally, send the role back as a JSON payload for easier debugging
            res.json({
                message: 'Login successful',
                user: {
                    username: user.username,
                    role: user.role,
                    isAdmin: user.role === 'admin'
                }
            });
        }
    );
});

app.get('/auth/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.clearCookie('connect.sid');
        res.json({ message: 'Logout successful' });
    });
});

app.get('/auth/check', (req, res) => {
    if (req.session && req.session.user) {
        res.json({
            authenticated: true,
            user: req.session.user
        });
    } else {
        res.json({
            authenticated: false
        });
    }
});

app.post('/utenti', (req, res) => {
    console.log('Received POST request:', req.body);
    const { nome, email, citta, indirizzo } = req.body;

    const query = `
        INSERT INTO auth_users (username, password, nome, email, citta, indirizzo, role) 
        VALUES (?, 'default_password', ?, ?, ?, ?, 'cliente')  -- Default role is 'cliente'
    `;

    db.run(query, [email, nome, email, citta, indirizzo], function (err) {
        if (err) {
            console.error('Database insertion error:', err);
            return res.status(500).json({ error: err.message });
        }
        console.log('User inserted successfully, ID:', this.lastID);
        res.json({ message: 'Nuovo utente creato', id: this.lastID });
    });
});

app.get('/utenti', auth, (req, res) => {
    console.log('Received GET request for users');
    db.all(`SELECT id, nome, email, citta, indirizzo, role FROM auth_users WHERE role IN ('cliente', 'tecnico')`, [], (err, rows) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ error: err.message });
        }
        console.log('Retrieved users:', rows);
        res.json({ utenti: rows });
    });
});

app.get('/utenti/filtrati', (req, res) => {
    const { role } = req.query;
    if (!role || !['cliente', 'tecnico', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Valid role parameter is required' });
    }

    const query = `SELECT id, nome, email, citta FROM auth_users WHERE role = ?`;
    db.all(query, [role], (err, rows) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ error: err.message });
        }
        console.log('Filtered users:', rows);
        res.json({ utenti: rows });
    });
});

app.put('/utenti/:id', (req, res) => {
    const { id } = req.params;
    const { nome, email, citta, indirizzo } = req.body;
    db.run(
        `UPDATE auth_users SET nome = ?, email = ?, citta = ?, indirizzo = ? WHERE id = ?`,
        [nome, email, citta, indirizzo, id],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ message: `Utente ${id} non trovato` });
            }
            res.json({ message: `Utente ${id} modificato` });
        }
    );
});

app.delete('/utenti/:id', (req, res) => {
    const { id } = req.params;
    console.log('Received DELETE request for user ID:', id);

    db.run(`DELETE FROM auth_users WHERE id = ?`, [id], function (err) {
        if (err) {
            console.error('Database deletion error:', err);
            return res.status(500).json({ error: err.message });
        }

        if (this.changes === 0) {
            console.log('No user found with ID:', id);
            return res.status(404).json({ error: `Utente ${id} non trovato` });
        }

        console.log('Successfully deleted user with ID:', id);
        res.json({ message: `Utente ${id} eliminato`, success: true });
    });
});

app.get('/utenti/citta/:city', (req, res) => {
    const citta = req.params.city;
    db.all(`SELECT * FROM utenti WHERE citta = ?`, [citta], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ utenti: rows });
    });
});

app.use('/api', exampleRouter);

app.get('/test', (req, res) => {
    res.send('Server is working');
});

swaggerSetup(app);

process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Closing the SQLite database.');
    });
    mockDb.close((err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Closing the SQLite mock database.');
        process.exit(0);
    });
});

http.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${port}`);
});