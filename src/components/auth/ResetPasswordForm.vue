<script setup>
import { ref } from 'vue'

const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const isLoading = ref(false)

const handleSubmit = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Las contraseñas no coinciden.'
    return
  }

  isLoading.value = true

  try {
    // Pendiente de conectar con POST /auth/restablecer
    // cuando esté implementado en backend.
    successMessage.value =
      'Tu contraseña se ha restablecido correctamente.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <form
    class="mt-8 space-y-5"
    @submit.prevent="handleSubmit"
  >
    <div>
      <label
        for="new-password"
        class="mb-2 block text-sm font-medium"
      >
        Nueva contraseña
      </label>

      <input
        id="new-password"
        v-model="password"
        type="password"
        autocomplete="new-password"
        required
        class="w-full rounded-lg border border-outline bg-surface-container px-4 py-3 outline-none transition focus:border-primary"
        placeholder="••••••••"
      />
    </div>

    <div>
      <label
        for="confirm-password"
        class="mb-2 block text-sm font-medium"
      >
        Repite la contraseña
      </label>

      <input
        id="confirm-password"
        v-model="confirmPassword"
        type="password"
        autocomplete="new-password"
        required
        class="w-full rounded-lg border border-outline bg-surface-container px-4 py-3 outline-none transition focus:border-primary"
        placeholder="••••••••"
      />
    </div>

    <p
      v-if="errorMessage"
      role="alert"
      class="text-sm text-error"
    >
      {{ errorMessage }}
    </p>

    <p
      v-if="successMessage"
      role="status"
      class="text-sm text-primary"
    >
      {{ successMessage }}
    </p>

    <button
      type="submit"
      :disabled="isLoading"
      class="w-full rounded-lg bg-primary-container px-4 py-3 font-semibold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {{ isLoading ? 'Guardando...' : 'Restablecer contraseña' }}
    </button>

    <p class="text-center text-sm">
      <RouterLink
        to="/login"
        class="font-semibold text-primary hover:underline"
      >
        Volver a iniciar sesión
      </RouterLink>
    </p>
  </form>
</template>