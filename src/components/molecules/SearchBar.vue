<template>
  <div class="search-bar">
    <form class="search-bar__form" @submit.prevent="handleSubmit">
      <div class="search-bar__input-wrapper">
        <BaseInput
          ref="inputRef"
          v-model="searchQuery"
          type="search"
          icon="search"
          :placeholder="placeholder"
          :disabled="isLoading"
          :error="error"
          clearable
          class="search-bar__input"
          @enter="handleSubmit"
          @clear="handleClear"
          @focus="handleFocus"
        />
      </div>
    </form>

    <!-- City suggestions dropdown -->
    <div
      v-if="
        showSuggestions &&
        (filteredSuggestions.length > 0 ||
          recentSearches.length > 0 ||
          isSearchingLocations)
      "
      class="search-bar__suggestions"
      role="listbox"
      aria-label="City suggestions"
    >
      <ul class="search-bar__suggestions-list">
        <!-- Loading state -->
        <li
          v-if="isSearchingLocations"
          class="search-bar__suggestion search-bar__suggestion--loading"
        >
          <div class="search-bar__suggestion-button">
            <BaseIcon
              name="loader"
              size="16"
              class="search-bar__suggestion-icon search-bar__suggestion-icon--loading"
            />
            <span class="search-bar__suggestion-text"
              >Searching locations...</span
            >
          </div>
        </li>

        <!-- Recent searches when no search query -->
        <template v-else-if="!searchQuery.trim() && recentSearches.length > 0">
          <li
            v-for="(item, index) in recentSearches.slice(0, 5)"
            :key="`recent-${item.city}`"
            class="search-bar__suggestion"
          >
            <button
              :class="[
                'search-bar__suggestion-button',
                {
                  'search-bar__suggestion-button--active':
                    index === selectedIndex,
                },
              ]"
              type="button"
              @click="selectSuggestion(item.city)"
              @mouseenter="selectedIndex = index"
            >
              <BaseIcon
                name="clock"
                size="16"
                class="search-bar__suggestion-icon"
              />
              <span class="search-bar__suggestion-text">{{ item.city }}</span>
            </button>
          </li>
        </template>

        <!-- Location suggestions from API -->
        <template v-else-if="filteredSuggestions.length > 0">
          <li
            v-for="(suggestion, index) in filteredSuggestions"
            :key="`suggestion-${suggestion}`"
            class="search-bar__suggestion"
          >
            <button
              :class="[
                'search-bar__suggestion-button',
                {
                  'search-bar__suggestion-button--active':
                    index === selectedIndex,
                },
              ]"
              type="button"
              @click="selectSuggestion(suggestion)"
              @mouseenter="selectedIndex = index"
            >
              <BaseIcon
                name="map-pin"
                size="16"
                class="search-bar__suggestion-icon"
              />
              <span class="search-bar__suggestion-text">{{ suggestion }}</span>
            </button>
          </li>
        </template>

        <!-- No results state -->
        <li
          v-else-if="searchQuery.trim().length >= 2 && !isSearchingLocations"
          class="search-bar__suggestion search-bar__suggestion--no-results"
        >
          <div class="search-bar__suggestion-button">
            <BaseIcon
              name="search"
              size="16"
              class="search-bar__suggestion-icon"
            />
            <span class="search-bar__suggestion-text">No locations found</span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { BaseInput, BaseButton, BaseIcon } from "@/components/atoms";
import WeatherService from "@/services/weatherApi";
import type { SearchHistoryItem, LocationSearchResult } from "@/types";

export interface SearchBarProps {
  modelValue?: string;
  placeholder?: string;
  isLoading?: boolean;
  error?: string;
  recentSearches?: SearchHistoryItem[];
}

const props = withDefaults(defineProps<SearchBarProps>(), {
  modelValue: "",
  placeholder: "Search for a city...",
  isLoading: false,
  recentSearches: () => [],
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
  search: [city: string];
  clear: [];
  "clear-history": [];
  "select-suggestion": [city: string];
}>();

const inputRef = ref<InstanceType<typeof BaseInput>>();
const searchQuery = ref(props.modelValue);
const showSuggestions = ref(false);
const selectedIndex = ref(-1);
const locationSuggestions = ref<LocationSearchResult[]>([]);
const isSearchingLocations = ref(false);
const searchTimeout = ref<NodeJS.Timeout>();

const canSearch = computed(() => searchQuery.value.trim().length > 0);

// Format location for display
const formatLocationDisplay = (location: LocationSearchResult): string => {
  const parts = [location.name];

  if (location.state && location.country === "US") {
    parts.push(location.state);
  }

  parts.push(location.country);
  return parts.join(", ");
};

// Debounced location search
const searchLocations = async (query: string) => {
  if (!query.trim() || query.trim().length < 2) {
    locationSuggestions.value = [];
    return;
  }

  isSearchingLocations.value = true;

  try {
    const results = await WeatherService.searchLocations(query, 8);
    locationSuggestions.value = results;
  } catch (error) {
    // Handle error silently
    locationSuggestions.value = [];
  } finally {
    isSearchingLocations.value = false;
  }
};

const debouncedSearch = (query: string) => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }

  searchTimeout.value = setTimeout(() => {
    searchLocations(query);
  }, 300); // 300ms debounce
};

