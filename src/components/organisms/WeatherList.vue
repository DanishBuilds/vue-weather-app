<template>
  <section class="weather-list" :aria-label="title">
    <header v-if="title" class="weather-list__header">
      <h2 class="weather-list__title">{{ title }}</h2>
      <span v-if="subtitle" class="weather-list__subtitle">{{ subtitle }}</span>
    </header>

    <!-- Loading State -->
    <div v-if="isLoading" class="weather-list__loading">
      <LoaderSpinner size="40" />
      <p class="weather-list__loading-text">{{ loadingText }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="weather-list__error">
      <BaseIcon name="cloud" size="48" class="weather-list__error-icon" />
      <h3 class="weather-list__error-title">{{ error.message }}</h3>
      <p class="weather-list__error-description">
        {{ getErrorDescription(error.code) }}
      </p>
      <BaseButton
        v-if="showRetry"
        variant="primary"
        size="sm"
        @click="handleRetry"
      >
        Try Again
      </BaseButton>
    </div>

    <!-- Empty State -->
    <div v-else-if="items.length === 0" class="weather-list__empty">
      <BaseIcon :name="emptyIcon" size="48" class="weather-list__empty-icon" />
      <h3 class="weather-list__empty-title">{{ emptyTitle }}</h3>
      <p class="weather-list__empty-description">{{ emptyDescription }}</p>
      <BaseButton
        v-if="showEmptyAction"
        variant="secondary"
        size="sm"
        @click="handleEmptyAction"
      >
        {{ emptyActionText }}
      </BaseButton>
    </div>

    <!-- Content -->
    <div v-else class="weather-list__content">
      <ul class="weather-list__items" role="list">
        <li
          v-for="(item, index) in displayItems"
          :key="getItemKey(item, index)"
          class="weather-list__item"
        >
          <WeatherListItem
            :weather="item"
            :interactive="interactive"
            :selected="selectedIndex === index"
            :show-details="showDetails"
            :compact="compact"
            @click="handleItemClick(item, index)"
          />
        </li>
      </ul>

      <!-- Load More -->
      <div v-if="showLoadMore" class="weather-list__load-more">
        <BaseButton
          variant="secondary"
          size="md"
          :is-loading="isLoadingMore"
          :disabled="isLoadingMore"
          @click="handleLoadMore"
        >
          {{ loadMoreText }}
        </BaseButton>
      </div>

      <!-- Pagination -->
      <nav
        v-if="showPagination"
        class="weather-list__pagination"
        aria-label="Weather list pagination"
      >
        <BaseButton
          variant="ghost"
          size="sm"
          icon="chevron-left"
          :disabled="currentPage === 1"
          aria-label="Previous page"
          @click="handlePreviousPage"
        />

        <span class="weather-list__pagination-info">
          Page {{ currentPage }} of {{ totalPages }}
        </span>

        <BaseButton
          variant="ghost"
          size="sm"
          icon="chevron-right"
          :disabled="currentPage === totalPages"
          aria-label="Next page"
          @click="handleNextPage"
        />
      </nav>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { BaseIcon, BaseButton, LoaderSpinner } from "@/components/atoms";
import { WeatherListItem } from "@/components/molecules";
import type {
  CurrentWeatherResponse,
  ForecastItem,
  WeatherError,
} from "@/types";

export interface WeatherListProps {
  items: (CurrentWeatherResponse | ForecastItem)[];
  title?: string;
  subtitle?: string;
  isLoading?: boolean;
  loadingText?: string;
  error?: WeatherError | null;
  showRetry?: boolean;
  interactive?: boolean;
  showDetails?: boolean;
  compact?: boolean;
  selectedIndex?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: string;
  showEmptyAction?: boolean;
  emptyActionText?: string;
  itemsPerPage?: number;
  showLoadMore?: boolean;
  showPagination?: boolean;
  loadMoreText?: string;
  isLoadingMore?: boolean;
  currentPage?: number;
}

const props = withDefaults(defineProps<WeatherListProps>(), {
  items: () => [],
  isLoading: false,
  loadingText: "Loading weather data...",
  error: null,
  showRetry: true,
  interactive: true,
  showDetails: true,
  compact: false,
  selectedIndex: -1,
  emptyTitle: "No weather data",
  emptyDescription: "Try searching for a city to see weather information.",
  emptyIcon: "search",
  showEmptyAction: false,
  emptyActionText: "Search Weather",
  itemsPerPage: 10,
  showLoadMore: false,
  showPagination: false,
  loadMoreText: "Load More",
  isLoadingMore: false,
  currentPage: 1,
});

const emit = defineEmits<{
  "item-click": [item: CurrentWeatherResponse | ForecastItem, index: number];
  retry: [];
  "empty-action": [];
  "load-more": [];
  "page-change": [page: number];
}>();

const displayItems = computed(() => {
  if (props.showPagination) {
    const start = (props.currentPage - 1) * props.itemsPerPage;
    const end = start + props.itemsPerPage;
    return props.items.slice(start, end);
  }
  return props.items;
});

const totalPages = computed(() => {
  if (!props.showPagination) return 1;
  return Math.ceil(props.items.length / props.itemsPerPage);
});

const getItemKey = (
  item: CurrentWeatherResponse | ForecastItem,
  index: number,
): string => {
  if ("name" in item) {
    return `current-${item.id || item.name}-${index}`;
  }
  return `forecast-${item.dt}-${index}`;
};

const getErrorDescription = (code: number): string => {
  const errorMessages: Record<number, string> = {
    400: "Please check your search query and try again.",
    401: "Weather service authentication failed.",
    404: "City not found. Please check the spelling and try again.",
    429: "Too many requests. Please wait a moment and try again.",
    500: "Weather service is temporarily unavailable.",
    503: "Weather service is under maintenance.",
  };

  return (
    errorMessages[code] || "An unexpected error occurred. Please try again."
  );
};

const handleItemClick = (
  item: CurrentWeatherResponse | ForecastItem,
  index: number,
) => {
  if (props.interactive) {
    emit("item-click", item, index);
  }
};

const handleRetry = () => {
  emit("retry");
};

const handleEmptyAction = () => {
  emit("empty-action");
};

const handleLoadMore = () => {
  emit("load-more");
};

const handlePreviousPage = () => {
  if (props.currentPage > 1) {
    emit("page-change", props.currentPage - 1);
  }
};

const handleNextPage = () => {
  if (props.currentPage < totalPages.value) {
    emit("page-change", props.currentPage + 1);
  }
};
</script>

<style lang="scss" scoped>
@use "@/styles/variables" as *;
@use "@/styles/mixins" as *;

.weather-list {
  width: 100%;

  &__header {
    margin-bottom: $spacing-xl;
    text-align: center;

    @include mobile {
      text-align: left;
      margin-bottom: $spacing-lg;
    }
  }

  &__title {
    @include heading-2;
    margin: 0 0 $spacing-sm;
  }

  &__subtitle {
    @include body-regular;
    color: $text-secondary;
  }

  &__loading,
  &__error,
  &__empty {
    @include flex-center;
    flex-direction: column;
    gap: $spacing-lg;
    padding: $spacing-4xl $spacing-xl;
    text-align: center;
  }

  &__loading {
    &-text {
      @include body-regular;
      color: $text-secondary;
      margin: 0;
    }
  }

  &__error {
    &-icon {
      color: $error-red;
    }

    &-title {
      @include heading-3;
      color: $error-red;
      margin: 0;
    }

    &-description {
      @include body-regular;
      color: $text-secondary;
      margin: 0;
      max-width: 400px;
    }
  }

  &__empty {
    &-icon {
      color: $text-light;
    }

    &-title {
      @include heading-3;
      color: $text-secondary;
      margin: 0;
    }

    &-description {
      @include body-regular;
      color: $text-light;
      margin: 0;
      max-width: 400px;
    }
  }

  &__content {
    width: 100%;
  }

  &__items {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: $spacing-lg;

    @include mobile {
      gap: $spacing-md;
    }
  }

  &__item {
    width: 100%;
  }

  &__load-more {
    @include flex-center;
    margin-top: $spacing-2xl;
  }

  &__pagination {
    @include flex-center;
    gap: $spacing-lg;
    margin-top: $spacing-2xl;
    padding-top: $spacing-xl;
    border-top: 1px solid $border-light;

    &-info {
      @include body-small;
      color: $text-secondary;
      font-weight: $font-weight-medium;
    }
  }
}

// Compact layout modifications
.weather-list--compact {
  .weather-list__items {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: $spacing-md;

    @include mobile {
      grid-template-columns: 1fr;
    }
  }
}

// Horizontal layout for forecast
.weather-list--horizontal {
  .weather-list__items {
    display: flex;
    overflow-x: auto;
    gap: $spacing-lg;
    padding-bottom: $spacing-md;
    scroll-snap-type: x mandatory;

    @include mobile {
      gap: $spacing-md;
    }
  }

  .weather-list__item {
    flex: 0 0 auto;
    width: 280px;
    scroll-snap-align: start;

    @include mobile {
      width: 240px;
    }
  }
}
</style>
