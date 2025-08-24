<template>
  <v-app>
    <!-- App Bar Component -->
    <AppBar />
    
    <!-- Main Content Area -->
    <v-main>
        <slot />
    </v-main>
    
    <!-- Footer Component -->
    <!-- <AppFooter /> -->
  </v-app>
</template>

<script>
import AppBar from '@/components/AppBar.vue'
import AppFooter from '@/components/AppFooter.vue'

export default {
  name: 'MainLayout',
  components: {
    AppBar,
    AppFooter
  }
}
</script>

<style scoped>
.fill-height {
  min-height: calc(100vh - 128px); /* Adjust based on app bar and footer height */
}
</style>