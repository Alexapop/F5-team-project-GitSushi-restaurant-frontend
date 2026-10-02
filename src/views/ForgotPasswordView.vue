<script setup>
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm.vue'
</script>

<template>
  <main class="page-container py-12">
    <section class="mx-auto max-w-md">
      <h1 class="text-center">
        Recuperar contraseña
      </h1>

      <p class="mt-3 text-center text-on-surface-variant">
        Introduce tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
      </p>

      <ForgotPasswordForm />
    </section>
  </main>
</template>