<template>
  <div class="clients-view">
    <div class="header-actions">
      <h2>Mijozlar Ro'yxati</h2>
      <div class="header-right">
        <div class="search-box">
          <input 
            v-model="searchQuery" 
            @input="handleSearch"
            type="text" 
            placeholder="Qidirish (ism, telefon...)" 
            class="search-input"
          />
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="M21 21l-4.35-4.35"></path>
          </svg>
        </div>
        <div class="filters-bar">
          <select v-model="filterStatus" @change="applyFilters" class="filter-select">
            <option value="">Barcha Status</option>
            <option value="active">Faol</option>
            <option value="inactive">Nofaol</option>
          </select>
        </div>
        <div class="action-buttons-header">
          <Tooltip text="Excel'ga eksport qilish">
            <button @click="exportToExcel" class="btn-secondary btn-export">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Excel
            </button>
          </Tooltip>
          <Tooltip text="Yangi mijoz qo'shish (Ctrl+N)">
            <button @click="showAddModal = true" class="btn-primary">+ Yangi Mijoz</button>
          </Tooltip>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>Yuklanmoqda...</p>
    </div>
    <div v-else-if="displayedClients.length === 0 && !loading" class="empty-state">
      <div class="empty-icon">👥</div>
      <h3>{{ clients.length === 0 ? 'Mijozlar ro\'yxati bo\'sh' : 'Filtrlangan natijalar topilmadi' }}</h3>
      <p v-if="clients.length === 0">Yangi mijoz qo'shish uchun "Yangi Mijoz" tugmasini bosing</p>
      <p v-else>Boshqa filterlarni tanlab ko'ring</p>
      <button v-if="clients.length === 0" @click="showAddModal = true" class="btn-primary">+ Yangi Mijoz Qo'shish</button>
    </div>
    <div v-else class="clients-table-container">
      <table class="clients-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Ism</th>
            <th>Telefon</th>
            <th>Uy Turi</th>
            <th>To'lov Usuli</th>
            <th>Status</th>
            <th>Oxirgi Gaplashuv</th>
            <th>Amallar</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="client in displayedClients" :key="client.id" class="table-row">
            <td>{{ client.id }}</td>
            <td class="name-cell">
              <strong>{{ client.name }}</strong>
            </td>
            <td>{{ client.phone || '-' }}</td>
            <td>{{ client.house_type || '-' }}</td>
            <td>{{ client.payment_method || '-' }}</td>
            <td>
              <span :class="['status-badge', client.status]">
                {{ client.status === 'active' ? 'Faol' : 'Nofaol' }}
              </span>
            </td>
            <td>
              {{ client.last_conversation_date ? formatDate(client.last_conversation_date) : '-' }}
            </td>
            <td class="actions-cell">
              <div class="action-buttons">
                <Tooltip text="Batafsil ko'rish">
                  <button @click="viewDetail(client.id)" class="btn-action btn-detail">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>
                </Tooltip>
                <Tooltip text="SMS yuborish">
                  <button @click="openSmsModal(client)" class="btn-action" title="SMS yuborish">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4 4h16v13H5.17L4 18.17V4z"></path>
                      <polyline points="22 6 12 13 2 6"></polyline>
                    </svg>
                  </button>
                </Tooltip>
                <Tooltip text="Gaplashuv qo'shish">
                  <button @click="openConversationModal(client)" class="btn-action" title="Gaplashuv">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </button>
                </Tooltip>
                <Tooltip text="Eslatma qo'shish">
                  <button @click="openReminderModal(client)" class="btn-action" title="Eslatma">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                  </button>
                </Tooltip>
                <Tooltip text="Tahrirlash">
                  <button @click="editClient(client)" class="btn-action" title="Tahrirlash">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                </Tooltip>
                <Tooltip text="O'chirish">
                  <button @click="deleteClient(client.id)" class="btn-action btn-danger" title="O'chirish">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </Tooltip>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showAddModal || editingClient" class="modal">
      <div class="modal-content">
        <h3>{{ editingClient ? 'Tahrirlash' : 'Yangi Mijoz' }}</h3>
        <form @submit.prevent="saveClient">
          <div class="form-group">
            <label>Ism <span class="required">*</span></label>
            <input v-model="form.name" required placeholder="Masalan: Alisher Karimov" />
            <small class="help-text">Mijozning to'liq ismini kiriting</small>
          </div>
          <div class="form-group">
            <label>Telefon</label>
            <input v-model="form.phone" type="tel" placeholder="+998901234567" />
            <small class="help-text">Telefon raqamini kiriting (ixtiyoriy)</small>
          </div>
          <div class="form-group">
            <label>Uy Turi</label>
            <input v-model="form.house_type" placeholder="Masalan: 2 xonali, 3 xonali" />
            <small class="help-text">Uy turini kiriting</small>
          </div>
          <div class="form-group">
            <label>To'lov Usuli</label>
            <input v-model="form.payment_method" placeholder="Masalan: Naqd, Karta" />
            <small class="help-text">To'lov usulini kiriting</small>
          </div>
          <div class="form-group">
            <label>Status</label>
            <select v-model="form.status">
              <option value="active">Faol</option>
              <option value="inactive">Nofaol</option>
            </select>
            <small class="help-text">Mijozning holatini belgilang</small>
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn-secondary">Bekor</button>
            <button type="submit" class="btn-primary">Saqlash</button>
          </div>
        </form>
      </div>
    </div>

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

    <ConfirmationDialog
      :show="showDeleteConfirm"
      title="Mijozni O'chirish"
      message="Bu mijozni o'chirishni tasdiqlaysizmi? Bu amalni qaytarib bo'lmaydi."
      confirm-text="Ha, O'chirish"
      cancel-text="Bekor"
      type="danger"
      @confirm="confirmDelete"
      @cancel="showDeleteConfirm = false"
    />

    <SendSmsModal
      :show="showSmsModal"
      :recipient-name="smsTarget?.name || ''"
      :phone="smsTarget?.phone || ''"
      :message="smsTemplate"
      :loading="smsLoading"
      @close="closeSmsModal"
      @send="sendSms"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'
