<template>
  <v-container>
    <v-form>
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
      default: () => ({ note: '' })
    }
  },
  data() {
    return {
      note: this.modelValue.note
    }
  },
  watch: {
    note() {
      this.emitUpdate();
    }
  },
  methods: {
    emitUpdate() {
      this.$emit('update:modelValue', { note: this.note });
    }
  },
  created() {
    this.emitUpdate();
  }
}
</script>