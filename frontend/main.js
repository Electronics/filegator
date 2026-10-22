import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Buefy from 'buefy'
import shared from './mixins/shared'
import axios from 'axios'
import api from './api/api'
import VueLazyload from 'vue-lazyload'
import '@fortawesome/fontawesome-free/css/all.css'
import '@fortawesome/fontawesome-free/css/fontawesome.css'

//TODO: import './registerServiceWorker'

Vue.config.productionTip = false

/* eslint-disable-next-line */
Vue.config.baseURL = process.env.VUE_APP_API_ENDPOINT ? process.env.VUE_APP_API_ENDPOINT : "/dist/"

axios.defaults.withCredentials = true
axios.defaults.baseURL = '/api/' //Vue.config.baseURL

axios.defaults.headers.common['Content-Type'] = 'application/json'

Vue.use(Buefy, {
  defaultIconPack: 'fas',
})

Vue.use(VueLazyload, {
  preLoad: 1.3,
})

Vue.mixin(shared)

window.vue = new Vue({
  router,
  store,
  created: function() {
      window.vueapi = api

    api.getConfig()
      .then(ret => {
        this.$store.commit('setConfig', ret.data.data)
        api.getUser()
          .then((user) => {
            this.$store.commit('initialize')
            this.$store.commit('setUser', user)
            // Navigate to the URL's pathname as the initial directory, unless it
            // looks like a file path (e.g. /report.pdf) — file URLs are handled
            // by the PHP DownloadController in production but would show a stuck
            // empty directory in dev.
            const rawPath = window.location.pathname.replace('/#/', '')
            const isFilePath = rawPath !== '/' && /\/[^/]*\.[^/]+$/.test(rawPath)
            const initialDir = isFilePath ? '/' : rawPath
            // The first push to root is needed as a warm-up; a direct push alone
            // doesn't always fire the $route watcher on the initial load.
            this.$router.push({name: 'browser', query: {'cd': "/"}}).catch(() => {}).then(()=>{
              this.$router.push({ name: 'browser', query: { 'cd': initialDir }}).catch(() => {})
            })
          })
          .catch(() => {
            this.$notification.open({
              message: this.lang('Something went wrong'),
              type: 'is-danger',
              queue: false,
              indefinite: true,
            })
          })
      })
      .catch(() => {
        this.$notification.open({
          message: this.lang('Something went wrong'),
          type: 'is-danger',
          queue: false,
          indefinite: true,
        })
      })
  },
  render: h => h(App),
}).$mount('#app')
