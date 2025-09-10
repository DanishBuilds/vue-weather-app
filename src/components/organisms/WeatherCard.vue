<template>
  <article class="weather-card">
    <header class="weather-card__header">
      <div class="weather-card__location">
        <BaseIcon name="map-pin" size="20" />
        <h2 class="weather-card__city">{{ weather.name }}</h2>
        <span class="weather-card__country">{{ weather.sys.country }}</span>
      </div>

      <div class="weather-card__timestamp">
        <BaseIcon name="clock" size="16" />
        <time :datetime="weatherTime.iso">{{ weatherTime.formatted }}</time>
      </div>
    </header>

    <div class="weather-card__main">
      <div class="weather-card__current">
        <div class="weather-card__icon">
          <BaseIcon
            :name="getWeatherIcon(weather.weather[0].description)"
            size="80"
            class="weather-card__weather-icon"
          />
        </div>

        <div class="weather-card__temp">
          <span class="weather-card__temp-value"
            >{{ Math.round(weather.main.temp) }}°</span
          >
          <div class="weather-card__condition">
            <span class="weather-card__condition-text">{{
              weather.weather[0].description
            }}</span>
            <span class="weather-card__feels-like">
              Feels like {{ Math.round(weather.main.feels_like) }}°C
            </span>
          </div>
        </div>
      </div>

      <div class="weather-card__range">
        <div class="weather-card__range-item">
          <span class="weather-card__range-label">High</span>
          <span class="weather-card__range-value"
            >{{ Math.round(weather.main.temp_max) }}°</span
          >
        </div>
        <div class="weather-card__range-divider"></div>
        <div class="weather-card__range-item">
          <span class="weather-card__range-label">Low</span>
          <span class="weather-card__range-value"
            >{{ Math.round(weather.main.temp_min) }}°</span
          >
        </div>
      </div>
    </div>

    <div class="weather-card__details">
      <div class="weather-card__detail-grid">
        <div class="weather-card__detail">
          <div class="weather-card__detail-header">
            <BaseIcon name="wind" size="20" />
            <span class="weather-card__detail-label">Wind</span>
          </div>
          <span class="weather-card__detail-value"
            >{{ Math.round(weather.wind.speed) }} m/s</span
          >
          <span class="weather-card__detail-sublabel">{{
            getWindDirection(weather.wind.deg)
          }}</span>
        </div>

        <div class="weather-card__detail">
          <div class="weather-card__detail-header">
            <BaseIcon name="droplets" size="20" />
            <span class="weather-card__detail-label">Humidity</span>
          </div>
          <span class="weather-card__detail-value"
            >{{ weather.main.humidity }}%</span
          >
          <span class="weather-card__detail-sublabel">{{
            getHumidityLevel(weather.main.humidity)
          }}</span>
        </div>

        <div class="weather-card__detail">
          <div class="weather-card__detail-header">
            <BaseIcon name="eye" size="20" />
            <span class="weather-card__detail-label">Visibility</span>
          </div>
          <span class="weather-card__detail-value"
            >{{ Math.round(weather.visibility / 1000) }} km</span
          >
          <span class="weather-card__detail-sublabel">{{
            getVisibilityLevel(weather.visibility)
          }}</span>
        </div>

        <div class="weather-card__detail">
          <div class="weather-card__detail-header">
            <BaseIcon name="thermometer" size="20" />
            <span class="weather-card__detail-label">Pressure</span>
          </div>
          <span class="weather-card__detail-value"
            >{{ weather.main.pressure }} hPa</span
          >
          <span class="weather-card__detail-sublabel">{{
            getPressureLevel(weather.main.pressure)
          }}</span>
        </div>
      </div>
    </div>

    <footer class="weather-card__footer">
      <div class="weather-card__sun-times">
        <div class="weather-card__sun-time">
          <BaseIcon name="sun" size="20" />
          <div>
            <span class="weather-card__sun-label">Sunrise</span>
            <time class="weather-card__sun-value">{{
              formatSunTime(weather.sys.sunrise)
            }}</time>
          </div>
        </div>

        <div class="weather-card__sun-time">
          <BaseIcon name="sun" size="20" />
          <div>
            <span class="weather-card__sun-label">Sunset</span>
            <time class="weather-card__sun-value">{{
              formatSunTime(weather.sys.sunset)
            }}</time>
          </div>
        </div>
      </div>
    </footer>
  </article>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { BaseIcon } from "@/components/atoms";
import type { CurrentWeatherResponse } from "@/types";

export interface WeatherCardProps {
  weather: CurrentWeatherResponse;
}

const props = defineProps<WeatherCardProps>();

