import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const routes = [
  {
    path: '/auth',
    name: 'AuthLayout',
    component: () => import('../layouts/AuthLayout.vue'),
    children: [
      {
        path: 'register',
        name: 'Register',
        component: () => import('../pages/AuthPages/RegisterPage.vue')
      },
      {
        path: 'login',
        name: 'Login',
        component: () => import('../pages/AuthPages/LoginPage.vue')
      }
    ]
  },
  {
    path: '/',
    name: 'AppLayout',
    component: () => import('../layouts/AppLayout.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('../pages/HomePage.vue')
      },
      {
        path: 'movie/:id',
        name: 'MovieDetails',
        component: () => import('../pages/MovieDetails.vue')
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Route guard for protected routes
router.beforeEach((to, from, next) => {
  const { isAuthenticated } = useAuth()
  
  const protectedRoutes = ['AddMovie', 'EditMovie']
  
  if (protectedRoutes.includes(to.name) && !isAuthenticated()) {
    next({ name: 'Login', query: { redirect: to.path } })
  } else {
    next()
  }
})

export default router
