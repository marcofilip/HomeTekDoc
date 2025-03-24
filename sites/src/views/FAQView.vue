<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <h1 class="display-1 text-center mb-6">Domande Frequenti</h1>
        <v-expansion-panels multiple>
          <v-expansion-panel v-for="(faq, index) in faqs" :key="index">
            <v-expansion-panel-title>
              {{ faq.question }}
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              {{ faq.answer }}
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "FAQView",
  data() {
    return {
      faqs: [
        {
          question: "Come funziona il servizio?",
          answer: "Il servizio ti consente di richiedere assistenza per i tuoi dispositivi elettronici direttamente a domicilio. Trovi i tecnici sulla mappa, leggi le recensioni e contatta il professionista più adatto alle tue esigenze."
        },
        {
          question: "Chi sono i tecnici?",
          answer: "I tecnici sono professionisti qualificati e verificati dalla piattaforma, con competenze specifiche nella riparazione elettronica domiciliare."
        },
        {
          question: "Come posso contattare un tecnico?",
          answer: "Sul sito, dopo aver filtrato la lista dei tecnici, puoi contattare direttamente tramite il pulsante 'Contatta' che apre il client di posta predefinito, oppure tramite la chat se disponibile."
        },
        {
          question: "Cosa succede in caso di assistenza urgente?",
          answer: "Se attivi l'opzione di assistenza urgente, il tuo intervento verrà gestito con priorità, garantendoti tempi di risposta più rapidi."
        }
      ]
    }
  }
}
</script>

<style scoped>
/* Aggiungi eventuali stili personalizzati */
</style>