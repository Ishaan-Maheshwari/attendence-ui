import { registerPlugins } from '@/plugins'

// Composables
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import { createPinia } from 'pinia'

// Styles
import 'unfonts.css'


const app = createApp(App)

registerPlugins(app)

app.use(createPinia())
app.use(router)
app.use(vuetify)
app.mount('#app')