const filteredSuggestions = computed(() => {
  const query = searchQuery.value.trim();

  if (!query) {
    return [];
  }

  return locationSuggestions.value.map((location) =>
    formatLocationDisplay(location),
  );
});

const handleSubmit = () => {
  if (canSearch.value && !props.isLoading) {
    emit("search", searchQuery.value.trim());
    hideSuggestionsDropdown();
  }
};

const handleClear = () => {
  searchQuery.value = "";
  emit("update:modelValue", "");
  emit("clear");
  hideSuggestionsDropdown();
};

const clearHistory = () => {
  emit("clear-history");
  hideSuggestionsDropdown();
};

const selectSuggestion = (city: string) => {
  searchQuery.value = city;
  emit("update:modelValue", city);
  emit("select-suggestion", city);
  hideSuggestionsDropdown();
};

const showSuggestionsDropdown = () => {
  showSuggestions.value = true;
};

const hideSuggestionsDropdown = () => {
  showSuggestions.value = false;
  selectedIndex.value = -1;
};

const handleKeydown = (event: KeyboardEvent) => {
  if (!showSuggestions.value || props.recentSearches.length === 0) return;

  switch (event.key) {
    case "ArrowDown":
      event.preventDefault();
      selectedIndex.value = Math.min(
        selectedIndex.value + 1,
        props.recentSearches.length - 1,
      );
      break;
    case "ArrowUp":
      event.preventDefault();
      selectedIndex.value = Math.max(selectedIndex.value - 1, -1);
      break;
    case "Enter":
      if (selectedIndex.value >= 0) {
        event.preventDefault();
        selectSuggestion(props.recentSearches[selectedIndex.value].city);
      }
      break;
    case "Escape":
      hideSuggestionsDropdown();
      break;
  }
};

const handleFocus = () => {
  if (props.recentSearches.length > 0) {
    showSuggestionsDropdown();
  }
};

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Element;
  if (!target.closest(".search-bar")) {
    hideSuggestionsDropdown();
  }
};

onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
  document.addEventListener("click", handleClickOutside);

  // Focus input if not on mobile
  if (window.innerWidth > 768) {
    inputRef.value?.focus();
  }
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
  document.removeEventListener("click", handleClickOutside);

  // Clear search timeout
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }
});

// Watch for prop changes
watch(
  () => props.modelValue,
  (newValue) => {
    searchQuery.value = newValue;
  },
);

watch(searchQuery, (newValue) => {
  emit("update:modelValue", newValue);

  // Trigger location search when user types
  if (newValue.trim().length >= 2) {
    debouncedSearch(newValue);
    showSuggestionsDropdown();
  } else {
    locationSuggestions.value = [];
    if (newValue.trim().length === 0 && props.recentSearches.length > 0) {
      showSuggestionsDropdown();
    } else {
      hideSuggestionsDropdown();
    }
  }
});
</script>

<style lang="scss" scoped>
@use "@/styles/variables" as *;
@use "@/styles/mixins" as *;

.search-bar {
  position: relative;
  width: 100%;

  &__form {
    width: 100%;
  }

  &__input-wrapper {
    width: 100%;
  }

  &__input {
    width: 100%;
  }

  &__suggestions {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: $z-dropdown;
    margin-top: $spacing-xs;
    background: $background-card;
    border-radius: $border-radius-lg;
    box-shadow: $shadow-lg;
    border: 1px solid $border-light;
    overflow: hidden;
    max-height: 300px;
  }

  &__suggestions-list {
    list-style: none;
    padding: 0;
    margin: 0;
    overflow-y: auto;
  }

  &__suggestion {
    &:not(:last-child) {
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    }
  }

  &__suggestion-button {
    width: 100%;
    display: flex;
    align-items: center;
    gap: $spacing-md;
    padding: $spacing-lg;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    transition: background-color 0.15s ease;
    @include body-regular;

    &:hover,
    &--active {
      background-color: #f6f6f8;
    }

    &:focus-visible {
      outline: 2px solid $primary-blue;
      outline-offset: -2px;
    }
  }

  &__suggestion-icon {
    color: #8d9aaf;
    flex-shrink: 0;
  }

  &__suggestion-text {
    color: $text-primary;
    flex: 1;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__suggestion--loading,
  &__suggestion--no-results {
    .search-bar__suggestion-button {
      cursor: default;

      &:hover {
        background-color: transparent;
      }
    }

    .search-bar__suggestion-text {
      color: $text-secondary;
    }
  }

  &__suggestion--loading {
    .search-bar__suggestion-icon--loading {
      animation: spin 1s linear infinite;
    }
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// Mobile responsive
@include mobile {
  .search-bar {
    &__suggestions {
      left: -$spacing-lg;
      right: -$spacing-lg;
      border-radius: 0;
      border-left: none;
      border-right: none;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }
}
</style>
