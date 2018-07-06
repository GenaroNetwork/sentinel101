import Vue from 'vue'
import Element from 'element-ui'
import App from './App.vue'
import "./filter"

import 'element-ui/lib/theme-chalk/index.css'
Vue.use(Element)
Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
