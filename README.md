# HomeTekDoc: Assistenza Elettronica Domiciliare Veloce

## Requisiti del Progetto

1. **Database (Mock e Real)**  
   - Utente  
   - Ruoli  
   - Profili  

2. **Autenticazione**  
   - Sessione  
   - Login  
   - Logout  
   - Google Auth  

3. **Frontend (Vue o HBS)**  
   - Admin backend  
   - User frontend  

4. **AJAX**  
   - Chiamata API/backend/query SQL  
   - Lista completa  
   - Lista filtrata  

5. **Web API di Terze Parti**  
   - Configurazione ambienti `.env`  

6. **Integrazione Swagger**

7. **Integrazione Web Socket**  
   - Minimo: contatore presenze visitatori in tempo reale (RT)

## Descrizione del Progetto

HomeTekDoc è una piattaforma che mette in contatto consumatori privati con tecnici specializzati per riparazioni elettroniche a domicilio. L'applicazione offre:
- Registrazione e gestione degli account (clienti e tecnici)
- Visualizzazione dei tecnici su mappa, con dettagli come specializzazione, esperienza, tariffa e disponibilità
- Sistema di richiesta di assistenza, feedback e valutazioni
- Integrazione con Swagger e WebSocket per feature in tempo reale

Sei stanco di dover portare i tuoi dispositivi elettronici in riparazione? La nostra piattaforma offre un'assistenza rapida e professionale a domicilio,
grazie a una rete di tecnici specializzati e indipendenti esperti in riparazioni elettroniche. Risolvi i problemi della tua tecnologia senza dover lasciare casa:
le nostre riparazioni sono rapide, efficaci e a portata di click. Non perdere più tempo e denaro in lunghe attese e trasferimenti: scegli la nostra soluzione innovativa
e scopri la comodità di avere un'assistenza elettronica di alta qualità direttamente a casa tua.

Il sito è mirato per consumatori privati.

Il sito mira a risolvere problemi con la lunga attesa per le riparazioni presso i centri assistenza tradizionali e la mancanza di trasparenza nel processo di riparazione.

Il sito ha questi requisiti:
  * Possibilità alla registrazione di creare un account cliente oppure professionista.
  * Tenere traccia delle iscrizioni dei professionisti in un apposito database.
  * Possibilità di visualizzare su una mappa la posizione dei professionisti.
  * Possibilità per il cliente di comunicare con il professionista richiesto attraverso un canale di comunicazione.
  * Permettere ai clienti di lasciare feedback e valutazioni sui professionisti dopo il servizio, per garantire trasparenza e fiducia.
  * Fornire informazioni dettagliate sui professionisti, inclusi specializzazioni, anni di esperienza, certificazioni e foto.
  * Creare una sezione di domande frequenti (FAQ) per rispondere a domande comuni.
  * Consentire ai clienti di filtrare i professionisti in base a criteri come specializzazione, distanza, valutazione e disponibilità.
  * Creare un'opzione per richieste di assistenza urgente, con tempi di risposta prioritari.

## Analisi SWOT per HomeTekDoc

**Punti di Forza (Strengths):**

* Servizio a Domicilio Conveniente: Elimina la necessità per i clienti di trasportare i dispositivi, risparmiando tempo e fatica.
* Rapidità di Intervento: Risolve il problema della lunga attesa dei centri assistenza tradizionali.
* Trasparenza e Fiducia: Feedback e valutazioni dei clienti aumentano la credibilità dei professionisti.
* Informazioni Dettagliate sui Professionisti: Aiuta i clienti a scegliere il tecnico più adatto alle loro esigenze.

**Punti di Debolezza (Weaknesses):**

* Necessità di Costruire una Rete di Professionisti: Richiede tempo e risorse per attrarre e validare i tecnici.
* Gestione della Qualità del Servizio: Assicurare uno standard elevato e uniforme da parte di professionisti indipendenti può essere impegnativo.
* Dipendenza dalla Disponibilità dei Professionisti: La velocità di risposta può variare a seconda della zona e della disponibilità dei tecnici.

**Opportunità (Opportunities):**

* Mercato in Crescita per l'Assistenza Tecnica a Domicilio: La dipendenza dalla tecnologia e la richiesta di comodità aumentano la domanda.

