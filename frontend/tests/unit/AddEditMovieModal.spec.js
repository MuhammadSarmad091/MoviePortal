import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'

// Mock BaseModal (external component dependency)
vi.mock('../../src/components/modal/BaseModal.vue', () => ({
  default: { template: '<div><slot /></div>' }
}))

import AddEditMovieModal from '../../src/components/modal/AddEditMovieModal.vue'

describe('AddEditMovieModal - Real Component', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(AddEditMovieModal, {
      props: {
        movieId: null,
        initialMovie: null,
        isLoading: false,
        serverError: null
      }
    })
  })

  it('renders the form with all input fields', () => {
    expect(wrapper.find('#title').exists()).toBe(true)
    expect(wrapper.find('#description').exists()).toBe(true)
    expect(wrapper.find('#releaseDate').exists()).toBe(true)
    expect(wrapper.find('#posterUrl').exists()).toBe(true)
    expect(wrapper.find('#trailerUrl').exists()).toBe(true)
  })

  it('validates and rejects short description on submit', async () => {
    await wrapper.find('#title').setValue('Movie Title')
    await wrapper.find('#description').setValue('short desc')
    await wrapper.find('#releaseDate').setValue('2020-01-01')
    await wrapper.find('#posterUrl').setValue('https://example.com/poster.jpg')
    await wrapper.find('#trailerUrl').setValue('https://youtube.com/watch?v=abc')

    await wrapper.find('form').trigger('submit.prevent')

    // Should show description error
    const errors = wrapper.findAll('.error-message').map(el => el.text())
    expect(errors.some(e => e.includes('Description must be at least 20 characters'))).toBe(true)

    // Should not emit submit event
    expect(wrapper.emitted('submit')).toBeFalsy()
  })

  it('emits submit when form is valid', async () => {
    await wrapper.find('#title').setValue('Good Movie Title')
    await wrapper.find('#description').setValue('This is a valid description with more than 20 characters.')
    await wrapper.find('#releaseDate').setValue('2022-05-20')
    await wrapper.find('#posterUrl').setValue('https://example.com/poster.jpg')
    await wrapper.find('#trailerUrl').setValue('https://youtube.com/watch?v=abc123')

    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.emitted('submit')).toBeTruthy()
    const payload = wrapper.emitted('submit')[0][0]
    expect(payload.title).toBe('Good Movie Title')
    expect(payload.description.length).toBeGreaterThanOrEqual(20)
  })
})
