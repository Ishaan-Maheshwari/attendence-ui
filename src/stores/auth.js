import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: localStorage.getItem('user') || null, // optionally store user info
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    getUser: (state) => !!state.user,
  },
  actions: {
    setToken(token) {
      this.token = token
      localStorage.setItem('token', token)
    },
    setUser(user) {
      this.user = user
      localStorage.setItem('user', JSON.stringify(user))
    },
    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // useRouter().push('/login') // avoid if outside setup()
    },
  },
})
