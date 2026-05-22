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

function isAllowedFileNameChar(char: string): boolean {
  const code = char.codePointAt(0)
  if (code === undefined) {
    return false
  }
  return (
    (code >= 97 && code <= 122) ||
    (code >= 48 && code <= 57) ||
    char === '_' ||
    char === '-'
  )
}

export function sanitizeFileName(value: string): string {
  const lower = value.toLowerCase()
  let result = ''

  for (const char of lower) {
    if (isAllowedFileNameChar(char)) {
      result += char
      continue
    }
    if (result.length > 0 && result.at(-1) !== '_') {
      result += '_'
    }
  }

  let start = 0
  let end = result.length
  while (start < end && result[start] === '_') {
    start += 1
  }
  while (end > start && result[end - 1] === '_') {
    end -= 1
  }

  return result.slice(start, end)
}
