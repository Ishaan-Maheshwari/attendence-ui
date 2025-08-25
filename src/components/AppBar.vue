<template>
  <v-app-bar 
    color="white"
    elevation="0"
    height="70"
    class="border-b-thin border-grey-lighten-3 px-6"
    style="backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);"
  >
    <!-- Brand Section -->
    <div class="d-flex align-center">
      <v-avatar size="36" color="primary" class="me-3">
        <v-icon color="white" size="20">mdi-office-building</v-icon>
      </v-avatar>
      <div>
        <h2 class="text-h6 font-weight-bold text-grey-darken-3 mb-0 lh-1">Attendance</h2>
        <p class="text-caption text-grey-darken-1 mb-0">Management System</p>
      </div>
    </div>
    
    <v-spacer></v-spacer>

    <!-- Navigation Menu -->
    <nav v-if="isLoggedIn"  class="d-flex align-center">
      <v-btn
        v-for="item in navigationItems"
        :key="item.name"
        :prepend-icon="item.icon"
        variant="text"
        color="grey-darken-2"
        class="nav-btn me-1"
        :class="{ 'nav-btn-active': isActiveRoute(item.route) }"
        @click="navigateTo(item.route)"
        size="default"
        rounded="lg"
      >
        {{ item.name }}
      </v-btn>

      <!-- Divider -->
      <v-divider vertical class="mx-4 opacity-30"></v-divider>

      <!-- User Menu -->
      <v-menu offset-y>
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            variant="text"
            class="user-menu-btn"
            size="default"
            rounded="lg"
          >
            <v-avatar size="32" color="primary" class="me-2">
              <v-icon color="white" size="16">mdi-account</v-icon>
            </v-avatar>
            <span class="text-grey-darken-2 font-weight-medium me-1">Admin</span>
            <v-icon color="grey-darken-1" size="16">mdi-chevron-down</v-icon>
          </v-btn>
        </template>

        <v-list class="elevation-8" min-width="180" rounded="lg">
          <!-- <v-list-item
            prepend-icon="mdi-account-circle"
            title="Profile"
            subtitle="Manage account"
            class="py-3"
          ></v-list-item> -->
          
          <!-- <v-list-item
            prepend-icon="mdi-cog"
            title="Settings"
            subtitle="App preferences"
            class="py-3"
          ></v-list-item> -->
          
          <!-- <v-divider class="my-2"></v-divider> -->
          
          <v-list-item
            prepend-icon="mdi-logout"
            title="Sign Out"
            class="py-3 text-error"
            @click="logout()"
          ></v-list-item>
        </v-list>
      </v-menu>
    </nav>
  </v-app-bar>
</template>

<script>
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { computed } from 'vue'

export default {
  name: 'AppBar',

  setup() {
    const router = useRouter()
    const route = useRoute()
    const authStore = useAuthStore()

    const navigationItems = [
      { name: 'Dashboard', route: 'DashboardHome', icon: 'mdi-view-dashboard-outline' },
      { name: 'Employees', route: 'ManageEmployeesHome', icon: 'mdi-account-group-outline' },
      // { name: 'Entries', route: '', icon: 'mdi-calendar-clock' },
      { name: 'Records', route: 'ManageRecordsHome', icon: 'mdi-file-chart-outline' },
      { name: 'Users', route: 'ManageUsersHome', icon: 'mdi-account-supervisor-outline' }
    ]

    const navigateTo = (routeName) => {
      if (routeName) {
        console.log(`Navigating to: ${routeName}`)
        router.push({ name: routeName })
      }
    }

    const isActiveRoute = (routeName) => {
      return route.name === routeName
    }

    const logout = () => {
      authStore.logout()
      router.push({ name: 'Login' })
    }

    const isLoggedIn = computed(() => authStore.isAuthenticated)

    return {
      navigationItems,
      navigateTo,
      isActiveRoute,
      logout,
      isLoggedIn
    }
  }
}
</script>

<style scoped>
/* Navigation Button Styles */
.nav-btn {
  position: relative;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
  letter-spacing: 0.5px;
  text-transform: none;
  height: 40px;
  min-width: auto;
  padding: 0 16px;
}

.nav-btn::before {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%) scaleX(0);
  width: 80%;
  height: 2px;
  background: rgb(var(--v-theme-primary));
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 1px;
}

.nav-btn:hover::before,
.nav-btn-active::before {
  transform: translateX(-50%) scaleX(1);
}

.nav-btn:hover {
  background-color: rgba(var(--v-theme-primary), 0.04);
  color: rgb(var(--v-theme-primary));
}

.nav-btn-active {
  color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.08);
  font-weight: 600;
}

/* User Menu Button */
.user-menu-btn {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  text-transform: none;
  height: 44px;
  padding: 0 12px;
  border: 1px solid transparent;
}

.user-menu-btn:hover {
  background-color: rgba(var(--v-theme-primary), 0.04);
  border-color: rgba(var(--v-theme-primary), 0.12);
}

/* App Bar Enhancements */
.v-app-bar {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95) !important;
}

/* Typography Enhancements */
.lh-1 {
  line-height: 1.1;
}

/* Responsive Design */
@media (max-width: 960px) {
  .nav-btn {
    min-width: auto;
    padding: 0 12px;
  }
  
  .nav-btn .v-btn__content {
    font-size: 0.875rem;
  }
}

@media (max-width: 768px) {
  .nav-btn .v-btn__prepend {
    display: none;
  }
}

/* Custom List Styles */
.v-list {
  padding: 8px;
}

.v-list-item {
  border-radius: 8px;
  margin: 2px 0;
}

.v-list-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.04);
}

/* Smooth Animations */
* {
  transition: color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>