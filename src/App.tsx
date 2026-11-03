import { useState, useEffect, useRef } from "react"
import { Routes, Route, useLocation, useNavigate } from "react-router-dom"
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import AboutPage from "./pages/AboutPage"
import Loader from "./components/Loader"
import CustomCursor from "./components/CustomCursor"
import { scrollToSection } from "./utils/scroll"

const SECTION_COLORS_DARK: Record<string, { bg: string; border: string }> = {
  home: { bg: "#004afd", border: "rgba(255, 255, 255, 0.12)" },
  about: { bg: "#004afd", border: "rgba(255, 255, 255, 0.12)" },
  "how-i-build": { bg: "#b6fe00", border: "rgba(1, 57, 0, 0.18)" },
  "wall-push": { bg: "#060a12", border: "rgba(255, 255, 255, 0.08)" },
  projects: { bg: "#060a12", border: "rgba(255, 255, 255, 0.08)" },
  contact: { bg: "#b6fe00", border: "rgba(1, 57, 0, 0.18)" },
  footer: { bg: "#034102", border: "rgba(182, 254, 0, 0.15)" },
}

const SECTION_COLORS_LIGHT: Record<string, { bg: string; border: string }> = {
  home: { bg: "#ffffff", border: "rgba(0, 0, 0, 0.08)" },
  about: { bg: "#ffffff", border: "rgba(0, 0, 0, 0.08)" },
  "how-i-build": { bg: "#b6fe00", border: "rgba(1, 57, 0, 0.18)" },
  "wall-push": { bg: "#f5f6f4", border: "rgba(0, 0, 0, 0.08)" },
  projects: { bg: "#f5f6f4", border: "rgba(0, 0, 0, 0.08)" },
  contact: { bg: "#b6fe00", border: "rgba(1, 57, 0, 0.18)" },
  footer: { bg: "#034102", border: "rgba(182, 254, 0, 0.15)" },
}

