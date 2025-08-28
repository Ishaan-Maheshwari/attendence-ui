import { createRouter, createWebHistory } from 'vue-router/auto'
// import { routes } from 'vue-router/auto-routes'

import Dashboard from '@/pages/Dashboard.vue'
import Employees from '@/pages/Employees.vue'
import Events from '@/pages/Events.vue'
import Entries from '@/pages/Entries.vue'
import Records from '@/pages/Records.vue'
import Users from '@/pages/Users.vue'
import Login from '@/pages/Login.vue'
import EmployeeRecords from '@/pages/EmployeeRecords.vue'
import RegulariseRecord from '@/pages/RegulariseRecord.vue'

import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { guestOnly: true },
  },
  {
    path: '/',
    meta: { requiresAuth: true },
    children: [
      { name: 'DashboardHome', path: '', component: Dashboard },
      { name: 'ManageEmployeesHome', path: 'employees', component: Employees },
      { path: 'events', component: Events },
      { path: 'entries', component: Entries },
      { name: 'ManageRecordsHome', path: 'records', component: Records },
      { name: 'ManageUsersHome', path: 'users', component: Users },
      { name: 'EmployeeRecords', path: 'records/emp/:employeeId', component: EmployeeRecords, props: true },
      { name: 'RegulariseRecord', path: '/regularise/:recordId', component: RegulariseRecord, props: true }
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Global route guard
router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next('/login')
  } else if (to.meta.guestOnly && auth.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (localStorage.getItem('vuetify:dynamic-reload')) {
      console.error('Dynamic import error, reloading page did not fix it', err)
    } else {
      console.log('Reloading page to fix dynamic import error')
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    }
  } else {
    console.error(err)
  }
})

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})

export default router
