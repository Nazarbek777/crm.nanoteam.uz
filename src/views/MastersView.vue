<template>
  <div class="masters-view">
    <div class="header-actions">
      <h2>Ustalar Ro'yxati</h2>
      <div class="header-right">
        <div class="search-box">
          <input 
            v-model="searchQuery" 
            @input="handleSearch"
            type="text" 
            placeholder="Qidirish (ism, telefon, mutaxassislik...)" 
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
          <select v-model="filterRegion" @change="applyFilters" class="filter-select">
            <option value="">Barcha Viloyatlar</option>
            <option v-for="region in regions" :key="region" :value="region">{{ region }}</option>
          </select>
        </div>
        <div class="action-buttons-header">
          <Tooltip text="Excel'dan import qilish">
            <button @click="showImportModal = true" class="btn-secondary btn-import">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              Import
            </button>
          </Tooltip>
          <Tooltip text="Chop etish">
            <button @click="printTable" class="btn-secondary btn-print">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              Chop etish
            </button>
          </Tooltip>
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
          <Tooltip text="Yangi usta qo'shish (Ctrl+N)">
            <button @click="showAddModal = true" class="btn-primary">+ Yangi Usta</button>
          </Tooltip>
        </div>
      </div>
    </div>

    <!-- Bulk Actions Bar -->
    <BulkActionsBar
      v-if="selectedMasters.length > 0"
      :selected-items="selectedMasters"
      @export="bulkExport"
      @status-change="showBulkStatusModal = true"
      @delete="bulkDelete"
      @clear="clearSelection"
    />

    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>Yuklanmoqda...</p>
    </div>
    <div v-else class="masters-table-container">
      <table class="masters-table">
        <thead>
          <tr>
            <th>
              <input 
                type="checkbox" 
                @change="toggleSelectAll"
                :checked="selectedMasters.length === displayedMasters.length && displayedMasters.length > 0"
                class="checkbox-input"
              />
            </th>
            <th>ID</th>
            <th>Ism</th>
            <th>Telefon</th>
            <th>Mutaxassislik</th>
            <th>Viloyat</th>
            <th>Tuman</th>
            <th>Telegram</th>
            <th>Status</th>
            <th>Oxirgi Gaplashuv</th>
            <th>Amallar</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="master in displayedMasters" :key="master.id" class="table-row" :class="{ 'selected': isSelected(master.id) }">
            <td>
              <input 
                type="checkbox" 
                :checked="isSelected(master.id)"
                @change="toggleSelect(master.id)"
                class="checkbox-input"
              />
            </td>
            <td>{{ master.id }}</td>
            <td class="name-cell">
              <strong>{{ master.name }}</strong>
            </td>
            <td>{{ master.phone || '-' }}</td>
            <td>{{ master.specialization || '-' }}</td>
            <td>{{ master.region || '-' }}</td>
            <td>{{ master.district || '-' }}</td>
            <td>{{ master.telegram_username || '-' }}</td>
            <td>
              <span :class="['status-badge', master.status]">
                {{ master.status === 'active' ? 'Faol' : 'Nofaol' }}
              </span>
            </td>
            <td>
              {{ master.last_conversation_date ? formatDate(master.last_conversation_date) : '-' }}
            </td>
            <td class="actions-cell">
              <div class="action-buttons">
                <Tooltip text="Batafsil ko'rish (V)">
                  <button @click="viewDetail(master.id)" class="btn-action btn-detail">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>
                </Tooltip>
                <Tooltip text="SMS yuborish">
                  <button @click="openSmsModal(master)" class="btn-action" title="SMS yuborish">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4 4h16v13H5.17L4 18.17V4z"></path>
                      <polyline points="22 6 12 13 2 6"></polyline>
                    </svg>
                  </button>
                </Tooltip>
                <Tooltip text="Gaplashuv qo'shish (C)">
                  <button @click="openConversationModal(master)" class="btn-action">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </button>
                </Tooltip>
                <Tooltip text="Eslatma qo'shish (R)">
                  <button @click="openReminderModal(master)" class="btn-action">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                  </button>
                </Tooltip>
                <Tooltip text="Texnik bo'limga o'tkazish (T)">
                  <button @click="transferToTechnical(master)" class="btn-action btn-technical">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                      <path d="M2 17l10 5 10-5"></path>
                      <path d="M2 12l10 5 10-5"></path>
                    </svg>
                  </button>
                </Tooltip>
                <Tooltip text="Tahrirlash (E)">
                  <button @click="editMaster(master)" class="btn-action">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                </Tooltip>
                <Tooltip text="O'chirish (Del)">
                  <button @click="deleteMaster(master.id)" class="btn-action btn-danger">
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
      <div v-if="displayedMasters.length === 0 && !loading" class="empty-table">
        <div class="empty-icon">📋</div>
        <h3>{{ masters.length === 0 ? 'Ustalar ro\'yxati bo\'sh' : 'Filtrlangan natijalar topilmadi' }}</h3>
        <p v-if="masters.length === 0">Yangi usta qo'shish uchun "Yangi Usta" tugmasini bosing</p>
        <p v-else>Boshqa filterlarni tanlab ko'ring</p>
        <button v-if="masters.length === 0" @click="showAddModal = true" class="btn-primary">+ Yangi Usta Qo'shish</button>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal || editingMaster" class="modal">
      <div class="modal-content">
        <h3>{{ editingMaster ? 'Tahrirlash' : 'Yangi Usta' }}</h3>
        <form @submit.prevent="saveMaster">
          <div class="form-group">
            <label>Ism <span class="required">*</span></label>
            <input 
              v-model="form.name" 
              required 
              placeholder="Masalan: Alisher Karimov"
              :class="{ 'error': formErrors.name }"
              @blur="validateField('name')"
            />
            <small v-if="formErrors.name" class="error-text">{{ formErrors.name }}</small>
            <small v-else class="help-text">Ustaning to'liq ismini kiriting</small>
          </div>
          <div class="form-group">
            <label>Telefon</label>
            <input 
              v-model="form.phone" 
              type="tel" 
              placeholder="+998901234567"
              :class="{ 'error': formErrors.phone }"
              @blur="validatePhone"
            />
            <small v-if="formErrors.phone" class="error-text">{{ formErrors.phone }}</small>
            <small v-else class="help-text">Telefon raqamini kiriting (ixtiyoriy)</small>
          </div>
          <div class="form-group">
            <label>Mutaxassislik sohasi</label>
            <input v-model="form.specialization" placeholder="Masalan: Plitkachi, Santexnik" />
            <small class="help-text">Ustaning mutaxassislik sohasini kiriting</small>
          </div>
          <div class="form-group">
            <label>Manzil</label>
            <textarea v-model="form.address" rows="2" placeholder="To'liq manzil"></textarea>
            <small class="help-text">Ustaning yashash manzilini kiriting</small>
          </div>
          <div class="form-group">
            <label>Telegram username</label>
            <input v-model="form.telegram_username" placeholder="@username" />
            <small class="help-text">Telegram username (ixtiyoriy)</small>
          </div>
          <div class="form-group">
            <label>Tajriba (yil)</label>
            <input v-model="form.experience_years" type="number" min="0" placeholder="Masalan: 5" />
            <small class="help-text">Ish tajribasi yillarda</small>
          </div>
          <div class="form-group">
            <label>Viloyat</label>
            <select v-model="form.region" @change="form.district = ''">
              <option value="">Tanlang</option>
              <option value="Toshkent shahri">Toshkent shahri</option>
              <option value="Andijon">Andijon</option>
              <option value="Buxoro">Buxoro</option>
              <option value="Farg'ona">Farg'ona</option>
              <option value="Jizzax">Jizzax</option>
              <option value="Qashqadaryo">Qashqadaryo</option>
              <option value="Navoiy">Navoiy</option>
              <option value="Namangan">Namangan</option>
              <option value="Samarqand">Samarqand</option>
              <option value="Sirdaryo">Sirdaryo</option>
              <option value="Surxondaryo">Surxondaryo</option>
              <option value="Toshkent viloyati">Toshkent viloyati</option>
              <option value="Xorazm">Xorazm</option>
              <option value="Qoraqalpog'iston">Qoraqalpog'iston</option>
            </select>
            <small class="help-text">Ustaning viloyatini tanlang</small>
          </div>
          <div class="form-group">
            <label>Tuman</label>
            <select v-model="form.district" :disabled="!form.region">
              <option value="">Tanlang</option>
              <option v-for="district in getDistricts(form.region)" :key="district" :value="district">
                {{ district }}
              </option>
            </select>
            <small class="help-text" v-if="!form.region">Avval viloyatni tanlang</small>
            <small class="help-text" v-else>Ustaning tumanini tanlang</small>
          </div>
          <div class="form-group">
            <label>Status</label>
            <select v-model="form.status">
              <option value="active">Faol</option>
              <option value="inactive">Nofaol</option>
            </select>
            <small class="help-text">Ustaning holatini belgilang</small>
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn-secondary">Bekor</button>
            <button type="submit" class="btn-primary">Saqlash</button>
          </div>
        </form>
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

    <!-- Transfer to Technical Modal -->
    <div v-if="showTransferModal" class="modal">
      <div class="modal-content">
        <h3>Texnik Bo'limga O'tkazish</h3>
        <form @submit.prevent="saveTransfer">
          <div class="form-group">
            <label>Qaysi Texnik Bo'limga Yo'naltirish?</label>
            <select v-model="transferForm.technical_user_id" required :disabled="loadingTechnicalUsers">
              <option value="">Tanlang</option>
              <option v-for="techUser in technicalUsers" :key="techUser.id" :value="techUser.id">
                {{ techUser.name }} ({{ techUser.email }})
              </option>
            </select>
            <small v-if="loadingTechnicalUsers" class="loading-text">Yuklanmoqda...</small>
            <small v-else-if="technicalUsers.length === 0" class="error-text">Texnik bo'lim foydalanuvchilari topilmadi</small>
          </div>
          <div class="form-group">
            <label>Izoh (ixtiyoriy)</label>
            <textarea v-model="transferForm.note" rows="3" placeholder="O'tkazish sababi yoki qo'shimcha ma'lumot"></textarea>
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeTransferModal" class="btn-secondary">Bekor</button>
            <button type="submit" class="btn-primary" :disabled="!transferForm.technical_user_id || loadingTransfer">
              {{ loadingTransfer ? 'O\'tkazilmoqda...' : 'O\'tkazish' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Success Modal -->
    <div v-if="showSuccessModal" class="modal">
      <div class="modal-content success-modal">
        <div class="success-icon">✅</div>
        <h3>Muvaffaqiyatli!</h3>
        <p>{{ successMessage }}</p>
        <div class="modal-actions">
          <button @click="showSuccessModal = false" class="btn-primary">Yopish</button>
        </div>
      </div>
    </div>

    <!-- Import Modal -->
    <div v-if="showImportModal" class="modal">
      <div class="modal-content">
        <h3>Excel'dan Import Qilish</h3>
        <div class="import-info">
          <p><strong>Fayl formati:</strong></p>
          <ul>
            <li>Ism (majburiy)</li>
            <li>Telefon</li>
            <li>Mutaxassislik</li>
            <li>Viloyat</li>
            <li>Tuman</li>
            <li>Manzil</li>
            <li>Telegram</li>
            <li>Tajriba</li>
            <li>Status</li>
          </ul>
        </div>
        <div class="form-group">
          <label>Excel Fayl</label>
          <input 
            type="file" 
            accept=".xlsx,.xls"
            @change="handleImport"
            :disabled="importing"
            class="file-input"
          />
          <small class="help-text">Faqat .xlsx yoki .xls formatidagi fayllar</small>
        </div>
        <div v-if="importing" class="importing-status">
          <div class="loading-spinner-small"></div>
          <span>Import qilinmoqda...</span>
        </div>
        <div class="modal-actions">
          <button type="button" @click="showImportModal = false" class="btn-secondary" :disabled="importing">Bekor</button>
        </div>
      </div>
    </div>

    <!-- Bulk Status Modal -->
    <div v-if="showBulkStatusModal" class="modal">
      <div class="modal-content">
        <h3>Status O'zgartirish</h3>
        <p>{{ selectedMasters.length }} ta ustaning statusini o'zgartirish</p>
        <div class="form-group">
          <label>Yangi Status</label>
          <select v-model="bulkStatus" class="form-select">
            <option value="active">Faol</option>
            <option value="inactive">Nofaol</option>
          </select>
        </div>
        <div class="modal-actions">
          <button type="button" @click="showBulkStatusModal = false" class="btn-secondary">Bekor</button>
          <button type="button" @click="applyBulkStatus" class="btn-primary">Saqlash</button>
        </div>
      </div>
    </div>

    <!-- Confirmation Dialog -->
    <ConfirmationDialog
      :show="showDeleteConfirm"
      title="Ustani O'chirish"
      message="Bu ustani o'chirishni tasdiqlaysizmi? Bu amalni qaytarib bo'lmaydi."
      confirm-text="Ha, O'chirish"
      cancel-text="Bekor"
      type="danger"
      @confirm="confirmDelete"
      @cancel="showDeleteConfirm = false"
    />
    <div v-if="showErrorModal" class="modal">
      <div class="modal-content error-modal">
        <div class="error-icon">❌</div>
        <h3>Xatolik</h3>
        <p>{{ errorMessage }}</p>
        <div class="modal-actions">
          <button @click="showErrorModal = false" class="btn-primary">Yopish</button>
        </div>
      </div>
    </div>

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
import BulkActionsBar from '../components/BulkActionsBar.vue'
import SendSmsModal from '../components/SendSmsModal.vue'
import { exportMastersToExcel } from '../utils/excelExport'
import { importFromExcel, mapExcelToMasters } from '../utils/excelImport'

const router = useRouter()
const masters = ref([])
const filteredMasters = ref([])
const loading = ref(true)
const searchQuery = ref('')
const searchTimeout = ref<number | null>(null)
const filterStatus = ref('')
const filterRegion = ref('')
const selectedMasters = ref<number[]>([])
const showAddModal = ref(false)
const showImportModal = ref(false)
const showBulkStatusModal = ref(false)
const importing = ref(false)
const bulkStatus = ref('active')
const showSmsModal = ref(false)
const smsTarget = ref<any | null>(null)
const smsLoading = ref(false)
const smsTemplate = ref('')
const editingMaster = ref<any | null>(null)
const showConversationModal = ref(false)
const showReminderModal = ref(false)
const showTransferModal = ref(false)
const showSuccessModal = ref(false)
const showErrorModal = ref(false)
const showDeleteConfirm = ref(false)
const deleteMasterId = ref<number | null>(null)
const selectedMaster = ref<any | null>(null)
const technicalUsers = ref([])
const loadingTechnicalUsers = ref(false)
const loadingTransfer = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const regions = [
  'Toshkent shahri',
  'Andijon',
  'Buxoro',
  "Farg'ona",
  'Jizzax',
  'Qashqadaryo',
  'Navoiy',
  'Namangan',
  'Samarqand',
  'Sirdaryo',
  'Surxondaryo',
  'Toshkent viloyati',
  'Xorazm',
  "Qoraqalpog'iston",
]

const displayedMasters = computed(() => {
  return filteredMasters.value.length > 0 ? filteredMasters.value : masters.value
})

const form = ref({
  name: '',
  phone: '',
  status: 'active',
  specialization: '',
  address: '',
  telegram_username: '',
  experience_years: null,
  region: '',
  district: '',
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

const transferForm = ref({
  technical_user_id: '',
  note: '',
})

const formErrors = ref<Record<string, string>>({})

onMounted(() => {
  fetchMasters()
  fetchSmsTemplate()
  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyboard)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyboard)
})

function handleKeyboard(e: KeyboardEvent) {
  // Escape - close modals
  if (e.key === 'Escape') {
    if (showAddModal.value) closeModal()
    if (showConversationModal.value) showConversationModal.value = false
    if (showReminderModal.value) showReminderModal.value = false
    if (showTransferModal.value) closeTransferModal()
    if (showSuccessModal.value) showSuccessModal.value = false
    if (showErrorModal.value) showErrorModal.value = false
    if (showSmsModal.value) closeSmsModal()
  }
  
  // Ctrl+S / Cmd+S - save form
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault()
    if (showAddModal.value) {
      saveMaster()
    }
  }
  
  // Ctrl+N / Cmd+N - new master
  if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
    e.preventDefault()
    if (!showAddModal.value && !showConversationModal.value && !showReminderModal.value) {
      showAddModal.value = true
    }
  }
  
  // Focus search on Ctrl+K / Cmd+K
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    const searchInput = document.querySelector('.search-input') as HTMLInputElement
    if (searchInput) {
      searchInput.focus()
      searchInput.select()
    }
  }
}