const weatherTime = computed(() => {
  const date = new Date(props.weather.dt * 1000);
  return {
    iso: date.toISOString(),
    formatted: date.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
});

const getWeatherIcon = (condition: string): string => {
  const iconMap: Record<string, string> = {
    "clear sky": "sun",
    "few clouds": "cloud",
    "scattered clouds": "cloud",
    "broken clouds": "cloud",
    "overcast clouds": "cloud",
    "shower rain": "cloud-rain",
    rain: "cloud-rain",
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

const getWindDirection = (degrees: number): string => {
  const directions = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
};

const getHumidityLevel = (humidity: number): string => {
  if (humidity < 30) return "Low";
  if (humidity < 60) return "Moderate";
  if (humidity < 80) return "High";
  return "Very High";
};

const getVisibilityLevel = (visibility: number): string => {
  const km = visibility / 1000;
  if (km < 1) return "Poor";
  if (km < 5) return "Moderate";
  if (km < 10) return "Good";
  return "Excellent";
};

const getPressureLevel = (pressure: number): string => {
  if (pressure < 1000) return "Low";
  if (pressure < 1020) return "Normal";
  return "High";
};

const formatSunTime = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};
</script>

<style lang="scss" scoped>
@use "@/styles/variables" as *;
@use "@/styles/mixins" as *;

.weather-card {
  @include card;
  padding: $spacing-2xl;
  max-width: 500px;
  margin: 0 auto;

  @include mobile {
    padding: $spacing-xl;
    margin: 0 $spacing-lg;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: $spacing-2xl;
    padding-bottom: $spacing-lg;
    border-bottom: 1px solid $border-light;

    @include mobile {
      flex-direction: column;
      gap: $spacing-md;
      align-items: stretch;
    }
  }

  &__location {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    flex: 1;
    min-width: 0;
  }

  &__city {
    @include heading-2;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__country {
    @include body-small;
    color: $text-secondary;
    background: $background-light;
    padding: $spacing-xs $spacing-sm;
    border-radius: $border-radius-sm;
    font-weight: $font-weight-medium;
  }

  &__timestamp {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    @include caption;
    color: $text-light;
    white-space: nowrap;
  }

  &__main {
    margin-bottom: $spacing-2xl;
  }

  &__current {
    display: flex;
    align-items: center;
    gap: $spacing-xl;
    margin-bottom: $spacing-xl;

    @include mobile {
      gap: $spacing-lg;
    }
  }

  &__icon {
    flex-shrink: 0;
  }

  &__weather-icon {
    color: $primary-blue;
  }

  &__temp {
    flex: 1;
  }

  &__temp-value {
    display: block;
    font-size: 4rem;
    font-weight: $font-weight-bold;
    line-height: 1;
    margin-bottom: $spacing-sm;

    @include mobile {
      font-size: 3rem;
    }
  }

  &__condition {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
  }

  &__condition-text {
    @include body-large;
    font-weight: $font-weight-medium;
    text-transform: capitalize;
  }

  &__feels-like {
    @include body-small;
    color: $text-secondary;
  }

  &__range {
    display: flex;
    align-items: center;
    background: $background-light;
    border-radius: $border-radius-lg;
    padding: $spacing-lg;
  }

  &__range-item {
    flex: 1;
    text-align: center;
  }

  &__range-label {
    display: block;
    @include caption;
    color: $text-secondary;
    margin-bottom: $spacing-xs;
  }

  &__range-value {
    @include text-style($font-size-xl, $font-weight-semibold);
  }

  &__range-divider {
    width: 1px;
    height: 30px;
    background: $border-light;
    margin: 0 $spacing-lg;
  }

  &__details {
    margin-bottom: $spacing-2xl;
  }

  &__detail-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: $spacing-xl;

    @include mobile {
      grid-template-columns: 1fr;
      gap: $spacing-lg;
    }
  }

  &__detail {
    text-align: center;
    padding: $spacing-lg;
    background: $background-light;
    border-radius: $border-radius-lg;
  }

  &__detail-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-sm;
    margin-bottom: $spacing-md;
  }

  &__detail-label {
    @include body-small;
    color: $text-secondary;
    font-weight: $font-weight-medium;
  }

  &__detail-value {
    display: block;
    @include text-style($font-size-xl, $font-weight-semibold);
    margin-bottom: $spacing-xs;
  }

  &__detail-sublabel {
    @include caption;
    color: $text-light;
  }

  &__footer {
    padding-top: $spacing-lg;
    border-top: 1px solid $border-light;
  }

  &__sun-times {
    display: flex;
    justify-content: space-around;

    @include mobile {
      justify-content: space-between;
    }
  }

  &__sun-time {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    color: $primary-blue;
  }

  &__sun-label {
    display: block;
    @include caption;
    color: $text-secondary;
  }

  &__sun-value {
    @include body-regular;
    font-weight: $font-weight-medium;
    color: $text-primary;
  }
}
</style>
