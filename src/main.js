// The Vue build version to load with the `import` command
import 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import router from './router'
import axios from 'axios'
import http from './common/js/http'
import 'lib-flexible/flexible'
import MintUI from 'mint-ui'
import 'mint-ui/lib/style.css'

Vue.use(MintUI)
// import VConsole from 'vconsole'
// var vConsole = new VConsole()
import FastClick from 'fastclick'
FastClick.attach(document.body)
Vue.config.productionTip = false
Vue.prototype.$http = axios
// 自定义指令修改title
Vue.directive('title', {
  inserted: (el, binding) => {
    // document.title = binding.value
    document.title = el.dataset.title
  }
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
