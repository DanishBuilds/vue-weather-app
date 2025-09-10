<template>
  <component
    :is="tag"
    :class="buttonClasses"
    :disabled="disabled || isLoading"
    :type="tag === 'button' ? type : undefined"
    :href="tag === 'a' ? href : undefined"
    :to="tag === 'router-link' ? to : undefined"
    @click="handleClick"
  >
    <LoaderSpinner
      v-if="isLoading"
      :size="iconSize"
      class="base-button__loader"
    />
    <BaseIcon
      v-else-if="icon"
      :name="icon"
      :size="iconSize"
      class="base-button__icon"
    />
    <span v-if="slots.default" class="base-button__text">
      <slot />
    </span>
  </component>
</template>

<script setup lang="ts">
import { computed, useSlots } from "vue";
import BaseIcon from "./BaseIcon.vue";
import LoaderSpinner from "./LoaderSpinner.vue";

export interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  isLoading?: boolean;
  icon?: string;
  tag?: "button" | "a" | "router-link";
  type?: "button" | "submit" | "reset";
  href?: string;
  to?: string | object;
  fullWidth?: boolean;
}

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: "primary",
  size: "md",
  disabled: false,
  isLoading: false,
  tag: "button",
  type: "button",
  fullWidth: false,
});

const emit = defineEmits<{
  click: [event: Event];
}>();

const slots = useSlots();

const buttonClasses = computed(() => [
  "base-button",
  `base-button--${props.variant}`,
  `base-button--${props.size}`,
  {
    "base-button--disabled": props.disabled,
    "base-button--loading": props.isLoading,
    "base-button--full-width": props.fullWidth,
    "base-button--icon-only": props.icon && !slots.default,
  },
]);

const iconSize = computed(() => {
  const sizeMap = {
    sm: "16",
    md: "20",
    lg: "24",
  };
  return sizeMap[props.size];
});

const handleClick = (event: Event) => {
  if (!props.disabled && !props.isLoading) {
    emit("click", event);
  }
};
</script>

<style lang="scss" scoped>
@use "sass:color";
@use "@/styles/variables" as *;
@use "@/styles/mixins" as *;

.base-button {
  @include button-base;
  gap: $spacing-sm;
  position: relative;

  &--primary {
    @include button-primary;
  }

  &--secondary {
    @include button-secondary;
  }

  &--ghost {
    background-color: transparent;
    color: $primary-blue;
    border: none;

    &:hover:not(.base-button--disabled) {
      background-color: $primary-blue-light;
    }
  }

  &--danger {
    background-color: $error-red;
    color: $white;

    &:hover:not(.base-button--disabled) {
      background-color: color.adjust($error-red, $lightness: -10%);
    }
  }

  &--sm {
    padding: $spacing-sm $spacing-md;
    font-size: $font-size-sm;
    min-height: 32px;
  }

  &--md {
    padding: $spacing-md $spacing-lg;
    font-size: $font-size-base;
    min-height: 40px;
  }

  &--lg {
    padding: $spacing-lg $spacing-xl;
    font-size: $font-size-lg;
    min-height: 48px;
  }

  &--full-width {
    width: 100%;
  }

  &--icon-only {
    aspect-ratio: 1;
    padding: $spacing-md;

    &.base-button--sm {
      padding: $spacing-sm;
    }

    &.base-button--lg {
      padding: $spacing-lg;
    }
  }

  &--loading {
    color: transparent;
  }

  &__loader {
    position: absolute;
    inset: 0;
    @include flex-center;
  }

  &__icon {
    flex-shrink: 0;
  }

  &__text {
    flex: 1;
  }
}
</style>
