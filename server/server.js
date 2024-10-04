const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs'); //modulo per leggere i file

//creiamo l'applicazione Express
const app = express();

//Middleware pe rparsare il body delle richieste in formato JSON
app.use(bodyParser.json());

//Endpoint di login
app.post('/login', (req, res) => {
    const {username, password} = req.body;
    console.log(`Richiesta di login per l'utente ${username}`);
    console.log(`Password: ${password}`);

    fs.readFile('utenti.json', 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Errore nella lettura del file utenti.json');
            return;
        }

        try {
            const utenti = JSON
            const user = utenti.find(u => u.user === username && u.pwd === password);

            if (user) {
                res.status(200).json({
                    "status": "OK",
                    "user": user.user,
                    "ruolo": user.ruolo
                });
            } else {
                res.status(401).json({ message: `Credenziali non valide` });
            }
        } catch (err) {
            res.status(500).json({ message: `Errore nel parsing del file utenti.json` });
        }
})});

//Endpoint per ottenere la lista degli utenti
app.get('/utenti', (req, res) => {
    fs.readFile('utenti.json', 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Errore nella lettura del file utenti.json');
            return;
        }
        try {
            const utenti = JSON.parse(data);
            res.status(200).json(utenti);
        } catch (err) {
            res.status(500).send('Errore nel parsing del file utenti.json');
        }
    });
});

//Endpoint per aggiungere un nuovo utente
app.post('/utenti', (req, res) => {
    const { user, pwd, ruolo } = req.body;

    if (!user || !pwd || !ruolo) {
        return res.status(400).send('I campi user, pwd e ruolo sono obbligatori');
    }

    fs.readFile('utenti.json', 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Errore nella lettura del file utenti.json. \nErr: ' + err);
            return;
        }
        try {
            const utenti = JSON.parse(data);
            const userExists = utenti.find(u => u.user === user);
            if (userExists) {
                res.status(400).send('Utente già presente');
                return;
            }
            const nuovoUtente = { user, pwd, ruolo };
            utenti.push(nuovoUtente);

            fs.writeFile('utenti.json', JSON.stringify(utenti, null, 2), (err) => {
                if (err) {
                    res.status(500).send('Errore nella scrittura del file utenti.json');
                    return;
                }
                res.status(201).json(nuovoUtente);
            });

        } catch (err) {
            res.status(500).send('Errore nel parsing del file utenti.json');
        }
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server in esecuzione sulla porta ${PORT}`);
});
