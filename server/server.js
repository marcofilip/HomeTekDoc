require("dotenv").config();
const path = require("path");
const express = require("express");
const session = require("express-session");
const app = express();
const swaggerSetup = require("../swagger");
const exampleRouter = require("../routes/example");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const port = process.env.PORT || 3000;
const http = require("http").createServer(app);
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.VUE_APP_GOOGLE_CLIENT_ID);
const tecnicoDb = require("./tecnicoDb");
const feedbackRouterFactory = require("./feedback");
const NodeGeocoder = require('node-geocoder');

const geocoder = NodeGeocoder({
  provider: 'openstreetmap', // o un altro provider che non richieda API key per test
  httpAdapter: 'https',
});

const io = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

let connectedUsers = 0;

io.on("connection", (socket) => {
  connectedUsers++;
  io.emit("userCount", connectedUsers);

  socket.on("chat message", (msg) => {
    io.emit("chat message", {
      text: msg.text,
      username: msg.username,
      timestamp: new Date(),
    });
  });

  socket.on("disconnect", () => {
    connectedUsers--;
    io.emit("userCount", connectedUsers);
  });
});

app.use(
  cors({
    origin: "http://localhost:8080",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
    store: new session.MemoryStore(),
  })
);
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
  return res.status(401).json({ error: "Unauthorized" });
};

// Middleware specifico per verificare se l'utente è un tecnico
const isTechnician = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'tecnico') {
    return next();
  }
  return res.status(403).json({ error: "Forbidden: Access restricted to technicians" });
};

// Uncomment the following line to use the actual database
// const dbPath = path.join(__dirname, "database.db");

// Uncomment the following lines to use the mock database
const dbPath = path.join(__dirname, 'mock.db');
const db = require('./mock');

// Comment the following block if using the mock database module
// console.log("Database path:", dbPath);
// let db = new sqlite3.Database(dbPath, (err) => {
//   if (err) return console.error("Database connection error:", err.message);
//   console.log("Connected to SQLite database at:", dbPath);
// });

