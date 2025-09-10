<template>
  <div class="home-page">
    <!-- Header -->
    <header class="home-page__header">
      <h1 class="home-page__title">Weather</h1>
      <BaseButton
        variant="ghost"
        size="sm"
        icon="user"
        class="home-page__profile-btn"
        aria-label="Edit profile"
        @click="handleProfileClick"
      />
    </header>

    <!-- Search Bar -->
    <div class="home-page__search">
      <SearchBar
        v-model="searchQuery"
        placeholder="Search for a city or airport"
        :is-loading="weatherStore.isLoading"
        :error="searchError"
        :recent-searches="weatherStore.recentSearches"
        @search="handleSearch"
        @clear="handleClear"
        @clear-history="handleClearHistory"
        @select-suggestion="handleSelectSuggestion"
      />
    </div>

    <!-- Weather Cards -->
    <div class="home-page__weather-cards">
      <!-- My Location Card -->
      <div
        v-if="weatherStore.hasWeatherData"
        class="weather-card weather-card--primary"
        @click="handleCurrentWeatherClick"
      >
        <div class="weather-card__header">
          <span class="weather-card__location-label">My Location</span>
          <span class="weather-card__temp"
            >{{ Math.round(weatherStore.currentWeather!.main.temp) }}°</span
          >
        </div>
        <div class="weather-card__location">
          {{ weatherStore.currentWeather!.name }}
        </div>
        <div class="weather-card__condition">
          {{ weatherStore.currentWeather!.weather[0].description }}
        </div>
        <div class="weather-card__range">
          H:{{ Math.round(weatherStore.currentWeather!.main.temp_max) }}° L:{{
            Math.round(weatherStore.currentWeather!.main.temp_min)
          }}°
        </div>
      </div>

      <!-- Recent Searches as Cards -->
      <div
        v-for="(item, index) in recentWeatherItems"
        :key="item.name"
        :class="['weather-card', getCardVariant(index)]"
        @click="handleRecentItemClick(item)"
      >
        <div class="weather-card__header">
          <span class="weather-card__location-label">{{
            getCurrentTime(item)
          }}</span>
          <span class="weather-card__temp"
            >{{ Math.round(item.main.temp) }}°</span
          >
        </div>
        <div class="weather-card__location">{{ item.name }}</div>
        <div class="weather-card__condition">
          {{ item.weather[0].description }}
        </div>
        <div class="weather-card__range">
          H:{{ Math.round(item.main.temp_max) }}° L:{{
            Math.round(item.main.temp_min)
          }}°
        </div>
      </div>

      <!-- Add Location Button -->
      <div
        v-if="!weatherStore.hasWeatherData && recentWeatherItems.length === 0"
        class="weather-card weather-card--add"
        @click="handleGetLocation"
      >
        <div class="weather-card__add-content">
          <BaseIcon name="plus" size="24" />
          <span>Add Location</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { BaseButton, BaseIcon } from "@/components/atoms";
import { SearchBar } from "@/components/molecules";
import { WeatherCard, WeatherList } from "@/components/organisms";
import { useWeatherStore } from "@/stores/weather";
import type { CurrentWeatherResponse, ForecastItem } from "@/types";

const router = useRouter();
const weatherStore = useWeatherStore();

const searchQuery = ref("");
const searchError = ref<string | null>(null);
const isGettingLocation = ref(false);

const recentWeatherItems = computed(() => {
  const items = weatherStore.recentSearches
    .filter((item) => item.weather)
    .map((item) => item.weather!)
    .slice(0, 5);

  return items;
});

