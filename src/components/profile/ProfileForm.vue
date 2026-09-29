<script setup>
import { reactive, watch } from 'vue'
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

watch(
  () => authStore.user,
  (user) => {
    if (!user) return

    form.firstName = user.firstName ?? ''
    form.lastName = user.lastName ?? ''
    form.email = user.email ?? ''
    form.address = user.address ?? ''
    form.postalCode = user.postalCode ?? ''
    form.city = user.city ?? ''
  },
  { immediate: true }
)
</script>

<template>
  <section class="profile-form">
    <h2 class="profile-form__title">
      Datos personales
    </h2>

    <form class="profile-form__fields">
      <div class="profile-form__row">
        <div>
          <label for="firstName">Nombre</label>
          <input
            id="firstName"
            v-model="form.firstName"
            type="text"
          />
        </div>

        <div>
          <label for="lastName">Apellidos</label>
          <input
            id="lastName"
            v-model="form.lastName"
            type="text"
          />
        </div>
      </div>

      <div>
        <label for="email">Correo electrónico</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
        />
      </div>

      <div>
        <label for="address">Dirección</label>
        <input
          id="address"
          v-model="form.address"
          type="text"
        />
      </div>

      <div class="profile-form__row">
        <div>
          <label for="postalCode">Código postal</label>
          <input
            id="postalCode"
            v-model="form.postalCode"
            type="text"
          />
        </div>

        <div>
          <label for="city">Ciudad</label>
          <input
            id="city"
            v-model="form.city"
            type="text"
          />
        </div>
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
  @apply w-full rounded-lg border border-outline bg-surface-container px-4 py-3 outline-none transition focus:border-primary;
}
</style>