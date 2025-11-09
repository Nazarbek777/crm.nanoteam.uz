<template>
  <div class="tooltip-wrapper" @mouseenter="show = true" @mouseleave="show = false">
    <slot></slot>
    <div v-if="show" :class="['tooltip', position]">
      {{ text }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  text: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}>()

const show = ref(false)
</script>

<style scoped>
.tooltip-wrapper {
  position: relative;
  display: inline-block;
}

.tooltip {
  position: absolute;
  background: #1f2937;
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
  z-index: 1000;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  pointer-events: none;
}

.tooltip.top {
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 0.5rem;
}

.tooltip.bottom {
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 0.5rem;
}

.tooltip.left {
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-right: 0.5rem;
}

.tooltip.right {
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-left: 0.5rem;
}

.tooltip::after {
  content: '';
  position: absolute;
  border: 5px solid transparent;
}

.tooltip.top::after {
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-top-color: #1f2937;
}

.tooltip.bottom::after {
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-bottom-color: #1f2937;
}

.tooltip.left::after {
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  border-left-color: #1f2937;
}

.tooltip.right::after {
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  border-right-color: #1f2937;
}
</style>


