<script setup>
defineProps({
  field: {
    type: Object,
    required: true,
  },
  modelValue: {
    type: String,
    default: '',
  },
  error: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue', 'blur'])
</script>

<template>
  <div
    class="profile-field"
    :class="{ 'profile-field--full': field.fullWidth }"
  >
    <label :for="field.name">{{ field.label }}</label>

    <input
      :id="field.name"
      :name="field.name"
      :value="modelValue"
      :type="field.type"
      :autocomplete="field.autocomplete"
      required
      :aria-invalid="Boolean(error)"
      :aria-describedby="error ? `${field.name}-error` : undefined"
      @input="emit('update:modelValue', $event.target.value)"
      @blur="emit('blur')"
    />

    <p
      v-if="error"
      :id="`${field.name}-error`"
      class="profile-form__error"
    >
      {{ error }}
    </p>
  </div>
</template>

<style scoped>
@reference "../../style.css";

.profile-field--full {
  @apply sm:col-span-2;
}

.profile-field label {
  @apply mb-2 block text-sm font-medium;
}

.profile-field input {
  @apply w-full rounded-lg border border-outline
    bg-surface-container px-4 py-3 outline-none
    transition focus:border-primary;
}

.profile-field input[aria-invalid="true"] {
  @apply border-error;
}

.profile-form__error {
  @apply mt-1 text-sm text-error;
}
</style>