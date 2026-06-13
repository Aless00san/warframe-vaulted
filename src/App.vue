<script setup>
import { ref, onMounted } from 'vue'
import Fuse from 'fuse.js'
import AppHeader from './components/AppHeader.vue'
import SearchBar from './components/SearchBar.vue'
import ResultsList from './components/ResultsList.vue'

const fuse = ref(null)
const results = ref([])
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    const resp = await fetch(`${import.meta.env.BASE_URL}items.json`)
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    const items = await resp.json()
    fuse.value = new Fuse(items, {
      keys: ['name'],
      threshold: 0.4,
    })
  } catch (e) {
    error.value = 'Failed to load item data.'
  } finally {
    loading.value = false
  }
})

function onSearch(query) {
  if (!fuse.value || !query.trim()) {
    results.value = []
    return
  }
  results.value = fuse.value.search(query).map((r) => r.item)
}
</script>

<template>
  <div class="app">
    <AppHeader />
    <p v-if="loading" class="status">Loading item data...</p>
    <p v-else-if="error" class="status error">{{ error }}</p>
    <template v-else>
      <SearchBar @search="onSearch" />
      <ResultsList :results="results" />
    </template>
  </div>
</template>

<style scoped>
.app {
  max-width: 600px;
  margin: 3rem auto;
  padding: 0 1rem;
}

.status {
  text-align: center;
  color: #888;
  margin-top: 2rem;
}

.status.error {
  color: #ff6b6b;
}
</style>