export default function App() {
  const [isLightMode, setIsLightMode] = useState(false)
  const [isLoaderFinished, setIsLoaderFinished] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const isLightModeRef = useRef(isLightMode)
  const location = useLocation()
  const navigate = useNavigate()

  const toggleTheme = () => {
    setIsLightMode((prev) => !prev)
  }

  // 1. Disable browser's erratic scroll restoration during animated loading
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual"
    }
  }, [])

  // 1.1 Sync theme class and scrollbar track colors on html root
  useEffect(() => {
    isLightModeRef.current = isLightMode
    document.documentElement.classList.toggle("light-mode", isLightMode)
    const currentSection =
      document.documentElement.getAttribute("data-active-section") || (location.pathname === "/about" ? "about" : "home")
    const palette = isLightMode ? SECTION_COLORS_LIGHT : SECTION_COLORS_DARK
    const cfg = palette[currentSection] || palette.home
    document.documentElement.style.setProperty("--scrollbar-track-color", cfg.bg)
    document.documentElement.style.setProperty("--scrollbar-track-border", cfg.border)
  }, [isLightMode, location.pathname])

  // 1.2 Hide scrollbar/sidebar completely while loading screen is active
  useEffect(() => {
    if (isLoaderFinished) {
      document.documentElement.classList.remove("is-loading")
      document.body.classList.remove("is-loading")
    } else {
      document.documentElement.classList.add("is-loading")
      document.body.classList.add("is-loading")
    }
    return () => {
      document.documentElement.classList.remove("is-loading")
      document.body.classList.remove("is-loading")
    }
  }, [isLoaderFinished])

  // 1.3 Redirect #about hash directly to /about route
  useEffect(() => {
    if (window.location.hash === "#about") {
      navigate("/about", { replace: true })
    }
  }, [location.pathname, navigate])

  // 2. Track scroll progress and active section in real-time as user scrolls
  useEffect(() => {
    const sections = [
      "home",
      "how-i-build",
      "wall-push",
      "projects",
      "contact",
      "footer",
    ]
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Calculate scroll progress for animated top bar
          const totalScroll =
            document.documentElement.scrollHeight - window.innerHeight
          if (totalScroll > 0) {
            setScrollProgress(
              Math.min(1, Math.max(0, window.scrollY / totalScroll))
            )
          }

          // In /about route: only about and footer
          if (location.pathname === "/about") {
            const isAtBottom =
              window.innerHeight + window.scrollY >=
              document.documentElement.scrollHeight - 80
            const activeId = isAtBottom ? "footer" : "about"
            document.documentElement.setAttribute("data-active-section", activeId)
            const palette = isLightModeRef.current
              ? SECTION_COLORS_LIGHT
              : SECTION_COLORS_DARK
            const cfg = palette[activeId] || palette.home
            document.documentElement.style.setProperty(
              "--scrollbar-track-color",
              cfg.bg
            )
            document.documentElement.style.setProperty(
              "--scrollbar-track-border",
              cfg.border
            )
            ticking = false
            return
          }

          // Active section detection on home ("/")
          const scrollY = window.scrollY
          const isAtBottom =
            window.innerHeight + scrollY >=
            document.documentElement.scrollHeight - 80

          let activeId = ""

          if (isAtBottom) {
            activeId = "footer"
          } else if (scrollY < 120) {
            activeId = "home"
          } else {
            const focalPoint = window.innerHeight * 0.45
            for (const id of sections) {
              const el = document.getElementById(id)
              if (el) {
                const rect = el.getBoundingClientRect()
                if (rect.top <= focalPoint && rect.bottom >= focalPoint) {
                  activeId = id
                  break
                }
              }
            }

            // Fallback to closest section
            if (!activeId) {
              let minDistance = Infinity
              for (const id of sections) {
                const el = document.getElementById(id)
                if (el) {
                  const rect = el.getBoundingClientRect()
                  const dist = Math.abs(rect.top - focalPoint)
                  if (dist < minDistance) {
                    minDistance = dist
                    activeId = id
                  }
                }
              }
            }
          }

          if (activeId) {
            document.documentElement.setAttribute("data-active-section", activeId)
            const palette = isLightModeRef.current
              ? SECTION_COLORS_LIGHT
              : SECTION_COLORS_DARK
            const cfg = palette[activeId] || palette.home
            document.documentElement.style.setProperty(
              "--scrollbar-track-color",
              cfg.bg
            )
            document.documentElement.style.setProperty(
              "--scrollbar-track-border",
              cfg.border
            )

            sessionStorage.setItem("faisal_active_section", activeId)
            if (window.location.hash !== `#${activeId}`) {
              window.history.replaceState(null, "", `#${activeId}`)
            }
          }

          ticking = false
        })
        ticking = true
      }
    }

    // Initialize track color and section state on mount
    handleScroll()

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [location.pathname])

  // 3. When page finishes loading, land precisely on that particular section
  useEffect(() => {
    if (!isLoaderFinished) return

    const targetSection =
      window.location.hash?.replace(/^#/, "") ||
      sessionStorage.getItem("faisal_active_section")

    if (targetSection && targetSection !== "home" && targetSection !== "about") {
      // Allow GSAP ScrollTrigger to stabilize after loader curtain opens
      const timer = window.setTimeout(() => {
        scrollToSection(targetSection)
      }, 200)
      return () => window.clearTimeout(timer)
    }
  }, [isLoaderFinished])

  // 4. Handle manual URL hash navigation / deep links
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash) {
        if (window.location.hash === "#about") {
          navigate("/about")
        } else {
          scrollToSection(window.location.hash)
        }
      }
    }

    window.addEventListener("hashchange", handleHash)
    return () => window.removeEventListener("hashchange", handleHash)
  }, [navigate])

  return (
    <div
      className={`relative w-full min-h-screen overflow-x-hidden select-none transition-colors duration-700 ease-in-out ${
        isLightMode ? "bg-white text-black" : "bg-[#004afd] text-white"
      }`}
    >
      {/* 0. 1:1 Sweet Tape Custom Interactive Cursor */}
      <CustomCursor />

      {/* 0.1 Animated Top Scroll Progress Bar */}
      <div
        className="fixed top-0 left-0 right-0 h-[3px] z-[60] pointer-events-none origin-left bg-gradient-to-r from-[#b6fe00] via-[#00f2fe] to-[#b6fe00] transition-opacity duration-500 shadow-[0_0_12px_rgba(182,254,0,0.8)]"
        style={{
          transform: `scaleX(${scrollProgress})`,
          opacity: isLoaderFinished ? 1 : 0,
        }}
        aria-hidden="true"
      />

      {/* 1. Creative Studio Loader Curtain matching user reference */}
      <Loader onComplete={() => setIsLoaderFinished(true)} />

      {/* 2. Fixed Top Navbar with Theme & Logo Toggle */}
      <Navbar
        isLightMode={isLightMode}
        onToggleTheme={toggleTheme}
        isReady={isLoaderFinished}
      />

      {/* 3. Page Routes */}
      <Routes>
        <Route path="/" element={<Home isLightMode={isLightMode} />} />
        <Route path="/about" element={<AboutPage isLightMode={isLightMode} />} />
        <Route path="*" element={<Home isLightMode={isLightMode} />} />
      </Routes>
    </div>
  )
}

