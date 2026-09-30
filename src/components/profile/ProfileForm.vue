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

const touched = reactive({})

function validateField(field) {
  touched[field] = true
}

function resetForm() {
  const user = authStore.user

  Object.keys(form).forEach((field) => {
    form[field] = user?.[field] ?? ''
    touched[field] = false
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

const errors = computed(() => {
  const result = {}

  const requiredFields = {
    firstName: 'El nombre es obligatorio.',
    lastName: 'Los apellidos son obligatorios.',
    email: 'El correo electrónico es obligatorio.',
    address: 'La dirección es obligatoria.',
    postalCode: 'El código postal es obligatorio.',
    city: 'La ciudad es obligatoria.',
  }

  Object.entries(requiredFields).forEach(([field, message]) => {
    if (!form[field].trim()) {
      result[field] = message
    }
  })

  if (
    !result.email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
  ) {
    result.email = 'Introduce un correo electrónico válido.'
  }

  return result
})
</script>

<template>
  <section class="profile-form">
    <h2 class="profile-form__title">Datos personales</h2>

    <form class="profile-form__fields" novalidate @submit.prevent>
      <div class="profile-form__row">
        <div>
          <label for="firstName">Nombre</label>
          <input
            id="firstName"
            v-model="form.firstName"
            type="text"
            autocomplete="given-name"
            required
            :aria-invalid="Boolean(touched.firstName && errors.firstName)"
            :aria-describedby="
              touched.firstName && errors.firstName
                ? 'firstName-error'
                : undefined
            "
            @blur="validateField('firstName')"
          />
          <p
            v-if="touched.firstName && errors.firstName"
            id="firstName-error"
            class="profile-form__error"
          >
            {{ errors.firstName }}
          </p>
        </div>

        <div>
          <label for="lastName">Apellidos</label>
          <input
            id="lastName"
            v-model="form.lastName"
            type="text"
            autocomplete="family-name"
            required
            :aria-invalid="Boolean(touched.lastName && errors.lastName)"
            :aria-describedby="
              touched.lastName && errors.lastName
                ? 'lastName-error'
                : undefined
            "
            @blur="validateField('lastName')"
          />
          <p
            v-if="touched.lastName && errors.lastName"
            id="lastName-error"
            class="profile-form__error"
          >
            {{ errors.lastName }}
          </p>
        </div>
      </div>

      <div>
        <label for="email">Correo electrónico</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          autocomplete="email"
          required
          :aria-invalid="Boolean(touched.email && errors.email)"
          :aria-describedby="
            touched.email && errors.email ? 'email-error' : undefined
          "
          @blur="validateField('email')"
        />
        <p
          v-if="touched.email && errors.email"
          id="email-error"
          class="profile-form__error"
        >
          {{ errors.email }}
        </p>
      </div>

      <div>
        <label for="address">Dirección</label>
        <input
          id="address"
          v-model="form.address"
          type="text"
          autocomplete="street-address"
          required
          :aria-invalid="Boolean(touched.address && errors.address)"
          :aria-describedby="
            touched.address && errors.address ? 'address-error' : undefined
          "
          @blur="validateField('address')"
        />
        <p
          v-if="touched.address && errors.address"
          id="address-error"
          class="profile-form__error"
        >
          {{ errors.address }}
        </p>
      </div>

      <div class="profile-form__row">
        <div>
          <label for="postalCode">Código postal</label>
          <input
            id="postalCode"
            v-model="form.postalCode"
            type="text"
            autocomplete="postal-code"
            required
            :aria-invalid="Boolean(touched.postalCode && errors.postalCode)"
            :aria-describedby="
              touched.postalCode && errors.postalCode
                ? 'postalCode-error'
                : undefined
            "
            @blur="validateField('postalCode')"
          />
          <p
            v-if="touched.postalCode && errors.postalCode"
            id="postalCode-error"
            class="profile-form__error"
          >
            {{ errors.postalCode }}
          </p>
        </div>

        <div>
          <label for="city">Ciudad</label>
          <input
            id="city"
            v-model="form.city"
            type="text"
            autocomplete="address-level2"
            required
            :aria-invalid="Boolean(touched.city && errors.city)"
            :aria-describedby="
              touched.city && errors.city ? 'city-error' : undefined
            "
            @blur="validateField('city')"
          />
          <p
            v-if="touched.city && errors.city"
            id="city-error"
            class="profile-form__error"
          >
            {{ errors.city }}
          </p>
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

.profile-form input[aria-invalid="true"] {
  @apply border-error;
}

.profile-form__error {
  @apply mt-1 text-sm text-error;
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