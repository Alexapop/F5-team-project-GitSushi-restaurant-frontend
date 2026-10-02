import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PerfilView from './PerfilView.vue'
import ExclusiveOffersCard from '../components/ExclusiveOffersCard.vue'
import * as offersService from '../services/offers.service'

describe('PerfilView', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(offersService, 'getExclusiveOffers').mockResolvedValue([])
    setActivePinia(createPinia())
  })

  it('renders the page title', async () => {
    const wrapper = mount(PerfilView)
    await flushPromises()

    expect(wrapper.find('.perfil-view__title').text()).toBe('Mi Perfil')
  })

  it('renders the ExclusiveOffersCard widget', async () => {
    const wrapper = mount(PerfilView)
    await flushPromises()

    expect(wrapper.findComponent(ExclusiveOffersCard).exists()).toBe(true)
  })
})
