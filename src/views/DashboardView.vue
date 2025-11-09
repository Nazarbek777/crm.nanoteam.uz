<template>
  <div class="dashboard">
    <div class="stats-grid">
      <div class="stat-card">
        <h3>Jami Ustalar</h3>
        <p class="stat-value">{{ stats.total_masters }}</p>
      </div>
      <div class="stat-card">
        <h3>Jami Mijozlar</h3>
        <p class="stat-value">{{ stats.total_clients }}</p>
      </div>
      <div class="stat-card">
        <h3>Jami Gaplashuvlar</h3>
        <p class="stat-value">{{ stats.total_conversations }}</p>
      </div>
      <div class="stat-card">
        <h3>Bugungi Eslatmalar</h3>
        <p class="stat-value">{{ stats.today_reminders }}</p>
      </div>
      <div class="stat-card">
        <h3>Faol Ustalar</h3>
        <p class="stat-value">{{ stats.active_masters }}</p>
      </div>
      <div class="stat-card">
        <h3>Faol Mijozlar</h3>
        <p class="stat-value">{{ stats.active_clients }}</p>
      </div>
    </div>

    <div class="charts-grid">
      <div class="chart-card">
        <h2>Ustalar va Mijozlar Taqsimoti</h2>
        <canvas ref="distributionChart"></canvas>
      </div>
      <div class="chart-card">
        <h2>Faol va Nofaol Taqsimoti</h2>
        <canvas ref="statusChart"></canvas>
      </div>
    </div>

    <div class="today-reminders">
      <h2>Bugungi Eslatmalar</h2>
      <div v-if="loading" class="loading">Yuklanmoqda...</div>
      <div v-else-if="todayReminders.length === 0" class="empty">Bugun eslatmalar yo'q</div>
      <div v-else class="reminders-list">
        <div v-for="reminder in todayReminders" :key="reminder.id" class="reminder-item">
          <div class="reminder-time">{{ formatTime(reminder.reminder_date) }}</div>
          <div class="reminder-content">
            <strong>{{ reminder.master?.name || reminder.client?.name }}</strong>
            <p>{{ reminder.note }}</p>
          </div>
          <button 
            @click="markCompleted(reminder.id)" 
            v-if="!reminder.is_completed"
            class="complete-btn"
          >
            ✅
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import api from '../services/api'

Chart.register(...registerables)

const stats = ref({
  total_masters: 0,
  total_clients: 0,
  total_conversations: 0,
  today_reminders: 0,
  active_masters: 0,
  active_clients: 0,
})

const todayReminders = ref([])
const loading = ref(true)
const distributionChart = ref<HTMLCanvasElement | null>(null)
const statusChart = ref<HTMLCanvasElement | null>(null)

let distributionChartInstance: Chart | null = null
let statusChartInstance: Chart | null = null

onMounted(async () => {
  await fetchDashboard()
  await nextTick()
  createCharts()
})

async function fetchDashboard() {
  try {
    loading.value = true
    const response = await api.get('/dashboard')
    stats.value = response.data.stats
    todayReminders.value = response.data.today_reminders
  } catch (error) {
    console.error('Dashboard fetch error:', error)
  } finally {
    loading.value = false
  }
}

