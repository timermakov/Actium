import Docxtemplater from 'docxtemplater'
import PizZip from 'pizzip'

const PLACEHOLDER_REGEX = /{{\s*([\w.-]+)\s*}}/g

export function extractPlaceholders(fullText: string): string[] {
  const matches = new Set<string>()
  let match = PLACEHOLDER_REGEX.exec(fullText)

  while (match) {
    matches.add(match[1])
    match = PLACEHOLDER_REGEX.exec(fullText)
  }

  return Array.from(matches)
}

export function extractPlaceholdersFromDocx(buffer: ArrayBuffer): string[] {
  const zip = new PizZip(buffer)
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: { start: '{{', end: '}}' },
  })
  const fullText = doc.getFullText()
  return extractPlaceholders(fullText)
}

export function generateDocxBlob(
  templateBuffer: ArrayBuffer,
  data: Record<string, string>,
): Blob {
  const zip = new PizZip(templateBuffer)
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: { start: '{{', end: '}}' },
  })
  doc.render(data)
  return doc.getZip().generate({
    type: 'blob',
    mimeType:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })
}
