import { useEffect, useRef } from "react"
import gsap from "gsap"
import { playSound } from "../utils/sound"

interface CursorConfig {
  url: string
  w: number
  h: number
  hx: number
  hy: number
}

type CursorType = "arrow" | "pointer" | "type" | "grab" | "grabbing"

const CURSOR_MODES: Record<CursorType, CursorConfig> = {
  arrow: {
    url: "/assets/new-cursor.svg",
    w: 48,
    h: 52,
    hx: 11.2,
    hy: 12,
  },
  pointer: {
    url: "/assets/cursor-pointer.svg",
    w: 46.4,
    h: 49.6,
    hx: 13.3,
    hy: 6.3,
  },
  type: {
    url: "/assets/cursor-type.svg",
    w: 25.6,
    h: 40.8,
    hx: 12.8,
    hy: 20.4,
  },
  grab: {
    url: "/assets/cursor-grab.svg",
    w: 44,
    h: 48,
    hx: 22,
    hy: 20,
  },
  grabbing: {
    url: "/assets/cursor-grabbing.svg",
    w: 42,
    h: 42,
    hx: 21,
    hy: 21,
  },
}

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // Only enable custom cursor on devices with fine pointer (mouse/trackpad)
    if (!window.matchMedia("(pointer: fine)").matches) {
      return
    }

    const root = document.documentElement
    root.classList.add("has-cursor")

    const cursor = cursorRef.current
    if (!cursor) return

    // Preload cursor assets
    Object.values(CURSOR_MODES).forEach((config) => {
      const img = new Image()
      img.src = config.url
    })

    // Initial setup
    gsap.set(cursor, { autoAlpha: 0, rotation: 7, scale: 1 })

    const setX = gsap.quickSetter(cursor, "x", "px")
    const setY = gsap.quickSetter(cursor, "y", "px")

    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0
    let isInitialized = false
    let currentMode: CursorType = "arrow"
    let hoveredElement: Element | null = null
    let isMouseDown = false

    const applyMode = (mode: CursorType) => {
      const config = CURSOR_MODES[mode]
      cursor.style.backgroundImage = `url("${config.url}")`
      cursor.style.width = `${config.w}px`
      cursor.style.height = `${config.h}px`
      cursor.style.transformOrigin = `${config.hx}px ${config.hy}px`
      cursor.style.translate = `${-config.hx}px ${-config.hy}px`
    }

    applyMode("arrow")

    const updateCursorVisuals = () => {
      let nextMode: CursorType = "arrow"
      if (hoveredElement) {
        const cursorAttr = hoveredElement.getAttribute("data-cursor")
        if (
          cursorAttr === "grab" ||
          cursorAttr === "grabbing" ||
          hoveredElement.classList.contains("cursor-grab") ||
          hoveredElement.classList.contains("cursor-grabbing") ||
          hoveredElement.closest(".lanyard-container")
        ) {
          nextMode = isMouseDown ? "grabbing" : "grab"
        } else if (
          hoveredElement.matches("input, textarea, [contenteditable='true']")
        ) {
          nextMode = "type"
        } else {
          nextMode = "pointer"
        }
      }

      const isGrabState = nextMode === "grab" || nextMode === "grabbing"
      const targetScale = nextMode === "grabbing" ? 0.95 : nextMode === "grab" ? 1.05 : isMouseDown ? 0.86 : hoveredElement ? 1.18 : 1
      const targetRotation = isGrabState ? 0 : 7 + (hoveredElement ? -8 : 0)

      if (nextMode !== currentMode) {
        currentMode = nextMode
        applyMode(nextMode)
      }

      gsap.to(cursor, {
        scale: targetScale,
        rotation: targetRotation,
        duration: 0.22,
        ease: "power3.out",
        overwrite: "auto",
      })
    }

    const onPointerMove = (e: PointerEvent) => {
      targetX = e.clientX
      targetY = e.clientY

      if (!isInitialized) {
        isInitialized = true
        currentX = targetX
        currentY = targetY
        setX(currentX)
        setY(currentY)
        gsap.to(cursor, { autoAlpha: 1, duration: 0.2, overwrite: "auto" })
      }
    }

    const onPointerOver = (e: PointerEvent) => {
      const target = (e.target as Element)?.closest?.(
        'a, button, [role="button"], input, select, textarea, label, summary, [data-cursor], .cursor-pointer, .cursor-grab, .cursor-grabbing, .lanyard-container'
      ) ?? null
      if (target !== hoveredElement) {
        hoveredElement = target
        updateCursorVisuals()
      }
    }

    const onPointerOut = (e: PointerEvent) => {
      if (!hoveredElement) return
      const related = e.relatedTarget as Node | null
      if (related && hoveredElement.contains(related)) return
      hoveredElement = null
      updateCursorVisuals()
    }

    const onPointerDown = () => {
      isMouseDown = true
      updateCursorVisuals()
    }

    const onPointerUp = () => {
      isMouseDown = false
      updateCursorVisuals()
    }

    const onPointerLeave = () => {
      gsap.to(cursor, { autoAlpha: 0, duration: 0.2, overwrite: "auto" })
    }

    const onPointerEnter = () => {
      if (isInitialized) {
        gsap.to(cursor, { autoAlpha: 1, duration: 0.2, overwrite: "auto" })
      }
    }

    const onClick = (e: MouseEvent) => {
      // Play Sweet Tape's tactile click sound on interactions
      const target = e.target as Element | null
      if (
        target?.closest?.(
          'a, button, [role="button"], input, select, textarea, [data-cursor], .cursor-pointer'
        )
      ) {
        playSound("click")
      }
    }

    // High performance ticker
    const onTick = () => {
      if (!isInitialized) return
      // Ultra crisp 1:1 follow with micro-lerp
      const factor = 0.85
      currentX += (targetX - currentX) * factor
      currentY += (targetY - currentY) * factor

      if (Math.abs(targetX - currentX) < 0.1 && Math.abs(targetY - currentY) < 0.1) {
        currentX = targetX
        currentY = targetY
      }

      setX(currentX)
      setY(currentY)
    }

    gsap.ticker.add(onTick)

    document.addEventListener("pointermove", onPointerMove, { passive: true })
    document.addEventListener("pointerover", onPointerOver, { passive: true })
    document.addEventListener("pointerout", onPointerOut, { passive: true })
    document.addEventListener("pointerdown", onPointerDown, { passive: true })
    document.addEventListener("pointerup", onPointerUp, { passive: true })
    document.addEventListener("pointerleave", onPointerLeave)
    document.addEventListener("pointerenter", onPointerEnter)
    document.addEventListener("click", onClick, { passive: true })

    return () => {
      gsap.ticker.remove(onTick)
      document.removeEventListener("pointermove", onPointerMove)
      document.removeEventListener("pointerover", onPointerOver)
      document.removeEventListener("pointerout", onPointerOut)
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("pointerup", onPointerUp)
      document.removeEventListener("pointerleave", onPointerLeave)
      document.removeEventListener("pointerenter", onPointerEnter)
      document.removeEventListener("click", onClick)
      gsap.killTweensOf(cursor)
      root.classList.remove("has-cursor")
    }
  }, [])

  return (
    <div
      ref={cursorRef}
      className="cursor-arrow"
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 99999,
        willChange: "transform",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "contain",
        filter: "drop-shadow(0 1.5px 2px rgba(0, 0, 0, 0.45))",
      }}
    />
  )
}
