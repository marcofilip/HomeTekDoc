import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'


const vuetify = createVuetify({
  icons: {
    iconfont: 'mdi',
  },
    components,
    directives,
    theme: {
        defaultTheme: 'dark'
    }
})

createApp(App).use(router).use(vuetify).mount('#app')
