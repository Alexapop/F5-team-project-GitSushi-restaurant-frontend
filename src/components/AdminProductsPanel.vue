<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAdminProducts } from '../composables/useAdminProducts'
import { usePagination } from '../composables/usePagination'
import { PRODUCT_CATEGORIES, CATEGORY_LABELS } from '../constants/productCategories'
import PaginationControl from './PaginationControl.vue'
import LoadingSpinner from './LoadingSpinner.vue'
import ProductFormModal from './ProductFormModal.vue'
import AdminProductsTable from './AdminProductsTable.vue'
import ConfirmDialog from './ConfirmDialog.vue'
import CategoryFilters from './CategoryFilters.vue'
import { PRODUCT_FORM_MODES } from '../constants/productFormModes'

const ALL_CATEGORIES = 'ALL'
const categoryOptions = Object.values(PRODUCT_CATEGORIES)
const categories = [ALL_CATEGORIES, ...categoryOptions]
const activeCategory = ref(ALL_CATEGORIES)

function categoryLabel(category) {
  return category === ALL_CATEGORIES ? 'Todas' : CATEGORY_LABELS[category]
}

const TABLE_PAGE_SIZE = 7
const HTTP_CONFLICT = 409

const {
  products,
  isLoading,
  loadError,
  loadProducts,
  addProduct,
  editProduct,
  toggleAvailability,
  removeProduct,
} = useAdminProducts()

const actionError = ref('')

onMounted(loadProducts)

const categoryCounts = computed(() => {
  const counts = { [ALL_CATEGORIES]: products.value.length }
  for (const cat of categoryOptions) {
    counts[cat] = products.value.filter((p) => p.category === cat).length
  }
  return counts
})

const categoryFilterOptions = computed(() =>
  categories.map((category) => ({
    value: category,
    label: categoryLabel(category),
    count: categoryCounts.value[category],
  }))
)

const filteredProducts = computed(() => {
  if (activeCategory.value === ALL_CATEGORIES) return products.value
  return products.value.filter((p) => p.category === activeCategory.value)
})

// --- Paginación de la tabla ---
const {
  currentPage,
  totalPages,
  paginatedItems: paginatedProducts,
  goToPage,
  resetPage,
} = usePagination(filteredProducts, TABLE_PAGE_SIZE)

function selectCategory(category) {
  activeCategory.value = category
  resetPage()
}

async function handleToggleAvailability(product) {
  actionError.value = ''
  try {
    await toggleAvailability(product)
  } catch (err) {
    actionError.value = 'No se ha podido cambiar el estado del producto. Inténtalo de nuevo.'
    console.error('[AdminProductsPanel] Error al cambiar el estado:', err)
  }
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
  removeProduct(productToDelete.value.id)
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
    await addProduct(formData)
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
    await editProduct(productBeingEdited.value, formData)
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
    <CategoryFilters
      :options="categoryFilterOptions"
      :active-category="activeCategory"
      @select-category="selectCategory"
    />

    <p v-if="actionError" class="mb-3 text-error text-sm">{{ actionError }}</p>

    <!-- Tabla de productos -->
    <LoadingSpinner v-if="isLoading" label="Cargando productos..." />
    <p v-else-if="loadError" class="py-6 text-center text-error">{{ loadError }}</p>
    <div v-else class="overflow-x-auto">
      <AdminProductsTable
        :products="paginatedProducts"
        @toggle-availability="handleToggleAvailability"
        @edit="openEditForm"
        @delete="requestDelete"
      />

      <PaginationControl
        v-if="totalPages > 1"
        :current-page="currentPage"
        :total-pages="totalPages"
        @change-page="goToPage"
      />
    </div>

    <!-- Confirmación de borrado -->
    <ConfirmDialog
      v-if="productToDelete"
      title="¿Eliminar producto?"
      confirm-label="Eliminar"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    >
      Esta acción es permanente y no se puede deshacer. Vas a eliminar
      <strong>{{ productToDelete.name }}</strong> de la carta.
    </ConfirmDialog>

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