import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export default createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#1976D2',      // Blu primario
          secondary: '#424242',    // Grigio scuro
          accent: '#82B1FF',       // Blu chiaro
          error: '#FF5252',        // Rosso
          info: '#2196F3',         // Blu info
          success: '#4CAF50',      // Verde
          warning: '#FFC107',      // Giallo
        }
      },
      dark: {
        colors: {
          primary: '#2196F3',
          secondary: '#757575'
        }
      }
    },
  },
  components,
  directives,
})