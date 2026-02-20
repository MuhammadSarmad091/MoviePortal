import { describe, it, expect } from 'vitest'
import { validateMovieForm, validateLoginForm } from '../../src/utils/validation'

describe('validation - Utility Functions', () => {
  describe('validateMovieForm', () => {
    it('rejects when title is missing', () => {
      const form = { title: '', description: 'Valid description here long', releaseDate: '2020-01-01', posterUrl: 'https://example.com/p.jpg', trailerUrl: 'https://youtube.com/e' }
      const result = validateMovieForm(form)
      expect(result.isValid).toBe(false)
      expect(result.errors.title).toContain('Title is required')
    })

    it('rejects when description too short (< 20 chars)', () => {
      const form = { title: 'Movie', description: 'short', releaseDate: '2020-01-01', posterUrl: 'https://example.com/p.jpg', trailerUrl: 'https://youtube.com/e' }
      const result = validateMovieForm(form)
      expect(result.isValid).toBe(false)
      expect(result.errors.description).toContain('Description must be at least 20 characters')
    })

    it('passes when all fields valid', () => {
      const form = {
        title: 'Valid Movie Title',
        description: 'This is a valid description with enough characters for validation.',
        releaseDate: '2022-05-20',
        posterUrl: 'https://example.com/poster.jpg',
        trailerUrl: 'https://youtube.com/watch?v=abc'
      }
      const result = validateMovieForm(form)
      expect(result.isValid).toBe(true)
      expect(Object.keys(result.errors).length).toBe(0)
    })
  })

  describe('validateLoginForm', () => {
    it('rejects when email missing', () => {
      const form = { email: '', password: 'password123' }
      const result = validateLoginForm(form)
      expect(result.isValid).toBe(false)
      expect(result.errors.email).toContain('Email is required')
    })

    it('rejects when password too short (< 6 chars)', () => {
      const form = { email: 'user@example.com', password: '123' }
      const result = validateLoginForm(form)
      expect(result.isValid).toBe(false)
      expect(result.errors.password).toContain('Password must be at least 6 characters')
    })

    it('rejects invalid email format', () => {
      const form = { email: 'notanemail', password: 'password123' }
      const result = validateLoginForm(form)
      expect(result.isValid).toBe(false)
      expect(result.errors.email).toContain('Please enter a valid email address')
    })

    it('passes when email and password valid', () => {
      const form = { email: 'user@example.com', password: 'password123' }
      const result = validateLoginForm(form)
      expect(result.isValid).toBe(true)
      expect(Object.keys(result.errors).length).toBe(0)
    })
  })
})
