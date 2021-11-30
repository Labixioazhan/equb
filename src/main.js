/*
 * @Description: 
 * @Author: xuzhan
 * @Date: 2021-11-25 17:46:43
 * @LastEditTime: 2021-11-26 14:13:47
 * @LastEditors: xuzhan
 */
import Vue from 'vue'
import App from './App.vue'
import store from './store'
import '@/assets/styles/icon.css'
import '@/assets/styles/global.scss'

import {tap,swipeleft,swiperight,press} from './assets/js/vue-touch.js'
Vue.use(tap,swipeleft,swiperight,press)
Vue.config.productionTip = false


new Vue({
  store,
  render: h => h(App)
}).$mount('#app')
