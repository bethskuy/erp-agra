<script setup>
import { ref, onMounted } from 'vue'
import AppSplash from './components/AppSplash.vue'

const loading = ref(true)

onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 2500)
})
</script>

<template>
  <AppSplash v-if="loading" />

  <router-view v-else />
</template>
