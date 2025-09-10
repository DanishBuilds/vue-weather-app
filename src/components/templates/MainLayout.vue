<template>
  <div class="main-layout">
    <main class="main-layout__content" role="main">
      <router-view v-slot="{ Component, route }">
        <Suspense>
          <template #default>
            <component :is="Component" :key="route.path" />
          </template>
          <template #fallback>
            <div class="main-layout__loading">
              <LoaderSpinner size="40" />
              <p>Loading page...</p>
            </div>
          </template>
        </Suspense>
      </router-view>
    </main>

    <footer class="main-layout__footer" role="contentinfo">
      <div class="container">
        <div class="main-layout__footer-content">
          <p class="main-layout__footer-text">
            Weather data provided by
            <a
              href="https://openweathermap.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              OpenWeatherMap
            </a>
          </p>
          <p class="main-layout__footer-copyright">
            © {{ currentYear }} Weather App. Built with Vue 3 & TypeScript.
          </p>
        </div>
      </div>
    </footer>

    <!-- Global Error Toast (if needed) -->
    <Teleport to="body">
      <div
        v-if="globalError"
        class="main-layout__toast main-layout__toast--error"
        role="alert"
        aria-live="polite"
      >
        <BaseIcon name="x" size="20" />
        <span>{{ globalError }}</span>
        <BaseButton
          variant="ghost"
          size="sm"
          icon="x"
          aria-label="Dismiss error"
          @click="clearGlobalError"
        />
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { BaseIcon, BaseButton, LoaderSpinner } from "@/components/atoms";
import { useWeatherStore } from "@/stores/weather";
import { useProfileStore } from "@/stores/profile";

const weatherStore = useWeatherStore();
const profileStore = useProfileStore();
const globalError = ref<string | null>(null);

const currentYear = computed(() => new Date().getFullYear());

const clearGlobalError = () => {
  globalError.value = null;
};

onMounted(() => {
  // Initialize the stores
  weatherStore.initialize();
  profileStore.initialize();
});
</script>

<style lang="scss" scoped>
@use "@/styles/variables" as *;
@use "@/styles/mixins" as *;

.main-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;

  &__content {
    flex: 1;
  }

  &__loading {
    @include flex-center;
    flex-direction: column;
    gap: $spacing-lg;
    padding: $spacing-4xl;
    text-align: center;

    p {
      @include body-regular;
      color: $text-secondary;
      margin: 0;
    }
  }

  &__footer {
    background: $background-light;
    border-top: 1px solid $border-light;
    padding: $spacing-xl 0;
    margin-top: auto;
  }

  &__footer-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: $spacing-lg;

    @include mobile {
      flex-direction: column;
      text-align: center;
      gap: $spacing-sm;
    }
  }

  &__footer-text,
  &__footer-copyright {
    @include caption;
    color: $text-light;
    margin: 0;

    a {
      color: $primary-blue;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  &__toast {
    position: fixed;
    bottom: $spacing-xl;
    right: $spacing-xl;
    z-index: $z-tooltip;
    display: flex;
    align-items: center;
    gap: $spacing-md;
    padding: $spacing-md $spacing-lg;
    background: $background-card;
    border-radius: $border-radius-lg;
    box-shadow: $shadow-xl;
    border: 1px solid $border-light;
    max-width: 400px;
    animation: toast-slide-in 0.3s ease-out;

    @include mobile {
      bottom: $spacing-lg;
      right: $spacing-lg;
      left: $spacing-lg;
      max-width: none;
    }

    &--error {
      border-color: $error-red;

      svg:first-child {
        color: $error-red;
      }
    }
  }
}

@keyframes toast-slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
