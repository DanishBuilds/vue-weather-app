<template>
  <div class="base-input">
    <label
      v-if="label"
      :for="inputId"
      class="base-input__label"
      :class="{ 'base-input__label--required': required }"
    >
      {{ label }}
    </label>

    <div class="base-input__wrapper">
      <BaseIcon
        v-if="icon"
        :name="icon"
        size="20"
        class="base-input__icon base-input__icon--left"
      />

      <input
        :id="inputId"
        ref="inputRef"
        v-model="modelValue"
        :class="inputClasses"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :aria-invalid="isInvalid"
        :aria-describedby="errorId"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
        @keydown.enter="handleEnter"
      />

      <BaseButton
        v-if="clearable && modelValue"
        variant="ghost"
        size="sm"
        icon="x"
        class="base-input__clear"
        @click="clearInput"
      />
    </div>

    <div
      v-if="error || hint"
      :id="errorId"
      class="base-input__message"
      :class="{
        'base-input__message--error': isInvalid,
        'base-input__message--hint': !isInvalid,
      }"
    >
      {{ error || hint }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useId } from "vue";
import BaseIcon from "./BaseIcon.vue";
import BaseButton from "./BaseButton.vue";

export interface InputProps {
  modelValue?: string;
  label?: string;
  placeholder?: string;
  hint?: string;
  error?: string;
  type?: "text" | "email" | "password" | "search" | "tel" | "url";
  icon?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  clearable?: boolean;
}

const props = withDefaults(defineProps<InputProps>(), {
  modelValue: "",
  type: "text",
  disabled: false,
  readonly: false,
  required: false,
  clearable: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
  input: [event: Event];
  blur: [event: FocusEvent];
  focus: [event: FocusEvent];
  enter: [event: KeyboardEvent];
  clear: [];
}>();

const inputRef = ref<HTMLInputElement>();
const inputId = useId();
const errorId = computed(() => `${inputId}-error`);

const modelValue = computed({
  get: () => props.modelValue,
  set: (value: string) => emit("update:modelValue", value),
});

const isInvalid = computed(() => Boolean(props.error));

const inputClasses = computed(() => [
  "base-input__field",
  {
    "base-input__field--with-icon": props.icon,
    "base-input__field--clearable": props.clearable && props.modelValue,
    "base-input__field--error": isInvalid.value,
    "base-input__field--disabled": props.disabled,
  },
]);

const handleInput = (event: Event) => {
  emit("input", event);
};

const handleBlur = (event: FocusEvent) => {
  emit("blur", event);
};

const handleFocus = (event: FocusEvent) => {
  emit("focus", event);
};

const handleEnter = (event: KeyboardEvent) => {
  emit("enter", event);
};

const clearInput = () => {
  modelValue.value = "";
  emit("clear");
  inputRef.value?.focus();
};

const focus = () => {
  inputRef.value?.focus();
};

const blur = () => {
  inputRef.value?.blur();
};

defineExpose({
  focus,
  blur,
  inputRef,
});
</script>

<style lang="scss" scoped>
@use "@/styles/variables" as *;
@use "@/styles/mixins" as *;

.base-input {
  width: 100%;

  &__label {
    display: block;
    @include body-small;
    font-weight: $font-weight-medium;
    margin-bottom: $spacing-sm;

    &--required::after {
      content: " *";
      color: $error-red;
    }
  }

  &__wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  &__field {
    @include input-base;

    &--with-icon {
      padding-left: calc(#{$spacing-lg} + 20px + #{$spacing-sm});
    }

    &--clearable {
      padding-right: calc(#{$spacing-lg} + 32px);
    }

    &--error {
      border-color: $error-red;

      &:focus {
        border-color: $error-red;
        box-shadow: 0 0 0 3px rgba($error-red, 0.1);
      }
    }

    &--disabled {
      background-color: $background-light;
      color: $text-light;
      cursor: not-allowed;
    }
  }

  &__icon {
    position: absolute;
    color: $text-light;
    pointer-events: none;

    &--left {
      left: $spacing-lg;
    }
  }

  &__clear {
    position: absolute;
    right: $spacing-sm;
    color: $text-light;

    &:hover {
      color: $text-secondary;
    }
  }

  &__message {
    margin-top: $spacing-sm;
    @include caption;

    &--error {
      color: $error-red;
    }

    &--hint {
      color: $text-light;
    }
  }
}
</style>
