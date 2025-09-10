<template>
  <div class="profile-page">
    <!-- Header -->
    <header class="profile-page__header">
      <BaseButton
        variant="ghost"
        size="sm"
        icon="chevron-left"
        aria-label="Go back"
        class="profile-page__back-btn"
        @click="goBack"
      />
      <h1 class="profile-page__title">
        {{ isEditing ? "Edit Profile" : "Profile" }}
      </h1>
      <div class="profile-page__spacer"></div>
    </header>

    <div class="profile-page__content">
      <!-- User Info Section -->
      <div
        v-if="!isEditing && profileStore.hasProfile"
        class="profile-page__user-info"
      >
        <h2 class="profile-page__user-name">
          {{ profileStore.profile.fullName }}
        </h2>
        <p class="profile-page__user-contact">
          {{ profileStore.profile.email }}
        </p>
        <p
          v-if="profileStore.profile.phoneNumber"
          class="profile-page__user-contact"
        >
          {{ profileStore.profile.phoneNumber }}
        </p>
      </div>

      <!-- Form Section -->
      <form
        v-if="isEditing"
        class="profile-page__form"
        @submit.prevent="handleSubmit"
      >
        <div class="profile-page__field">
          <label class="profile-page__label" for="fullName">Full Name</label>
          <BaseInput
            id="fullName"
            v-model="formData.fullName"
            type="text"
            placeholder="Enter your full name"
            required
            class="profile-page__input"
          />
        </div>

        <div class="profile-page__field">
          <label class="profile-page__label" for="email">Email</label>
          <BaseInput
            id="email"
            v-model="formData.email"
            type="email"
            placeholder="Enter your email address"
            required
            class="profile-page__input"
          />
        </div>

        <div class="profile-page__field">
          <label class="profile-page__label" for="phoneNumber"
            >Phone Number</label
          >
          <BaseInput
            id="phoneNumber"
            v-model="formData.phoneNumber"
            type="tel"
            placeholder="Enter your phone number"
            class="profile-page__input"
          />
        </div>


        <!-- Form Actions -->
        <div class="profile-page__actions">
          <BaseButton
            type="button"
            variant="secondary"
            :disabled="profileStore.isLoading"
            @click="handleCancel"
          >
            Cancel
          </BaseButton>
          <BaseButton
            type="submit"
            variant="primary"
            :is-loading="profileStore.isLoading"
            :disabled="!isFormValid"
          >
            {{ profileStore.hasProfile ? "Update" : "Save" }}
          </BaseButton>
        </div>
      </form>

      <!-- View Mode Actions -->
      <div v-else class="profile-page__view-actions">
        <BaseButton
          variant="primary"
          class="profile-page__edit-btn"
          @click="startEditing"
        >
          {{ profileStore.hasProfile ? "Edit Profile" : "Create Profile" }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { BaseButton, BaseIcon, BaseInput } from "@/components/atoms";
import { useProfileStore } from "@/stores/profile";
import type { UserProfile } from "@/types";

const router = useRouter();
const profileStore = useProfileStore();

const isEditing = ref(false);
const formData = reactive({
  fullName: "",
  email: "",
  phoneNumber: "",
});

const isFormValid = computed(() => {
  return formData.fullName.trim() && formData.email.trim();
});

const startEditing = () => {
  // Copy current profile data to form
  Object.assign(formData, profileStore.profile);
  isEditing.value = true;
};

const handleCancel = () => {
  // Reset form data
  Object.assign(formData, profileStore.profile);
  isEditing.value = false;
};

const handleSubmit = async () => {
  if (!isFormValid.value) return;

  try {
    await profileStore.updateProfile(formData);
    isEditing.value = false;
  } catch (error) {
    // Handle error silently
  }
};


const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1);
  } else {
    router.push("/");
  }
};

onMounted(() => {
  profileStore.initialize();

  // If no profile exists, start in editing mode
  if (!profileStore.hasProfile) {
    startEditing();
  }
});
</script>

<style lang="scss" scoped>
@use "@/styles/variables" as *;
@use "@/styles/mixins" as *;

.profile-page {
  min-height: 100vh;
  background: #f6f6f8;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-lg;
    background: white;
    border-bottom: 1px solid $border-light;
  }

  &__back-btn {
    color: $primary-blue;
  }

  &__title {
    @include text-style($font-size-xl, $font-weight-semibold);
    color: $text-primary;
    margin: 0;
  }

  &__spacer {
    width: 40px; // Same as back button to center title
  }

  &__content {
    padding: $spacing-xl $spacing-lg;
    max-width: 500px;
    margin: 0 auto;
  }


  &__user-info {
    text-align: center;
  }

  &__user-name {
    @include text-style($font-size-2xl, $font-weight-semibold);
    color: $text-primary;
    margin: 0 0 $spacing-sm;
  }

  &__user-contact {
    @include body-regular;
    color: $text-secondary;
    margin: $spacing-xs 0;
  }

  &__form {
    background: white;
    border-radius: $border-radius-xl;
    padding: $spacing-xl;
    box-shadow: $shadow-sm;
  }

  &__field {
    margin-bottom: $spacing-lg;
  }

  &__label {
    display: block;
    @include body-small;
    font-weight: $font-weight-medium;
    color: $text-secondary;
    margin-bottom: $spacing-sm;
  }

  &__input {
    width: 100%;
  }


  &__actions {
    display: flex;
    gap: $spacing-md;
    margin-top: $spacing-2xl;

    @include mobile {
      flex-direction: column;
    }
  }

  &__view-actions {
    text-align: center;
    margin-top: $spacing-2xl;
  }

  &__edit-btn {
    min-width: 200px;
  }
}


// Mobile responsive
@include mobile {
  .profile-page {
    &__content {
      padding: $spacing-lg $spacing-md;
    }
  }
}
</style>
