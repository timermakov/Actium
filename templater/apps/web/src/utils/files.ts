export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return file.arrayBuffer()
}

export function readFileAsText(file: File): Promise<string> {
  return file.text()
}
