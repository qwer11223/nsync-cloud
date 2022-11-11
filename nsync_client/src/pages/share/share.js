import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './share.vue'
// import router from '../../router'
// import store from '../../store'
import axios from '../../config'
// import io from '../../../public/socket.io.min.js'
import * as filters from '../../filter'

//////element ui/////
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import 'font-awesome/css/font-awesome.min.css'

//////全局过滤器////////
Object.keys(filters).forEach(key => {
    Vue.filter(key, filters[key])
})

const router = new VueRouter({
    mode: 'hash',
    routes: [
        { path: '/' }
    ]
})


//全局注册
Vue.use(VueRouter)
Vue.use(ElementUI)
Vue.config.productionTip = false
Vue.prototype.$axios = axios.axios
// Vue.prototype.$io = io
// Vue.prototype.$EventBus = new Vue() //全局的事件总线

new Vue({
    router,
    // store,
    render: h => h(App)
}).$mount('#share')
