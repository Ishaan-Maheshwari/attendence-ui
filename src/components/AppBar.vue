<template>
  
  <v-app-bar 
    color="amber-lighten-4"
    elevation="2"
    height="50"
    class="rounded-lg mx-1 my-1"
  >

  
  
  <!-- App Title -->
  <v-toolbar-title class="text-h6 font-weight-medium">
    
  </v-toolbar-title>
  
  <v-spacer></v-spacer>

    <!-- Navigation Links -->
    <v-btn
      variant="text"
      color="grey-darken-2"
      prepend-icon="mdi-home"
      @click="navigateTo('DashboardHome')"
    >
      Home
    </v-btn>
    
    <v-btn
      variant="text"
      color="grey-darken-2"
      prepend-icon="mdi-account-hard-hat"
      @click="navigateTo('ManageEmployeesHome')"
    >
      Employees
    </v-btn>
    
    <v-btn
      variant="text"
      color="grey-darken-2"
      prepend-icon="mdi-file-document-outline"
      @click="navigateTo('')"
    >
      Entries
    </v-btn>
    
    <v-btn
      variant="text"
      color="grey-darken-2"
      prepend-icon="mdi-database-outline"
      @click="navigateTo('ManageRecordsHome')"
    >
      Records
    </v-btn>

   <v-btn
      variant="text"
      color="grey-darken-2"
      prepend-icon="mdi-account"
      @click="navigateTo('ManageUsersHome')"
    >
      Users
    </v-btn>

    <v-btn
      variant="text"
      color="grey-darken-2"
      prepend-icon="mdi-logout"
      @click="logout()"
    >
      Logout
    </v-btn>

  </v-app-bar>
</template>

<script>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'AppBar',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()

    const navigateTo = (route) => {
      console.log(`Navigating to: ${route}`)
      router.push({ name: route })
    }

    const logout = () => {
      authStore.logout()
      navigateTo('Login')
    }

    return {
      navigateTo,
      logout
    }
  }
}
</script>

<style scoped>
.v-toolbar-title {
  font-style: italic;
}

</style>