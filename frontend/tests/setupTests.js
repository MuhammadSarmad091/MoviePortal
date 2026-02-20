// Mock localStorage to avoid side effects during component import
const localStorageMock = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {}
}
global.localStorage = localStorageMock

// Polyfill/guard for atob/btoa during tests to avoid InvalidCharacterError
// Some runtime code (or third-party libs) may call atob with non-base64 strings.
// Make these functions safe for tests.
const safeAtob = (str) => {
  if (!str) return ''
  try {
    return Buffer.from(str, 'base64').toString('binary')
  } catch (e) {
    // Return empty string instead of crashing
    return ''
  }
}

const safeBtoa = (str) => {
  if (!str) return ''
  try {
    return Buffer.from(str, 'binary').toString('base64')
  } catch (e) {
    return ''
  }
}

global.atob = safeAtob
global.btoa = safeBtoa

// Also replace on window object for jsdom
if (typeof window !== 'undefined') {
  window.atob = safeAtob
  window.btoa = safeBtoa
  window.localStorage = localStorageMock
}