**Minacce (Threats):**

* Concorrenza da Parte di Centri Assistenza Tradizionali Evoluti: Alcuni centri stanno migliorando la loro offerta con servizi di ritiro e consegna.
* Nascita di Piattaforme Simili: Il mercato potrebbe diventare saturo con altri servizi di assistenza on-demand.

## Product Vision Board

**Target Group:**

* **Descrizione:** Consumatori privati di tutte le età che possiedono dispositivi elettronici (smartphone, computer, tablet, elettrodomestici, etc.) e che hanno bisogno di riparazioni rapide e affidabili senza dover uscire di casa.
* **Bisogni:**
    * Risolvere velocemente i problemi tecnici dei propri dispositivi.
    * Avere un'esperienza di riparazione comoda e senza stress.
    * Evitare lunghe attese e spostamenti.

**Needs:**

* **Funzionalità:**
    * Piattaforma web e/o app user-friendly per la registrazione e la richiesta di assistenza.
    * Mappa interattiva per visualizzare i professionisti disponibili nella zona.
    * Canale di comunicazione diretto (chat, videochiamata) tra cliente e professionista.
    * Sistema di feedback e valutazioni per i professionisti.
    * Profili dettagliati dei professionisti con informazioni sulle loro competenze ed esperienza.
    * Sezione FAQ esaustiva.
    * Sistema di filtri avanzati per la ricerca dei professionisti.
    * Opzione per richieste di assistenza urgenti.

**Product:**

* **Vision:** Diventare la piattaforma di riferimento per l'assistenza elettronica domiciliare, offrendo un servizio rapido, trasparente e affidabile che semplifica la vita dei consumatori.
* **Caratteristiche Distintive:**
    * La comodità di avere un tecnico specializzato direttamente a casa.
    * La trasparenza grazie a feedback, valutazioni e informazioni dettagliate sui professionisti.
    * La velocità di risposta, soprattutto per le richieste urgenti.
    * La possibilità di scegliere il professionista in base alle proprie esigenze.

**Business Goals:**

* Diventare leader nel mercato dell'assistenza elettronica domiciliare.
* Raggiungere un elevato tasso di soddisfazione dei clienti.
* Generare un flusso di ricavi sostenibile e in crescita.

## Product Vision Box

**Lato Frontale:**

