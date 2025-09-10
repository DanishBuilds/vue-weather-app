<template>
  <div class="detail-page">
    <!-- Loading State -->
    <div v-if="weatherStore.isLoading" class="detail-page__loading">
      <LoaderSpinner size="48" />
      <p>Loading weather information...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="weatherStore.error" class="detail-page__error">
      <BaseIcon name="cloud" size="64" class="detail-page__error-icon" />
      <h2>Unable to Load Weather Data</h2>
      <p>{{ weatherStore.error.message }}</p>
      <BaseButton variant="primary" @click="handleRetry">Try Again</BaseButton>
    </div>

    <!-- Content -->
    <div v-else-if="weatherStore.hasWeatherData" class="detail-page__content">
      <!-- Gradient Header -->
      <header class="detail-page__header">
        <div class="detail-page__header-top">
          <BaseButton
            variant="ghost"
            size="sm"
            icon="chevron-left"
            aria-label="Go back"
            class="detail-page__back-btn"
            @click="goBack"
          />
          <BaseButton
            variant="ghost"
            size="sm"
            icon="trash-2"
            aria-label="Remove location"
            class="detail-page__delete-btn"
            @click="handleDelete"
          />
        </div>

        <div class="detail-page__header-content">
          <h1 class="detail-page__location">
            {{ weatherStore.currentWeather!.name }},
            {{ weatherStore.currentWeather!.sys.country }}
          </h1>
          <p class="detail-page__date">{{ formattedDate }}</p>

          <div class="detail-page__weather-main">
            <BaseIcon
              :name="
                getWeatherIcon(
                  weatherStore.currentWeather!.weather[0].description,
                )
              "
              size="80"
              class="detail-page__weather-icon"
            />
          </div>

          <div class="detail-page__temp">
            {{ Math.round(weatherStore.currentWeather!.main.temp) }}°C
          </div>
          <div class="detail-page__condition">
            {{ weatherStore.currentWeather!.weather[0].description }}
          </div>

          <div class="detail-page__last-update">
            <BaseIcon name="refresh-cw" size="16" />
            <span>Last Update {{ lastUpdateTime }}</span>
          </div>
        </div>
      </header>

      <!-- White Content Sections -->
      <div class="detail-page__sections">
        <!-- Hourly Forecast -->
        <section v-if="hourlyForecast.length > 0" class="detail-page__section">
          <h2 class="detail-page__section-title">Hourly Forecast</h2>
          <div class="detail-page__hourly-grid">
            <div
              v-for="item in hourlyForecast"
              :key="item.dt"
              class="hourly-item"
            >
              <BaseIcon
                :name="getWeatherIcon(item.weather[0].description)"
                size="32"
                class="hourly-item__icon"
              />
              <div class="hourly-item__temp">
                {{ Math.round(item.main.temp) }}°
              </div>
              <div class="hourly-item__time">
                {{ formatHourlyTime(item.dt) }}
              </div>
            </div>
          </div>
        </section>

        <!-- Weekly Forecast -->
        <section v-if="dailyForecast.length > 0" class="detail-page__section">
          <h2 class="detail-page__section-title">Weekly Forecast</h2>
          <div class="detail-page__weekly-list">
            <div
              v-for="item in dailyForecast"
              :key="item.dt"
              class="weekly-item"
            >
              <div class="weekly-item__left">
                <BaseIcon
                  :name="getWeatherIcon(item.weather[0].description)"
                  size="40"
                  class="weekly-item__icon"
                />
                <div class="weekly-item__info">
                  <div class="weekly-item__day">
                    {{ formatDayName(item.dt) }}
                  </div>
                  <div class="weekly-item__condition">
                    {{ item.weather[0].description }}
                  </div>
                </div>
              </div>
              <div class="weekly-item__temp">
                {{ Math.round(item.main.temp) }}°C
              </div>
              <BaseIcon
                name="chevron-right"
                size="20"
                class="weekly-item__arrow"
              />
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="detail-page__empty">
      <BaseIcon name="search" size="64" />
      <h2>No Weather Data Available</h2>
      <p>Search for a city to view detailed weather information.</p>
      <BaseButton variant="primary" @click="goHome">Search Weather</BaseButton>
    </div>

    <!-- Delete Success Toast -->
    <div v-if="showDeleteSuccess" class="detail-page__delete-toast">
      <BaseIcon name="check-circle" size="20" />
      <span>Location deleted successfully</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { BaseButton, BaseIcon, LoaderSpinner } from "@/components/atoms";
