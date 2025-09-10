<template>
  <div
    :class="loaderClasses"
    :style="loaderStyles"
    role="status"
    :aria-label="label"
  >
    <svg viewBox="0 0 50 50" class="loader-spinner__svg">
      <circle
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke="currentColor"
        stroke-width="4"
        stroke-linecap="round"
        stroke-dasharray="31.416"
        stroke-dashoffset="31.416"
        class="loader-spinner__circle"
      />
    </svg>
    <span class="sr-only">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

export interface LoaderSpinnerProps {
  size?: string | number;
  color?: string;
  thickness?: number;
  label?: string;
}

const props = withDefaults(defineProps<LoaderSpinnerProps>(), {
  size: "24",
  thickness: 4,
  label: "Loading...",
});

const loaderClasses = computed(() => ["loader-spinner"]);

const loaderStyles = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  color: props.color,
}));
</script>

<style lang="scss" scoped>
@use "@/styles/variables" as *;
@use "@/styles/mixins" as *;

.loader-spinner {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &__svg {
    width: 100%;
    height: 100%;
    @include loading-spinner;
  }

  &__circle {
    animation: loader-dash 1.5s ease-in-out infinite;
  }
}

@keyframes loader-dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}
</style>