import ConfirmationDialog from '../components/ConfirmationDialog.vue'
import Tooltip from '../components/Tooltip.vue'
import SendSmsModal from '../components/SendSmsModal.vue'
import { exportClientsToExcel } from '../utils/excelExport'

const router = useRouter()
const clients = ref<any[]>([])
const filteredClients = ref<any[]>([])
const loading = ref(true)
const searchQuery = ref('')
const searchTimeout = ref<number | null>(null)
const filterStatus = ref('')
const showAddModal = ref(false)
const editingClient = ref<any | null>(null)
const showConversationModal = ref(false)
const showReminderModal = ref(false)
const selectedClient = ref<any | null>(null)
const showDeleteConfirm = ref(false)
const deleteClientId = ref<number | null>(null)
const showSmsModal = ref(false)
const smsTarget = ref<any | null>(null)
const smsLoading = ref(false)
const smsTemplate = ref('')

const form = ref({
  name: '',
  phone: '',
  house_type: '',
  payment_method: '',
  status: 'active',
})

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

const displayedClients = computed(() => {
  return filteredClients.value.length > 0 ? filteredClients.value : clients.value
})

onMounted(() => {
  fetchClients()
  fetchSmsTemplate()
  document.addEventListener('keydown', handleKeyboard)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyboard)
})

function handleKeyboard(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    if (showAddModal.value) closeModal()
    if (showConversationModal.value) showConversationModal.value = false
    if (showReminderModal.value) showReminderModal.value = false
    if (showSmsModal.value) closeSmsModal()
  }
}

async function fetchClients() {
  try {
    loading.value = true
    const params: any = {}
    if (searchQuery.value) {
      params.search = searchQuery.value
    }
    const response = await api.get('/clients', { params })
    clients.value = response.data
    applyFilters()
  } catch (error) {
    console.error('Fetch clients error:', error)
  } finally {
    loading.value = false
  }
}

function applyFilters() {
  let filtered = [...clients.value]
  
  if (filterStatus.value) {
    filtered = filtered.filter(c => c.status === filterStatus.value)
  }
  
  filteredClients.value = filtered
}

async function fetchSmsTemplate() {
  try {
    const response = await api.get('/sms/template')
    smsTemplate.value = response.data?.message || ''
  } catch (error) {
    console.error('Fetch SMS template error:', error)
  }
}

function exportToExcel() {
  const dataToExport = filteredClients.value.length > 0 ? filteredClients.value : clients.value
  if (dataToExport.length === 0) {
    window.dispatchEvent(new CustomEvent('show-error-toast', { detail: { message: 'Eksport qilish uchun ma\'lumot topilmadi' } }))
    return
  }
  exportClientsToExcel(dataToExport)
  window.dispatchEvent(new CustomEvent('show-success-toast', { detail: { message: 'Excel fayl muvaffaqiyatli yuklab olindi' } }))
}

function handleSearch() {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
  searchTimeout.value = window.setTimeout(() => {
    fetchClients()
  }, 500)
}

