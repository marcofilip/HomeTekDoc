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
