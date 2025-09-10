import axios, { AxiosResponse } from "axios";
import type {
  CurrentWeatherResponse,
  ForecastResponse,
  GeolocationCoordinates,
  LocationSearchResult,
} from "@/types";

const API_KEY = "2a2d81f2b5f3a3cd1dc18949565b5e59";
const BASE_URL = "https://api.openweathermap.org/data/2.5";
const GEO_URL = "https://api.openweathermap.org/geo/1.0";

// Weather API instance
const weatherApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  params: {
    appid: API_KEY,
    units: "metric",
  },
});

// Geocoding API instance
const geoApi = axios.create({
  baseURL: GEO_URL,
  timeout: 5000,
  params: {
    appid: API_KEY,
  },
});

// Error handling
weatherApi.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    const message = error.response?.data?.message || "Network error occurred";
    const code = error.response?.status || 500;

    return Promise.reject({
      code,
      message: message.charAt(0).toUpperCase() + message.slice(1),
    });
  },
);

// Geocoding error handling
geoApi.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    const message = error.response?.data?.message || "Location search failed";
    const code = error.response?.status || 500;

    return Promise.reject({
      code,
      message: message.charAt(0).toUpperCase() + message.slice(1),
    });
  },
);

export class WeatherService {
  // Search locations
  static async searchLocations(
    query: string,
    limit = 5,
  ): Promise<LocationSearchResult[]> {
    if (!query.trim() || query.trim().length < 2) {
      return [];
    }

    try {
      const response = await geoApi.get<LocationSearchResult[]>("/direct", {
        params: {
          q: query.trim(),
          limit: Math.min(limit, 10), // API limit is 10
        },
      });

      return response.data.map((location) => ({
        name: location.name,
        lat: location.lat,
        lon: location.lon,
        country: location.country,
        state: location.state,
      }));
    } catch (error) {
      return [];
    }
  }

  // Get current weather
  static async getCurrentWeather(
    city: string,
  ): Promise<CurrentWeatherResponse> {
    try {
      const response = await weatherApi.get<CurrentWeatherResponse>(
        "/weather",
        {
          params: { q: city },
        },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get weather by coordinates
  static async getCurrentWeatherByCoords(
    coords: GeolocationCoordinates,
  ): Promise<CurrentWeatherResponse> {
    try {
      const response = await weatherApi.get<CurrentWeatherResponse>(
        "/weather",
        {
          params: {
            lat: coords.latitude,
            lon: coords.longitude,
          },
        },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get forecast
  static async getForecast(city: string): Promise<ForecastResponse> {
    try {
      const response = await weatherApi.get<ForecastResponse>("/forecast", {
        params: { q: city },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get forecast by coordinates
  static async getForecastByCoords(
    coords: GeolocationCoordinates,
  ): Promise<ForecastResponse> {
    try {
      const response = await weatherApi.get<ForecastResponse>("/forecast", {
        params: {
          lat: coords.latitude,
          lon: coords.longitude,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Simple cache
  private static cache = new Map<string, { data: any; timestamp: number }>();
  private static readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  static async getCachedWeather(
    city: string,
  ): Promise<CurrentWeatherResponse | null> {
    const cached = this.cache.get(`weather-${city}`);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  static setCachedWeather(city: string, data: CurrentWeatherResponse): void {
    this.cache.set(`weather-${city}`, {
      data,
      timestamp: Date.now(),
    });
  }

  // Get weather with cache
  static async getWeatherWithCache(
    city: string,
  ): Promise<CurrentWeatherResponse> {
    const cached = await this.getCachedWeather(city);
    if (cached) {
      return cached;
    }

    try {
      const data = await this.getCurrentWeather(city);
      this.setCachedWeather(city, data);
      return data;
    } catch (error) {
      // If API fails, try to return stale cache
      const staleCache = this.cache.get(`weather-${city}`);
      if (staleCache) {
        return staleCache.data;
      }
      throw error;
    }
  }
}

export default WeatherService;
