<template>
  <div class="technical-view">
    <div class="header-actions">
      <h2>Texnik Bo'lim - O'tkazilgan Ustalar</h2>
    </div>

    <div v-if="loading" class="loading">Yuklanmoqda...</div>
    <div v-else class="masters-table-container">
      <table class="masters-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Usta Ismi</th>
            <th>Telefon</th>
            <th>Mutaxassislik</th>
            <th>Viloyat/Tuman</th>
            <th>O'tkazgan Operator</th>
            <th>O'tkazilgan Sana</th>
            <th>Amallar</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="master in masters" :key="master.id" class="table-row">
            <td>{{ master.id }}</td>
            <td class="name-cell">
              <strong>{{ master.name }}</strong>
            </td>
            <td>{{ master.phone || '-' }}</td>
            <td>{{ master.specialization || '-' }}</td>
            <td>
              {{ master.region ? `${master.region}, ${master.district || ''}` : '-' }}
            </td>
            <td>
              <span v-if="getTransferredBy(master)">
                {{ getTransferredBy(master)?.name }}
                <span v-if="getTransferredBy(master)?.operator">
                  ({{ getTransferredBy(master).operator.section_type === 'jobbank' ? 'JobBank' : 'UyTV' }})
                </span>
                <span v-else-if="getTransferredBy(master)?.role === 'super_admin'">
                  (SuperAdmin)
                </span>
              </span>
              <span v-else>-</span>
            </td>
            <td>
              {{ getTransferDate(master) ? formatDate(getTransferDate(master)) : '-' }}
            </td>
            <td class="actions-cell">
              <div class="action-buttons">
                <button @click="viewDetail(master.id)" class="btn-action btn-detail" title="Batafsil">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
                <button @click="openConversationModal(master)" class="btn-action" title="Gaplashuv">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </button>
                <button @click="openReminderModal(master)" class="btn-action" title="Eslatma">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="masters.length === 0" class="empty-table">
        O'tkazilgan ustalar yo'q
      </div>
    </div>

    <!-- Conversation Modal -->
    <div v-if="showConversationModal" class="modal">
      <div class="modal-content">
        <h3>Yangi Gaplashuv</h3>
        <form @submit.prevent="saveConversation">
          <div class="form-group">
            <label>Aloqa turi</label>
            <select v-model="conversationForm.conversation_type">
              <option value="">Tanlang</option>
              <option value="telefon">Telefon</option>
              <option value="telegram">Telegram</option>
              <option value="shaxsan">Shaxsan</option>
              <option value="boshqa">Boshqa</option>
            </select>
          </div>
          <div class="form-group">
            <label>Mavzu</label>
            <input v-model="conversationForm.topic" placeholder="Gaplashuv mavzusi" />
          </div>
          <div class="form-group">
            <label>Izoh</label>
            <textarea v-model="conversationForm.note" required rows="4" placeholder="Gaplashuv tafsilotlari"></textarea>
          </div>
          <div class="form-group">
            <label>Natija</label>
            <select v-model="conversationForm.result">
              <option value="">Tanlang</option>
              <option value="muvaffaqiyatli">Muvaffaqiyatli</option>
              <option value="muvaffaqiyatsiz">Muvaffaqiyatsiz</option>
              <option value="keyinroq">Keyinroq</option>
            </select>
          </div>
          <div class="form-group">
            <label>Keyingi qadam</label>
            <textarea v-model="conversationForm.next_action" rows="2" placeholder="Keyingi qadamlar"></textarea>
          </div>
          <div class="form-group">
            <label>Sana va Vaqt</label>
            <input v-model="conversationForm.conversation_date" type="datetime-local" required />
          </div>
          <div class="modal-actions">
            <button type="button" @click="showConversationModal = false" class="btn-secondary">Bekor</button>
            <button type="submit" class="btn-primary">Saqlash</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Reminder Modal -->
    <div v-if="showReminderModal" class="modal">
      <div class="modal-content">
        <h3>Yangi Eslatma</h3>
        <form @submit.prevent="saveReminder">
          <div class="form-group">
            <label>Eslatma</label>
            <textarea v-model="reminderForm.note" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>Sana va Vaqt</label>
            <input v-model="reminderForm.reminder_date" type="datetime-local" required />
          </div>
          <div class="modal-actions">
            <button type="button" @click="showReminderModal = false" class="btn-secondary">Bekor</button>
            <button type="submit" class="btn-primary">Saqlash</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const router = useRouter()