async function fetchMasters() {
  try {
    loading.value = true
    const params: any = {}
    if (searchQuery.value) {
      params.search = searchQuery.value
    }
    const response = await api.get('/masters', { params })
    masters.value = response.data
    applyFilters()
  } catch (error) {
    console.error('Fetch masters error:', error)
  } finally {
    loading.value = false
  }
}

function applyFilters() {
  let filtered = [...masters.value]
  
  if (filterStatus.value) {
    filtered = filtered.filter(m => m.status === filterStatus.value)
  }
  
  if (filterRegion.value) {
    filtered = filtered.filter(m => m.region === filterRegion.value)
  }
  
  filteredMasters.value = filtered
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
  try {
    const dataToExport = filteredMasters.value.length > 0 ? filteredMasters.value : masters.value
    if (dataToExport.length === 0) {
      window.dispatchEvent(new CustomEvent('show-error-toast', { detail: { message: 'Eksport qilish uchun ma\'lumot topilmadi' } }))
      return
    }
    exportMastersToExcel(dataToExport)
    window.dispatchEvent(new CustomEvent('show-success-toast', { detail: { message: 'Excel fayl muvaffaqiyatli yuklab olindi' } }))
  } catch (error) {
    console.error('Export error:', error)
    window.dispatchEvent(new CustomEvent('show-error-toast', { detail: { message: 'Eksport qilishda xatolik yuz berdi' } }))
  }
}

