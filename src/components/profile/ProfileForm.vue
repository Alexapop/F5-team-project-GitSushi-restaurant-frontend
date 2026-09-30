<script setup>
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { useAuthStore } from '../../stores/auth'
import VoiceDictationButton from '../VoiceDictationButton.vue'

const authStore = useAuthStore()
const formElement = ref(null)

const fields = [
  {
    name: 'firstName',
    label: 'Nombre',
    type: 'text',
    autocomplete: 'given-name',
    requiredMessage: 'El nombre es obligatorio.',
  },
  {
    name: 'lastName',
    label: 'Apellidos',
    type: 'text',
    autocomplete: 'family-name',
    requiredMessage: 'Los apellidos son obligatorios.',
  },
  {
    name: 'email',
    label: 'Correo electrónico',
    type: 'email',
    autocomplete: 'email',
    requiredMessage: 'El correo electrónico es obligatorio.',
    fullWidth: true,
  },
  {
    name: 'address',
    label: 'Dirección',
    type: 'text',
    autocomplete: 'street-address',
    requiredMessage: 'La dirección es obligatoria.',
    fullWidth: true,
  },
  {
    name: 'postalCode',
    label: 'Código postal',
    type: 'text',
    autocomplete: 'postal-code',
    requiredMessage: 'El código postal es obligatorio.',
  },
  {
    name: 'city',
    label: 'Ciudad',
    type: 'text',
    autocomplete: 'address-level2',
    requiredMessage: 'La ciudad es obligatoria.',
    voiceInput: true,
  },
]

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  address: '',
  postalCode: '',
  city: '',
})

const touched = reactive({})

function resetForm() {
  const user = authStore.user

  fields.forEach(({ name }) => {
    form[name] = user?.[name] ?? ''
    touched[name] = false
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

  return fields.some(({ name }) => {
    return form[name] !== (user[name] ?? '')
  })
})

const errors = computed(() => {
  const result = {}

  fields.forEach(({ name, requiredMessage }) => {
    if (!form[name].trim()) {
      result[name] = requiredMessage
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

function validateField(field) {
  touched[field] = true
}

function handleDictation(field, transcript) {
  form[field] = transcript
  validateField(field)
}

function validateForm() {
  fields.forEach(({ name }) => {
    touched[name] = true
  })

  return Object.keys(errors.value).length === 0
}

async function handleSubmit() {
  if (authStore.isFetchingUser || !authStore.user) return

  if (!validateForm()) {
    await nextTick()

    formElement.value
      ?.querySelector('[aria-invalid="true"]')
      ?.focus()

    return
  }

  if (!hasChanges.value) return

  // Pendiente del contrato del backend:
  // enviar los datos y actualizar el store tras guardar correctamente.
}
</script>

<template>
  <section
    class="profile-form"
    :aria-busy="Boolean(authStore.isFetchingUser)"
  >
    <h2 class="profile-form__title">Datos personales</h2>

    <p
      v-if="authStore.isFetchingUser"
      class="profile-form__notice"
      role="status"
    >
      Cargando tus datos…
    </p>

    <p
      v-else-if="!authStore.user"
      class="profile-form__notice"
      role="status"
    >
      No hay datos de usuario disponibles.
    </p>

    <form
      v-else
      ref="formElement"
      class="profile-form__fields"
      novalidate
      @submit.prevent="handleSubmit"
    >
      <p class="profile-form__notice">
        Todos los campos son obligatorios.
      </p>

      <div class="profile-form__grid">
        <div
          v-for="field in fields"
          :key="field.name"
          :class="{
            'profile-form__field--full': field.fullWidth,
          }"
        >
          <label :for="field.name">{{ field.label }}</label>

          <div
            :class="{ 'profile-form__voice-control': field.voiceInput }"
          >
            <input
              :id="field.name"
              v-model="form[field.name]"
              :name="field.name"
              :type="field.type"
              :autocomplete="field.autocomplete"
              required
              :aria-invalid="
                Boolean(touched[field.name] && errors[field.name])
              "
              :aria-describedby="
                touched[field.name] && errors[field.name]
                  ? `${field.name}-error`
                  : undefined
              "
              @blur="validateField(field.name)"
            />

            <VoiceDictationButton
              v-if="field.voiceInput"
              :field-label="field.label"
              @transcript="handleDictation(field.name, $event)"
            />
          </div>

          <p
            v-if="touched[field.name] && errors[field.name]"
            :id="`${field.name}-error`"
            class="profile-form__error"
          >
            {{ errors[field.name] }}
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

.profile-form__grid {
  @apply grid grid-cols-1 gap-5 sm:grid-cols-2;
}

.profile-form__field--full {
  @apply sm:col-span-2;
}

.profile-form label {
  @apply mb-2 block text-sm font-medium;
}

.profile-form input {
  @apply w-full rounded-lg border border-outline
    bg-surface-container px-4 py-3 outline-none
    transition focus:border-primary;
}

.profile-form__voice-control {
  @apply grid grid-cols-[1fr_auto] items-center gap-x-2 gap-y-1;
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