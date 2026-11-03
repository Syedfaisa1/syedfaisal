import { useEffect, useRef } from "react"

// Import directional WebP frame sequences using Vite's eager glob imports
const leftModules = import.meta.glob<string>("../assets/frames/left_*.webp", {
  eager: true,
  import: "default",
})
const rightModules = import.meta.glob<string>("../assets/frames/right_*.webp", {
  eager: true,
  import: "default",
})

/**
 * Directional mapping (verified by pupil and pixel coordinates):
 * - right_*.webp: head turns to viewer's LEFT (screen-left)
 * - left_*.webp: head turns to viewer's RIGHT (screen-right)
 * - Both share index 00 (direct eye contact center gaze)
 */
const lookLeftUrls: string[] = Object.keys(rightModules)
  .sort()
  .map((k) => rightModules[k])

const lookRightUrls: string[] = Object.keys(leftModules)
  .sort()
  .map((k) => leftModules[k])

export const TOTAL_FRAMES_COUNT = lookLeftUrls.length + lookRightUrls.length

/**
 * Maps horizontal position lx in [-1, 1] to left/right frame index (0..24).
 * - Center (lx near 0): index 0 (straight-ahead gaze)
 * - Left (lx < 0): turns head to screen-left
 * - Right (lx > 0): turns head to screen-right
 */
function getFrameForPosition(lx: number): { dir: "left" | "right"; index: number } {
  const absX = Math.abs(lx)

  // Gentle deadzone around center for steady eye contact
  if (absX < 0.025) {
    return { dir: "left", index: 0 }
  }

  const progress = Math.min(1, Math.max(0, (absX - 0.025) / 0.975))
  const index = Math.min(24, Math.round(progress * 24))

  return lx < 0 ? { dir: "left", index } : { dir: "right", index }
}

interface BackgroundVideoProps {
  onProgress?: (loaded: number, total: number) => void
}

export default function BackgroundVideo({ onProgress }: BackgroundVideoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Pure memory refs for 60/120 FPS cursor interpolation without re-renders
  const targetXRef = useRef(0)
  const currentXRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d", { alpha: false })
    if (!ctx) return

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = "high"

    let isCancelled = false
    let lastDrawnKey = ""

    // High-speed parallel preloading of 1080p WebP frames into GPU memory
    const lookLeftImages: HTMLImageElement[] = new Array(lookLeftUrls.length)
    const lookRightImages: HTMLImageElement[] = new Array(lookRightUrls.length)

    let loadedCount = 0
    const totalFrames = lookLeftUrls.length + lookRightUrls.length
    let initialDrawn = false

    // Safely retrieve nearest loaded frame to prevent any blank frames
    const getSafeImage = (
      list: HTMLImageElement[],
      index: number
    ): HTMLImageElement | null => {
      if (list[index]?.complete && list[index].naturalWidth > 0) {
        return list[index]
      }
      for (let offset = 1; offset <= 24; offset++) {
        const prev = index - offset
        if (prev >= 0 && list[prev]?.complete && list[prev].naturalWidth > 0) {
          return list[prev]
        }
        const next = index + offset
        if (next < list.length && list[next]?.complete && list[next].naturalWidth > 0) {
          return list[next]
        }
      }
      return null
    }

    // Draw frame on canvas with responsive object-fit: cover (stationary background)
    const drawFrame = (img: HTMLImageElement) => {
      if (!ctx || !canvas || !img) return

      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = window.innerWidth
      const h = window.innerHeight

      const targetW = Math.round(w * dpr)
      const targetH = Math.round(h * dpr)

      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW
        canvas.height = targetH
      }

      ctx.save()
      ctx.scale(dpr, dpr)
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = "high"

      const imgAspect = 1920 / 1080
      const canvasAspect = w / h

      let drawW: number
      let drawH: number
      let drawX: number
      let drawY: number

      if (canvasAspect > imgAspect) {
        // Ultrawide screen: fit width and center vertically
        drawW = w
        drawH = w / imgAspect
        drawX = 0
        drawY = (h - drawH) / 2
      } else {
        // Standard desktop / mobile screen:
        // Desktop aligns character at 65% (leaves left 50% for typography)
        // Mobile centers character at 50%
        drawH = h
        drawW = h * imgAspect
        const focalX = w >= 768 ? 0.65 : 0.5
        drawX = (w - drawW) * focalX
        drawY = 0
      }

      ctx.drawImage(img, drawX, drawY, drawW, drawH)
      ctx.restore()
    }

    const preloadList = (
      urls: string[],
      targetArr: HTMLImageElement[],
      isPrimary = false
    ) => {
      urls.forEach((url, i) => {
        const img = new Image()
        img.src = url
        img.onload = () => {
          if (isCancelled) return
          targetArr[i] = img
          loadedCount++
          onProgress?.(loadedCount, totalFrames)

          if (isPrimary && i === 0 && !initialDrawn) {
            initialDrawn = true
            drawFrame(img)
          }
        }
        img.onerror = () => {
          if (isCancelled) return
          loadedCount++
          onProgress?.(loadedCount, totalFrames)
        }
      })
    }

    // Preload center frame first for instantaneous paint
    preloadList(lookLeftUrls, lookLeftImages, true)
    preloadList(lookRightUrls, lookRightImages)

    // Cursor tracking: calculates horizontal delta [-1, 1] relative to center
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX =
        "touches" in e && e.touches.length > 0
          ? e.touches[0].clientX
          : (e as MouseEvent).clientX

      const w = window.innerWidth
      const dx = Math.max(-1, Math.min(1, (clientX - w / 2) / (w / 2)))
      targetXRef.current = dx
    }

    const handlePointerLeave = () => {
      // Gently return to center gaze when pointer leaves window
      targetXRef.current = 0
    }

    const handleWindowResize = () => {
      const { dir, index } = getFrameForPosition(currentXRef.current)
      const list = dir === "left" ? lookLeftImages : lookRightImages
      const img = getSafeImage(list, index)
      if (img) drawFrame(img)
    }

    window.addEventListener("mousemove", handlePointerMove, { passive: true })
    window.addEventListener("touchmove", handlePointerMove, { passive: true })
    window.addEventListener("mouseleave", handlePointerLeave, { passive: true })
    window.addEventListener("resize", handleWindowResize, { passive: true })

    // Smooth 60 FPS / 120 FPS requestAnimationFrame render loop
    let rafId: number

    const tick = () => {
      if (isCancelled) return

      // Fluid spring interpolation (0.18 = snappy, organic response)
      currentXRef.current +=
        (targetXRef.current - currentXRef.current) * 0.18

      // Determine directional frame index from current spring position
      const { dir, index } = getFrameForPosition(currentXRef.current)
      const frameKey = `${dir}_${index}`

      if (frameKey !== lastDrawnKey) {
        const list = dir === "left" ? lookLeftImages : lookRightImages
        const targetImg = getSafeImage(list, index)

        if (targetImg) {
          drawFrame(targetImg)
          lastDrawnKey = frameKey
        }
      }

      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)

    return () => {
      isCancelled = true
      window.removeEventListener("mousemove", handlePointerMove)
      window.removeEventListener("touchmove", handlePointerMove)
      window.removeEventListener("mouseleave", handlePointerLeave)
      window.removeEventListener("resize", handleWindowResize)
      cancelAnimationFrame(rafId)
    }
  }, [onProgress])

  return (
    <div className="fixed inset-0 z-0 w-full h-full overflow-hidden pointer-events-none select-none bg-[#0e53e5]">
      {/* 100% Pure Hardware-Accelerated Image Canvas (Zero Video Tags) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
      />
    </div>
  )
}