function printTable() {
  window.print()
}

function isSelected(id: number): boolean {
  return selectedMasters.value.includes(id)
}

function toggleSelect(id: number) {
  const index = selectedMasters.value.indexOf(id)
  if (index > -1) {
    selectedMasters.value.splice(index, 1)
  } else {
    selectedMasters.value.push(id)
  }
}

function toggleSelectAll() {
  if (selectedMasters.value.length === displayedMasters.value.length) {
    selectedMasters.value = []
  } else {
    selectedMasters.value = displayedMasters.value.map(m => m.id)
  }
}

function clearSelection() {
  selectedMasters.value = []
}

function bulkExport() {
  const dataToExport = masters.value.filter(m => selectedMasters.value.includes(m.id))
  if (dataToExport.length === 0) return
  exportMastersToExcel(dataToExport)
  clearSelection()
}

async function bulkDelete() {
  if (!confirm(`${selectedMasters.value.length} ta ustani o'chirishni tasdiqlaysizmi?`)) return
  const count = selectedMasters.value.length
  try {
    for (const id of selectedMasters.value) {
      await api.delete(`/masters/${id}`)
    }
    clearSelection()
    fetchMasters()
    window.dispatchEvent(new CustomEvent('show-success-toast', { detail: { message: `${count} ta usta muvaffaqiyatli o'chirildi` } }))
  } catch (error) {
    console.error('Bulk delete error:', error)
    window.dispatchEvent(new CustomEvent('show-error-toast', { detail: { message: 'O\'chirishda xatolik yuz berdi' } }))
  }
}

