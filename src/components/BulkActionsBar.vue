<template>
  <div class="bulk-actions-bar" v-if="selectedItems.length > 0">
    <div class="bulk-info">
      <strong>{{ selectedItems.length }} ta tanlangan</strong>
    </div>
    <div class="bulk-buttons">
      <button @click="bulkExport" class="btn-bulk">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        Eksport qilish
      </button>
      <button @click="bulkStatusChange" class="btn-bulk">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        Status o'zgartirish
      </button>
      <button @click="bulkDelete" class="btn-bulk btn-danger">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
        O'chirish
      </button>
      <button @click="clearSelection" class="btn-bulk btn-secondary">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
        Bekor qilish
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

const props = defineProps<{
  selectedItems: any[]
}>()

const emit = defineEmits(['export', 'statusChange', 'delete', 'clear'])

function bulkExport() {
  emit('export')
}

function bulkStatusChange() {
  emit('statusChange')
}

function bulkDelete() {
  emit('delete')
}

function clearSelection() {
  emit('clear')
}
</script>

<style scoped>
.bulk-actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.bulk-info {
  font-size: 1rem;
  font-weight: 600;
}

.bulk-buttons {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.btn-bulk {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: white;
  color: #3b82f6;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.btn-bulk:hover {
  background: #f0f9ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn-bulk.btn-danger {
  color: #ef4444;
}

.btn-bulk.btn-danger:hover {
  background: #fef2f2;
}

.btn-bulk.btn-secondary {
  color: #6b7280;
}

.btn-bulk svg {
  width: 16px;
  height: 16px;
}
</style>


