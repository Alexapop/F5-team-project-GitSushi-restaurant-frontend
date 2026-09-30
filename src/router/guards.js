import { ROLES } from '../constants/roles'

// Devuelve true si el rol puede entrar en la ruta.
// Una ruta sin meta.roles es pública.
export function canAccess(route, role) {
  const allowedRoles = route.meta?.roles
  if (!allowedRoles) return true
  return allowedRoles.includes(role)
}

// Decide a dónde redirigir cuando el rol no tiene acceso:
// el invitado va a iniciar sesión y el usuario logueado vuelve a la carta.
export function getRedirectFor(role) {
  return role === ROLES.GUEST ? { name: 'login' } : { name: 'carta' }
}

// Una ruta que no existe en el router (p. ej. /user) no tiene coincidencias.
export function isUnknownRoute(route) {
  return route.matched.length === 0
}