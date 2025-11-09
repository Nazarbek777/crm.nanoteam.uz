<template>
  <nav class="breadcrumbs" v-if="items.length > 0">
    <ol class="breadcrumbs-list">
      <li v-for="(item, index) in items" :key="index" class="breadcrumb-item">
        <router-link v-if="item.to && index < items.length - 1" :to="item.to" class="breadcrumb-link">
          {{ item.label }}
        </router-link>
        <span v-else class="breadcrumb-current">{{ item.label }}</span>
        <span v-if="index < items.length - 1" class="breadcrumb-separator">/</span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

interface BreadcrumbItem {
  label: string
  to?: string
}

const route = useRoute()

const items = computed(() => {
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', to: '/' }
  ]

  const routeName = route.name as string
  const routeParams = route.params

  if (routeName === 'masters') {
    breadcrumbs.push({ label: 'Ustalar' })
  } else if (routeName === 'master-detail') {
    breadcrumbs.push({ label: 'Ustalar', to: '/masters' })
    breadcrumbs.push({ label: `Usta #${routeParams.id}` })
  } else if (routeName === 'clients') {
    breadcrumbs.push({ label: 'Mijozlar' })
  } else if (routeName === 'client-detail') {
    breadcrumbs.push({ label: 'Mijozlar', to: '/clients' })
    breadcrumbs.push({ label: `Mijoz #${routeParams.id}` })
  } else if (routeName === 'operators') {
    breadcrumbs.push({ label: 'Operatorlar' })
  } else if (routeName === 'reminders') {
    breadcrumbs.push({ label: 'Eslatmalar' })
  } else if (routeName === 'conversations') {
    breadcrumbs.push({ label: 'Gaplashuvlar' })
  } else if (routeName === 'technical') {
    breadcrumbs.push({ label: 'Texnik Bo\'lim' })
  } else if (routeName === 'sms-center') {
    breadcrumbs.push({ label: 'SMS Yuborish' })
  }

  return breadcrumbs
})
</script>

<style scoped>
.breadcrumbs {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.breadcrumbs-list {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
  flex-wrap: wrap;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.breadcrumb-link {
  color: #3b82f6;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 0.2s ease;
}

.breadcrumb-link:hover {
  color: #2563eb;
  text-decoration: underline;
}

.breadcrumb-current {
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 600;
}

.breadcrumb-separator {
  color: #9ca3af;
  font-size: 0.875rem;
  margin-left: 0.5rem;
}
</style>