function createCharts() {
  if (distributionChart.value && statusChart.value) {
    // Gradient functions
    const createGradient = (ctx: CanvasRenderingContext2D, color1: string, color2: string) => {
      const gradient = ctx.createLinearGradient(0, 0, 0, 400)
      gradient.addColorStop(0, color1)
      gradient.addColorStop(1, color2)
      return gradient
    }

    // Distribution Chart
    if (distributionChartInstance) {
      distributionChartInstance.destroy()
    }
    const distCtx = distributionChart.value.getContext('2d')
    if (distCtx) {
      distributionChartInstance = new Chart(distributionChart.value, {
        type: 'bar',
        data: {
          labels: ['Ustalar', 'Mijozlar'],
          datasets: [{
            label: 'Soni',
            data: [stats.value.total_masters, stats.value.total_clients],
            backgroundColor: [
              createGradient(distCtx, '#3b82f6', '#2563eb'),
              createGradient(distCtx, '#8b5cf6', '#7c3aed')
            ],
            borderRadius: 12,
            borderSkipped: false,
            barThickness: 60,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 1500,
            easing: 'easeInOutQuart'
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              padding: 12,
              titleFont: {
                size: 14,
                weight: 'bold'
              },
              bodyFont: {
                size: 13
              },
              cornerRadius: 8,
              displayColors: false,
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: '#e5e7eb',
                drawBorder: false
              },
              ticks: {
                color: '#6b7280',
                font: {
                  size: 12
                }
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: '#6b7280',
                font: {
                  size: 13,
                  weight: '600'
                }
              }
            }
          }
        }
      })
    }

    // Status Chart
    if (statusChartInstance) {
      statusChartInstance.destroy()
    }
    const statusCtx = statusChart.value.getContext('2d')
    if (statusCtx) {
      statusChartInstance = new Chart(statusChart.value, {
        type: 'doughnut',
        data: {
          labels: ['Faol Ustalar', 'Nofaol Ustalar', 'Faol Mijozlar', 'Nofaol Mijozlar'],
          datasets: [{
            data: [
              stats.value.active_masters,
              Math.max(0, stats.value.total_masters - stats.value.active_masters),
              stats.value.active_clients,
              Math.max(0, stats.value.total_clients - stats.value.active_clients)
            ],
            backgroundColor: [
              '#10b981',
              '#ef4444',
              '#3b82f6',
              '#f59e0b'
            ],
            borderWidth: 0,
            hoverOffset: 8,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            animateRotate: true,
            animateScale: true,
            duration: 1500,
            easing: 'easeInOutQuart'
          },
          cutout: '60%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 15,
                usePointStyle: true,
                pointStyle: 'circle',
                font: {
                  size: 12,
                  weight: '500'
                },
                color: '#374151'
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              padding: 12,
              titleFont: {
                size: 14,
                weight: 'bold'
              },
              bodyFont: {
                size: 13
              },
              cornerRadius: 8,
              callbacks: {
                label: function(context) {
                  const label = context.label || ''
                  const value = context.parsed || 0
                  const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0
                  return `${label}: ${value} (${percentage}%)`
                }
              }
            }
          }
        }
      })
    }
  }
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
}

async function markCompleted(id: number) {
  try {
    await api.put(`/reminders/${id}`, { is_completed: true })
    await fetchDashboard()
    createCharts()
  } catch (error) {
    console.error('Mark completed error:', error)
  }
}
</script>

<style scoped>
.dashboard {
  width: 100%;
  max-width: 100%;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  width: 100%;
}

.stat-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid #e5e7eb;
  text-align: center;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}

.stat-card h3 {
  margin: 0 0 1rem 0;
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 800;
  color: #111827;
  margin: 0;
  line-height: 1;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  width: 100%;
}

.chart-card {
  background: white;
  padding: 2.5rem;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.chart-card:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.chart-card h2 {
  margin: 0 0 2rem 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 1rem;
}

.chart-card canvas {
  max-height: 350px;
  height: 350px !important;
}

.today-reminders {
  background: white;
  padding: 2.5rem;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  width: 100%;
}

.today-reminders h2 {
  margin: 0 0 2rem 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

.loading, .empty {
  text-align: center;
  padding: 4rem 2rem;
  color: #6b7280;
  font-size: 1rem;
}

.reminders-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.reminder-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 10px;
  border-left: 4px solid #3b82f6;
  transition: all 0.3s ease;
}

.reminder-item:hover {
  background: #f3f4f6;
  transform: translateX(4px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
}

.reminder-time {
  font-weight: 700;
  color: #3b82f6;
  min-width: 80px;
  font-size: 1rem;
}

.reminder-content {
  flex: 1;
}

.reminder-content strong {
  display: block;
  margin-bottom: 0.5rem;
  color: #111827;
  font-size: 1rem;
  font-weight: 600;
}

.reminder-content p {
  margin: 0;
  color: #6b7280;
  font-size: 0.9375rem;
}

.complete-btn {
  background: #10b981;
  color: white;
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.complete-btn:hover {
  background: #059669;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
}
</style>
