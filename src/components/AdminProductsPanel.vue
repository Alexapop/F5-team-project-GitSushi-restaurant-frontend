<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { getAdminProducts, updateProduct, createProduct } from '../services/products.service'
import { PRODUCT_CATEGORIES, CATEGORY_LABELS } from '../constants/productCategories'
import PaginationControl from './PaginationControl.vue'
import LoadingSpinner from './LoadingSpinner.vue'
import ProductFormModal from './ProductFormModal.vue'
import { PRODUCT_FORM_MODES } from '../constants/productFormModes'

const ALL_CATEGORIES = 'ALL'
const categoryOptions = Object.values(PRODUCT_CATEGORIES)
const categories = [ALL_CATEGORIES, ...categoryOptions]
const activeCategory = ref(ALL_CATEGORIES)

function categoryLabel(category) {
  return category === ALL_CATEGORIES ? 'Todas' : CATEGORY_LABELS[category]
}

const LOW_STOCK_THRESHOLD = 5
const TABLE_PAGE_SIZE = 7
const DEFAULT_DISCOUNT = 0
const HTTP_CONFLICT = 409

const products = ref([])
const isLoading = ref(false)
const loadError = ref('')
const actionError = ref('')

async function loadProducts() {
  isLoading.value = true
  loadError.value = ''
  try {
    products.value = await getAdminProducts()
  } catch (err) {
    loadError.value = 'No se han podido cargar los productos. Inténtalo de nuevo más tarde.'
    console.error('[AdminProductsPanel] Error al obtener los productos:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(loadProducts)

const categoryCounts = computed(() => {
  const counts = { [ALL_CATEGORIES]: products.value.length }
  for (const cat of categoryOptions) {
    counts[cat] = products.value.filter((p) => p.category === cat).length
  }
  return counts
})

const filteredProducts = computed(() => {
  if (activeCategory.value === ALL_CATEGORIES) return products.value
  return products.value.filter((p) => p.category === activeCategory.value)
})

// --- Paginación de la tabla ---
const currentPage = ref(1)

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredProducts.value.length / TABLE_PAGE_SIZE))
)

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * TABLE_PAGE_SIZE
  return filteredProducts.value.slice(start, start + TABLE_PAGE_SIZE)
})

function selectCategory(category) {
  activeCategory.value = category
  currentPage.value = 1
}

function goToPage(page) {
  currentPage.value = page
}

// Si se borran productos y la página actual deja de existir, vuelve a la última
watch(totalPages, (newTotal) => {
  if (currentPage.value > newTotal) currentPage.value = newTotal
})

async function toggleActive(product) {
  actionError.value = ''
  try {
    const updatedProduct = await updateProduct(product.id, { available: !product.available })
    product.available = updatedProduct.available
  } catch (err) {
    actionError.value = 'No se ha podido cambiar el estado del producto. Inténtalo de nuevo.'
    console.error('[AdminProductsPanel] Error al cambiar el estado:', err)
  }
}

function isLowStock(product) {
  return product.stock <= LOW_STOCK_THRESHOLD
}

// --- Eliminar producto ---
const productToDelete = ref(null)

function requestDelete(product) {
  productToDelete.value = product
}

function cancelDelete() {
  productToDelete.value = null
}

function confirmDelete() {
  products.value = products.value.filter((p) => p.id !== productToDelete.value.id)
  productToDelete.value = null
}

// --- Formulario de producto (añadir y editar) ---
const formMode = ref(null)
const productBeingEdited = ref(null)
const isSavingForm = ref(false)
const formError = ref('')

function openCreateForm() {
  productBeingEdited.value = null
  formError.value = ''
  formMode.value = PRODUCT_FORM_MODES.CREATE
}

function openEditForm(product) {
  productBeingEdited.value = product
  formError.value = ''
  formMode.value = PRODUCT_FORM_MODES.EDIT
}

function closeForm() {
  formMode.value = null
  productBeingEdited.value = null
}

async function saveNewProduct(formData) {
  try {
    const createdProduct = await createProduct({
      ...formData,
      discount: DEFAULT_DISCOUNT,
      available: true,
      exclusive: false,
    })
    products.value.push(createdProduct)
    closeForm()
  } catch (err) {
    formError.value =
      err.response?.status === HTTP_CONFLICT
        ? 'Ya existe un producto con ese nombre.'
        : 'No se ha podido guardar el producto. Inténtalo de nuevo.'
    console.error('[AdminProductsPanel] Error al crear el producto:', err)
  }
}

async function saveProductChanges(formData) {
  try {
    const updatedProduct = await updateProduct(productBeingEdited.value.id, formData)
    Object.assign(productBeingEdited.value, updatedProduct)
    closeForm()
  } catch (err) {
    formError.value = 'No se han podido guardar los cambios. Inténtalo de nuevo.'
    console.error('[AdminProductsPanel] Error al editar el producto:', err)
  }
}

async function handleFormSubmit(formData) {
  formError.value = ''
  isSavingForm.value = true
  if (formMode.value === PRODUCT_FORM_MODES.CREATE) {
    await saveNewProduct(formData)
  } else {
    await saveProductChanges(formData)
  }
  isSavingForm.value = false
}
</script>

