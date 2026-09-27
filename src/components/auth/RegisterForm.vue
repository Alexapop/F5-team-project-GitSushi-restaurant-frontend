<script setup>
import { ref } from 'vue'

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

const handleSubmit = () => {
  // La conexión con el backend se añadirá después
}
</script>

<template>
  <form
    class="mt-8 space-y-5"
    @submit.prevent="handleSubmit"
  >
    <div>
      <label
        for="name"
        class="mb-2 block text-sm font-medium"
      >
        Nombre
      </label>

      <input
        id="name"
        v-model="name"
        type="text"
        autocomplete="name"
        required
        class="w-full rounded-lg border border-outline bg-surface-container px-4 py-3 outline-none transition focus:border-primary"
        placeholder="Tu nombre"
      />
    </div>

    <div>
      <label
        for="email"
        class="mb-2 block text-sm font-medium"
      >
        Correo electrónico
      </label>

      <input
        id="email"
        v-model="email"
        type="email"
        autocomplete="email"
        required
        class="w-full rounded-lg border border-outline bg-surface-container px-4 py-3 outline-none transition focus:border-primary"
        placeholder="correo@ejemplo.com"
      />
    </div>

    <div>
      <label
        for="password"
        class="mb-2 block text-sm font-medium"
      >
        Contraseña
      </label>

      <input
        id="password"
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
        Confirmar contraseña
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

    <button
      type="submit"
      class="w-full rounded-lg bg-primary-container px-4 py-3 font-semibold transition hover:opacity-90"
    >
      Crear cuenta
    </button>

    <p class="text-center text-sm">
      ¿Ya tienes una cuenta?

      <RouterLink
        to="/login"
        class="font-semibold text-primary"
      >
        Inicia sesión
      </RouterLink>
    </p>
  </form>
</template>