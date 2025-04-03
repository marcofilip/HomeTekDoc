<template>
  <v-container>
    <v-form @submit.prevent="submitTecnico">
      <v-text-field 
        v-model="specializzazione" 
        label="Specializzazione" 
        required
      ></v-text-field>
      <v-text-field 
        v-model="esperienza_anni" 
        label="Esperienza (anni)" 
        type="number" 
        required
      ></v-text-field>
      <v-text-field 
        v-model="tariffa_oraria" 
        label="Tariffa Oraria (€)" 
        type="number" 
        required
      ></v-text-field>
      <v-text-field 
        v-model="disponibilita" 
        label="Disponibilità" 
        required
      ></v-text-field>
      <v-textarea 
        v-model="note" 
        label="Note (opzionali)"
      ></v-textarea>
      <!-- Nuovi campi opzionali -->
      <v-text-field 
        v-model="certificazioni" 
        label="Certificazioni (opzionali)"
      ></v-text-field>
      <v-text-field 
        v-model="foto" 
        label="URL Foto (opzionale)"
      ></v-text-field>
    </v-form>
  </v-container>
</template>

<script>
export default {
  name: 'TecnicoForm',
  props: {
    modelValue: {
      type: Object,
      default: () => ({
        specializzazione: '',
        esperienza_anni: null,
        tariffa_oraria: null,
        disponibilita: '',
        note: '',
        certificazioni: '',
        foto: ''
      })
    }
  },
  data() {
    return {
      specializzazione: this.modelValue.specializzazione,
      esperienza_anni: this.modelValue.esperienza_anni,
      tariffa_oraria: this.modelValue.tariffa_oraria,
      disponibilita: this.modelValue.disponibilita,
      note: this.modelValue.note,
      certificazioni: this.modelValue.certificazioni,
      foto: this.modelValue.foto
    }
  },
  watch: {
    specializzazione() { this.emitUpdate(); },
    esperienza_anni() { this.emitUpdate(); },
    tariffa_oraria() { this.emitUpdate(); },
    disponibilita() { this.emitUpdate(); },
    note() { this.emitUpdate(); },
    certificazioni() { this.emitUpdate(); },
    foto() { this.emitUpdate(); }
  },
  methods: {
    submitTecnico() { // ATTENZIONE: Questa logica potrebbe essere ridondante
      console.warn("TecnicoForm.submitTecnico() chiamato. È ancora necessario?");
      // Verifica se tutti i campi richiesti sono validi prima di procedere
      if (!this.specializzazione || !this.esperienza_anni || !this.tariffa_oraria || !this.disponibilita) {
          console.error("Campi tecnico obbligatori mancanti.");
          // Mostra un errore all'utente
          return;
      }

      const payload = {
          specializzazione: this.specializzazione,
          esperienza_anni: this.esperienza_anni,
          tariffa_oraria: this.tariffa_oraria,
          disponibilita: this.disponibilita,
          note: this.note,
          certificazioni: this.certificazioni,
          foto: this.foto
      };

      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'http://localhost:3000/tecnici', true); // Endpoint corretto?
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.withCredentials = true; // Serve autenticazione per creare un tecnico separatamente?

      xhr.onload = () => {
          try {
             if (xhr.status >= 200 && xhr.status < 300) {
                 const responseData = JSON.parse(xhr.responseText);
                 if (responseData.id) {
                     console.log("Tecnico creato/aggiornato(?) con ID:", responseData.id);
                     // Decidi cosa fare: emettere evento, reindirizzare?
                     // this.$router.push('/'); // Esempio reindirizzamento
                     this.$emit('tecnicoSubmitted', responseData); // Esempio emissione evento
                 } else {
                      console.warn("Risposta successo da /tecnici ma senza ID:", responseData);
                 }
             } else {
                  console.error("Errore HTTP submitTecnico:", xhr.status, xhr.statusText);
                   const errorData = JSON.parse(xhr.responseText);
                   console.error("Dettagli errore server:", errorData);
                   // Mostra errore all'utente
                   this.$emit('tecnicoError', errorData.error || 'Errore registrazione tecnico');
             }
          } catch(e) {
               console.error("Errore parsing JSON submitTecnico:", e);
               this.$emit('tecnicoError', 'Errore risposta server');
          }
      };

      xhr.onerror = () => {
          console.error('Errore di rete submitTecnico');
          this.$emit('tecnicoError', 'Errore di rete');
      };

      xhr.send(JSON.stringify(payload));
    },
    emitUpdate() {
      this.$emit('update:modelValue', {
        specializzazione: this.specializzazione,
        esperienza_anni: this.esperienza_anni,
        tariffa_oraria: this.tariffa_oraria,
        disponibilita: this.disponibilita,
        note: this.note,
        certificazioni: this.certificazioni,
        foto: this.foto
      });
    }
  },
  created() {
    this.emitUpdate();
  }
}
</script>
