import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { UserProfile } from "@/types";

const DEFAULT_PROFILE: UserProfile = {
  fullName: "",
  email: "",
  phoneNumber: "",
  locations: {
    favoriteLocations: [],
    homeLocation: undefined,
  },
};

export const useProfileStore = defineStore("profile", () => {
  // State
  const profile = ref<UserProfile>({ ...DEFAULT_PROFILE });
  const isLoading = ref(false);
  const hasProfile = computed(() => {
    return !!(profile.value.fullName && profile.value.email);
  });

  // Actions
  const loadProfile = () => {
    try {
      const storedProfile = localStorage.getItem("weather-app-profile");
      if (storedProfile) {
        const parsed = JSON.parse(storedProfile);
        profile.value = { ...DEFAULT_PROFILE, ...parsed };
      }
    } catch (error) {
      profile.value = { ...DEFAULT_PROFILE };
    }
  };

  const saveProfile = (newProfile: Partial<UserProfile>) => {
    try {
      profile.value = { ...profile.value, ...newProfile };
      localStorage.setItem(
        "weather-app-profile",
        JSON.stringify(profile.value),
      );
    } catch (error) {
      // Silent fail
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    isLoading.value = true;
    try {
      saveProfile(updates);
    } finally {
      isLoading.value = false;
    }
  };

  const resetProfile = () => {
    profile.value = { ...DEFAULT_PROFILE };
    try {
      localStorage.removeItem("weather-app-profile");
    } catch (error) {
      // Silent fail
    }
  };

  const addFavoriteLocation = (location: string) => {
    if (!profile.value.locations.favoriteLocations.includes(location)) {
      profile.value.locations.favoriteLocations.push(location);
      saveProfile({ locations: profile.value.locations });
    }
  };

  const removeFavoriteLocation = (location: string) => {
    profile.value.locations.favoriteLocations =
      profile.value.locations.favoriteLocations.filter(
        (loc) => loc !== location,
      );
    saveProfile({ locations: profile.value.locations });
  };

  const setHomeLocation = (location: string) => {
    profile.value.locations.homeLocation = location;
    saveProfile({ locations: profile.value.locations });
  };

  // Initialize on store creation
  const initialize = () => {
    loadProfile();
  };

  return {
    // State
    profile,
    isLoading,
    hasProfile,

    // Actions
    loadProfile,
    saveProfile,
    updateProfile,
    resetProfile,
    addFavoriteLocation,
    removeFavoriteLocation,
    setHomeLocation,
    initialize,
  };
});

export type ProfileStore = ReturnType<typeof useProfileStore>;
