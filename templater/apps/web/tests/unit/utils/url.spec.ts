import { describe, it, expect } from 'vitest'
import { hasAbsoluteHttpUrl, resolveApiBaseUrl, trimTrailingSlashes } from '../../../src/utils/url'

describe('trimTrailingSlashes', () => {
  it('removes trailing slashes', () => {
    expect(trimTrailingSlashes('https://api.example.com///')).toBe('https://api.example.com')
  })

  it('keeps url without slashes', () => {
    expect(trimTrailingSlashes('https://api.example.com')).toBe('https://api.example.com')
  })
})

describe('hasAbsoluteHttpUrl', () => {
  it('accepts http and https', () => {
    expect(hasAbsoluteHttpUrl('http://localhost:8001')).toBe(true)
    expect(hasAbsoluteHttpUrl('https://api.example.com')).toBe(true)
  })

  it('rejects relative paths', () => {
    expect(hasAbsoluteHttpUrl('/api/user')).toBe(false)
    expect(hasAbsoluteHttpUrl('')).toBe(false)
  })
})

describe('resolveApiBaseUrl', () => {
  it('uses raw value when absolute', () => {
    expect(resolveApiBaseUrl('https://api.example.com/', '')).toBe('https://api.example.com')
  })

  it('uses dev fallback when raw is empty', () => {
    expect(resolveApiBaseUrl('', 'http://localhost:8001')).toBe('http://localhost:8001')
  })

  it('returns empty for invalid url', () => {
    expect(resolveApiBaseUrl('/relative', '')).toBe('')
  })
})