<template>
  <section class="bg-white border border-outline rounded-xl p-5">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
      <div>
        <h2 class="text-xl font-heading font-bold text-on-surface">Gestión de Productos de la Carta</h2>
        <p class="text-on-surface-variant text-sm">Consulta el estado de los productos por categoría.</p>
      </div>
      <button
        type="button"
        @click="openCreateForm"
        class="bg-primary text-on-primary px-4 py-2 rounded-lg font-semibold text-sm hover:opacity-90 transition self-start sm:self-auto whitespace-nowrap"
      >
        + Añadir nuevo producto a la carta
      </button>
    </div>

    <!-- Filtros por categoría -->
    <div class="flex flex-wrap gap-2 mb-4">
      <button
        v-for="cat in categories"
        :key="cat"
        type="button"
        @click="selectCategory(cat)"
        :class="[
          'px-3 py-1.5 rounded-full text-sm font-semibold border transition',
          activeCategory === cat
            ? 'bg-primary text-on-primary border-primary'
            : 'bg-surface-variant text-on-surface-variant border-outline hover:border-primary/50',
        ]"
      >
        {{ categoryLabel(cat) }} ({{ categoryCounts[cat] }})
      </button>
    </div>

    <p v-if="actionError" class="mb-3 text-error text-sm">{{ actionError }}</p>

    <!-- Tabla de productos -->
    <LoadingSpinner v-if="isLoading" label="Cargando productos..." />
    <p v-else-if="loadError" class="py-6 text-center text-error">{{ loadError }}</p>
    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-on-surface-variant uppercase text-xs border-b border-outline">
            <th class="py-2 pr-3">Producto</th>
            <th class="py-2 pr-3">Categoría</th>
            <th class="py-2 pr-3">Precio</th>
            <th class="py-2 pr-3">Stock</th>
            <th class="py-2 pr-3">Estado</th>
            <th class="py-2 pr-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredProducts.length === 0">
            <td colspan="6" class="py-6 text-center text-on-surface-variant">
              No hay productos en esta categoría.
            </td>
          </tr>
          <tr
            v-for="product in paginatedProducts"
            :key="product.id"
            class="border-b border-outline last:border-0"
          >
            <td class="py-3 pr-3">
              <div class="font-semibold text-on-surface">{{ product.name }}</div>
              <div class="text-on-surface-variant text-xs">{{ product.description }}</div>
            </td>
            <td class="py-3 pr-3 text-on-surface-variant">{{ categoryLabel(product.category) }}</td>
            <td class="py-3 pr-3 font-semibold text-on-surface">{{ product.price.toFixed(2) }} €</td>
            <td class="py-3 pr-3">
              <span
                :class="[
                  'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold',
                  isLowStock(product) ? 'bg-error-container text-error' : 'bg-surface-variant text-on-surface-variant',
                ]"
              >
                <span v-if="isLowStock(product)">⚠️</span>
                {{ product.stock }} uds.
              </span>
            </td>
            <td class="py-3 pr-3">
              <span
                :class="[
                  'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold',
                  product.available ? 'bg-secondary-container text-secondary' : 'bg-surface-variant text-on-surface-variant',
                ]"
              >
                <span :class="['w-1.5 h-1.5 rounded-full', product.available ? 'bg-secondary' : 'bg-on-surface-variant']"></span>
                {{ product.available ? 'Activo' : 'Desactivado' }}
              </span>
            </td>
            <td class="py-3 pr-3 text-right whitespace-nowrap">
              <div class="inline-flex items-center gap-2">
                <button
                  type="button"
                  @click="toggleActive(product)"
                  class="text-xs font-semibold px-3 py-1.5 rounded-lg border border-outline hover:bg-surface-container-high transition"
                >
                  {{ product.available ? 'Desactivar' : 'Activar' }}
                </button>
                <button
                  type="button"
                  @click="openEditForm(product)"
                  class="w-8 h-8 flex items-center justify-center rounded-lg border border-outline text-on-surface-variant hover:text-primary hover:border-primary/50 transition"
                  aria-label="Editar producto"
                  title="Editar"
                >
                  ✏️
                </button>
                <button
                  type="button"
                  @click="requestDelete(product)"
                  class="w-8 h-8 flex items-center justify-center rounded-lg border border-outline text-on-surface-variant hover:text-error hover:border-error/50 transition"
                  aria-label="Eliminar producto"
                  title="Eliminar"
                >
                  🗑️
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <PaginationControl
        v-if="totalPages > 1"
        :current-page="currentPage"
        :total-pages="totalPages"
        @change-page="goToPage"
      />
    </div>

    <!-- Modal de confirmación de borrado -->
    <div
      v-if="productToDelete"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
    >
      <div class="bg-white rounded-xl p-6 max-w-sm w-full shadow-lg">
        <h3 class="text-lg font-heading font-bold text-on-surface mb-2">¿Eliminar producto?</h3>
        <p class="text-on-surface-variant text-sm mb-5">
          Esta acción es permanente y no se puede deshacer. Vas a eliminar
          <span class="font-semibold text-on-surface">{{ productToDelete.name }}</span> de la carta.
        </p>
        <div class="flex justify-end gap-3">
          <button
            type="button"
            @click="cancelDelete"
            class="px-4 py-2 rounded-lg border border-outline text-on-surface text-sm font-semibold hover:bg-surface-container-high transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            @click="confirmDelete"
            class="px-4 py-2 rounded-lg bg-error text-white text-sm font-semibold hover:opacity-90 transition"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>

    <!-- Formulario de producto (añadir y editar) -->
    <ProductFormModal
      v-if="formMode"
      :mode="formMode"
      :initial-product="productBeingEdited"
      :is-saving="isSavingForm"
      :error-message="formError"
      @submit="handleFormSubmit"
      @cancel="closeForm"
    />
  </section>
</template>