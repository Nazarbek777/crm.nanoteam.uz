<template>
  <div class="client-detail-view">
    <div v-if="loading" class="loading">Yuklanmoqda...</div>
    <div v-else-if="client" class="detail-container">
      <!-- Header -->
      <div class="detail-header">
        <button @click="$router.back()" class="btn-back">← Orqaga</button>
        <h2>{{ client.name }} - Batafsil Ma'lumot</h2>
      </div>

      <!-- Client Info Card -->
      <div class="info-card">
        <h3>Asosiy Ma'lumotlar</h3>
        <div class="info-grid">
          <div class="info-item">
            <label>Ism:</label>
            <span>{{ client.name }}</span>
          </div>
          <div class="info-item">
            <label>Telefon:</label>
            <span>{{ client.phone || '-' }}</span>
          </div>
          <div class="info-item">
            <label>Uy Turi:</label>
            <span>{{ client.house_type || '-' }}</span>
          </div>
          <div class="info-item">
            <label>To'lov Usuli:</label>
            <span>{{ client.payment_method || '-' }}</span>
          </div>
          <div class="info-item">
            <label>Status:</label>
            <span :class="['status-badge', client.status]">
              {{ client.status === 'active' ? 'Faol' : 'Nofaol' }}
            </span>
          </div>
          <div class="info-item">
            <label>Operator:</label>
            <span>{{ client.operator?.user?.name || '-' }}</span>
          </div>
        </div>
      </div>

      <!-- Conversations History -->
      <div class="info-card">
        <h3>Gaplashuvlar Tarixi ({{ client.conversations?.length || 0 }})</h3>
        <div v-if="client.conversations && client.conversations.length > 0" class="conversations-list">
          <div v-for="conversation in client.conversations" :key="conversation.id" class="conversation-item">
            <div class="conversation-header">
              <div class="conversation-meta">
                <strong>{{ formatDate(conversation.conversation_date) }}</strong>
                <span class="conversation-type" v-if="conversation.conversation_type">
                  {{ getConversationTypeLabel(conversation.conversation_type) }}
                </span>
                <span class="conversation-result" v-if="conversation.result">
                  {{ getResultLabel(conversation.result) }}
                </span>
              </div>
              <div class="conversation-user">
                <strong>Operator:</strong> {{ conversation.user?.name }}
                <span v-if="conversation.user?.operator">
                  ({{ conversation.user.operator.section_type === 'jobbank' ? 'JobBank' : 'UyTV' }})
                </span>
                <span v-else-if="conversation.user?.role === 'technical'">(Texnik Bo'lim)</span>
              </div>
            </div>
            <div v-if="conversation.topic" class="conversation-topic">
              <strong>Mavzu:</strong> {{ conversation.topic }}
            </div>
            <div class="conversation-note">
              {{ conversation.note }}
            </div>
            <div v-if="conversation.next_action" class="conversation-action">
              <strong>Keyingi qadam:</strong> {{ conversation.next_action }}
            </div>
          </div>
        </div>
        <div v-else class="empty-message">
          Gaplashuvlar mavjud emas
        </div>
      </div>

      <!-- Reminders History -->
      <div class="info-card">
        <h3>Eslatmalar Tarixi ({{ client.reminders?.length || 0 }})</h3>
        <div v-if="client.reminders && client.reminders.length > 0" class="reminders-list">
          <div v-for="reminder in client.reminders" :key="reminder.id" class="reminder-item">
            <div class="reminder-header">
              <strong>{{ formatDate(reminder.reminder_date) }}</strong>
              <span :class="['reminder-status', reminder.is_completed ? 'completed' : 'pending']">
                {{ reminder.is_completed ? 'Bajarilgan' : 'Kutilmoqda' }}
              </span>
            </div>
            <div class="reminder-note">{{ reminder.note }}</div>
            <div class="reminder-user">
              <strong>Yaratgan:</strong> {{ reminder.user?.name }}
            </div>
          </div>
        </div>
        <div v-else class="empty-message">
          Eslatmalar mavjud emas
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../services/api'

const route = useRoute()
const client = ref<any | null>(null)
const loading = ref(true)

onMounted(() => {
  fetchClientDetail()
})

async function fetchClientDetail() {
  try {
    loading.value = true
    const response = await api.get(`/clients/${route.params.id}`)
    client.value = response.data
  } catch (error) {
    console.error('Fetch client detail error:', error)
  } finally {
    loading.value = false
  }
}

function formatDate(date: string) {
  if (!date) return '-'
  return new Date(date).toLocaleString('uz-UZ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getConversationTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    telefon: 'Telefon',
    telegram: 'Telegram',
    shaxsan: 'Shaxsan',
    boshqa: 'Boshqa'
  }
  return labels[type] || type
}

function getResultLabel(result: string): string {
  const labels: Record<string, string> = {
    muvaffaqiyatli: 'Muvaffaqiyatli',
    muvaffaqiyatsiz: 'Muvaffaqiyatsiz',
    keyinroq: 'Keyinroq'
  }
  return labels[result] || result
}
</script>

<style scoped>
.client-detail-view {
  padding: 20px;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
}

.btn-back {
  padding: 8px 16px;
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-back:hover {
  background: #e0e0e0;
}

.detail-header h2 {
  margin: 0;
  color: #2563eb;
}

.info-card {
  background: white;
  border-radius: 8px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.info-card h3 {
  margin: 0 0 20px 0;
  color: #2563eb;
  font-size: 20px;
  border-bottom: 2px solid #2563eb;
  padding-bottom: 10px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-item label {
  font-weight: 600;
  color: #666;
  font-size: 14px;
}

.info-item span {
  color: #333;
  font-size: 15px;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.active {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.inactive {
  background: #fee2e2;
  color: #991b1b;
}

.conversations-list,
.reminders-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.conversation-item,
.reminder-item {
  padding: 20px;
  background: #f9fafb;
  border-radius: 8px;
  border-left: 4px solid #2563eb;
}

.conversation-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 10px;
}

.conversation-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.conversation-type,
.conversation-result {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.conversation-type {
  background: #dbeafe;
  color: #1e40af;
}

.conversation-result {
  background: #d1fae5;
  color: #065f46;
}

.conversation-user {
  font-size: 13px;
  color: #666;
}

.conversation-topic {
  margin-bottom: 10px;
  font-weight: 600;
  color: #2563eb;
}

.conversation-note {
  margin-bottom: 10px;
  color: #333;
  line-height: 1.6;
}

.conversation-action {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #e5e7eb;
  color: #666;
  font-size: 14px;
}

.reminder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.reminder-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.reminder-status.completed {
  background: #d1fae5;
  color: #065f46;
}

.reminder-status.pending {
  background: #fef3c7;
  color: #92400e;
}

.reminder-note {
  margin-bottom: 10px;
  color: #333;
  line-height: 1.6;
}

.reminder-user {
  font-size: 13px;
  color: #666;
}

.empty-message {
  text-align: center;
  padding: 40px;
  color: #999;
  font-style: italic;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}
</style>

