import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'

// Mock external dependencies only (not the component itself)
vi.mock('../../src/composables/useAuth', () => ({
  useAuth: () => ({
    login: vi.fn(),
    loading: { value: false },
    error: { value: null }
  })
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({ query: {} })
}))

import LoginPage from '../../src/pages/AuthPages/LoginPage.vue'

describe('LoginPage - Real Component', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(LoginPage)
  })

  it('renders email and password input fields', () => {
    expect(wrapper.find('#email').exists()).toBe(true)
    expect(wrapper.find('#password').exists()).toBe(true)
  })

  it('shows password length error when password too short', async () => {
    await wrapper.find('#email').setValue('user@example.com')
    await wrapper.find('#password').setValue('123')

    await wrapper.find('form').trigger('submit.prevent')

    const errors = wrapper.findAll('.error-message').map(el => el.text())
    expect(errors.some(e => e.includes('Password must be at least 6 characters'))).toBe(true)
  })

  it('shows email required error when email empty', async () => {
    await wrapper.find('#email').setValue('')
    await wrapper.find('#password').setValue('password123')

    await wrapper.find('form').trigger('submit.prevent')

    const errors = wrapper.findAll('.error-message').map(el => el.text())
    expect(errors.some(e => e.includes('Email is required'))).toBe(true)
  })

  it('shows invalid email error for bad format', async () => {
    await wrapper.find('#email').setValue('notanemail')
    await wrapper.find('#password').setValue('password123')

    await wrapper.find('form').trigger('submit.prevent')

    const errors = wrapper.findAll('.error-message').map(el => el.text())
    expect(errors.some(e => e.includes('Please enter a valid email address'))).toBe(true)
  })
})