* **Logo:** HomeTekDoc (con un'icona che suggerisce velocità e assistenza a domicilio, ad esempio una freccia che punta verso una casa stilizzata con un simbolo di chip elettronico).
* **Slogan:**  La tua assistenza elettronica, a portata di click. Veloce. Affidabile. A Domicilio.
* **Immagine:** Una persona rilassata sul divano con un tecnico che ripara un dispositivo elettronico, entrambi sorridenti.

**Lato Superiore:**

* **Testo:**  Riparazioni Elettroniche Domiciliari Semplificate.

**Lato 1 (Benefici per il Cliente):**

* **Niente più attese:** Riparazioni rapide senza uscire di casa.
* **Tecnici Esperti:** Professionisti qualificati per ogni tua esigenza.
* **Trasparenza Totale:** Scegli il tuo tecnico, leggi le recensioni, comunica direttamente.

**Lato 2 (Funzionalità Chiave):**

* Registrati come cliente o professionista.
* Trova tecnici sulla mappa.
* Chatta e richiedi assistenza.
* Lascia feedback e valutazioni.

**Lato 3 (Perché Scegliere HomeTekDoc):**

* **Comodità:** L'assistenza arriva da te.
* **Affidabilità:** Solo professionisti verificati.
* **Semplicità:** Pochi click per risolvere i tuoi problemi tecnologici.

**Lato Posteriore:**

* **Testo:**  Scarica l'app HomeTekDoc e risolvi subito i tuoi problemi elettronici!
* **QR Code:** Link all'app store e al sito web.
* **Icone dei Social Media.**

## Product Vision Template

**Vision Statement:**

Rivoluzionare l'assistenza elettronica domestica, fornendo una piattaforma intuitiva e affidabile che connette rapidamente i consumatori con tecnici qualificati, offrendo un servizio comodo, trasparente e di alta qualità direttamente a domicilio.

**Target Audience:**

Consumatori privati che possiedono dispositivi elettronici e che necessitano di assistenza per la riparazione. Sono persone che apprezzano la comodità, la velocità e la trasparenza, e che sono stanchi delle lunghe attese e delle incertezze dei centri assistenza tradizionali. Sono utenti digitalmente alfabetizzati che si sentono a proprio agio nell'utilizzare piattaforme online e app mobili.

**Needs:**

I consumatori hanno bisogno di un modo rapido, affidabile e trasparente per risolvere i problemi dei loro dispositivi elettronici senza dover affrontare lo stress e l'inconveniente di recarsi presso i centri assistenza tradizionali. Vogliono avere la possibilità di scegliere un tecnico in base alle proprie esigenze, di comunicare direttamente con lui e di avere fiducia nella sua competenza.

**Key Features:**

* Registrazione e gestione account cliente e professionista.
* Database e gestione dei profili dei professionisti.
* Visualizzazione dei professionisti su mappa.
* Sistema di comunicazione integrato.
* Sistema di feedback e valutazioni per i professionisti.
* Profili dettagliati dei professionisti (specializzazioni, esperienza, certificazioni, foto).
* Sezione FAQ.
* Filtri di ricerca avanzati per professionisti (specializzazione, distanza, valutazione, disponibilità).
* Opzione per richieste di assistenza urgenti.

**Goals:**

* Diventare la piattaforma leader per l'assistenza elettronica a domicilio.
* Ottenere un punteggio medio di soddisfazione cliente di almeno 4 su 5.

**Values:**

* **Convenienza:** Offrire un servizio comodo e accessibile direttamente a casa.
* **Affidabilità:** Garantire la qualità dei professionisti e dei servizi offerti.
* **Trasparenza:** Fornire informazioni chiare e accessibili sui professionisti e sui processi.
* **Rapidità:** Risolvere i problemi tecnici in tempi brevi.
* **Efficienza:** Ottimizzare il processo di assistenza per la massima soddisfazione del cliente.

## Struttura dei File

- **server/**  
  - Contiene il backend Node.js.  
  - [Dockerfile](server/Dockerfile): Definisce l'immagine Docker per il backend.  
  - [server.js](server/server.js): Punto di ingresso del server.  
  - [tecnicoDb.js](server/tecnicoDb.js): Modulo per le operazioni CRUD sui tecnici.  
  - [mock.js](server/mock.js): Database mock e popolamento delle tabelle.

- **sites/**  
  - Contiene il frontend sviluppato in Vue.js.  
  - [Dockerfile](sites/Dockerfile): Definisce l'immagine Docker per il frontend.  
  - [UtentiView.vue](sites/src/views/UtentiView.vue) e [ClienteView.vue](sites/src/views/ClienteView.vue): Componenti di visualizzazione.

- **docker-compose.yml**  
  - File in radice che definisce i servizi per il backend (server) e il frontend (sites).

- **run-docker.ps1**  
  - Script PowerShell in radice che controlla se Docker è installato, lo scarica ed esegue i container.

## Esecuzione con Docker

Lo svolgimento dell'applicazione in Docker avviene tramite due container separati (Node.js per il backend e Vue.js per il frontend).

### Prerequisiti
- Windows (lo script è in PowerShell)
- Permessi di amministratore per installare Docker Desktop, se non già presente

## Script di Avvio (run-docker.ps1)

Lo script **run-docker.ps1** (in radice) controlla se Docker è installato, lo scarica ed esegue il comando per avviare i container.

## Come Far Girare l'Applicazione

2. Apri un terminale PowerShell con privilegi amministrativi e naviga nella cartella radice del progetto (ad esempio, `d:\squola\tep\HomeTekDoc`).

3. Esegui lo script:
   ```powershell
   .\run-docker.ps1
   ```

   - Se Docker non è installato, lo script lo scaricherà ed installerà Docker Desktop.
   - Una volta installato, riavvia lo script per avviare i container.

4. Il backend sarà disponibile all'indirizzo: [http://localhost:3000](http://localhost:3000)  
   Il frontend sarà disponibile all'indirizzo: [http://localhost:8080](http://localhost:8080)

## Conclusioni

Utilizzando Docker e docker-compose vengono creati due container separati per il backend e il frontend, garantendo uno sviluppo isolato e una distribuzione semplificata dell'intera applicazione.