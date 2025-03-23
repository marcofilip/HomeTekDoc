<template>
  <v-container>
    <v-form>
      <v-text-field 
        v-model="telefono"
        label="Telefono"
        required
      ></v-text-field>
      <v-textarea
        v-model="note"
        label="Note (opzionali)"
      ></v-textarea>
    </v-form>
  </v-container>
</template>

<script>
export default {
  name: 'ClienteForm',
  props: {
    modelValue: {
      type: Object,
      default: () => ({ telefono: '', note: '' })
    }
  },
  data() {
    return {
      telefono: this.modelValue.telefono,
      note: this.modelValue.note
    }
  },
  watch: {
    telefono(newVal) {
      this.emitUpdate();
    },
    note(newVal) {
      this.emitUpdate();
    }
  },
  methods: {
    emitUpdate() {
      this.$emit('update:modelValue', {
        telefono: this.telefono,
        note: this.note
      });
    }
  },
  created() {
    this.emitUpdate();
  }
}
</script>