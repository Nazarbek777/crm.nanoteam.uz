<template>
  <div v-if="show" class="modal">
    <div class="modal-content">
      <h3>SMS yuborish</h3>
      <p class="recipient-info">
        <span class="label">Kimga:</span>
        <strong>{{ recipientName || 'Aniqlanmagan' }}</strong>
        <span class="phone">{{ phone }}</span>
      </p>
      <p class="helper-text">
        SMS matni Eskiz tomonidan tasdiqlangan shablon bo'yicha yuboriladi.
      </p>

      <div class="form-group">
        <label>SMS matni</label>
        <textarea
          :value="message"
          rows="4"
          readonly
        />
        <div class="message-meta">
          <span>{{ message.length }}/500</span>
          <span v-if="message.length > 160" class="segments">
            ~{{ segments }} ta segment
          </span>
        </div>
      </div>

      <div class="modal-actions">
        <button type="button" class="btn-secondary" @click="handleClose" :disabled="loading">
          Bekor
        </button>
        <button type="button" class="btn-primary" @click="handleSend" :disabled="loading || !message">
          {{ loading ? 'Yuborilmoqda...' : 'Yuborish' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  recipientName: { type: String, default: '' },
  phone: { type: String, default: '' },
  loading: { type: Boolean, default: false },
  message: { type: String, default: '' },
})

const emit = defineEmits(['close', 'send'])

const segments = computed(() => (props.message ? Math.ceil(props.message.length / 160) : 0))

function handleClose() {
  emit('close')
}

function handleSend() {
  emit('send')
}
</script>

<style scoped>
.recipient-info {
  margin-bottom: 0.5rem;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.recipient-info .label {
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  color: #94a3b8;
}

.recipient-info .phone {
  background: #f1f5f9;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.875rem;
  color: #0f172a;
}

.helper-text {
  margin: 0 0 1rem;
  font-size: 0.85rem;
  color: #64748b;
}

textarea {
  width: 100%;
  padding: 0.875rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 0.95rem;
  min-height: 140px;
  resize: vertical;
  background: #f8fafc;
  color: #0f172a;
}

textarea:focus {
  outline: none;
}

.message-meta {
  margin-top: 0.5rem;
  display: flex;
  justify-content: space-between;
  color: #94a3b8;
  font-size: 0.8125rem;
}

.message-meta .segments {
  color: #3b82f6;
  font-weight: 600;
}
</style>
