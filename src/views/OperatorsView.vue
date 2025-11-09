<template>
  <div class="operators-view">
    <div class="header-actions">
      <h2>Operatorlar Ro'yxati</h2>
      <button @click="showAddModal = true" class="btn-primary">+ Yangi Operator</button>
    </div>

    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>Yuklanmoqda...</p>
    </div>
    <div v-else-if="operators.length === 0 && technicalUsers.length === 0" class="empty-state">
      <div class="empty-icon">👤</div>
      <h3>Operatorlar ro'yxati bo'sh</h3>
      <p>Yangi operator qo'shish uchun "Yangi Operator" tugmasini bosing</p>
      <button @click="showAddModal = true" class="btn-primary">+ Yangi Operator Qo'shish</button>
    </div>
    <div v-else class="operators-table-container">
      <table class="operators-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Ism</th>
            <th>Email</th>
            <th>Bo'lim</th>
            <th>Amallar</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="operator in operators" :key="operator.id" class="table-row">
            <td>{{ operator.id }}</td>
            <td class="name-cell">
              <strong>{{ operator.user?.name }}</strong>
            </td>
            <td>{{ operator.user?.email }}</td>
            <td>
              <span :class="['section-badge', operator.section_type]">
                {{ operator.section_type === 'jobbank' ? 'JobBank' : 'UyTV' }}
              </span>
            </td>
            <td class="actions-cell">
              <div class="action-buttons">
                <button @click="editOperator(operator)" class="btn-action" title="Tahrirlash">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
                <button @click="deleteOperator(operator.id)" class="btn-action btn-danger" title="O'chirish">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
          <tr v-for="technical in technicalUsers" :key="technical.id" class="table-row technical-row">
            <td>{{ technical.id }}</td>
            <td class="name-cell">
              <strong>{{ technical.user?.name }}</strong>
            </td>
            <td>{{ technical.user?.email }}</td>
            <td>
              <span class="section-badge technical">
                Texnik Bo'lim
              </span>
            </td>
            <td class="actions-cell">
              <div class="action-buttons">
                <button @click="editOperator(technical)" class="btn-action" title="Tahrirlash">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
                <button @click="deleteOperator(technical.id)" class="btn-action btn-danger" title="O'chirish">
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

    <div v-if="showAddModal || editingOperator" class="modal">
      <div class="modal-content">
        <h3>{{ editingOperator ? 'Tahrirlash' : 'Yangi Foydalanuvchi' }}</h3>
        <form @submit.prevent="saveOperator">
          <div class="form-group">
            <label>Ism</label>
            <input v-model="form.name" required />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input v-model="form.email" type="email" required />
          </div>
          <div class="form-group">
            <label>Parol</label>
            <input v-model="form.password" type="password" :required="!editingOperator" />
          </div>
          <div class="form-group">
            <label>Bo'lim</label>
            <select v-model="form.section_type" required>
              <option value="jobbank">JobBank</option>
              <option value="uytv">UyTV</option>
              <option value="technical">Texnik Bo'lim</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn-secondary">Bekor</button>
            <button type="submit" class="btn-primary">Saqlash</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '../services/api'

const operators = ref([])
const technicalUsers = ref([])
const loading = ref(true)
const showAddModal = ref(false)
const editingOperator = ref(null)

const form = ref({
  name: '',
  email: '',
  password: '',
  section_type: 'jobbank',
})

onMounted(() => {
  fetchOperators()
})

async function fetchOperators() {
  try {
    loading.value = true
    const response = await api.get('/operators')
    operators.value = response.data.operators || []
    technicalUsers.value = response.data.technical || []
  } catch (error) {
    console.error('Fetch operators error:', error)
  } finally {
    loading.value = false
  }
}

function editOperator(operator: any) {
  editingOperator.value = operator
  form.value = {
    name: operator.user.name,
    email: operator.user.email,
    password: '',
    section_type: operator.section_type,
  }
  showAddModal.value = true
}

function closeModal() {
  showAddModal.value = false
  editingOperator.value = null
  form.value = { name: '', email: '', password: '', section_type: 'jobbank' }
}

async function saveOperator() {
  try {
    if (editingOperator.value) {
      const id = editingOperator.value.id
      await api.put(`/operators/${id}`, form.value)
    } else {
      await api.post('/operators', form.value)
    }
    closeModal()
    fetchOperators()
  } catch (error) {
    console.error('Save operator error:', error)
  }
}

async function deleteOperator(id: number) {
  if (!confirm('Operatorni o\'chirishni tasdiqlaysizmi?')) return
  try {
    await api.delete(`/operators/${id}`)
    fetchOperators()
  } catch (error) {
    console.error('Delete operator error:', error)
  }
}
</script>

<style scoped>
.operators-view {
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

.operators-table-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.operators-table {
  width: 100%;
  border-collapse: collapse;
}

.operators-table thead {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 2px solid #e5e7eb;
}

.operators-table th {
  padding: 1.5rem 1.75rem;
  text-align: left;
  font-weight: 700;
  font-size: 0.8125rem;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.operators-table tbody tr {
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.2s ease;
}

.operators-table tbody tr:hover {
  background: linear-gradient(90deg, #f8fafc 0%, #ffffff 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.operators-table tbody tr:last-child {
  border-bottom: none;
}

.operators-table td {
  padding: 1.5rem 1.75rem;
  font-size: 0.9375rem;
  color: #475569;
  vertical-align: middle;
}

.name-cell strong {
  font-weight: 700;
  color: #111827;
}

.section-badge {
  display: inline-block;
  padding: 0.375rem 0.875rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.section-badge.jobbank {
  background: #dbeafe;
  color: #1e40af;
}

.section-badge.uytv {
  background: #fce7f3;
  color: #9f1239;
}

.section-badge.technical {
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

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.875rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group select:focus {
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

