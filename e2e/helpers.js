import { expect, test } from '@playwright/test'

// Usuarios de prueba que crea el backend en data.sql. Las contraseñas no se
// guardan en el repo: llegan por variables de entorno desde .env.e2e.
export const USERS = Object.freeze({
  customer: { email: 'customer@gitsushi.com', passwordVar: 'E2E_CUSTOMER_PASSWORD' },
  admin: { email: 'admin@gitsushi.com', passwordVar: 'E2E_ADMIN_PASSWORD' },
  cook: { email: 'cook@gitsushi.com', passwordVar: 'E2E_COOK_PASSWORD' },
})

// Salta el test si falta la contraseña, en vez de fallar con un error confuso.
export function requirePassword(user) {
  const password = process.env[user.passwordVar]
  test.skip(!password, `Falta ${user.passwordVar} en .env.e2e`)
  return password
}

// Inicia sesión desde el formulario, igual que una persona, y espera a volver a la carta.
export async function login(page, user) {
  const password = requirePassword(user)

  await page.goto('/login')
  await page.getByLabel('Correo electrónico').fill(user.email)
  await page.locator('#password').fill(password)
  await page.getByRole('button', { name: 'Iniciar sesión' }).click()

  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('heading', { name: 'Nuestra carta' })).toBeVisible()
}