import { WeatherCard, WeatherList } from "@/components/organisms";
import { useWeatherStore } from "@/stores/weather";
import type { ForecastItem } from "@/types";

const route = useRoute();
const router = useRouter();
const weatherStore = useWeatherStore();
const showDeleteSuccess = ref(false);

const cityParam = computed(() => {
  const city = route.params.city as string;
  return city ? decodeURIComponent(city) : null;
});

const hourlyForecast = computed(() => {
  if (!weatherStore.forecast) return [];

  // Get next 24 hours (8 items * 3 hours each)
  return weatherStore.forecast.list.slice(0, 8);
});

const dailyForecast = computed(() => {
  if (!weatherStore.forecast) return [];

  // Group by day and get one representative item per day
  const dailyItems: ForecastItem[] = [];
  const seenDates = new Set<string>();

  for (const item of weatherStore.forecast.list) {
    const date = new Date(item.dt * 1000).toDateString();
    if (!seenDates.has(date)) {
      seenDates.add(date);
      dailyItems.push(item);
      if (dailyItems.length >= 5) break;
    }
  }

  return dailyItems;
});

const formattedDate = computed(() => {
  if (!weatherStore.currentWeather) return "";

  const date = new Date(weatherStore.currentWeather.dt * 1000);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
});

const lastUpdateTime = computed(() => {
  if (!weatherStore.currentWeather) return "";

  const date = new Date(weatherStore.currentWeather.dt * 1000);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
});

const formatHourlyTime = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const formatDayName = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("en-US", { weekday: "long" });
};

const getWeatherIcon = (condition: string): string => {
  const iconMap: Record<string, string> = {
    "clear sky": "sun",
    "few clouds": "cloud",
    "scattered clouds": "cloud",
    "broken clouds": "cloud",
    "overcast clouds": "cloud",
    "shower rain": "cloud-rain",
    rain: "cloud-rain",
    "moderate rain": "cloud-rain",
    thunderstorm: "zap",
    snow: "cloud-snow",
    mist: "cloud",
    fog: "cloud",
  };

  const description = condition.toLowerCase();
  for (const [key, icon] of Object.entries(iconMap)) {
    if (description.includes(key)) {
      return icon;
    }
  }

  return "cloud";
};

const loadWeatherData = async (city: string) => {
  try {
    await weatherStore.fetchWeatherData(city);
  } catch (error) {
    // Handle error silently
  }
};

const handleRetry = () => {
  if (cityParam.value) {
    loadWeatherData(cityParam.value);
  } else if (weatherStore.selectedCity) {
    loadWeatherData(weatherStore.selectedCity);
  }
};

const handleDelete = () => {
  // Remove from recent searches and go back
  if (weatherStore.currentWeather) {
    const locationName = weatherStore.currentWeather.name;

    // Show success feedback
    showDeleteSuccess.value = true;

    // Remove from search history (this will also add to deleted locations list)
    weatherStore.removeFromSearchHistory(locationName);

    // Navigate back after a short delay to show feedback
    setTimeout(() => {
      showDeleteSuccess.value = false;
      goBack();
    }, 800);
  } else {
    goBack();
  }
};

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1);
  } else {
    router.push("/");
  }
};

const goHome = () => {
  router.push("/");
};

// Watch for city parameter changes
watch(
  cityParam,
  (newCity) => {
    if (newCity && newCity !== weatherStore.selectedCity) {
      loadWeatherData(newCity);
    }
  },
  { immediate: true },
);

onMounted(() => {
  // If we have city param but no data, load it
  if (cityParam.value && !weatherStore.hasWeatherData) {
    loadWeatherData(cityParam.value);
  } else if (!cityParam.value && weatherStore.currentWeather) {
    // If no city param but we have current weather, update URL
    router.replace(
      `/detail/${encodeURIComponent(weatherStore.currentWeather.name)}`,
    );
  }
});
</script>

<style lang="scss" scoped>
@use "@/styles/variables" as *;
@use "@/styles/mixins" as *;

