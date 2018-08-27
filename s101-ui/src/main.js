import Vue from 'vue'
import Element from 'element-ui'
import VueI18n from 'vue-i18n'
import App from './App.vue'
import "./filter"
import messages from './locale/messages'

import 'element-ui/lib/theme-chalk/index.css'
Vue.use(Element)
Vue.use(VueI18n)
Vue.config.productionTip = false

const locale = localStorage.getItem('selectedLocale') ||'zh_hk';
// set default locale
const i18n = new VueI18n({
  locale,
  messages,
});


new Vue({
  i18n,
  render: h => h(App)
}).$mount('#app')
