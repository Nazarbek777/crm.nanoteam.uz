<template>
  <div v-if="show" class="confirmation-modal-overlay" @click.self="handleCancel">
    <div class="confirmation-modal">
      <div class="confirmation-icon">
        {{ type === 'danger' ? '⚠️' : '❓' }}
      </div>
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
      <div class="confirmation-actions">
        <button @click="handleCancel" class="btn-cancel">{{ cancelText }}</button>
        <button @click="handleConfirm" :class="['btn-confirm', type]">{{ confirmText }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'

interface Props {
  show: boolean
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Tasdiqlash',
  message: 'Bu amalni bajarishni tasdiqlaysizmi?',
  confirmText: 'Ha',
  cancelText: 'Yo\'q',
  type: 'warning'
})

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

function handleConfirm() {
  emit('confirm')
}

function handleCancel() {
  emit('cancel')
}

// Close on Escape key
watch(() => props.show, (newVal) => {
  if (newVal) {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }
})
</script>

<style scoped>
.confirmation-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.confirmation-modal {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.confirmation-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.confirmation-modal h3 {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

.confirmation-modal p {
  margin: 0 0 2rem 0;
  color: #6b7280;
  font-size: 1rem;
  line-height: 1.6;
}

.confirmation-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-cancel {
  padding: 0.875rem 2rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  background: white;
  color: #6b7280;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.btn-confirm {
  padding: 0.875rem 2rem;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  color: white;
}

.btn-confirm.warning {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.btn-confirm.warning:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
}

.btn-confirm.danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.btn-confirm.danger:hover {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.btn-confirm.info {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.btn-confirm.info:hover {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4);
}
</style>