async function applyBulkStatus() {
  const count = selectedMasters.value.length
  try {
    for (const id of selectedMasters.value) {
      await api.put(`/masters/${id}`, { status: bulkStatus.value })
    }
    showBulkStatusModal.value = false
    clearSelection()
    fetchMasters()
    window.dispatchEvent(new CustomEvent('show-success-toast', { detail: { message: `${count} ta ustaning statusi o'zgartirildi` } }))
  } catch (error) {
    console.error('Bulk status error:', error)
    window.dispatchEvent(new CustomEvent('show-error-toast', { detail: { message: "Status o'zgartirishda xatolik yuz berdi" } }))
  }
}

async function handleImport(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  try {
    importing.value = true
    const excelData = await importFromExcel(file)
    const mastersData = mapExcelToMasters(excelData)
    
    for (const master of mastersData) {
      await api.post('/masters', master)
    }
    
    showImportModal.value = false
    fetchMasters()
    window.dispatchEvent(new CustomEvent('show-success-toast', { detail: { message: `${mastersData.length} ta usta muvaffaqiyatli import qilindi` } }))
  } catch (error) {
    console.error('Import error:', error)
    window.dispatchEvent(new CustomEvent('show-error-toast', { detail: { message: 'Import qilishda xatolik yuz berdi' } }))
  } finally {
    importing.value = false
  }
}

