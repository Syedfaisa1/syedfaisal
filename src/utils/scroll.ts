import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

/**
 * Smoothly scrolls the window to the target element ID
 * Handles complex pinned ScrollTrigger layouts and responsive offsets.
 */
export function scrollToSection(targetId: string, behavior: ScrollBehavior = "smooth") {
  if (typeof window === "undefined") return

  const cleanId = targetId.replace(/^#/, "")
  const element = document.getElementById(cleanId)
  if (!element) {
    if (cleanId === "about") {
      window.location.href = "/about"
      return
    }
    if (window.location.pathname !== "/") {
      window.location.href = `/#${cleanId}`
      return
    }
    return
  }

  // Refresh ScrollTrigger so pinned spacer dimensions are up-to-date
  try {
    ScrollTrigger.refresh()
  } catch {
    // Ignore if not ready
  }

  // 1. Direct scroll into view
  element.scrollIntoView({ behavior, block: "start" })

  // 2. Secondary multi-pass correction for pinned scroll spacers (ScrollTrigger)
  const adjustOffset = () => {
    const el = document.getElementById(cleanId)
    if (!el) return
    const rect = el.getBoundingClientRect()
    if (Math.abs(rect.top) > 20) {
      const targetTop = window.scrollY + rect.top
      window.scrollTo({
        top: targetTop,
        behavior,
      })
    }
  }

  window.setTimeout(adjustOffset, 200)
  window.setTimeout(adjustOffset, 450)
  window.setTimeout(adjustOffset, 800)
}
