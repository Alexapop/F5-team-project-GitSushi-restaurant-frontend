<script setup>
import { ref } from 'vue'

const email = ref('')
const password = ref('')

const handleSubmit = () => {

}

</script>

<template>
<form
  class="mt-8 space-y-5"
  @submit.prevent="handleSubmit"
>
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
        autocomplete="current-password"
        required
        class="w-full rounded-lg border border-outline bg-surface-container px-4 py-3 outline-none transition focus:border-primary"
        placeholder="••••••••"
      />
    </div>

<button
  type="submit"
  class="w-full rounded-lg bg-primary-container px-4 py-3 font-semibold transition hover:opacity-90"
>
  Iniciar sesión
</button>

    <p class="text-center text-sm">
      ¿No tienes cuenta?

      <RouterLink
        to="/register"
        class="font-semibold text-primary"
      >
        Regístrate
      </RouterLink>
    </p>
  </form>
</template>