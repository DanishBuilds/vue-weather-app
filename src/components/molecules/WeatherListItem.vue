<template>
  <article class="weather-list-item">
    <button
      v-if="interactive"
      :class="itemClasses"
      type="button"
      @click="handleClick"
    >
      <div class="weather-content">
        <div class="weather-content__main">
          <div class="weather-content__icon">
            <BaseIcon
              :name="getWeatherIcon(weatherData.condition.description)"
              :size="compact ? '32' : '48'"
            />
          </div>

          <div class="weather-content__info">
            <h3 class="weather-content__location">
              {{ weatherData.location }}
            </h3>
            <p class="weather-content__condition">
              {{ weatherData.condition.description }}
            </p>
          </div>

          <div class="weather-content__temperature">
            <span class="weather-content__temp-main"
              >{{ weatherData.temperature }}°</span
            >
            <span v-if="!compact" class="weather-content__temp-feels">
              Feels like {{ weatherData.feelsLike }}°
            </span>
          </div>
        </div>

        <div v-if="showDetails && !compact" class="weather-content__details">
          <div class="weather-content__detail">
            <BaseIcon name="droplets" size="16" />
            <span>{{ weatherData.humidity }}%</span>
          </div>

          <div class="weather-content__detail">
            <BaseIcon name="wind" size="16" />
            <span>{{ Math.round(weatherData.windSpeed) }} m/s</span>
          </div>

          <div class="weather-content__detail">
            <BaseIcon name="thermometer" size="16" />
            <span>{{ weatherData.pressure }} hPa</span>
          </div>
        </div>
      </div>
    </button>

    <div v-else :class="itemClasses">
      <div class="weather-content">
        <div class="weather-content__main">
          <div class="weather-content__icon">
            <BaseIcon
              :name="getWeatherIcon(weatherData.condition.description)"
              :size="compact ? '32' : '48'"
            />
          </div>

          <div class="weather-content__info">
            <h3 class="weather-content__location">
              {{ weatherData.location }}
            </h3>
            <p class="weather-content__condition">
              {{ weatherData.condition.description }}
            </p>
          </div>

          <div class="weather-content__temperature">
            <span class="weather-content__temp-main"
              >{{ weatherData.temperature }}°</span
            >
            <span v-if="!compact" class="weather-content__temp-feels">
              Feels like {{ weatherData.feelsLike }}°
            </span>
          </div>
        </div>

        <div v-if="showDetails && !compact" class="weather-content__details">
          <div class="weather-content__detail">
            <BaseIcon name="droplets" size="16" />
            <span>{{ weatherData.humidity }}%</span>
          </div>

          <div class="weather-content__detail">
            <BaseIcon name="wind" size="16" />
            <span>{{ Math.round(weatherData.windSpeed) }} m/s</span>
          </div>

          <div class="weather-content__detail">
            <BaseIcon name="thermometer" size="16" />
            <span>{{ weatherData.pressure }} hPa</span>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { BaseIcon } from "@/components/atoms";
import type { CurrentWeatherResponse, ForecastItem } from "@/types";

export interface WeatherListItemProps {
  weather: CurrentWeatherResponse | ForecastItem;
  interactive?: boolean;
  selected?: boolean;
  showDetails?: boolean;
  compact?: boolean;
}

const props = withDefaults(defineProps<WeatherListItemProps>(), {
  interactive: true,
  selected: false,
  showDetails: true,
  compact: false,
});

const emit = defineEmits<{
  click: [weather: CurrentWeatherResponse | ForecastItem];
}>();

const itemClasses = computed(() => [
  "weather-list-item__content",
  {
    "weather-list-item__content--interactive": props.interactive,
    "weather-list-item__content--selected": props.selected,
    "weather-list-item__content--compact": props.compact,
  },
]);

const weatherData = computed(() => {
  const data = props.weather;

  // Check if it's a CurrentWeatherResponse or ForecastItem
  const isCurrentWeather = "name" in data;

  return {
    temperature: Math.round(data.main.temp),
    condition: data.weather[0],
    humidity: data.main.humidity,
    windSpeed: data.wind.speed,
    pressure: data.main.pressure,
    feelsLike: Math.round(data.main.feels_like),
    location: isCurrentWeather
      ? data.name
      : formatForecastTime(data as ForecastItem),
    isCurrentWeather,
  };
});

const formatForecastTime = (forecast: ForecastItem): string => {
  const date = new Date(forecast.dt * 1000);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
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

const handleClick = () => {
  if (props.interactive) {
    emit("click", props.weather);
  }
};
</script>

<style lang="scss" scoped>
@use "@/styles/variables" as *;
@use "@/styles/mixins" as *;

.weather-list-item {
  &__content {
    @include card;
    padding: $spacing-lg;
    width: 100%;
    text-align: left;
    transition: all 0.2s ease-in-out;

    &--interactive {
      cursor: pointer;
      border: 1px solid transparent;

      &:hover {
        @include card-hover;
        border-color: $primary-blue;
      }

      &:focus-visible {
        outline: 2px solid $primary-blue;
        outline-offset: 2px;
      }
    }

    &--selected {
      border-color: $primary-blue;
      background-color: $primary-blue-light;
    }

    &--compact {
      padding: $spacing-md;
    }
  }
}

.weather-content {
  &__main {
    display: flex;
    align-items: center;
    gap: $spacing-lg;
    margin-bottom: $spacing-md;
  }

  &__icon {
    flex-shrink: 0;
    color: $primary-blue;
  }

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__location {
    @include heading-3;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__condition {
    @include body-small;
    color: $text-secondary;
    margin: $spacing-xs 0 0;
    text-transform: capitalize;
  }

  &__temperature {
    text-align: right;
    flex-shrink: 0;
  }

  &__temp-main {
    @include text-style($font-size-3xl, $font-weight-bold, $line-height-tight);
    display: block;
  }

  &__temp-feels {
    @include caption;
    color: $text-light;
  }

  &__details {
    display: flex;
    gap: $spacing-xl;
    padding-top: $spacing-md;
    border-top: 1px solid $border-light;

    @include mobile {
      gap: $spacing-lg;
      flex-wrap: wrap;
    }
  }

  &__detail {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    @include caption;
    color: $text-secondary;

    svg {
      color: $text-light;
    }
  }
}

.weather-content--compact {
  .weather-content__main {
    margin-bottom: 0;
  }

  .weather-content__location {
    @include body-regular;
    font-weight: $font-weight-medium;
  }

  .weather-content__temp-main {
    @include text-style($font-size-xl, $font-weight-semibold);
  }
}
</style>
