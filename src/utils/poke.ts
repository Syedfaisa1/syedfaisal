import gsap from "gsap"

const clamp = (val: number, min: number, max: number) =>
  Math.min(max, Math.max(min, val))

export interface PokeOptions {
  selector?: string
  radiusMultiplier?: number
  maxLift?: number
  maxRotate?: number
  maxScale?: number
}

/**
 * 1:1 Sweet Tape Character Poke Interaction
 * Smooth, tactile, springy text interaction on cursor proximity.
 * Characters elevate, tilt away from the cursor, and pop forward.
 * On mouse leave, characters spring back with an elastic wobble.
 */
export function initPoke(
  container: HTMLElement | null,
  options: PokeOptions = {}
): () => void {
  if (!container || typeof window === "undefined") {
    return () => {}
  }

  const {
    selector = ".char",
    radiusMultiplier = 0.92,
    maxLift = 0.12,
    maxRotate = 13,
    maxScale = 0.1,
  } = options

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return () => {}
  }

  const chars = Array.from(
    container.querySelectorAll<HTMLElement>(selector)
  )
  if (!chars.length) return () => {}

  const charMap = new Map(chars.map((el, i) => [el, i]))
  let centers: { x: number; y: number }[] = []
  let fontSize = 16
  let pointerPos: { x: number; y: number } | null = null
  let rafId = 0
  let isPoking = false
  let leaveTimeout = 0

  const measure = () => {
    const rect = container.getBoundingClientRect()
    fontSize =
      parseFloat(window.getComputedStyle(container).fontSize) || 16

    centers = chars.map((ch) => {
      const parent = ch.parentElement ?? ch
      const pRect = parent.getBoundingClientRect()
      return {
        x: pRect.left - rect.left + pRect.width / 2,
        y: pRect.top - rect.top + pRect.height / 2,
      }
    })
  }

  const update = () => {
    rafId = 0
    if (!pointerPos) return

    if (!isPoking) {
      measure()
      isPoking = true
      chars.forEach((c) => {
        if (c.parentElement) c.parentElement.style.overflow = "visible"
      })
    }

    const rect = container.getBoundingClientRect()
    const rx = pointerPos.x - rect.left
    const ry = pointerPos.y - rect.top
    const radius = radiusMultiplier * fontSize

    const calcFalloff = (idx: number) => {
      const center = centers[idx]
      if (!center) return 0
      const dist = Math.hypot(rx - center.x, ry - center.y)
      const t = clamp(1 - dist / radius, 0, 1)
      return t * t * (3 - 2 * t) // smoothstep interpolation
    }

    gsap.to(chars, {
      y: (_i, el) => {
        const idx = charMap.get(el) ?? 0
        return -maxLift * fontSize * calcFalloff(idx)
      },
      rotate: (_i, el) => {
        const idx = charMap.get(el) ?? 0
        const center = centers[idx]
        if (!center) return 0
        const f = calcFalloff(idx)
        const dir = clamp((rx - center.x) / (0.45 * radius), -1, 1)
        return -maxRotate * f * dir
      },
      scale: (_i, el) => {
        const idx = charMap.get(el) ?? 0
        return 1 + maxScale * calcFalloff(idx)
      },
      transformOrigin: "50% 100%",
      duration: 0.4,
      ease: "power3.out",
      overwrite: "auto",
    })
  }

  const onPointerMove = (e: PointerEvent) => {
    pointerPos = { x: e.clientX, y: e.clientY }
    window.clearTimeout(leaveTimeout)
    if (!rafId) {
      rafId = requestAnimationFrame(update)
    }
  }

  const onPointerLeave = () => {
    pointerPos = null
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = 0
    }
    if (isPoking) {
      gsap.to(chars, {
        y: 0,
        rotate: 0,
        scale: 1,
        duration: 0.95,
        ease: "elastic.out(1.1, 0.42)",
        stagger: {
          each: 0.015,
          from: "center",
        },
        overwrite: "auto",
        onComplete: () => {
          isPoking = false
        },
      })
    }
  }

  const onPointerDown = (e: PointerEvent) => {
    onPointerMove(e)
    window.clearTimeout(leaveTimeout)
    leaveTimeout = window.setTimeout(onPointerLeave, 450)
  }

  const isHoverable = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  ).matches

  if (isHoverable) {
    container.addEventListener("pointermove", onPointerMove, {
      passive: true,
    })
    container.addEventListener("pointerleave", onPointerLeave, {
      passive: true,
    })
  } else {
    container.addEventListener("pointerdown", onPointerDown, {
      passive: true,
    })
  }

  const onResize = () => {
    if (isPoking) measure()
  }
  window.addEventListener("resize", onResize, { passive: true })

  // Initial measure once fonts and layout have settled
  window.setTimeout(measure, 150)

  return () => {
    if (rafId) cancelAnimationFrame(rafId)
    window.clearTimeout(leaveTimeout)
    container.removeEventListener("pointermove", onPointerMove)
    container.removeEventListener("pointerleave", onPointerLeave)
    container.removeEventListener("pointerdown", onPointerDown)
    window.removeEventListener("resize", onResize)
    gsap.set(chars, { clearProps: "transform" })
  }
}
