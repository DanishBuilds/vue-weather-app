import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type {
  CurrentWeatherResponse,
  ForecastResponse,
  WeatherError,
  SearchHistoryItem,
  GeolocationCoordinates,
} from "@/types";
import WeatherService from "@/services/weatherApi";

export const useWeatherStore = defineStore("weather", () => {
  // State
  const currentWeather = ref<CurrentWeatherResponse | null>(null);
  const forecast = ref<ForecastResponse | null>(null);
  const isLoading = ref(false);
  const error = ref<WeatherError | null>(null);
  const searchHistory = ref<SearchHistoryItem[]>([]);
  const selectedCity = ref<string>("");
  const userLocation = ref<GeolocationCoordinates | null>(null);
  const deletedLocations = ref<Set<string>>(new Set());

  // Getters
  const hasWeatherData = computed(() => currentWeather.value !== null);
  const hasForecastData = computed(() => forecast.value !== null);
  const isError = computed(() => error.value !== null);
  const recentSearches = computed(() =>
    searchHistory.value.slice(0, 5).sort((a, b) => b.timestamp - a.timestamp),
  );

  // Actions
  const setLoading = (loading: boolean) => {
    isLoading.value = loading;
    if (loading) {
      error.value = null;
    }
  };

  const setError = (weatherError: WeatherError | null) => {
    error.value = weatherError;
  };

  const clearError = () => {
    error.value = null;
  };

  // Load search history from localStorage
  const loadSearchHistory = () => {
    try {
      const stored = localStorage.getItem("weather-search-history");
      if (stored) {
        searchHistory.value = JSON.parse(stored);
      }
    } catch (err) {
      searchHistory.value = [];
    }
  };

  // Save search history to localStorage
  const saveSearchHistory = () => {
    try {
      localStorage.setItem(
        "weather-search-history",
        JSON.stringify(searchHistory.value),
      );
    } catch (err) {
      // Silent fail for localStorage
    }
  };

  // Load deleted locations from localStorage
  const loadDeletedLocations = () => {
    try {
      const stored = localStorage.getItem("weather-deleted-locations");
      if (stored) {
        const parsedSet = JSON.parse(stored);
        deletedLocations.value = new Set(parsedSet);
      }
    } catch (err) {
      deletedLocations.value = new Set();
    }
  };

  // Save deleted locations to localStorage
  const saveDeletedLocations = () => {
    try {
      localStorage.setItem(
        "weather-deleted-locations",
        JSON.stringify(Array.from(deletedLocations.value)),
      );
    } catch (err) {
      // Silent fail for localStorage
    }
  };

  // Add search to history
  const addToSearchHistory = (
    city: string,
    weather?: CurrentWeatherResponse,
  ) => {
    // Check if this location was previously deleted by the user
    const cityLower = city.toLowerCase();
    if (deletedLocations.value.has(cityLower)) {
      return; // Don't add deleted locations back to history
    }

    const existingIndex = searchHistory.value.findIndex(
      (item) => item.city.toLowerCase() === cityLower,
    );

    const historyItem: SearchHistoryItem = {
      city,
      timestamp: Date.now(),
      weather,
    };

    if (existingIndex >= 0) {
      // Update existing entry
      searchHistory.value[existingIndex] = historyItem;
    } else {
      // Add new entry
      searchHistory.value.unshift(historyItem);
      // Keep only last 10 searches
      if (searchHistory.value.length > 10) {
        searchHistory.value = searchHistory.value.slice(0, 10);
      }
    }

    saveSearchHistory();
  };

  // Remove from search history
  const removeFromSearchHistory = (city: string) => {
    const cityLower = city.toLowerCase();

    // Add to deleted locations list to prevent future re-addition
    deletedLocations.value.add(cityLower);
    saveDeletedLocations();

    // Remove from search history
    const originalLength = searchHistory.value.length;
    searchHistory.value = searchHistory.value.filter(
      (item) => item.city.toLowerCase() !== cityLower,
    );

    const removedCount = originalLength - searchHistory.value.length;

    // Save to localStorage immediately
    saveSearchHistory();

    // Clear current weather if it matches the deleted city
    if (
      currentWeather.value &&
      currentWeather.value.name.toLowerCase() === cityLower
    ) {
      currentWeather.value = null;
      forecast.value = null;
      selectedCity.value = "";
    }
  };

  // Clear search history
  const clearSearchHistory = () => {
    searchHistory.value = [];
    saveSearchHistory();
  };

  // Allow a location to be re-added (remove from deleted list)
  const allowLocationReaddition = (city: string) => {
    const cityLower = city.toLowerCase();
    deletedLocations.value.delete(cityLower);
    saveDeletedLocations();
  };

  // Fetch current weather by city
  const fetchCurrentWeather = async (city: string) => {
    if (!city.trim()) {
      setError({ code: 400, message: "City name is required" });
      return;
    }

    setLoading(true);

    try {
      const data = await WeatherService.getWeatherWithCache(city.trim());
      currentWeather.value = data;
      selectedCity.value = city.trim();
      addToSearchHistory(city.trim(), data);
      clearError();
    } catch (err) {
      const weatherError = err as WeatherError;
      setError(weatherError);
      currentWeather.value = null;
    } finally {
      setLoading(false);
    }
  };

  // Fetch current weather by coordinates
  const fetchCurrentWeatherByCoords = async (
    coords: GeolocationCoordinates,
  ) => {
    setLoading(true);

    try {
      const data = await WeatherService.getCurrentWeatherByCoords(coords);
      currentWeather.value = data;
      selectedCity.value = data.name;
      userLocation.value = coords;
      addToSearchHistory(data.name, data);
      clearError();
    } catch (err) {
      const weatherError = err as WeatherError;
      setError(weatherError);
      currentWeather.value = null;
    } finally {
      setLoading(false);
    }
  };

  // Fetch forecast by city
  const fetchForecast = async (city: string) => {
    if (!city.trim()) {
      setError({ code: 400, message: "City name is required" });
      return;
    }

    setLoading(true);

    try {
      const data = await WeatherService.getForecast(city.trim());
      forecast.value = data;
      clearError();
    } catch (err) {
      const weatherError = err as WeatherError;
      setError(weatherError);
      forecast.value = null;
    } finally {
      setLoading(false);
    }
  };

  // Fetch forecast by coordinates
  const fetchForecastByCoords = async (coords: GeolocationCoordinates) => {
    setLoading(true);

    try {
      const data = await WeatherService.getForecastByCoords(coords);
      forecast.value = data;
      clearError();
    } catch (err) {
      const weatherError = err as WeatherError;
      setError(weatherError);
      forecast.value = null;
    } finally {
      setLoading(false);
    }
  };

  // Fetch both current weather and forecast
  const fetchWeatherData = async (city: string) => {
    // If user is manually searching for a previously deleted location, allow it
    const cityLower = city.toLowerCase();
    if (deletedLocations.value.has(cityLower)) {
      allowLocationReaddition(city);
    }

    setLoading(true);

    try {
      const [weatherData, forecastData] = await Promise.all([
        WeatherService.getWeatherWithCache(city.trim()),
        WeatherService.getForecast(city.trim()),
      ]);

      currentWeather.value = weatherData;
      selectedCity.value = city.trim();
      forecast.value = forecastData;
      addToSearchHistory(city.trim(), weatherData);
      clearError();
    } catch (err) {
      const weatherError = err as WeatherError;
      setError(weatherError);
    } finally {
      setLoading(false);
    }
  };

  // Fetch both current weather and forecast by coordinates
  const fetchWeatherDataByCoords = async (coords: GeolocationCoordinates) => {
    setLoading(true);

    try {
      const [weatherData, forecastData] = await Promise.all([
        WeatherService.getCurrentWeatherByCoords(coords),
        WeatherService.getForecastByCoords(coords),
      ]);

      currentWeather.value = weatherData;
      selectedCity.value = weatherData.name;
      userLocation.value = coords;
      forecast.value = forecastData;
      addToSearchHistory(weatherData.name, weatherData);
      clearError();
    } catch (err) {
      const weatherError = err as WeatherError;
      setError(weatherError);
    } finally {
      setLoading(false);
    }
  };

  // Get user location using Geolocation API
  const getUserLocation = async (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setError({
          code: 400,
          message: "Geolocation is not supported by this browser",
        });
        resolve(false);
        return;
      }

      setLoading(true);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords: GeolocationCoordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };

          // fetchWeatherDataByCoords will manage loading state and add to history (if not deleted)
          setLoading(false);
          await fetchWeatherDataByCoords(coords);
          resolve(true);
        },
        (err) => {
          let message = "Failed to get location";

          switch (err.code) {
            case err.PERMISSION_DENIED:
              message = "Location access denied by user";
              break;
            case err.POSITION_UNAVAILABLE:
              message = "Location information unavailable";
              break;
            case err.TIMEOUT:
              message = "Location request timed out";
              break;
          }

          setError({ code: err.code, message });
          setLoading(false);
          resolve(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        },
      );
    });
  };

  // Reset store
  const resetStore = () => {
    currentWeather.value = null;
    forecast.value = null;
    isLoading.value = false;
    error.value = null;
    selectedCity.value = "";
    userLocation.value = null;
  };

  // Initialize store
  const initialize = async () => {
    loadSearchHistory();
    loadDeletedLocations();

    const hasLocation = await getUserLocation();

    if (!hasLocation && searchHistory.value.length > 0) {
      const mostRecent = searchHistory.value[0];
      await fetchWeatherData(mostRecent.city);
    }
  };

  return {
    // State
    currentWeather,
    forecast,
    isLoading,
    error,
    searchHistory,
    selectedCity,
    userLocation,

    // Getters
    hasWeatherData,
    hasForecastData,
    isError,
    recentSearches,

    // Actions
    setLoading,
    setError,
    clearError,
    loadSearchHistory,
    saveSearchHistory,
    loadDeletedLocations,
    saveDeletedLocations,
    addToSearchHistory,
    removeFromSearchHistory,
    allowLocationReaddition,
    clearSearchHistory,
    fetchCurrentWeather,
    fetchCurrentWeatherByCoords,
    fetchForecast,
    fetchForecastByCoords,
    fetchWeatherData,
    fetchWeatherDataByCoords,
    getUserLocation,
    resetStore,
    initialize,
  };
});

export type WeatherStore = ReturnType<typeof useWeatherStore>;