function handleSearch() {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
  searchTimeout.value = window.setTimeout(() => {
    fetchMasters()
  }, 500)
}

function viewDetail(id: number) {
  router.push(`/masters/${id}`)
}

function editMaster(master: any) {
  editingMaster.value = master
  form.value = { ...master }
  showAddModal.value = true
}

function closeModal() {
  showAddModal.value = false
  editingMaster.value = null
  formErrors.value = {}
  form.value = {
    name: '',
    phone: '',
    status: 'active',
    specialization: '',
    address: '',
    telegram_username: '',
    experience_years: null,
    region: '',
    district: '',
  }
}

async function saveMaster() {
  // Validate form
  formErrors.value = {}
  if (!form.value.name || form.value.name.trim().length < 2) {
    formErrors.value.name = 'Ism kamida 2 ta belgidan iborat bo\'lishi kerak'
  }
  if (form.value.phone && !/^\+998\d{9}$/.test(form.value.phone.replace(/\s/g, ''))) {
    formErrors.value.phone = 'Telefon raqami noto\'g\'ri formatda (masalan: +998901234567)'
  }
  
  if (Object.keys(formErrors.value).length > 0) {
    return
  }
  
  try {
    if (editingMaster.value) {
      await api.put(`/masters/${editingMaster.value.id}`, form.value)
      window.dispatchEvent(new CustomEvent('show-success-toast', { detail: { message: 'Usta muvaffaqiyatli yangilandi' } }))
    } else {
      await api.post('/masters', form.value)
      window.dispatchEvent(new CustomEvent('show-success-toast', { detail: { message: 'Usta muvaffaqiyatli qo\'shildi' } }))
    }
    closeModal()
    fetchMasters()
  } catch (error: any) {
    console.error('Save master error:', error)
    const message = error.response?.data?.message || 'Xatolik yuz berdi'
    window.dispatchEvent(new CustomEvent('show-error-toast', { detail: { message } }))
  }
}

