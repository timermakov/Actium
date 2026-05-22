import { describe, it, expect, vi, beforeAll } from 'vitest'
import { readFileAsArrayBuffer, readFileAsText } from '../../../src/utils/files'

function ensureBlobFileApis(): void {
  if (typeof File.prototype.arrayBuffer !== 'function') {
    File.prototype.arrayBuffer = function arrayBuffer(this: File) {
      return new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as ArrayBuffer)
        reader.onerror = () =>
          reject(new Error(reader.error?.message ?? 'Failed to read file as ArrayBuffer'))
        reader.readAsArrayBuffer(this)
      })
    }
  }

  if (typeof File.prototype.text !== 'function') {
    File.prototype.text = function text(this: File) {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () =>
          reject(new Error(reader.error?.message ?? 'Failed to read file as text'))
        reader.readAsText(this)
      })
    }
  }
}

beforeAll(() => {
  ensureBlobFileApis()
})

describe('readFileAsArrayBuffer', () => {
  it('resolves with ArrayBuffer from file', async () => {
    const file = new File(['content'], 'test.txt', { type: 'text/plain' })
    const buffer = await readFileAsArrayBuffer(file)
    expect(buffer).toBeInstanceOf(ArrayBuffer)
    expect(buffer.byteLength).toBeGreaterThan(0)
  })

  it('rejects when arrayBuffer fails', async () => {
    const file = new File(['content'], 'test.txt', { type: 'text/plain' })
    vi.spyOn(file, 'arrayBuffer').mockRejectedValue(new Error('Failed to read file as ArrayBuffer'))

    await expect(readFileAsArrayBuffer(file)).rejects.toThrow('Failed to read file as ArrayBuffer')
  })
})

describe('readFileAsText', () => {
  it('resolves with text from file', async () => {
    const file = new File(['hello world'], 'test.txt', { type: 'text/plain' })
    const text = await readFileAsText(file)
    expect(text).toBe('hello world')
  })

  it('rejects when text fails', async () => {
    const file = new File(['content'], 'test.txt', { type: 'text/plain' })
    vi.spyOn(file, 'text').mockRejectedValue(new Error('Failed to read file as text'))

    await expect(readFileAsText(file)).rejects.toThrow('Failed to read file as text')
  })
})
