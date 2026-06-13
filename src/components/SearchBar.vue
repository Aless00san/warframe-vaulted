<script setup>
import { ref } from 'vue'

const emit = defineEmits(['search'])
const query = ref('')

function onInput() {
  emit('search', query.value)
}
</script>

<template>
  <div class="search-bar">
    <input v-model="query" type="text" placeholder="Search Prime items..." @input="onInput" />
  </div>
</template>

<style scoped>
.search-bar {
  margin-bottom: 1.5rem;
}

input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 1px solid #444;
  border-radius: 6px;
  background: #1a1a1a;
  color: #fff;
  outline: none;
  box-sizing: border-box;
}

input:focus {
  border-color: #646cff;
}

input::placeholder {
  color: #666;
}
</style>
