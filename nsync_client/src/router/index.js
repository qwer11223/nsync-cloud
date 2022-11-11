import Vue from 'vue'
import VueRouter from 'vue-router'

/*Layout*/
import Layout from '@/layout'

/* Router Modules */
import Login from '@/views/login'


Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/myfile',
    name: 'Layout',
    component: Layout,
    children: [
      {
        path: '/myfile',
        component: () => import('@/views/myfile/index'),
        meta: {
          title: '我的文件'
        }
      },
      {
        path: '/trash',
        component: () => import('@/views/trash/index'),
        meta: {
          title: '回收站'
        }
      },
      {
        path: '/share',
        component: () => import('@/views/share/index'),
        meta: {
          title: '文件共享'
        }
      },
      {
        path: '/setting',
        component: () => import('@/views/setting/index'),
        meta: {
          title: '设置'
        }
      },
      {
        path: '/device',
        component: () => import('@/views/device/index'),
        meta: {
          title: '在线设备'
        }
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/s',
    component: () => import('@/views/shareview/index')
  }
  // {
  //   path: '/about',
  //   name: 'About',
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   //component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  // }
]

const router = new VueRouter({
  mode: 'hash',
  routes
})

router.beforeEach((to, from, next) => {
  if (to.path == '/s') return next()  //分享页面
  if (to.path == '/login') return next()
  if (!localStorage.getItem('token')) return next('/login')
  next()
})

export default router
