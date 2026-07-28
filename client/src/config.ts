// ============================================
// CONFIGURAÇÕES DO JOGO
// ============================================

export const SQM_SIZE = 55
export const CANVAS_W = 770
export const CANVAS_H = 495
export const GRID_COLS = Math.floor(CANVAS_W / SQM_SIZE)
export const GRID_ROWS = Math.floor(CANVAS_H / SQM_SIZE)
export const MOVE_SPEED = 0.06

// Cache de imagens
export const imageCache: Record<string, HTMLImageElement> = {}
export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve) => {
    if (imageCache[src]) { resolve(imageCache[src]); return }
    const img = new Image()
    img.onload = () => { imageCache[src] = img; resolve(img) }
    img.onerror = () => { resolve(img) }
    img.src = src
  })
}

export const gridToPixel = (gx: number, gy: number) => ({
  x: gx * SQM_SIZE + SQM_SIZE / 2,
  y: gy * SQM_SIZE + SQM_SIZE / 2
})

export const SPRITE_PATHS = [
  '/assets/sprites/characters/dark_knight.png',
  '/assets/sprites/characters/dark_wizard.png',
  '/assets/sprites/characters/elf.png',
  '/assets/sprites/monsters/spider.png',
  '/assets/sprites/monsters/skeleton.png',
  '/assets/sprites/monsters/budgedragon.png',
]