const masters = ref<any[]>([])
const loading = ref(true)
const showConversationModal = ref(false)
const showReminderModal = ref(false)
const selectedMaster = ref<any | null>(null)

const conversationForm = ref({
  note: '',
  conversation_date: new Date().toISOString().slice(0, 16),
  conversation_type: '',
  result: '',
  topic: '',
  next_action: '',
})

const reminderForm = ref({
  note: '',
  reminder_date: new Date().toISOString().slice(0, 16),
})

onMounted(() => {
  fetchMasters()
})

async function fetchMasters() {
  try {
    loading.value = true
    const response = await api.get('/technical/masters')
    masters.value = response.data
  } catch (error) {
    console.error('Fetch masters error:', error)
  } finally {
    loading.value = false
  }
}

function getTransferredBy(master: any) {
  if (master.notifications && master.notifications.length > 0) {
    return master.notifications[0].transferred_by
  }
  return null
}

function getTransferDate(master: any) {
  if (master.notifications && master.notifications.length > 0) {
    return master.notifications[0].created_at
  }
  return null
}

function formatDate(date: string) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('uz-UZ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function viewDetail(id: number) {
  router.push(`/masters/${id}`)
}

function openConversationModal(master: any) {
  selectedMaster.value = master
  conversationForm.value = {
    note: '',
    conversation_date: new Date().toISOString().slice(0, 16),
    conversation_type: '',
    result: '',
    topic: '',
    next_action: '',
  }
  showConversationModal.value = true
}

async function saveConversation() {
  if (!selectedMaster.value) {
    return
  }
  try {
    await api.post('/conversations', {
      master_id: selectedMaster.value.id,
      note: conversationForm.value.note,
      conversation_date: conversationForm.value.conversation_date,
      conversation_type: conversationForm.value.conversation_type || null,
      result: conversationForm.value.result || null,
      topic: conversationForm.value.topic || null,
      next_action: conversationForm.value.next_action || null,
    })
    showConversationModal.value = false
    fetchMasters()
  } catch (error) {
    console.error('Save conversation error:', error)
  }
}

function openReminderModal(master: any) {
  selectedMaster.value = master
  reminderForm.value = {
    note: '',
    reminder_date: new Date().toISOString().slice(0, 16),
  }
  showReminderModal.value = true
}

async function saveReminder() {
  if (!selectedMaster.value) {
    return
  }
  try {
    await api.post('/reminders', {
      master_id: selectedMaster.value.id,
      note: reminderForm.value.note,
      reminder_date: reminderForm.value.reminder_date,
    })
    showReminderModal.value = false
  } catch (error) {
    console.error('Save reminder error:', error)
  }
}
</script>

<style scoped>
.technical-view {
  width: 100%;
  max-width: 100%;
}

.header-actions {
  margin-bottom: 2rem;
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

.masters-table-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.masters-table {
  width: 100%;
  border-collapse: collapse;
}

.masters-table thead {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 2px solid #e5e7eb;
}

.masters-table th {
  padding: 1.5rem 1.75rem;
  text-align: left;
  font-weight: 700;
  font-size: 0.8125rem;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.masters-table tbody tr {
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.2s ease;
}

.masters-table tbody tr:hover {
  background: linear-gradient(90deg, #f8fafc 0%, #ffffff 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.masters-table tbody tr:last-child {
  border-bottom: none;
}

.masters-table td {
  padding: 1.5rem 1.75rem;
  font-size: 0.9375rem;
  color: #475569;
  vertical-align: middle;
}

.name-cell strong {
  color: #0f172a;
  font-weight: 700;
  font-size: 1rem;
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
  font-size: 1.125rem;
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

.btn-action.btn-detail {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
}

.btn-action svg {
  width: 16px;
  height: 16px;
}

.btn-action:hover {
  background: #e2e8f0;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.empty-table {
  text-align: center;
  padding: 5rem 2rem;
  color: #94a3b8;
  font-size: 1.125rem;
  font-weight: 500;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  padding: 2.5rem;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
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

.modal-content h3 {
  margin: 0 0 2rem 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.75rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.9375rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.875rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.9375rem;
  transition: all 0.2s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn-secondary {
  background: white;
  color: #6b7280;
  border: 2px solid #e5e7eb;
  padding: 0.875rem 2rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  padding: 0.875rem 2rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(59, 130, 246, 0.4);
}
</style>

