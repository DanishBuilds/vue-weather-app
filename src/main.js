import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './styles/main.scss'

// Import pages with lazy loading
const HomePage = () => import('./pages/HomePage.vue')
const DetailPage = () => import('./pages/DetailPage.vue')

// Router configuration
const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
    meta: {
      title: 'Weather App - Current Weather',
    },
  },
  {
    path: '/detail/:city?',
    name: 'detail',
    component: DetailPage,
    meta: {
      title: 'Weather Details',
    },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Update document title on route change
router.beforeEach((to) => {
  document.title = to.meta?.title as string || 'Weather App'
})

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

app.mount('#app')
