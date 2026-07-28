export const SQM_SIZE = 55
export const CANVAS_W = 880
export const CANVAS_H = 550
export const GRID_COLS = Math.floor(CANVAS_W / SQM_SIZE)
export const GRID_ROWS = Math.floor(CANVAS_H / SQM_SIZE)
export const MOVE_SPEED = 0.06

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
  '/assets/sprites/monsters/lord_of_ferea.png',
  '/assets/sprites/monsters/ferea_general.png',
]

export const MAP_BG: Record<string, string> = {
  lorencia: '/assets/maps/hunt_bg.png',
  lord_of_ferea: '/assets/maps/ferea_bg.png',
}