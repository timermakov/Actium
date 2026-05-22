export function trimTrailingSlashes(url: string): string {
  let end = url.length
  while (end > 0 && url[end - 1] === '/') {
    end -= 1
  }
  return url.slice(0, end)
}

export function hasAbsoluteHttpUrl(url: string): boolean {
  const lower = url.toLowerCase()
  return lower.startsWith('https://') || lower.startsWith('http://')
}

export function resolveApiBaseUrl(rawValue: string, devFallback: string): string {
  const trimmed = rawValue.trim()
  const normalized = trimTrailingSlashes(trimmed || devFallback)
  return hasAbsoluteHttpUrl(normalized) ? normalized : ''
}
