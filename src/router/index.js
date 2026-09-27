import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/', name: 'carta', component: () => import('../views/CartaView.vue'), meta: { roles: [null, 'cliente', 'cocina', 'reparto', 'admin'] } },
  { path: '/mi-pedido', name: 'mi-pedido', component: () => import('../views/MiPedidoView.vue'), meta: { roles: ['cliente'] } },
  { path: '/perfil', name: 'perfil', component: () => import('../views/PerfilView.vue'), meta: { roles: ['cliente', 'cocina', 'reparto', 'admin'] } },
  { path: '/cesta', name: 'cesta', component: () => import('../views/CestaView.vue'), meta: { roles: [null, 'cliente'] } },
  { path: '/cocina', name: 'cocina', component: () => import('../views/CocinaView.vue'), meta: { roles: ['cocina'] } },
  { path: '/reparto', name: 'reparto', component: () => import('../views/RepartoView.vue'), meta: { roles: ['reparto'] } },
  { path: '/admin', name: 'admin', component: () => import('../views/AdminView.vue'), meta: { roles: ['admin'] } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})
//TODO: reactivar cuando esté implementado el login real 
//router.beforeEach((to) => {
//  const authStore = useAuthStore()
//  if (to.meta.roles && !to.meta.roles.includes(authStore.role)) {
//    return { name: 'carta' }
//  }
//})

export default router