const dailyForecastItems = computed(() => {
  if (!weatherStore.forecast) return [];

  // Group forecast items by day and take one item per day
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

const handleSearch = async (city: string) => {
  searchError.value = null;
  searchQuery.value = city;

  try {
    // Allow re-addition of deleted locations for manual searches
    await weatherStore.fetchWeatherData(city);
  } catch (error) {
    searchError.value = "Failed to fetch weather data";
  }
};

const handleClear = () => {
  searchQuery.value = "";
  searchError.value = null;
};

const handleClearHistory = () => {
  weatherStore.clearSearchHistory();
};

const handleSelectSuggestion = async (city: string) => {
  await handleSearch(city);
};

const handleGetLocation = async () => {
  isGettingLocation.value = true;

  try {
    await weatherStore.getUserLocation();
  } catch (error) {
    searchError.value = "Unable to get location";
  } finally {
    isGettingLocation.value = false;
  }
};

const handleRecentItemClick = (item: CurrentWeatherResponse) => {
  router.push(`/detail/${encodeURIComponent(item.name)}`);
};

const handleCurrentWeatherClick = () => {
  if (weatherStore.currentWeather) {
    router.push(
      `/detail/${encodeURIComponent(weatherStore.currentWeather.name)}`,
    );
  }
};

const getCurrentTime = (weather: CurrentWeatherResponse): string => {
  const date = new Date(weather.dt * 1000);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const getCardVariant = (index: number): string => {
  const variants = [
    "weather-card--secondary",
    "weather-card--dark",
    "weather-card--tertiary",
  ];
  return variants[index % variants.length];
};

const handleProfileClick = () => {
  router.push("/profile");
};

onMounted(() => {
  // If we have a current weather but no forecast, try to fetch it
  if (weatherStore.currentWeather && !weatherStore.forecast) {
    weatherStore.fetchForecast(weatherStore.currentWeather.name);
  }
});
</script>

<style lang="scss" scoped>
@use "@/styles/variables" as *;
@use "@/styles/mixins" as *;

.home-page {
  padding: $spacing-lg;
  background-color: #f6f6f8;
  min-height: 100vh;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-xl;
  }

  &__title {
    @include text-style($font-size-4xl, $font-weight-bold);
    color: $text-primary;
    margin: 0;
  }

  &__profile-btn {
    color: $text-secondary;
  }

  &__search {
    margin-bottom: $spacing-xl;
  }

  &__weather-cards {
    display: flex;
    flex-direction: column;
    gap: $spacing-lg;
  }
}

.weather-card {
  padding: $spacing-xl;
  border-radius: $border-radius-2xl;
  color: white;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-lg;
  }

  &--primary {
    background: linear-gradient(135deg, #5d9cec 0%, #4a8fdc 100%);
  }

  &--secondary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  &--dark {
    background: linear-gradient(135deg, #2c3e50 0%, #3498db 30%, #2c3e50 100%);
    position: relative;
    overflow: hidden;

    &::before {
      content: "";
      position: absolute;
      top: 0;
      right: 0;
      width: 40%;
      height: 100%;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="80" cy="20" r="30" fill="rgba(255,255,255,0.1)"/><circle cx="90" cy="50" r="20" fill="rgba(255,255,255,0.05)"/></svg>')
        no-repeat;
      background-size: cover;
      opacity: 0.3;
    }
  }

  &--tertiary {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  }

  &--add {
    background: transparent;
    border: 2px dashed $border-light;
    color: $text-secondary;
    justify-content: center;
    align-items: center;

    &:hover {
      border-color: $primary-blue;
      color: $primary-blue;
    }
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: $spacing-sm;
  }

  &__location-label {
    @include body-small;
    font-weight: $font-weight-medium;
    opacity: 0.9;
  }

  &__temp {
    @include text-style($font-size-4xl, $font-weight-light);
    line-height: 1;
  }

  &__location {
    @include text-style($font-size-xl, $font-weight-semibold);
    margin-bottom: $spacing-xs;
  }

  &__condition {
    @include body-regular;
    opacity: 0.9;
    margin-bottom: $spacing-sm;
    text-transform: capitalize;
  }

  &__range {
    @include body-small;
    opacity: 0.8;
    font-weight: $font-weight-medium;
  }

  &__add-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $spacing-sm;
    @include body-regular;
    font-weight: $font-weight-medium;
  }
}

// Mobile responsive adjustments
@include mobile {
  .home-page {
    padding: $spacing-md;

    &__title {
      font-size: $font-size-3xl;
    }
  }

  .weather-card {
    min-height: 100px;
    padding: $spacing-lg;

    &__temp {
      font-size: $font-size-3xl;
    }

    &__location {
      font-size: $font-size-lg;
    }
  }
}
</style>
