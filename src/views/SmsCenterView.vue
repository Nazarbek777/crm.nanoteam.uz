<template>
  <div class="sms-center">
    <div class="sms-header">
      <div class="template-card" v-if="smsTemplate">
        <h3>SMS Shabloni</h3>
        <textarea :value="smsTemplate" readonly></textarea>
        <div class="template-meta">
          <span>{{ smsTemplate.length }}/500 belgi</span>
          <span v-if="templateSegments > 1" class="segments">~{{ templateSegments }} ta segment</span>
        </div>
      </div>
      <div class="info-card">
        <h3>Yuborish qoidalari</h3>
        <ul>
          <li>Eskiz tasdiqlagan SMS matni bir xil bo'lishi kerak.</li>
          <li>Faqat telefon raqami mavjud bo'lgan ustalar yoki mijozlar tanlanadi.</li>
          <li>Ko'p qatorli yuborish mos ravishda navbatma-navbat bajariladi.</li>
        </ul>
      </div>
    </div>

    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="['tab-btn', { active: activeTab === tab.key }]"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="tab-content">
      <div v-if="activeTab === 'masters'" class="tab-panel">
        <div class="panel-header">
          <input
            v-model="masterSearch"
            type="text"
            placeholder="Usta qidirish (ism, telefon, viloyat...)"
            class="search-input"
          />
          <span class="selected-count">Tanlangan: {{ selectedMasterIds.length }}</span>
        </div>
        <div class="list-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>
                  <input type="checkbox" @change="toggleAllMasters" :checked="allMastersSelected" class="checkbox-input" />
                </th>
                <th>Ism</th>
                <th>Telefon</th>
                <th>Viloyat</th>
                <th>Tuman</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="master in filteredMasters" :key="master.id">
                <td>
                  <input
                    type="checkbox"
                    class="checkbox-input"
                    :disabled="!master.phone"
                    :checked="selectedMasterIds.includes(master.id)"
                    @change="toggleMaster(master.id)"
                  />
                </td>
                <td>
                  <strong>{{ master.name }}</strong>
                </td>
                <td>
                  <span v-if="master.phone" class="phone">{{ master.phone }}</span>
                  <span v-else class="no-phone">Telefon yo'q</span>
                </td>
                <td>{{ master.region || '-' }}</td>
                <td>{{ master.district || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-else-if="activeTab === 'clients'" class="tab-panel">
        <div class="panel-header">
          <input
            v-model="clientSearch"
            type="text"
            placeholder="Mijoz qidirish (ism, telefon...)"
            class="search-input"
          />
          <span class="selected-count">Tanlangan: {{ selectedClientIds.length }}</span>
        </div>
        <div class="list-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>
                  <input type="checkbox" @change="toggleAllClients" :checked="allClientsSelected" class="checkbox-input" />
                </th>
                <th>Ism</th>
                <th>Telefon</th>
                <th>Uy turi</th>
                <th>To'lov usuli</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="client in filteredClients" :key="client.id">
                <td>
                  <input
                    type="checkbox"
                    class="checkbox-input"
                    :disabled="!client.phone"
                    :checked="selectedClientIds.includes(client.id)"
                    @change="toggleClient(client.id)"
                  />
                </td>
                <td>
                  <strong>{{ client.name }}</strong>
                </td>
                <td>
                  <span v-if="client.phone" class="phone">{{ client.phone }}</span>
                  <span v-else class="no-phone">Telefon yo'q</span>
                </td>
                <td>{{ client.house_type || '-' }}</td>
                <td>{{ client.payment_method || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-else class="tab-panel">
        <div class="panel-header">
          <label>Telefon raqamlar (har qatorga bittadan)</label>
          <span class="selected-count">{{ customPhones.length }} ta raqam</span>
        </div>
        <textarea
          v-model="customPhoneInput"
          rows="10"
          placeholder="Masalan:\n998901234567\n998907654321"
          class="custom-input"
        ></textarea>
      </div>
    </div>

    <div class="actions-bar">
      <div class="summary">
        <span>Tanlanganlar: {{ totalSelected }}</span>
      </div>
      <div class="action-buttons">
        <button class="btn-secondary" @click="clearSelection" :disabled="sending">Tozalash</button>
        <button class="btn-primary" @click="sendBulkSms" :disabled="sending || totalSelected === 0 || !smsTemplate">
          {{ sending ? 'Yuborilmoqda...' : 'SMS yuborish' }}
        </button>
      </div>
    </div>

    <div v-if="results.length" class="results">
      <h3>Natijalar</h3>
      <table class="data-table results-table">
        <thead>
          <tr>
            <th>Ism / Telefon</th>
            <th>Telefon</th>
            <th>Status</th>
            <th>Xabar</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="result in results" :key="result.id + result.phone">
            <td>{{ result.name || '-' }}</td>
            <td>{{ result.phone }}</td>
            <td>
              <span :class="['status-badge', result.status]">
                {{ result.status === 'success' ? 'Yuborildi' : 'Xatolik' }}
              </span>
            </td>
            <td>{{ result.message }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import api from '../services/api'

interface Recipient {
  id?: number
  name?: string
  phone: string
  type: 'master' | 'client' | 'custom'
}

const tabs = [
  { key: 'masters', label: 'Ustalar' },
  { key: 'clients', label: 'Mijozlar' },
  { key: 'custom', label: 'Boshqa raqamlar' },
] as const

type TabKey = typeof tabs[number]['key']

const activeTab = ref<TabKey>('masters')
const smsTemplate = ref('')
const masters = ref<any[]>([])
const clients = ref<any[]>([])
const masterSearch = ref('')
const clientSearch = ref('')
const selectedMasterIds = ref<number[]>([])
const selectedClientIds = ref<number[]>([])
const customPhoneInput = ref('')
const sending = ref(false)
const results = ref<Array<{ id: string; name: string; phone: string; status: 'success' | 'error'; message: string }>>([])

const templateSegments = computed(() => (smsTemplate.value ? Math.ceil(smsTemplate.value.length / 160) : 0))

const filteredMasters = computed(() => {
  const query = masterSearch.value.toLowerCase()
  if (!query) return masters.value
  return masters.value.filter((master) => {
    return [master.name, master.phone, master.region, master.district]
      .filter(Boolean)
      .some((field) => String(field).toLowerCase().includes(query))
  })
})

const filteredClients = computed(() => {
  const query = clientSearch.value.toLowerCase()
  if (!query) return clients.value
  return clients.value.filter((client) => {
    return [client.name, client.phone, client.house_type, client.payment_method]
      .filter(Boolean)
      .some((field) => String(field).toLowerCase().includes(query))
  })
})

const customPhones = computed(() => {
  return customPhoneInput.value
    .split(/\n|,|;|\s+/)
    .map((phone) => phone.trim())
    .filter((phone) => phone.length > 0)
})

const totalSelected = computed(() => {
  if (activeTab.value === 'masters') {
    return selectedMasterIds.value.length
  }
  if (activeTab.value === 'clients') {
    return selectedClientIds.value.length
  }
  return customPhones.value.length
})

const allMastersSelected = computed(() => {
  const selectable = filteredMasters.value.filter((master) => master.phone)
  return selectable.length > 0 && selectable.every((master) => selectedMasterIds.value.includes(master.id))
})

const allClientsSelected = computed(() => {
  const selectable = filteredClients.value.filter((client) => client.phone)
  return selectable.length > 0 && selectable.every((client) => selectedClientIds.value.includes(client.id))
})

onMounted(async () => {
  await Promise.all([fetchTemplate(), fetchMasters(), fetchClients()])
})

async function fetchTemplate() {
  try {
    const response = await api.get('/sms/template')
    smsTemplate.value = response.data?.message || ''
  } catch (error) {
    console.error('Fetch SMS template error:', error)
  }
}

async function fetchMasters() {
  try {
    const response = await api.get('/masters')
    masters.value = Array.isArray(response.data)
      ? response.data
      : []
  } catch (error) {
    console.error('Fetch masters error:', error)
  }
}

async function fetchClients() {
  try {
    const response = await api.get('/clients')
    clients.value = Array.isArray(response.data)
      ? response.data
      : []
  } catch (error) {
    console.error('Fetch clients error:', error)
  }
}

function toggleMaster(id: number) {
  if (selectedMasterIds.value.includes(id)) {
    selectedMasterIds.value = selectedMasterIds.value.filter((item) => item !== id)
  } else {
    selectedMasterIds.value.push(id)
  }
}

function toggleClient(id: number) {
  if (selectedClientIds.value.includes(id)) {
    selectedClientIds.value = selectedClientIds.value.filter((item) => item !== id)
  } else {
    selectedClientIds.value.push(id)
  }
}

function toggleAllMasters() {
  if (allMastersSelected.value) {
    selectedMasterIds.value = []
  } else {
    selectedMasterIds.value = filteredMasters.value
      .filter((master) => master.phone)
      .map((master) => master.id)
  }
}

function toggleAllClients() {
  if (allClientsSelected.value) {
    selectedClientIds.value = []
  } else {
    selectedClientIds.value = filteredClients.value
      .filter((client) => client.phone)
      .map((client) => client.id)
  }
}

function clearSelection() {
  selectedMasterIds.value = []
  selectedClientIds.value = []
  customPhoneInput.value = ''
  results.value = []
}

async function sendBulkSms() {
  if (!smsTemplate.value) {
    window.dispatchEvent(new CustomEvent('show-error-toast', { detail: { message: 'SMS matni topilmadi. Iltimos, administrator bilan bog\'laning.' } }))
    return
  }

  let recipients: Recipient[] = []

  if (activeTab.value === 'masters') {
    recipients = masters.value
      .filter((master) => selectedMasterIds.value.includes(master.id) && master.phone)
      .map((master) => ({ id: master.id, name: master.name, phone: master.phone, type: 'master' as const }))
  } else if (activeTab.value === 'clients') {
    recipients = clients.value
      .filter((client) => selectedClientIds.value.includes(client.id) && client.phone)
      .map((client) => ({ id: client.id, name: client.name, phone: client.phone, type: 'client' as const }))
  } else {
    recipients = customPhones.value.map((phone, index) => ({ id: index, name: '', phone, type: 'custom' as const }))
  }

  if (recipients.length === 0) {
    window.dispatchEvent(new CustomEvent('show-error-toast', { detail: { message: 'SMS yuborish uchun telefon raqamlari tanlanmagan.' } }))
    return
  }

  sending.value = true
  results.value = []

  for (const recipient of recipients) {
    try {
      await api.post('/sms/send', {
        recipient_type: recipient.type,
        recipient_id: recipient.type === 'custom' ? null : recipient.id,
        phone: recipient.type === 'custom' ? recipient.phone : undefined,
        message: smsTemplate.value,
      })
      results.value.push({
        id: String(recipient.id ?? recipient.phone),
        name: recipient.name || '(Custom raqam)',
        phone: recipient.phone,
        status: 'success',
        message: 'Yuborildi',
      })
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Xatolik yuz berdi'
      results.value.push({
        id: String(recipient.id ?? recipient.phone),
        name: recipient.name || '(Custom raqam)',
        phone: recipient.phone,
        status: 'error',
        message: msg,
      })
    }
  }

  sending.value = false

  const successCount = results.value.filter((result) => result.status === 'success').length
  if (successCount > 0) {
    window.dispatchEvent(new CustomEvent('show-success-toast', { detail: { message: `${successCount} ta SMS yuborildi` } }))
  }
  const errorCount = results.value.length - successCount
  if (errorCount > 0) {
    window.dispatchEvent(new CustomEvent('show-error-toast', { detail: { message: `${errorCount} ta SMS yuborilmadi` } }))
  }
}
</script>

<style scoped>
.sms-center {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.sms-header {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.template-card,
.info-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(15, 23, 42, 0.08);
  border: 1px solid #e2e8f0;
}

.template-card h3,
.info-card h3 {
  margin: 0 0 1rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
}

.template-card textarea {
  width: 100%;
  border: 2px dashed #bfdbfe;
  border-radius: 12px;
  padding: 1rem;
  background: #eff6ff;
  color: #1e3a8a;
  min-height: 140px;
  resize: vertical;
}

.template-meta {
  display: flex;
  justify-content: space-between;
  margin-top: 0.75rem;
  color: #64748b;
  font-size: 0.875rem;
}

.template-meta .segments {
  color: #2563eb;
  font-weight: 600;
}

.info-card ul {
  margin: 0;
  padding-left: 1.25rem;
  color: #475569;
  line-height: 1.7;
}

.tabs {
  display: inline-flex;
  background: #f1f5f9;
  padding: 0.5rem;
  border-radius: 999px;
  gap: 0.5rem;
}

.tab-btn {
  border: none;
  background: transparent;
  padding: 0.5rem 1.25rem;
  border-radius: 999px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn.active {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);
}

.tab-content {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.search-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 999px;
  font-size: 0.95rem;
}

.selected-count {
  font-weight: 600;
  color: #2563eb;
}

.list-container {
  max-height: 420px;
  overflow: auto;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 0.85rem 1rem;
  font-size: 0.95rem;
  text-align: left;
  border-bottom: 1px solid #f1f5f9;
}

.data-table thead {
  background: #f8fafc;
  position: sticky;
  top: 0;
  z-index: 1;
}

.checkbox-input {
  width: 18px;
  height: 18px;
  accent-color: #3b82f6;
}

.phone {
  color: #0f172a;
  font-weight: 600;
}

.no-phone {
  color: #ef4444;
  font-size: 0.85rem;
}

.custom-input {
  width: 100%;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  padding: 1rem;
  min-height: 220px;
  font-size: 0.95rem;
}

.actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 1rem 1.5rem;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.75rem;
  border-radius: 10px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
}

.results {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
}

.results-table .status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-badge.success {
  background: #dcfce7;
  color: #166534;
}

.status-badge.error {
  background: #fee2e2;
  color: #b91c1c;
}

@media (max-width: 900px) {
  .panel-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .actions-bar {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .action-buttons {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
