<template>
  <div class="reminders-view">
    <div class="header-actions">
      <h2>Eslatmalar</h2>
    </div>

    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>Yuklanmoqda...</p>
    </div>
    <div v-else-if="reminders.length === 0" class="empty-state">
      <div class="empty-icon">📋</div>
      <h3>Eslatmalar ro'yxati bo'sh</h3>
    </div>
    <div v-else class="reminders-table-container">
      <table class="reminders-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Kimga</th>
            <th>Eslatma</th>
            <th>Sana va Vaqt</th>
            <th>Status</th>
            <th>Yaratgan</th>
            <th>Amallar</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="reminder in reminders" :key="reminder.id" class="table-row">
            <td>{{ reminder.id }}</td>
            <td class="name-cell">
              <strong>{{ reminder.master?.name || reminder.client?.name || '-' }}</strong>
            </td>
            <td>{{ reminder.note || '-' }}</td>
            <td>{{ formatDate(reminder.reminder_date) }}</td>
            <td>
              <span :class="['status-badge', reminder.is_completed ? 'completed' : 'pending']">
                {{ reminder.is_completed ? 'Bajarildi' : 'Kutilmoqda' }}
              </span>
            </td>
            <td>{{ reminder.user?.name || '-' }}</td>
            <td class="actions-cell">
              <div class="action-buttons">
                <button 
                  v-if="!reminder.is_completed"
                  @click="markCompleted(reminder.id)" 
                  class="btn-action btn-success"
                  title="Bajarildi deb belgilash"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </button>
                <button @click="deleteReminder(reminder.id)" class="btn-action btn-danger" title="O'chirish">
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

const reminders = ref([])
const loading = ref(true)

onMounted(() => {
  fetchReminders()
})

async function fetchReminders() {
  try {
    loading.value = true
    const response = await api.get('/reminders')
    reminders.value = response.data
  } catch (error) {
    console.error('Fetch reminders error:', error)
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

async function markCompleted(id: number) {
  try {
    await api.put(`/reminders/${id}`, { is_completed: true })
    fetchReminders()
  } catch (error) {
    console.error('Mark completed error:', error)
  }
}

async function deleteReminder(id: number) {
  if (!confirm('Eslatmani o\'chirishni tasdiqlaysizmi?')) return
  try {
    await api.delete(`/reminders/${id}`)
    fetchReminders()
  } catch (error) {
    console.error('Delete reminder error:', error)
  }
}
</script>

<style scoped>
.reminders-view {
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

.reminders-table-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.reminders-table {
  width: 100%;
  border-collapse: collapse;
}

.reminders-table thead {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 2px solid #e5e7eb;
}

.reminders-table th {
  padding: 1.5rem 1.75rem;
  text-align: left;
  font-weight: 700;
  font-size: 0.8125rem;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.reminders-table tbody tr {
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.2s ease;
}

.reminders-table tbody tr:hover {
  background: linear-gradient(90deg, #f8fafc 0%, #ffffff 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.reminders-table tbody tr:last-child {
  border-bottom: none;
}

.reminders-table td {
  padding: 1.5rem 1.75rem;
  font-size: 0.9375rem;
  color: #475569;
  vertical-align: middle;
}

.name-cell strong {
  font-weight: 700;
  color: #111827;
}

.status-badge {
  display: inline-block;
  padding: 0.375rem 0.875rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.completed {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.pending {
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

.btn-action.btn-success {
  background: #d1fae5;
  color: #065f46;
  border-color: #a7f3d0;
}

.btn-action.btn-success:hover {
  background: #a7f3d0;
  box-shadow: 0 4px 6px rgba(5, 150, 105, 0.2);
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

