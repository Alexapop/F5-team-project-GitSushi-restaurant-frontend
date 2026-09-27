import { describe, it, expect } from 'vitest'
import router from './index'

describe('router', () => {
  it('registra una ruta para cada sección principal', () => {
    const paths = router.getRoutes().map((route) => route.path)
    expect(paths).toContain('/')
    expect(paths).toContain('/cesta')
    expect(paths).toContain('/admin')
  })
    it('cada ruta indica qué roles pueden acceder (meta.roles)', () => {
    const routes = router.getRoutes()

    routes.forEach((route) => {
      expect(Array.isArray(route.meta.roles)).toBe(true)
    })
  })

  it('cada ruta carga su vista correctamente', async () => {
    const routes = router.getRoutes()

    for (const route of routes) {
      const loadedModule = await route.components.default()

      expect(loadedModule.default).toBeDefined()
    }
  })
})
