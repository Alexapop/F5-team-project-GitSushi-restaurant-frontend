<script setup>
import { ref } from 'vue'

const email = ref('')
const isLoading = ref(false)
const confirmationMessage = ref('')

const handleSubmit = async () => {
  confirmationMessage.value = ''
  isLoading.value = true

  try {
    // Pendiente de conectar con el backend.
    confirmationMessage.value =
      'Si existe una cuenta asociada a este correo, recibirás un enlace para restablecer tu contraseña.'
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
        for="recovery-email"
        class="mb-2 block text-sm font-medium"
      >
        Correo electrónico
      </label>

      <input
        id="recovery-email"
        v-model="email"
        type="email"
        autocomplete="email"
        required
        placeholder="correo@ejemplo.com"
        class="w-full rounded-lg border border-outline bg-surface-container px-4 py-3 outline-none transition focus:border-primary"
      />
    </div>

    <p
      v-if="confirmationMessage"
      role="status"
      class="text-sm text-primary"
    >
      {{ confirmationMessage }}
    </p>

    <button
      type="submit"
      :disabled="isLoading"
      class="w-full rounded-lg bg-primary-container px-4 py-3 font-semibold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {{ isLoading ? 'Enviando...' : 'Enviar enlace de recuperación' }}
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