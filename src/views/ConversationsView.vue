<template>
  <div class="conversations-view">
    <div class="header-actions">
      <h2>Gaplashuvlar</h2>
    </div>

    <div class="filters">
      <select v-model="filterType" @change="fetchConversations">
        <option value="">Barchasi</option>
        <option value="master">Ustalar</option>
        <option value="client">Mijozlar</option>
      </select>
    </div>

    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>Yuklanmoqda...</p>
    </div>
    <div v-else-if="conversations.length === 0" class="empty-state">
      <div class="empty-icon">💬</div>
      <h3>Gaplashuvlar ro'yxati bo'sh</h3>
    </div>
    <div v-else class="conversations-table-container">
      <table class="conversations-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Kimga</th>
            <th>Mavzu</th>
            <th>Izoh</th>
            <th>Aloqa Turi</th>
            <th>Natija</th>
            <th>Sana</th>
            <th>Operator</th>
            <th>Amallar</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="conversation in conversations" :key="conversation.id" class="table-row">
            <td>{{ conversation.id }}</td>
            <td class="name-cell">
              <strong>{{ conversation.master?.name || conversation.client?.name || '-' }}</strong>
            </td>
            <td>{{ conversation.topic || '-' }}</td>
            <td class="note-cell">{{ conversation.note || '-' }}</td>
            <td>
              <span v-if="conversation.conversation_type" class="type-badge">
                {{ getConversationTypeLabel(conversation.conversation_type) }}
              </span>
              <span v-else>-</span>
            </td>
            <td>
              <span v-if="conversation.result" :class="['result-badge', conversation.result]">
                {{ getResultLabel(conversation.result) }}
              </span>
              <span v-else>-</span>
            </td>
            <td>{{ formatDate(conversation.conversation_date) }}</td>
            <td>
              <small>
                {{ conversation.user?.name }}
                <span v-if="conversation.user?.operator">
                  ({{ conversation.user.operator.section_type === 'jobbank' ? 'JobBank' : 'UyTV' }})
                </span>
                <span v-else-if="conversation.user?.role === 'technical'">(Texnik)</span>
              </small>
            </td>
            <td class="actions-cell">
              <div class="action-buttons">
                <button @click="deleteConversation(conversation.id)" class="btn-action btn-danger" title="O'chirish">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '../services/api'

const conversations = ref([])
const loading = ref(true)
const filterType = ref('')

onMounted(() => {
  fetchConversations()
})

async function fetchConversations() {
  try {
    loading.value = true
    const params: any = {}
    // Add filter logic if needed
    const response = await api.get('/conversations', { params })
    conversations.value = response.data
  } catch (error) {
    console.error('Fetch conversations error:', error)
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

async function deleteConversation(id: number) {
  if (!confirm('Gaplashuvni o\'chirishni tasdiqlaysizmi?')) return
  try {
    await api.delete(`/conversations/${id}`)
    fetchConversations()
  } catch (error) {
    console.error('Delete conversation error:', error)
  }
}
</script>

<style scoped>
.conversations-view {
  width: 100%;
  max-width: 100%;
}

.header-actions {
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.header-actions h2 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
}

.filters {
  margin-bottom: 2rem;
}

.filters select {
  padding: 0.875rem 1.5rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9375rem;
  background: white;
  color: #374151;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.filters select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.loading {
  text-align: center;
  padding: 4rem;
  color: #6b7280;
  font-size: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading p {
  margin: 0;
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 5rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.empty-icon {
  font-size: 5rem;
  margin-bottom: 1.5rem;
  opacity: 0.5;
}

.empty-state h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #475569;
}

.conversations-table-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.conversations-table {
  width: 100%;
  border-collapse: collapse;
}

.conversations-table thead {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 2px solid #e5e7eb;
}

.conversations-table th {
  padding: 1.5rem 1.75rem;
  text-align: left;
  font-weight: 700;
  font-size: 0.8125rem;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.conversations-table tbody tr {
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.2s ease;
}

.conversations-table tbody tr:hover {
  background: linear-gradient(90deg, #f8fafc 0%, #ffffff 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.conversations-table tbody tr:last-child {
  border-bottom: none;
}

.conversations-table td {
  padding: 1.5rem 1.75rem;
  font-size: 0.9375rem;
  color: #475569;
  vertical-align: middle;
}

.name-cell strong {
  font-weight: 700;
  color: #111827;
}

.note-cell {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.type-badge {
  display: inline-block;
  padding: 0.375rem 0.875rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  background: #dbeafe;
  color: #1e40af;
}

.result-badge {
  display: inline-block;
  padding: 0.375rem 0.875rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.result-badge.muvaffaqiyatli {
  background: #d1fae5;
  color: #065f46;
}

.result-badge.muvaffaqiyatsiz {
  background: #fee2e2;
  color: #991b1b;
}

.result-badge.keyinroq {
  background: #fef3c7;
  color: #92400e;
}

.actions-cell {
  white-space: nowrap;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.btn-action {
  padding: 0.625rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #f8fafc;
  color: #475569;
  border: 1px solid #e2e8f0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-action:hover {
  background: #e2e8f0;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn-action.btn-danger {
  background: #fee2e2;
  color: #dc2626;
  border-color: #fecaca;
}

.btn-action.btn-danger:hover {
  background: #fecaca;
  box-shadow: 0 4px 6px rgba(239, 68, 68, 0.2);
}

.btn-action svg {
  width: 16px;
  height: 16px;
}
</style>