app.post("/auth/register", (req, res) => {
  console.log("Received registration request:", req.body);
  const {
    username,
    password,
    nome,
    email,
    citta,
    indirizzo,
    role,
    telefono,
    // Ottieni i dati tecnici direttamente dal req.body
    specializzazione,
    esperienza_anni,
    tariffa_oraria,
    disponibilita,
    note,
    certificazioni,
    foto,
  } = req.body;

  if (
    !username ||
    !password ||
    !nome ||
    !email ||
    !citta ||
    !indirizzo ||
    !role ||
    !telefono
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Avvio della transazione
  db.run("BEGIN TRANSACTION", (err) => {
    if (err) {
      console.error("Error beginning transaction:", err);
      return res.status(500).json({ error: err.message });
    }

    const query = `
      INSERT INTO auth_users (username, password, nome, email, citta, indirizzo, telefono, role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.run(
      query,
      [username, password, nome, email, citta, indirizzo, telefono, role],
      function (err) {
        if (err) {
          console.error("Registration error:", err);
          db.run("ROLLBACK");
          if (err.message.includes("UNIQUE constraint failed")) {
            return res.status(400).json({ error: "Username already exists" });
          }
          return res.status(500).json({ error: err.message });
        }

        const userId = this.lastID;
        console.log("User registered successfully with ID:", userId);

        // Se il ruolo è tecnico, procediamo a creare il profilo tecnico
        if (role === "tecnico") {
          const technicianData = {
            auth_user_id: userId,
            specializzazione: specializzazione || "",
            esperienza_anni: esperienza_anni || 0,
            tariffa_oraria: tariffa_oraria || 0,
            disponibilita: disponibilita || "",
            note: note || "",
            certificazioni: certificazioni || "",
            foto: foto || "",
          };

          // Pass the same `db` connection to technician creation
          tecnicoDb.createTechnician(
            technicianData,
            geocoder,
            (err, technicianId) => {
              if (err) {
                console.error("Error creating technician:", err);
                db.run("ROLLBACK");
                return res.status(500).json({ error: err.message });
              }
              db.run("COMMIT", (err) => {
                if (err) {
                  console.error("Error committing transaction:", err);
                  return res.status(500).json({ error: err.message });
                }
                res.json({
                  message: "Registrazione effettuata con successo",
                  userId: userId,
                  technicianId: technicianId,
                });
              });
            },
            db
          );
        } else {
          // For non-tecnico roles, commit the transaction and send response
          db.run("COMMIT", (err) => {
            if (err) {
              console.error("Error committing transaction:", err);
              return res.status(500).json({ error: err.message });
            }
            res.json({
              message: "Registrazione avvenuta con successo",
              userId: userId,
            });
          });
        }
      }
    );
  });
});

// server/server.js
app.post("/auth/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  db.get(
    "SELECT * FROM auth_users WHERE username = ? AND password = ?",
    [username, password],
    (err, user) => {
      if (err) {
        console.error("Login error:", err);
        return res.status(500).json({ error: err.message });
      }
      if (!user) {
        console.log("Invalid login attempt");
        return res.status(401).json({ error: "Invalid username or password" });
      }

      // Set session data
      req.session.user = {
        id: user.id, // <-- Added user ID to session
        username: user.username,
        isAdmin: user.role === "admin",
        role: user.role,
      };

      // Optionally, send the role back as a JSON payload for easier debugging
      res.json({
        message: "Login successful",
        user: {
          username: user.username,
          role: user.role,
          isAdmin: user.role === "admin",
        },
      });
    }
  );
});

app.post("/auth/google", async (req, res) => {
  const { token } = req.body;

  try {
      const ticket = await client.verifyIdToken({
          idToken: token,
          audience: process.env.VUE_APP_GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      const { email, name, sub: googleId } = payload; // 'sub' è l'ID Google

      if (!email) {
          // Dovrebbe essere sempre presente, ma per sicurezza
          return res.status(400).json({ authenticated: false, error: "Email not found in Google token." });
      }

      // 1. Cerca per google_id
      db.get("SELECT * FROM auth_users WHERE google_id = ?", [googleId], (err, userByGoogleId) => {
          if (err) {
              console.error("Error finding user by google_id:", err);
              return res.status(500).json({ authenticated: false, error: "Database error checking Google ID." });
          }

          if (userByGoogleId) {
              // Utente trovato tramite Google ID, accedi
              console.log(`Google Login: User found by google_id ${googleId}`);
              req.session.user = { id: userByGoogleId.id, username: userByGoogleId.username, role: userByGoogleId.role };
              return res.json({
                  authenticated: true,
                  user: { email: userByGoogleId.email, name: userByGoogleId.nome, role: userByGoogleId.role },
              });
          }

          // 2. Se non trovato per google_id, cerca per email
          console.log(`Google Login: User not found by google_id ${googleId}. Searching by email ${email}...`);
          db.get("SELECT * FROM auth_users WHERE email = ?", [email], (err, userByEmail) => {
              if (err) {
                  console.error("Error finding user by email:", err);
                  return res.status(500).json({ authenticated: false, error: "Database error checking email." });
              }

              if (userByEmail) {
                  // Utente trovato tramite email
                  console.log(`Google Login: User found by email ${email}. Checking google_id...`);
                  if (userByEmail.google_id && userByEmail.google_id !== googleId) {
                      // Email associata a un altro account Google!
                      console.error("Google Login Conflict: Email", email, "linked to google_id", userByEmail.google_id, "but attempting login with", googleId);
                      return res.status(409).json({ authenticated: false, error: "This email address is already linked to a different Google account." });
                  } else if (!userByEmail.google_id) {
                      // Email trovata, ma non ancora collegata a Google ID. Aggiorna e accedi.
                      console.log(`Google Login: Linking email ${email} to google_id ${googleId}`);
                      db.run("UPDATE auth_users SET google_id = ? WHERE id = ?", [googleId, userByEmail.id], (err) => {
                          if (err) {
                              console.error("Error updating user with google_id:", err);
                              return res.status(500).json({ authenticated: false, error: "Failed to link Google account." });
                          }
                          req.session.user = { id: userByEmail.id, username: userByEmail.username, role: userByEmail.role };
                          return res.json({
                              authenticated: true,
                              user: { email: userByEmail.email, name: userByEmail.nome, role: userByEmail.role },
                          });
                      });
                  } else {
                      // Email trovata E google_id corrisponde (questo caso non dovrebbe succedere a causa del primo check, ma per sicurezza)
                      console.log(`Google Login: User found by email ${email} and matching google_id ${googleId}`);
                      req.session.user = { id: userByEmail.id, username: userByEmail.username, role: userByEmail.role };
                      return res.json({
                          authenticated: true,
                          user: { email: userByEmail.email, name: userByEmail.nome, role: userByEmail.role },
                      });
                  }
              } else {
                  // 3. Nessun utente trovato. Crea nuovo utente Google.
                  console.log(`Google Login: No user found for email ${email}. Creating new user...`);
                  const newUsername = email; // Usiamo email come username, assicurati sia UNIQUE
                  const insertQuery = `
                      INSERT INTO auth_users (username, password, nome, email, citta, indirizzo, telefono, role, google_id)
                      VALUES (?, NULL, ?, ?, '', '', '', 'cliente', ?)
                  `;
                  db.run(insertQuery, [newUsername, name, email, googleId], function (err) {
                      if (err) {
                          console.error("Error inserting new Google user:", err);
                          if (err.message.includes("UNIQUE constraint failed: auth_users.email") || err.message.includes("UNIQUE constraint failed: auth_users.username")) {
                              // Può succedere se c'è una race condition o se l'email è stata usata come username per un account non-google
                              return res.status(409).json({ authenticated: false, error: "Email or username already exists." });
                          }
                           if (err.message.includes("UNIQUE constraint failed: auth_users.google_id")) {
                               // Teoricamente impossibile a causa del primo check, ma per sicurezza
                               return res.status(409).json({ authenticated: false, error: "Google account already linked." });
                           }
                          return res.status(500).json({ authenticated: false, error: "Failed to create new user." });
                      }
                      const newUserId = this.lastID;
                      console.log(`Google Login: New user created with ID ${newUserId}`);
                      req.session.user = { id: newUserId, username: newUsername, role: 'cliente' };
                      return res.json({
                          authenticated: true,
                          user: { email: email, name: name, role: 'cliente' },
                      });
                  });
              }
          });
      });

  } catch (error) {
      console.error("Error verifying Google token:", error);
      res.status(401).json({ authenticated: false, error: "Invalid or expired Google token." });
  }
});

app.get("/auth/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.clearCookie("connect.sid");
    res.json({ message: "Logout successful" });
  });
});

app.get("/auth/check", (req, res) => {
  if (req.session && req.session.user) {
    res.json({
      authenticated: true,
      user: req.session.user,
    });
  } else {
    res.json({
      authenticated: false,
    });
  }
});

// Add user profile endpoint
app.get("/auth/profile", auth, (req, res) => {
  if (!req.session.user || !req.session.user.id) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  db.get("SELECT id, nome, email, citta, indirizzo, telefono, role FROM auth_users WHERE id = ?",
    [req.session.user.id],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ user });
    }
  );
});

app.get("/utenti", auth, (req, res) => {
  console.log("Received GET request for users");
  db.all(
    `SELECT id, nome, email, citta, indirizzo, role FROM auth_users WHERE role IN ('cliente', 'tecnico')`,
    [],
    (err, rows) => {
      if (err) {
        console.error("Database query error:", err);
        return res.status(500).json({ error: err.message });
      }
      console.log("Retrieved users:", rows);
      res.json({ utenti: rows });
    }
  );
});

app.get("/utenti/filtrati", (req, res) => {
  const { role } = req.query;
  if (!role || !["cliente", "tecnico", "admin"].includes(role)) {
    return res.status(400).json({ error: "Valid role parameter is required" });
  }

  const query = `SELECT id, nome, email, citta FROM auth_users WHERE role = ?`;
  db.all(query, [role], (err, rows) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: err.message });
    }
    console.log("Filtered users:", rows);
    res.json({ utenti: rows });
  });
});

app.put("/utenti/:id", (req, res) => {
  const { id } = req.params;
  const { nome, email, citta, indirizzo } = req.body;
  const now = Date.now();

  // Prima, recuperiamo i campi di controllo per le modifiche
  db.get(
    "SELECT mod_count, mod_reset FROM auth_users WHERE id = ?",
    [id],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res.status(404).json({ error: `Utente ${id} non trovato` });
      }

      // Se non ancora presenti, consideriamo mod_count=0 e mod_reset null
      let mod_count = row.mod_count || 0;
      let mod_reset = row.mod_reset; // memorizzato come timestamp

      // Se mod_reset esiste e il countdown è ancora attivo
      if (mod_reset && now < mod_reset && mod_count === 2) {
        return res.status(403).json({
          error: "Hai raggiunto il limite di 2 modifiche. Riprova dopo 24 ore.",
        });
      }

      // Se il countdown è scaduto, resettiamo il contatore
      if (mod_reset && now >= mod_reset) {
        mod_count = 0;
        mod_reset = null;
      }

      // Determiniamo i nuovi valori in base alla modifica corrente
      let new_mod_count, new_mod_reset;
      if (mod_count === 0) {
        new_mod_count = 1;
        new_mod_reset = now + 24 * 60 * 60 * 1000; // 24 ore in ms
      } else if (mod_count === 1) {
        new_mod_count = 2;
        new_mod_reset = mod_reset || now + 24 * 60 * 60 * 1000;
      } else {
        return res
          .status(403)
          .json({ error: "Non puoi modificare attualmente." });
      }

      // Eseguiamo l'update includendo i nuovi valori di mod_count e mod_reset
      const updateQuery = `
      UPDATE auth_users 
      SET nome = ?, email = ?, citta = ?, indirizzo = ?, mod_count = ?, mod_reset = ?
      WHERE id = ?
    `;
      db.run(
        updateQuery,
        [nome, email, citta, indirizzo, new_mod_count, new_mod_reset, id],
        function (err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          if (this.changes === 0) {
            return res.status(404).json({ error: `Utente ${id} non trovato` });
          }
          res.json({
            message: `Utente ${id} modificato con successo`,
            mod_count: new_mod_count,
            mod_reset: new_mod_reset,
          });
        }
      );
    }
  );
});

app.delete("/utenti/:id", (req, res) => {
  const { id } = req.params;
  console.log("Received DELETE request for user ID:", id);

  db.run(`DELETE FROM auth_users WHERE id = ?`, [id], function (err) {
    if (err) {
      console.error("Database deletion error:", err);
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      console.log("No user found with ID:", id);
      return res.status(404).json({ error: `Utente ${id} non trovato` });
    }

    console.log("Successfully deleted user with ID:", id);
    res.json({ message: `Utente ${id} eliminato`, success: true });
  });
});

app.get("/utenti/citta/:city", (req, res) => {
  const citta = req.params.city;
  db.all(`SELECT * FROM auth_users WHERE citta = ?`, [citta], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ utenti: rows });
  });
});

// API endpoints for technicians
app.post("/tecnici", auth, (req, res) => {
  const technicianData = req.body;
  // Preleva l'id dell'utente dalla sessione
  const auth_user_id = req.session.user.id;

  if (!technicianData.specializzazione) {
    return res.status(400).json({ error: "specializzazione is required" });
  }

  // Passa db a createTechnician:
  tecnicoDb.createTechnician(
    db, // passaggio esplicito della connessione
    { ...technicianData, auth_user_id: auth_user_id },
    (err, technicianId) => {
      if (err) {
        console.error("Error creating technician:", err);
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({
        message: "Tecnico creato con successo",
        id: technicianId,
      });
    }
  );
});

app.get("/tecnici", (req, res) => {
  // Prepara i filtri se presenti
  const filters = {
    specializzazione: req.query.specializzazione,
    disponibilita: req.query.disponibilita,
    min_rating: req.query.min_rating,
    max_distance: req.query.max_distance,
    client_lat: req.query.client_lat || 41.9028,
    client_lng: req.query.client_lng || 12.4964,
  };

  if (
    filters.specializzazione ||
    filters.disponibilita ||
    filters.min_rating ||
    filters.max_distance
  ) {
    // Usa getTechniciansAdvanced passando il db
    tecnicoDb.getTechniciansAdvanced(
      filters,
      (err, technicians) => {
        if (err) {
          console.error("Error retrieving advanced technicians:", err);
          return res.status(500).json({ error: err.message });
        }
        res.json({ tecnici: technicians });
      },
      db // passiamo qui il database (mockDb)
    );
  } else {
    // Per la chiamata base, passa il db a getAllTechnicians:
    tecnicoDb.getAllTechnicians((err, technicians) => {
      if (err) {
        console.error("Error retrieving technicians:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ tecnici: technicians });
    }, db); // <-- Passa l'oggetto db
  }
});

app.get("/tecnici/specializzazione/:spec", (req, res) => {
  const specializzazione = req.params.spec;

  tecnicoDb.getTechniciansBySpecialization(
    specializzazione,
    (err, technicians) => {
      if (err) {
        console.error("Error retrieving technicians by specialization:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ tecnici: technicians });
    }, db
  );
});

app.get("/tecnici/:id", (req, res) => {
  const id = req.params.id;

  tecnicoDb.getTechnicianById(id, (err, technician) => {
    if (err) {
      console.error("Error retrieving technician:", err);
      return res.status(500).json({ error: err.message });
    }

    if (!technician) {
      return res.status(404).json({ error: "Tecnico non trovato" });
    }

    res.json({ tecnico: technician });
  }, db);
});

app.put("/tecnici/:id", auth, (req, res) => {
  const id = req.params.id;
  const technicianData = req.body;
  const auth_user_id = req.session.user.id;

  tecnicoDb.updateTechnician(
    id,
    { ...technicianData, auth_user_id: auth_user_id }, geocoder, 
    (err, changes) => {
      if (err) {
        console.error("Error updating technician:", err);
        return res.status(500).json({ error: err.message });
      }

      if (changes === 0) {
        return res.status(404).json({ error: "Tecnico non trovato" });
      }

      res.json({ message: "Tecnico aggiornato con successo" });
    }, db
  );
});

app.delete("/tecnici/:id", auth, (req, res) => {
  const id = req.params.id;

  tecnicoDb.deleteTechnician(id, (err, changes) => {
    if (err) {
      console.error("Error deleting technician:", err);
      return res.status(500).json({ error: err.message });
    }

    if (changes === 0) {
      return res.status(404).json({ error: "Tecnico non trovato" });
    }

    res.json({ message: "Tecnico eliminato con successo" });
  }, db);
});

app.post("/assistenza", auth, (req, res) => {
  const { description, urgente, technician_id, title } = req.body;
  const customer_id = req.session.user.id;

  if (!description || !technician_id || !title) {
    return res.status(400).json({ error: "Descrizione, ID tecnico e titolo sono obbligatori" });
  }
  if (isNaN(Number(technician_id))) {
    return res.status(400).json({ error: "ID tecnico non valido" });
  }

  const query = `
    INSERT INTO assistenza (customer_id, description, urgente, technician_id, title)
    VALUES (?, ?, ?, ?, ?)
  `;

  const urgFlag = urgente ? 1 : 0;
  db.run(query, [customer_id, description, urgFlag, Number(technician_id), title], function (err) {
    if (err) {
      console.error("Error inserting assistenza request:", err);
      if (err.message.includes("FOREIGN KEY constraint failed")) {
        return res.status(400).json({ error: "ID Tecnico specificato non valido." });
      }
      return res.status(500).json({ error: "Errore nell'invio della richiesta: " + err.message });
    }
    res.status(201).json({
      message: "Richiesta di assistenza inviata con successo",
      richiestaId: this.lastID
    });
  });
});

app.get('/assistenze', auth, (req, res) => {
  const customer_id = req.session.user?.id;
  if (!customer_id) {
    return res.status(401).json({ error: 'Autenticazione richiesta o ID utente non trovato in sessione' });
  }

  const query = `
      SELECT
          a.id, a.title, a.description, a.urgente, a.status, a.created_at,
          a.technician_id,
          u_tech.nome AS technician_name,
          (f.id IS NOT NULL) AS feedbackSent -- Verifica se esiste un feedback collegato
      FROM assistenza a
      LEFT JOIN technicians t ON a.technician_id = t.id
      LEFT JOIN auth_users u_tech ON t.auth_user_id = u_tech.id
      LEFT JOIN feedback f ON a.id = f.assistenza_id -- LEFT JOIN con feedback tramite assistenza_id
      WHERE a.customer_id = ?
      ORDER BY a.created_at DESC
  `;

  db.all(query, [customer_id], (err, rows) => {
    if (err) {
      console.error("Error fetching assistenze:", err);
      return res.status(500).json({ error: "Errore nel recupero delle richieste di assistenza." });
    }
    const assistenze = rows.map(a => ({
      id: a.id,
      title: a.title,
      description: a.description,
      urgente: Boolean(a.urgente),
      status: a.status,
      created_at: new Date(a.created_at).toLocaleString(),
      technician_id: a.technician_id,
      technician_name: a.technician_name || 'N/D',
      feedbackSent: Boolean(a.feedbackSent) // Converte 0/1 in false/true
    }));
    res.json({ assistenze: assistenze });
  });
});

// NUOVO Endpoint: GET /tecnici/me/assistenze
app.get('/tecnici/me/assistenze', auth, isTechnician, (req, res) => {
  const auth_user_id = req.session.user.id;

  db.get("SELECT id FROM technicians WHERE auth_user_id = ?", [auth_user_id], (err, technicianProfile) => {
    if (err) {
      console.error("Error finding technician profile:", err);
      return res.status(500).json({ error: "Errore nel trovare il profilo tecnico." });
    }
    if (!technicianProfile) {
      console.error(`No technician profile found for auth_user_id: ${auth_user_id}`);
      return res.status(404).json({ error: "Profilo tecnico non trovato per l'utente corrente." });
    }

    const technician_id = technicianProfile.id;

    const query = `
        SELECT
            a.id, a.title, a.description, a.urgente, a.status, a.created_at,
            a.customer_id,
            u_cli.nome AS customer_name,
            u_cli.telefono AS customer_phone,
            u_cli.indirizzo AS customer_address,
            u_cli.citta AS customer_city
        FROM assistenza a
        JOIN auth_users u_cli ON a.customer_id = u_cli.id
        WHERE a.technician_id = ?
        ORDER BY a.created_at DESC
    `;

    db.all(query, [technician_id], (err, rows) => {
      if (err) {
        console.error("Error fetching assigned assistenze:", err);
        return res.status(500).json({ error: "Errore nel recupero delle richieste di assistenza assegnate." });
      }
      const assignedAssistenze = rows.map(a => ({
        id: a.id,
        title: a.title,
        description: a.description,
        urgente: Boolean(a.urgente),
        status: a.status,
        created_at: new Date(a.created_at).toLocaleString(),
        customer_id: a.customer_id,
        customer_name: a.customer_name || 'N/D',
        customer_phone: a.customer_phone || 'N/D',
        customer_address: a.customer_address || 'N/D',
        customer_city: a.customer_city || 'N/D'
      }));
      res.json({ assistenze: assignedAssistenze });
    });
  });
});

// NUOVO Endpoint: PUT /assistenze/:id/status
app.put('/assistenze/:id/status', auth, isTechnician, (req, res) => {
  const assistenzaId = req.params.id;
  const newStatus = req.body.status;
  const auth_user_id = req.session.user.id;
  const allowedStatuses = ['in corso', 'completato', 'annullata'];

  if (!assistenzaId || isNaN(Number(assistenzaId))) {
      return res.status(400).json({ error: "ID richiesta non valido." });
  }
  if (!newStatus || !allowedStatuses.includes(newStatus)) {
    return res.status(400).json({ error: `Stato non valido. Stati permessi: ${allowedStatuses.join(', ')}` });
  }

  db.get("SELECT id FROM technicians WHERE auth_user_id = ?", [auth_user_id], (err, technicianProfile) => {
    if (err) {
      console.error("Error finding technician profile for status update:", err);
      return res.status(500).json({ error: "Errore nel trovare il profilo tecnico." });
    }
    if (!technicianProfile) {
      return res.status(404).json({ error: "Profilo tecnico non trovato per l'utente corrente." });
    }

    const technician_id = technicianProfile.id;

    const updateQuery = `
        UPDATE assistenza
        SET status = ?
        WHERE id = ? AND technician_id = ?
    `;

    db.run(updateQuery, [newStatus, Number(assistenzaId), technician_id], function(err) {
      if (err) {
        console.error("Error updating assistenza status:", err);
        return res.status(500).json({ error: "Errore nell'aggiornamento dello stato." });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "Richiesta non trovata o non assegnata a questo tecnico." });
      }

      res.json({ message: `Stato della richiesta ${assistenzaId} aggiornato a \"${newStatus}\" con successo.` });
    });
  });
});

// Add geocoding endpoint
app.get("/geocode", (req, res) => {
  const address = req.query.address;
  if (!address) {
    return res.status(400).json({ error: "Address is required" });
  }

  geocoder.geocode(address)
    .then(results => {
      if (results && results.length > 0) {
        res.json({
          lat: results[0].latitude,
          lng: results[0].longitude
        });
      } else {
        res.status(404).json({ error: "Address not found" });
      }
    })
    .catch(err => {
      console.error("Geocoding error:", err);
      res.status(500).json({ error: "Geocoding failed" });
    });
});

app.use("/api", exampleRouter);
app.use('/', feedbackRouterFactory(db));

app.get("/test", (req, res) => {
  res.send("Server is working");
});

swaggerSetup(app);

process.on("SIGINT", () => {
  db.close((err) => {
    if (err) {
      return console.error("Errore chiusura database:", err.message);
    }
    console.log("Chiusura connessione SQLite.");
    process.exit(0);
  });
});

http.listen(port, "0.0.0.0", () => {
  console.log(`Server running at http://localhost:${port}`);
});
