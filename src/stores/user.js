// src/stores/user.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const user = ref({
    roles: [], // e.g. ['super_admin', 'admin', 'employee']
  })

  const isSuperAdmin = computed(() => user.value.roles.includes('super_admin'))
  const isAdmin = computed(() =>
    user.value.roles.includes('admin') || isSuperAdmin.value
  )

  // Other user related states & actions...

  return { user, isSuperAdmin, isAdmin }
})