.detail-page {
  min-height: 100vh;
  background: #f6f6f8;

  &__loading,
  &__error,
  &__empty {
    @include flex-center;
    flex-direction: column;
    gap: $spacing-lg;
    padding: $spacing-4xl $spacing-xl;
    text-align: center;
    min-height: 100vh;

    h2 {
      @include heading-2;
      margin: 0;
    }

    p {
      @include body-regular;
      color: $text-secondary;
      margin: 0;
      max-width: 400px;
    }
  }

  &__error {
    &-icon {
      color: $error-red;
    }

    h2 {
      color: $error-red;
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  &__header {
    background: linear-gradient(135deg, #5d9cec 0%, #4a8fdc 100%);
    color: white;
    padding: $spacing-lg $spacing-lg $spacing-2xl;
    text-align: center;
    position: relative;
  }

  &__header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-xl;
  }

  &__back-btn,
  &__delete-btn {
    color: white;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  }

  &__location {
    @include text-style($font-size-xl, $font-weight-semibold);
    margin: 0 0 $spacing-sm;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__date {
    @include body-regular;
    opacity: 0.9;
    margin: 0 0 $spacing-xl;
  }

  &__weather-main {
    margin: $spacing-lg 0;
  }

  &__weather-icon {
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
  }

  &__temp {
    @include text-style(4rem, $font-weight-light);
    line-height: 1;
    margin: $spacing-lg 0 $spacing-sm;

    @include mobile {
      font-size: 3.5rem;
    }
  }

  &__condition {
    @include text-style($font-size-xl, $font-weight-medium);
    text-transform: capitalize;
    opacity: 0.95;
    margin-bottom: $spacing-xl;
  }

  &__last-update {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-sm;
    @include body-small;
    opacity: 0.8;

    svg {
      opacity: 0.7;
    }
  }

  &__sections {
    flex: 1;
    background: white;
    padding: $spacing-xl $spacing-lg;
  }

  &__section {
    margin-bottom: $spacing-2xl;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__section-title {
    @include text-style($font-size-xl, $font-weight-semibold);
    color: $text-primary;
    margin: 0 0 $spacing-lg;
  }

  &__hourly-grid {
    display: flex;
    gap: $spacing-md;
    overflow-x: auto;
    padding: $spacing-md 0;

    &::-webkit-scrollbar {
      height: 4px;
    }

    &::-webkit-scrollbar-track {
      background: #f6f6f8;
      border-radius: $border-radius-sm;
    }

    &::-webkit-scrollbar-thumb {
      background: $border-light;
      border-radius: $border-radius-sm;
    }
  }

  &__weekly-list {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
  }
}

.hourly-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-md;
  background: #f8fafc;
  border-radius: $border-radius-lg;
  min-width: 80px;
  flex-shrink: 0;

  &__icon {
    color: $primary-blue;
  }

  &__temp {
    @include text-style($font-size-lg, $font-weight-semibold);
    color: $text-primary;
  }

  &__time {
    @include body-small;
    color: $text-secondary;
  }
}

.weekly-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-lg;
  background: #f8fafc;
  border-radius: $border-radius-lg;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: #f1f5f9;
  }

  &__left {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    flex: 1;
  }

  &__icon {
    color: $primary-blue;
    flex-shrink: 0;
  }

  &__info {
    flex: 1;
  }

  &__day {
    @include body-regular;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin-bottom: $spacing-xs;
  }

  &__condition {
    @include body-small;
    color: $text-secondary;
    text-transform: capitalize;
  }

  &__temp {
    @include text-style($font-size-lg, $font-weight-semibold);
    color: $text-primary;
    margin-right: $spacing-md;
  }

  &__arrow {
    color: $text-light;
    flex-shrink: 0;
  }
}

.detail-page {
  &__delete-toast {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: $z-tooltip;
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-md $spacing-lg;
    background: $success-green;
    color: white;
    border-radius: $border-radius-lg;
    box-shadow: $shadow-xl;
    animation: toast-fade-in 0.3s ease-out;
    font-weight: $font-weight-medium;

    svg {
      color: white;
    }
  }
}

@keyframes toast-fade-in {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

// Mobile responsive
@include mobile {
  .detail-page {
    &__header {
      padding: $spacing-md $spacing-md $spacing-xl;
    }

    &__location {
      font-size: $font-size-lg;
    }

    &__sections {
      padding: $spacing-lg $spacing-md;
    }

    &__hourly-grid {
      gap: $spacing-sm;
    }

    &__delete-toast {
      left: $spacing-lg;
      right: $spacing-lg;
      transform: translateY(-50%);
    }
  }

  .hourly-item {
    min-width: 70px;
    padding: $spacing-sm;
  }

  .weekly-item {
    padding: $spacing-md;
  }
}
</style>
