import { describe, it, expect, vi, beforeEach } from 'vitest'
import api from './api'
import { getPaidInvoices, INVOICES_PAGE_SIZE } from './invoices.service'

vi.mock('./api', () => ({
  default: { get: vi.fn() },
}))

const INVOICES = [{ id: 1 }, { id: 2 }]

describe('invoices.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    api.get.mockResolvedValue({ data: { content: INVOICES, totalPages: 3 } })
  })

  it('pide la primera página de 5 facturas por defecto', async () => {
    await getPaidInvoices()

    expect(api.get).toHaveBeenCalledWith('/api/v1/invoices', {
      params: { page: 0, size: INVOICES_PAGE_SIZE },
    })
  })

  it('convierte la página del front (empieza en 1) a la de Spring (empieza en 0)', async () => {
    await getPaidInvoices({ page: 3 })

    expect(api.get.mock.calls[0][1].params.page).toBe(2)
  })

  it('envía el texto de búsqueda sin espacios sobrantes', async () => {
    await getPaidInvoices({ search: '  Mesa 4  ' })

    expect(api.get.mock.calls[0][1].params.search).toBe('Mesa 4')
  })

  it('no envía la búsqueda si está vacía', async () => {
    await getPaidInvoices({ search: '   ' })

    expect(api.get.mock.calls[0][1].params).not.toHaveProperty('search')
  })

  it('devuelve las facturas y el total de páginas', async () => {
    const result = await getPaidInvoices()

    expect(result).toEqual({ items: INVOICES, totalPages: 3 })
  })
})