function viewDetail(id: number) {
  router.push(`/clients/${id}`)
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

function editClient(client: any) {
  editingClient.value = client
  form.value = { ...client }
  showAddModal.value = true
}

function closeModal() {
  showAddModal.value = false
  editingClient.value = null
  form.value = { name: '', phone: '', house_type: '', payment_method: '', status: 'active' }
}

async function saveClient() {
  try {
    if (editingClient.value) {
      await api.put(`/clients/${editingClient.value.id}`, form.value)
    } else {
      await api.post('/clients', form.value)
    }
    closeModal()
    fetchClients()
  } catch (error) {
    console.error('Save client error:', error)
  }
}

async function deleteClient(id: number) {
  deleteClientId.value = id
  showDeleteConfirm.value = true
}

async function confirmDelete() {
  if (!deleteClientId.value) return
  try {
    await api.delete(`/clients/${deleteClientId.value}`)
    showDeleteConfirm.value = false
    deleteClientId.value = null
    fetchClients()
    window.dispatchEvent(new CustomEvent('show-success-toast', { detail: { message: 'Mijoz muvaffaqiyatli o\'chirildi' } }))
  } catch (error: any) {
    console.error('Delete client error:', error)
    const message = error.response?.data?.message || 'Xatolik yuz berdi'
    window.dispatchEvent(new CustomEvent('show-error-toast', { detail: { message } }))
  }
}

function openConversationModal(client: any) {
  selectedClient.value = client
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
  try {
    await api.post('/conversations', {
      client_id: selectedClient.value.id,
      note: conversationForm.value.note,
      conversation_date: conversationForm.value.conversation_date,
      conversation_type: conversationForm.value.conversation_type,
      result: conversationForm.value.result,
      topic: conversationForm.value.topic,
      next_action: conversationForm.value.next_action,
    })
    showConversationModal.value = false
    fetchClients()
    window.dispatchEvent(new CustomEvent('show-success-toast', { detail: { message: 'Gaplashuv muvaffaqiyatli saqlandi' } }))
  } catch (error: any) {
    console.error('Save conversation error:', error)
    const message = error.response?.data?.message || 'Xatolik yuz berdi'
    window.dispatchEvent(new CustomEvent('show-error-toast', { detail: { message } }))
  }
}

function openReminderModal(client: any) {
  selectedClient.value = client
  reminderForm.value = {
    note: '',
    reminder_date: new Date().toISOString().slice(0, 16),
  }
  showReminderModal.value = true
}

async function saveReminder() {
  try {
    await api.post('/reminders', {
      client_id: selectedClient.value.id,
      note: reminderForm.value.note,
      reminder_date: reminderForm.value.reminder_date,
    })
    showReminderModal.value = false
  } catch (error) {
    console.error('Save reminder error:', error)
  }
}

async function openSmsModal(client: any) {
  if (!smsTemplate.value) {
    await fetchSmsTemplate()
  }
  smsTarget.value = client
  showSmsModal.value = true
}

function closeSmsModal() {
  showSmsModal.value = false
  smsTarget.value = null
}

async function sendSms() {
  if (!smsTarget.value) return
  if (!smsTemplate.value) {
    window.dispatchEvent(new CustomEvent('show-error-toast', { detail: { message: 'SMS matni topilmadi. Iltimos, administrator bilan bog\'laning.' } }))
    return
  }
  smsLoading.value = true
  try {
    await api.post('/sms/send', {
      recipient_type: 'client',
      recipient_id: smsTarget.value.id,
      message: smsTemplate.value,
    })
    showSmsModal.value = false
    smsTarget.value = null
    window.dispatchEvent(new CustomEvent('show-success-toast', { detail: { message: 'SMS muvaffaqiyatli yuborildi' } }))
  } catch (error: any) {
    console.error('Send SMS error:', error)
    const msg = error.response?.data?.message || 'SMS yuborishda xatolik yuz berdi'
    window.dispatchEvent(new CustomEvent('show-error-toast', { detail: { message: msg } }))
  } finally {
    smsLoading.value = false
  }
}
</script>

<style scoped>
.clients-view {
  width: 100%;
  max-width: 100%;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.filters-bar {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 150px;
}

.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.action-buttons-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-export {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
}

.btn-export svg {
  width: 16px;
  height: 16px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  padding: 0.875rem 1rem 0.875rem 2.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.9375rem;
  width: 350px;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #9ca3af;
  pointer-events: none;
  width: 18px;
  height: 18px;
}

.header-actions h2 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.875rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
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
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #475569;
}

.empty-state p {
  margin: 0 0 2rem 0;
  color: #64748b;
  font-size: 1rem;
}

.empty-state .btn-primary {
  margin-top: 1rem;
}

.clients-table-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.clients-table {
  width: 100%;
  border-collapse: collapse;
}

.clients-table thead {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 2px solid #e5e7eb;
}

.clients-table th {
  padding: 1.5rem 1.75rem;
  text-align: left;
  font-weight: 700;
  font-size: 0.8125rem;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.clients-table tbody tr {
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.2s ease;
}

.clients-table tbody tr:hover {
  background: linear-gradient(90deg, #f8fafc 0%, #ffffff 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.clients-table tbody tr:last-child {
  border-bottom: none;
}

.clients-table td {
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

.status-badge.active {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.inactive {
  background: #fee2e2;
  color: #991b1b;
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

.btn-action.btn-detail {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
}

.btn-action.btn-detail:hover {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(124, 58, 237, 0.3);
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
  max-width: 500px;
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
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.75rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.95rem;
}

.form-group label .required {
  color: #ef4444;
  margin-left: 4px;
}

.help-text {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.8125rem;
  color: #6b7280;
  font-style: italic;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.875rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn-secondary {
  background: white;
  color: #6b7280;
  border: 2px solid #e5e7eb;
  padding: 0.875rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}
</style>
