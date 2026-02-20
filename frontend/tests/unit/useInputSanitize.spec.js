import { describe, it, expect } from 'vitest'
import { sanitizeUsername, sanitizeEmail } from '../../src/composables/useInputSanitize'

describe('useInputSanitize - Utility Functions', () => {
  describe('sanitizeUsername', () => {
    it('removes special characters, keeping only alphanumeric, underscore, hyphen', () => {
      const raw = 'john!@# doe$%^_+-'
      expect(sanitizeUsername(raw)).toBe('johndoe_-')
    })

    it('handles empty username', () => {
      expect(sanitizeUsername('')).toBe('')
    })

    it('preserves allowed characters (letters, numbers, underscore, hyphen)', () => {
      expect(sanitizeUsername('User_name-123')).toBe('User_name-123')
    })

    it('removes spaces and special chars from username', () => {
      expect(sanitizeUsername('user@email.com')).toBe('useremailcom')
    })
  })

  describe('sanitizeEmail', () => {
    it('removes invalid chars, keeps common email chars (@, ., -, _, +)', () => {
      const raw = 'te+st^%user(@)exa mple!#$.com'
      expect(sanitizeEmail(raw)).toBe('te+stuser@example.com')
    })

    it('preserves uppercase and plus in email', () => {
      expect(sanitizeEmail('USER+TEST@EXAMPLE.COM')).toBe('USER+TEST@EXAMPLE.COM')
    })

    it('handles empty email', () => {
      expect(sanitizeEmail('')).toBe('')
    })

    it('removes spaces from email', () => {
      expect(sanitizeEmail('user @ex ample.com')).toBe('user@example.com')
    })
  })
})