function validateField(field: string) {
  if (field === 'name') {
    if (!form.value.name || form.value.name.trim().length < 2) {
      formErrors.value.name = 'Ism kamida 2 ta belgidan iborat bo\'lishi kerak'
    } else {
      delete formErrors.value.name
    }
  }
}

function validatePhone() {
  if (form.value.phone && !/^\+998\d{9}$/.test(form.value.phone.replace(/\s/g, ''))) {
    formErrors.value.phone = 'Telefon raqami noto\'g\'ri formatda (masalan: +998901234567)'
  } else {
    delete formErrors.value.phone
  }
}

async function deleteMaster(id: number) {
  deleteMasterId.value = id
  showDeleteConfirm.value = true
}

async function confirmDelete() {
  if (!deleteMasterId.value) return
  try {
    await api.delete(`/masters/${deleteMasterId.value}`)
    showDeleteConfirm.value = false
    deleteMasterId.value = null
    fetchMasters()
    window.dispatchEvent(new CustomEvent('show-success-toast', { detail: { message: 'Usta muvaffaqiyatli o\'chirildi' } }))
  } catch (error: any) {
    console.error('Delete master error:', error)
    const message = error.response?.data?.message || 'Xatolik yuz berdi'
    window.dispatchEvent(new CustomEvent('show-error-toast', { detail: { message } }))
  }
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

function getDistricts(region: string): string[] {
  const districts: Record<string, string[]> = {
    'Toshkent shahri': [
      'Bektemir', 'Chilonzor', 'Mirobod', 'Mirzo Ulug\'bek', 'Olmazor', 'Sergeli', 'Shayxontohur', 'Uchtepa', 'Yakkasaroy', 'Yashnobod', 'Yunusobod'
    ],
    'Toshkent viloyati': [
      'Bekobod', 'Bo\'ka', 'Bo\'stonliq', 'Chinoz', 'O\'rta Chirchiq', 'Ohangaron', 'Parkent', 'Piskent', 'Qibray', 'Quyichirchiq', 'Yangiyo\'l', 'Yuqori Chirchiq', 'Zangiota'
    ],
    'Andijon': [
      'Andijon shahri', 'Andijon tumani', 'Asaka', 'Baliqchi', 'Bo\'z', 'Buloqboshi', 'Izboskan', 'Jalaquduq', 'Qo\'rg\'ontepa', 'Paxtaobod', 'Ulug\'nor', 'Xonobod'
    ],
    'Buxoro': [
      'Buxoro shahri', 'Buxoro tumani', 'Vobkent', 'G\'ijduvon', 'Jondor', 'Kogon', 'Olot', 'Peshku', 'Qorako\'l', 'Qorovulbozor', 'Romitan', 'Shofirkon'
    ],
    'Farg\'ona': [
      'Farg\'ona shahri', 'Beshariq', 'Bog\'dod', 'Buvayda', 'Dang\'ara', 'Farg\'ona tumani', 'Furqat', 'O\'zbekiston', 'Qo\'qon', 'Qo\'shtepa', 'Rishton', 'So\'x', 'Toshloq', 'Uchko\'prik', 'Yozyovon'
    ],
    'Jizzax': [
      'Jizzax shahri', 'Arnasoy', 'Baxmal', 'Do\'stlik', 'Forish', 'G\'allaorol', 'Jizzax tumani', 'Mirzacho\'l', 'Paxtakor', 'Yangiobod', 'Zafarobod', 'Zarbdor', 'Zomin'
    ],
    'Qashqadaryo': [
      'Qarshi shahri', 'Dehqonobod', 'G\'uzor', 'Kasbi', 'Kitob', 'Koson', 'Mirishkor', 'Muborak', 'Nishon', 'Qamashi', 'Qarshi tumani', 'Shahrisabz', 'Yakkabog\'', 'Yangi Nishon'
    ],
    'Navoiy': [
      'Navoiy shahri', 'Zarafshon shahri', 'Karmana', 'Konimex', 'Navbahor', 'Nurota', 'Qiziltepa', 'Tomdi', 'Uchquduq', 'Xatirchi'
    ],
    'Namangan': [
      'Namangan shahri', 'Chortoq', 'Chust', 'Kosonsoy', 'Mingbuloq', 'Namangan tumani', 'Norin', 'Pop', 'To\'raqo\'rg\'on', 'Uchqo\'rg\'on', 'Uychi', 'Yangiqo\'rg\'on'
    ],
    'Samarqand': [
      'Samarqand shahri', 'Bulung\'ur', 'Ishtixon', 'Jomboy', 'Kattaqo\'rg\'on', 'Narpay', 'Nurobod', 'Oqdaryo', 'Paxtachi', 'Payariq', 'Pastdarg\'om', 'Qo\'shrabot', 'Samarqand tumani', 'Toyloq', 'Urgut'
    ],
    'Sirdaryo': [
      'Guliston shahri', 'Boyovut', 'Guliston tumani', 'Mirzaobod', 'Oqoltin', 'Sayxunobod', 'Sardoba', 'Sirdaryo tumani', 'Xovos'
    ],
    'Surxondaryo': [
      'Termiz shahri', 'Angor', 'Bandixon', 'Boysun', 'Denov', 'Jarqo\'rg\'on', 'Qiziriq', 'Qumqo\'rg\'on', 'Muzrabot', 'Oltinsoy', 'Sariosiyo', 'Sherobod', 'Sho\'rchi', 'Termiz tumani', 'Uzun'
    ],
    'Xorazm': [
      'Urganch shahri', 'Bog\'ot', 'Gurlan', 'Qo\'shko\'pir', 'Shovot', 'Urganch tumani', 'Xazorasp', 'Xiva', 'Xonqa', 'Yangiariq', 'Yangibozor'
    ],
    'Qoraqalpog\'iston': [
      'Nukus shahri', 'Amudaryo', 'Beruniy', 'Chimboy', 'Ellikqala', 'Kegayli', 'Mo\'ynoq', 'Nukus tumani', 'Qanliko\'l', 'Qo\'ng\'irot', 'Qorao\'zak', 'Shumanay', 'Taxtako\'pir', 'To\'rtko\'l', 'Xo\'jayli'
    ]
  }
  return districts[region] || []
}

async function transferToTechnical(master: any) {
  selectedMaster.value = master
  transferForm.value = {
    technical_user_id: '',
    note: '',
  }
  showTransferModal.value = true
  await fetchTechnicalUsers()
}

async function fetchTechnicalUsers() {
  try {
    loadingTechnicalUsers.value = true
    const response = await api.get('/technical/users')
    technicalUsers.value = response.data
  } catch (error) {
    console.error('Fetch technical users error:', error)
    technicalUsers.value = []
  } finally {
    loadingTechnicalUsers.value = false
  }
}

function closeTransferModal() {
  showTransferModal.value = false
  transferForm.value = {
    technical_user_id: '',
    note: '',
  }
  selectedMaster.value = null
}

async function saveTransfer() {
  if (!transferForm.value.technical_user_id) return
  
  try {
    loadingTransfer.value = true
    const response = await api.post(`/masters/${selectedMaster.value.id}/transfer-to-technical`, {
      technical_user_id: transferForm.value.technical_user_id,
      note: transferForm.value.note || '',
    })
    
    const techUserName = technicalUsers.value.find(u => u.id === parseInt(transferForm.value.technical_user_id))?.name || 'Texnik Bo\'lim'
    successMessage.value = `Usta "${selectedMaster.value.name}" ${techUserName} ga muvaffaqiyatli o'tkazildi!`
    
    closeTransferModal()
    showSuccessModal.value = true
    
    // Show toast notification
    window.dispatchEvent(new CustomEvent('show-success-toast', {
      detail: { message: successMessage.value }
    }))
    
    fetchMasters()
  } catch (error: any) {
    console.error('Transfer error:', error)
    const message = error.response?.data?.message || 'Xatolik yuz berdi'
    errorMessage.value = message
    showErrorModal.value = true
    
    // Show toast notification
    window.dispatchEvent(new CustomEvent('show-error-toast', {
      detail: { message }
    }))
  } finally {
    loadingTransfer.value = false
  }
}

async function openSmsModal(master: any) {
  if (!smsTemplate.value) {
    await fetchSmsTemplate()
  }
  smsTarget.value = master
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
      recipient_type: 'master',
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
.masters-view {
  width: 100%;
  max-width: 100%;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.header-right {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  flex-wrap: nowrap;
}

.filters-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: nowrap;
  flex-shrink: 0;
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
  flex-shrink: 0;
}

.btn-export,
.btn-import,
.btn-print {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
}

.btn-import {
  background: #f1f5f9;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}

.btn-import:hover {
  background: #e0f2fe;
}

.btn-print {
  background: #f8fafc;
  color: #0f172a;
  border: 1px solid #cbd5f5;
}

.btn-print:hover {
  background: #e2e8f0;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 260px;
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
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  padding: 0.875rem 2rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(59, 130, 246, 0.4);
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

.masters-table tbody tr.selected {
  background: linear-gradient(90deg, #dbeafe 0%, #e0e7ff 100%);
  border-left: 4px solid #3b82f6;
}

.checkbox-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #3b82f6;
}

.import-info {
  background: #f0f9ff;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.import-info ul {
  margin: 0.5rem 0 0 1.5rem;
  padding: 0;
}

.import-info li {
  margin: 0.25rem 0;
  color: #475569;
}

.file-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.file-input:hover {
  border-color: #3b82f6;
  background: #f0f9ff;
}

.importing-status {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #f0f9ff;
  border-radius: 8px;
  margin-top: 1rem;
}

.loading-spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@media (max-width: 1200px) {
  .header-right {
    flex-wrap: wrap;
  }
  .search-box {
    flex: 1 1 100%;
  }
}

@media print {
  .header-actions,
  .bulk-actions-bar,
  .action-buttons,
  .btn-action {
    display: none !important;
  }
  
  .masters-table-container {
    box-shadow: none;
    border: 1px solid #000;
  }
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

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.status-badge.active {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #065f46;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
}

.status-badge.inactive {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #991b1b;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
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

.btn-action.btn-technical {
  background: #dbeafe;
  color: #1e40af;
  border-color: #bfdbfe;
}

.btn-action svg {
  width: 16px;
  height: 16px;
}

.empty-table {
  text-align: center;
  padding: 5rem 2rem;
  color: #94a3b8;
  font-size: 1.125rem;
  font-weight: 500;
}

.empty-icon {
  font-size: 5rem;
  margin-bottom: 1.5rem;
  opacity: 0.5;
}

.empty-table h3 {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #475569;
}

.empty-table p {
  margin: 0 0 2rem 0;
  color: #64748b;
  font-size: 1rem;
}

.empty-table .btn-primary {
  margin-top: 1rem;
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

.form-group input.error,
.form-group select.error,
.form-group textarea.error {
  border-color: #ef4444;
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
}

.error-text {
  display: block;
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  font-weight: 500;
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

.success-modal {
  text-align: center;
}

.success-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.success-modal h3 {
  color: #10b981;
  margin-bottom: 1rem;
}

.success-modal p {
  color: #374151;
  font-size: 1.125rem;
  margin-bottom: 2rem;
}

.loading-text {
  display: block;
  color: #6b7280;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.error-text {
  display: block;
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.error-modal {
  text-align: center;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.error-modal h3 {
  color: #ef4444;
  margin-bottom: 1rem;
}

.error-modal p {
  color: #374151;
  font-size: 1.125rem;
  margin-bottom: 2rem;
}
</style>

