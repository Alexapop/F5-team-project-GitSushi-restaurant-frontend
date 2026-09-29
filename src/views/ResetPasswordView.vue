<script setup>
import ResetPasswordForm from '../components/auth/ResetPasswordForm.vue'
</script>

<template>
  <main class="page-container py-12">
    <section class="mx-auto max-w-md">
      <h1 class="text-center">
        Restablecer contraseña
      </h1>

      <p class="mt-3 text-center text-on-surface-variant">
        Introduce tu nueva contraseña para recuperar el acceso a tu cuenta.
      </p>

      <ResetPasswordForm />
    </section>
  </main>
</template>