<template>
  <header class="app-header" role="banner">
    <div class="container">
      <div class="app-header__content">
        <!-- Logo/Brand -->
        <div class="app-header__brand">
          <router-link
            to="/"
            class="app-header__logo"
            aria-label="Weather App Home"
          >
            <BaseIcon name="cloud" size="32" class="app-header__logo-icon" />
            <span class="app-header__logo-text">{{ appName }}</span>
          </router-link>
        </div>

        <!-- Navigation -->
        <nav
          class="app-header__nav"
          role="navigation"
          aria-label="Main navigation"
        >
          <ul class="app-header__nav-list">
            <li
              v-for="item in navigationItems"
              :key="item.path"
              class="app-header__nav-item"
            >
              <router-link
                :to="item.path"
                class="app-header__nav-link"
                :class="{
                  'app-header__nav-link--active': $route.path === item.path,
                }"
                :aria-label="item.ariaLabel"
              >
                <BaseIcon :name="item.icon" size="20" />
                <span class="app-header__nav-text">{{ item.label }}</span>
              </router-link>
            </li>
          </ul>
        </nav>

        <!-- Actions -->
        <div class="app-header__actions">
          <!-- Location button -->
          <BaseButton
            v-if="showLocationButton"
            variant="ghost"
            size="sm"
            icon="map-pin"
            :is-loading="isGettingLocation"
            :disabled="isGettingLocation"
            class="app-header__location-btn"
            aria-label="Get current location weather"
            @click="handleGetLocation"
          />

          <!-- Theme toggle (future feature) -->
          <BaseButton
            v-if="showThemeToggle"
            variant="ghost"
            size="sm"
            :icon="isDarkMode ? 'sun' : 'moon'"
            class="app-header__theme-btn"
            aria-label="Toggle theme"
            @click="handleThemeToggle"
          />

          <!-- Mobile menu toggle -->
          <BaseButton
            variant="ghost"
            size="sm"
            :icon="isMobileMenuOpen ? 'x' : 'menu'"
            class="app-header__menu-toggle"
            aria-label="Toggle navigation menu"
            @click="toggleMobileMenu"
          />
        </div>
      </div>

      <!-- Mobile Navigation -->
      <nav
        v-show="isMobileMenuOpen"
        class="app-header__mobile-nav"
        role="navigation"
        aria-label="Mobile navigation"
      >
        <ul class="app-header__mobile-nav-list">
          <li
            v-for="item in navigationItems"
            :key="`mobile-${item.path}`"
            class="app-header__mobile-nav-item"
          >
            <router-link
              :to="item.path"
              class="app-header__mobile-nav-link"
              :class="{
                'app-header__mobile-nav-link--active':
                  $route.path === item.path,
              }"
              @click="closeMobileMenu"
            >
              <BaseIcon :name="item.icon" size="20" />
              <span>{{ item.label }}</span>
            </router-link>
          </li>
        </ul>

        <div class="app-header__mobile-actions">
          <BaseButton
            v-if="showLocationButton"
            variant="secondary"
            size="md"
            icon="map-pin"
            :is-loading="isGettingLocation"
            :disabled="isGettingLocation"
            full-width
            @click="handleGetLocationMobile"
          >
            Get Current Location
          </BaseButton>
        </div>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { BaseIcon, BaseButton } from "@/components/atoms";

export interface HeaderProps {
  appName?: string;
  showLocationButton?: boolean;
  showThemeToggle?: boolean;
  isGettingLocation?: boolean;
  isDarkMode?: boolean;
}

const props = withDefaults(defineProps<HeaderProps>(), {
  appName: "Weather App",
  showLocationButton: true,
  showThemeToggle: false,
  isGettingLocation: false,
  isDarkMode: false,
});

const emit = defineEmits<{
  "get-location": [];
  "theme-toggle": [];
}>();

const route = useRoute();
const isMobileMenuOpen = ref(false);

