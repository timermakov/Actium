export function buildFileName(values: string[], index: number): string {
  const cleanedValues = values
    .map((value) => sanitizeFileName(value))
    .filter(Boolean)

  if (cleanedValues.length === 0) {
    return `document_${String(index).padStart(3, '0')}.docx`
  }

  const suffix = `_${String(index).padStart(3, '0')}`
  const maxBaseLength = Math.max(0, 80 - suffix.length)
  const joined = cleanedValues.join('_').slice(0, maxBaseLength)
  return `${joined}${suffix}.docx`
}

export function sanitizeFileName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
}
