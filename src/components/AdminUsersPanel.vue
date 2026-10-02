<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAdminUsers } from '../composables/useAdminUsers'
import { useAuthStore } from '../stores/auth'
import ConfirmDialog from './ConfirmDialog.vue'
import LoadingSpinner from './LoadingSpinner.vue'
import PaginationControl from './PaginationControl.vue'
import UsersTable from './UsersTable.vue'

// Responsabilidad: coordinar la sección "Gestión de usuarios". Une la tabla,
// la paginación y la confirmación de borrado con el estado de useAdminUsers.

const authStore = useAuthStore()
const currentUserId = computed(() => authStore.user?.id ?? null)

const {
  users,
  isLoading,
  loadError,
  actionError,
  pendingUserId,
  currentPage,
  totalPages,
  loadUsers,
  goToPage,
  changeRole,
  toggleActive,
  removeUser,
} = useAdminUsers()

const userToDelete = ref(null)

const userToDeleteName = computed(() =>
  `${userToDelete.value?.firstName ?? ''} ${userToDelete.value?.lastName ?? ''}`.trim()
)

function handleDeleteRequest(user) {
  userToDelete.value = user
}

function handleDeleteCancel() {
  userToDelete.value = null
}

async function handleDeleteConfirm() {
  const user = userToDelete.value
  userToDelete.value = null
  await removeUser(user)
}

onMounted(loadUsers)
</script>

<template>
  <section class="admin-users" aria-labelledby="admin-users-title">
    <header class="admin-users__header">
      <h2 id="admin-users-title" class="admin-users__title">Gestión de usuarios</h2>
      <p class="admin-users__subtitle">Cambia el rol de cada cuenta, actívala o desactívala.</p>
    </header>

    <p v-if="actionError" class="admin-users__action-error" role="alert">{{ actionError }}</p>

    <LoadingSpinner v-if="isLoading" label="Cargando usuarios..." />
    <p v-else-if="loadError" class="admin-users__load-error">{{ loadError }}</p>
    <div v-else class="admin-users__table-wrapper">
      <UsersTable
        :users="users"
        :current-user-id="currentUserId"
        :pending-user-id="pendingUserId"
        @change-role="changeRole"
        @toggle-active="toggleActive"
        @delete="handleDeleteRequest"
      />

      <PaginationControl
        v-if="totalPages > 1"
        :current-page="currentPage"
        :total-pages="totalPages"
        @change-page="goToPage"
      />
    </div>

    <ConfirmDialog
      v-if="userToDelete"
      :title="`¿Eliminar a ${userToDeleteName}?`"
      confirm-label="Eliminar"
      @confirm="handleDeleteConfirm"
      @cancel="handleDeleteCancel"
    >
      Se borrará su cuenta y no se puede deshacer. Si solo quieres impedir que entre,
      desactívala.
    </ConfirmDialog>
  </section>
</template>

<style scoped>
@reference "../style.css";

.admin-users {
  @apply rounded-xl border border-outline bg-white p-5;
}

.admin-users__header {
  @apply mb-4;
}

.admin-users__title {
  @apply font-heading text-xl font-bold text-on-surface;
}

.admin-users__subtitle {
  @apply text-sm text-on-surface-variant;
}

.admin-users__action-error {
  @apply mb-4 rounded-lg bg-error-container px-4 py-3 text-sm text-on-error-container;
}

.admin-users__load-error {
  @apply py-6 text-center text-error;
}

/* En móvil la tabla hace scroll horizontal dentro de la tarjeta, no la página */
.admin-users__table-wrapper {
  @apply overflow-x-auto;
}
</style>