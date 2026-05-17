export async function compressImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  const maxWidth = 1280
  const ratio = Math.min(1, maxWidth / bitmap.width)

  canvas.width = Math.round(bitmap.width * ratio)
  canvas.height = Math.round(bitmap.height * ratio)

  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Canvas not supported')
  }

  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.82)
}
