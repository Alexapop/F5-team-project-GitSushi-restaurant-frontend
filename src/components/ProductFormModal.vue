<script setup>
import { reactive, ref, computed } from 'vue'
import { PRODUCT_CATEGORIES, CATEGORY_LABELS } from '../constants/productCategories'
import { PRODUCT_FORM_MODES } from '../constants/productFormModes'
import { validateProductForm } from '../utils/productValidation'

const MIN_STOCK = 0
const STOCK_STEP = 1

const FORM_TEXTS = Object.freeze({
  [PRODUCT_FORM_MODES.CREATE]: {
    title: 'Añadir nuevo producto a la carta',
    stockLabel: 'Stock inicial',
    submitLabel: 'Guardar',
  },
  [PRODUCT_FORM_MODES.EDIT]: {
    title: 'Editar producto',
    stockLabel: 'Stock',
    submitLabel: 'Guardar cambios',
  },
})

const props = defineProps({
  mode: {
    type: String,
    required: true,
    validator: (value) => Object.values(PRODUCT_FORM_MODES).includes(value),
  },
  initialProduct: {
    type: Object,
    default: null,
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['submit', 'cancel'])

const categoryOptions = Object.values(PRODUCT_CATEGORIES)
const isCreateMode = computed(() => props.mode === PRODUCT_FORM_MODES.CREATE)
const texts = computed(() => FORM_TEXTS[props.mode])

function buildInitialForm(product) {
  return {
    name: product?.name ?? '',
    category: product?.category ?? PRODUCT_CATEGORIES.ESPECIALES,
    imageUrl: product?.imageUrl ?? '',
    price: product?.price ?? '',
    stock: product ? (product.stock ?? MIN_STOCK) : '',
    description: product?.description ?? '',
  }
}

const initialForm = buildInitialForm(props.initialProduct)
const form = reactive({ ...initialForm })
const validationError = ref('')

const hasChanges = computed(() =>
  Object.keys(initialForm).some((key) => String(form[key]) !== String(initialForm[key]))
)
const canSubmit = computed(() => isCreateMode.value || hasChanges.value)
const displayedError = computed(() => validationError.value || props.errorMessage)

function incrementStock() {
  const current = parseInt(form.stock, 10)
  form.stock = (isNaN(current) ? MIN_STOCK : current) + STOCK_STEP
}

function decrementStock() {
  const current = parseInt(form.stock, 10)
  const next = (isNaN(current) ? MIN_STOCK : current) - STOCK_STEP
  form.stock = Math.max(MIN_STOCK, next)
}

function handleSubmit() {
  validationError.value = validateProductForm(form, { requireImage: isCreateMode.value })
  if (validationError.value) return

  emit('submit', {
    name: form.name.trim(),
    category: form.category,
    imageUrl: form.imageUrl.trim(),
    price: parseFloat(form.price),
    stock: parseInt(form.stock, 10),
    description: form.description.trim(),
  })
}
</script>

<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
    <div class="bg-white rounded-xl p-6 max-w-md w-full shadow-lg">
      <h3 class="text-lg font-heading font-bold text-on-surface mb-4">{{ texts.title }}</h3>

      <form @submit.prevent="handleSubmit" class="flex flex-col gap-3">
        <div>
          <label class="block text-xs font-semibold text-on-surface-variant mb-1">Nombre</label>
          <input
            v-model="form.name"
            type="text"
            class="w-full px-3 py-2 rounded-lg border border-outline text-sm outline-none focus:border-primary"
            placeholder="Ej. Merge Nigiri"
          />
        </div>

        <div v-if="isCreateMode">
          <label class="block text-xs font-semibold text-on-surface-variant mb-1">Imagen (nombre del archivo)</label>
          <input
            v-model="form.imageUrl"
            type="text"
            class="w-full px-3 py-2 rounded-lg border border-outline text-sm outline-none focus:border-primary"
            placeholder="Ej. merge-nigiri.png"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-on-surface-variant mb-1">Categoría</label>
          <select
            v-model="form.category"
            class="w-full px-3 py-2 rounded-lg border border-outline text-sm outline-none focus:border-primary"
          >
            <option v-for="cat in categoryOptions" :key="cat" :value="cat">{{ CATEGORY_LABELS[cat] }}</option>
          </select>
        </div>

        <div class="flex gap-3">
          <div class="flex-1">
            <label class="block text-xs font-semibold text-on-surface-variant mb-1">Precio (€)</label>
            <input
              v-model="form.price"
              type="number"
              step="0.01"
              min="0"
              class="w-full px-3 py-2 rounded-lg border border-outline text-sm outline-none focus:border-primary"
              placeholder="Ej. 12.50"
            />
          </div>
          <div class="flex-1">
            <label class="block text-xs font-semibold text-on-surface-variant mb-1">{{ texts.stockLabel }}</label>
            <div class="flex items-center border border-outline rounded-lg overflow-hidden">
              <button
                type="button"
                @click="decrementStock"
                class="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition"
                aria-label="Disminuir stock"
              >
                −
              </button>
              <input
                v-model="form.stock"
                type="number"
                min="0"
                step="1"
                class="flex-1 w-0 text-center border-x border-outline text-sm outline-none py-2"
                placeholder="Ej. 20"
              />
              <button
                type="button"
                @click="incrementStock"
                class="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition"
                aria-label="Aumentar stock"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-on-surface-variant mb-1">Descripción</label>
          <textarea
            v-model="form.description"
            rows="3"
            class="w-full px-3 py-2 rounded-lg border border-outline text-sm outline-none focus:border-primary resize-none"
            placeholder="Breve descripción del producto"
          ></textarea>
        </div>

        <p v-if="displayedError" class="text-error text-sm">{{ displayedError }}</p>

        <div class="flex justify-end gap-3 pt-2">
          <button
            type="button"
            @click="emit('cancel')"
            class="px-4 py-2 rounded-lg border border-outline text-on-surface text-sm font-semibold hover:bg-surface-container-high transition"
          >
            Cancelar
          </button>
          <button
            v-if="canSubmit"
            type="submit"
            :disabled="isSaving"
            class="px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isSaving ? 'Guardando...' : texts.submitLabel }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
