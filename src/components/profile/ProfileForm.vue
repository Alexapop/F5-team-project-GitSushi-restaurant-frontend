<script setup>
import { computed, reactive, watch } from 'vue'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  address: '',
  postalCode: '',
  city: '',
})

function resetForm() {
  const user = authStore.user

  Object.keys(form).forEach((field) => {
    form[field] = user?.[field] ?? ''
  })
}

watch(
  () => authStore.user,
  () => resetForm(),
  { immediate: true }
)

const hasChanges = computed(() => {
  const user = authStore.user

  if (!user) return false

  return Object.keys(form).some((field) => {
    return form[field] !== (user[field] ?? '')
  })
})
</script>

<template>
  <section class="profile-form">
    <h2 class="profile-form__title">Datos personales</h2>

    <form class="profile-form__fields" @submit.prevent>
      <div class="profile-form__row">
        <div>
          <label for="firstName">Nombre</label>
          <input
            id="firstName"
            v-model="form.firstName"
            type="text"
            autocomplete="given-name"
          />
        </div>

        <div>
          <label for="lastName">Apellidos</label>
          <input
            id="lastName"
            v-model="form.lastName"
            type="text"
            autocomplete="family-name"
          />
        </div>
      </div>

      <div>
        <label for="email">Correo electrónico</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          autocomplete="email"
        />
      </div>

      <div>
        <label for="address">Dirección</label>
        <input
          id="address"
          v-model="form.address"
          type="text"
          autocomplete="street-address"
        />
      </div>

      <div class="profile-form__row">
        <div>
          <label for="postalCode">Código postal</label>
          <input
            id="postalCode"
            v-model="form.postalCode"
            type="text"
            autocomplete="postal-code"
          />
        </div>

        <div>
          <label for="city">Ciudad</label>
          <input
            id="city"
            v-model="form.city"
            type="text"
            autocomplete="address-level2"
          />
        </div>
      </div>

      <p
        v-if="hasChanges"
        class="profile-form__notice"
        role="status"
      >
        Tienes cambios sin guardar.
      </p>

      <p id="profile-save-help" class="profile-form__notice">
        El guardado de cambios estará disponible próximamente.
      </p>

      <div class="profile-form__actions">
        <button
          v-if="hasChanges"
          type="button"
          class="profile-form__reset"
          @click="resetForm"
        >
          Descartar cambios
        </button>

        <button
          type="submit"
          class="profile-form__submit"
          disabled
          aria-describedby="profile-save-help"
        >
          Guardar cambios
        </button>
      </div>
    </form>
  </section>
</template>

<style scoped>
@reference "../../style.css";

.profile-form {
  @apply flex flex-col gap-6;
}

.profile-form__title {
  @apply text-xl font-heading;
}

.profile-form__fields {
  @apply flex flex-col gap-5;
}

.profile-form__row {
  @apply grid grid-cols-1 gap-5 sm:grid-cols-2;
}

.profile-form label {
  @apply mb-2 block text-sm font-medium;
}

.profile-form input {
  @apply w-full rounded-lg border border-outline
    bg-surface-container px-4 py-3 outline-none
    transition focus:border-primary;
}

.profile-form__notice {
  @apply text-sm text-on-surface;
}

.profile-form__actions {
  @apply flex flex-wrap justify-end gap-3;
}

.profile-form__reset {
  @apply rounded-lg border-2 border-primary
    bg-surface-container px-6 py-3 font-semibold
    text-primary shadow-sm cursor-pointer
    transition hover:bg-primary hover:text-white;
}

.profile-form__submit {
  @apply rounded-lg bg-primary px-6 py-3
    font-semibold text-white transition;
}

.profile-form__submit:disabled {
  @apply cursor-not-allowed opacity-50;
}
</style>