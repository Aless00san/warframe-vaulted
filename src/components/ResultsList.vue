<script setup>
import { computed } from 'vue'
import { timeAgo } from '../utils/timeAgo.js'

const props = defineProps({
  results: {
    type: Array,
    default: () => [],
  },
})

const sorted = computed(() => {
  return [...props.results].sort((a, b) => {
    if (a.vaulted !== b.vaulted) return a.vaulted ? -1 : 1
    return a.name.localeCompare(b.name)
  })
})
</script>

<template>
  <div class="results-list" v-if="sorted.length">
    <ul>
      <li v-for="item in sorted" :key="item.id">
        <div class="item-info">
          <span class="item-name">{{ item.name }}</span>
          <span class="item-category">{{ item.category }}</span>
        </div>
        <div class="item-status">
          <span class="badge" :class="item.vaulted ? 'vaulted' : 'unvaulted'">
            {{ item.vaulted ? 'Vaulted' : 'Unvaulted' }}
          </span>
          <span v-if="item.vaulted && item.lastUnvault" class="last-unvault">
            Last unvaulted {{ timeAgo(item.lastUnvault) }}
          </span>
        </div>
      </li>
    </ul>
  </div>
  <p v-else class="empty">No results found.</p>
</template>

<style scoped>
.results-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #333;
  transition: background 0.15s;
  gap: 1rem;
}

li:hover {
  background: #2a2a2a;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.item-name {
  font-weight: 600;
}

.item-category {
  font-size: 0.8rem;
  color: #888;
}

.item-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.15rem;
  flex-shrink: 0;
}

.badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge.vaulted {
  background: #5a1a1a;
  color: #ff6b6b;
}

.badge.unvaulted {
  background: #1a4a1a;
  color: #6bff6b;
}

.last-unvault {
  font-size: 0.75rem;
  color: #888;
}

.empty {
  text-align: center;
  color: #666;
}
</style>