const navigationItems = computed(() => [
  {
    path: "/",
    label: "Home",
    icon: "cloud",
    ariaLabel: "Go to home page",
  },
  {
    path: "/forecast",
    label: "Forecast",
    icon: "calendar",
    ariaLabel: "View weather forecast",
  },
  {
    path: "/favorites",
    label: "Favorites",
    icon: "heart",
    ariaLabel: "View favorite locations",
  },
]);

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};

const handleGetLocation = () => {
  emit("get-location");
};

const handleGetLocationMobile = () => {
  emit("get-location");
  closeMobileMenu();
};

const handleThemeToggle = () => {
  emit("theme-toggle");
};

// Close mobile menu on outside click
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Element;
  if (isMobileMenuOpen.value && !target.closest(".app-header")) {
    closeMobileMenu();
  }
};

// Close mobile menu on escape key
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape" && isMobileMenuOpen.value) {
    closeMobileMenu();
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  document.removeEventListener("keydown", handleKeydown);
});

// Close mobile menu on route change
watch(
  () => route.path,
  () => {
    closeMobileMenu();
  },
);
</script>

<style lang="scss" scoped>
@use "@/styles/variables" as *;
@use "@/styles/mixins" as *;

.app-header {
  background: $background-card;
  border-bottom: 1px solid $border-light;
  position: sticky;
  top: 0;
  z-index: $z-sticky;
  box-shadow: $shadow-sm;

  &__content {
    @include flex-between;
    padding: $spacing-lg 0;
    gap: $spacing-lg;

    @include mobile {
      padding: $spacing-md 0;
    }
  }

  &__brand {
    flex-shrink: 0;
  }

  &__logo {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    text-decoration: none;
    color: $text-primary;
    transition: color 0.2s ease-in-out;

    &:hover {
      color: $primary-blue;
    }

    &:focus-visible {
      outline: 2px solid $primary-blue;
      outline-offset: 2px;
      border-radius: $border-radius-sm;
    }
  }

  &__logo-icon {
    color: $primary-blue;
  }

  &__logo-text {
    @include text-style($font-size-lg, $font-weight-bold);
    white-space: nowrap;

    @include mobile {
      display: none;
    }
  }

  &__nav {
    flex: 1;
    display: flex;
    justify-content: center;

    @include max-width($breakpoint-md) {
      display: none;
    }
  }

  &__nav-list {
    display: flex;
    list-style: none;
    gap: $spacing-lg;
  }

  &__nav-link {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm $spacing-md;
    text-decoration: none;
    color: $text-secondary;
    border-radius: $border-radius-md;
    transition: all 0.2s ease-in-out;
    @include body-regular;
    font-weight: $font-weight-medium;

    &:hover {
      color: $primary-blue;
      background-color: $primary-blue-light;
    }

    &:focus-visible {
      outline: 2px solid $primary-blue;
      outline-offset: 2px;
    }

    &--active {
      color: $primary-blue;
      background-color: $primary-blue-light;
    }
  }

  &__nav-text {
    @include mobile {
      display: none;
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }

  &__location-btn,
  &__theme-btn {
    @include min-width($breakpoint-md) {
      display: flex;
    }
  }

  &__menu-toggle {
    @include min-width($breakpoint-md) {
      display: none;
    }
  }

  &__mobile-nav {
    @include min-width($breakpoint-md) {
      display: none;
    }

    border-top: 1px solid $border-light;
    padding: $spacing-lg 0;
    background: $background-card;
  }

  &__mobile-nav-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
    margin-bottom: $spacing-xl;
  }

  &__mobile-nav-link {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    padding: $spacing-md;
    text-decoration: none;
    color: $text-primary;
    border-radius: $border-radius-md;
    transition: all 0.2s ease-in-out;
    @include body-regular;
    font-weight: $font-weight-medium;

    &:hover {
      background-color: $primary-blue-light;
      color: $primary-blue;
    }

    &--active {
      background-color: $primary-blue-light;
      color: $primary-blue;
    }
  }

  &__mobile-actions {
    padding-top: $spacing-lg;
    border-top: 1px solid $border-light;
  }
}
</style>
