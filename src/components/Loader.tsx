import { useEffect, useState, useRef } from "react"
import gsap from "gsap"
import syedOutline from "../assets/logo/syed_outline.png"
import syedFilled from "../assets/logo/syed_filled.png"
import faisalOutline from "../assets/logo/faisal_outline.png"
import faisalFilled from "../assets/logo/faisal_filled.png"
import logo3 from "../assets/logo/logo_3.png"
import heroBlueImg from "../assets/Me/hero.me.png"
import heroLightImg from "../assets/Me/hero.me-light.png"

// Import all 7 transparent sticker graphics
import sticker1 from "../assets/stickers_7/01_deep_focus-Photoroom.png"
import sticker2 from "../assets/stickers_7/02_good_ideas-Photoroom.png"
import sticker3 from "../assets/stickers_7/03_almost_there-Photoroom.png"
import sticker4 from "../assets/stickers_7/04_coding_mode-Photoroom.png"
import sticker5 from "../assets/stickers_7/05_recharging-Photoroom.png"
import sticker6 from "../assets/stickers_7/06_its_working-Photoroom.png"
import sticker7 from "../assets/stickers_7/07_debugging-Photoroom.png"

interface LoaderProps {
  onComplete?: () => void
}

/**
 * 7 Stickers arranged in exact spatial layout from user's sketch:
 * - 1: Left-Mid (01 Deep Focus)
 * - 2: Top-Left (02 Good Ideas)
 * - 3: Bottom-Center-Left (03 Almost There)
 * - 4: Top-Center (04 Coding Mode)
 * - 5: Center (05 Recharging)
 * - 6: Top-Right (06 It's Working)
 * - 7: Bottom-Right (07 Debugging)
 *
 * Each sticker pops up from the bottom baseline, floats in air, and clears before logo reveals.
 */
const STICKER_CONFIGS = [
  {
    id: 1,
    img: sticker1,
    alt: "01 Deep Focus",
    left: "25%",
    top: "67%",
    baseRot: -16,
    spawn: 4,
    exit: 50,
    floatClass: "animate-[floatBob1_3.2s_ease-in-out_infinite]",
    zIndex: 10,
  },
  {
    id: 2,
    img: sticker2,
    alt: "02 Good Ideas",
    left: "36%",
    top: "44%",
    baseRot: -4,
    spawn: 11,
    exit: 52,
    floatClass: "animate-[floatBob2_2.8s_ease-in-out_infinite_0.4s]",
    zIndex: 10,
  },
  {
    id: 3,
    img: sticker3,
    alt: "03 Almost There",
    left: "36.5%",
    top: "82%",
    baseRot: -1,
    spawn: 18,
    exit: 54,
    floatClass: "animate-[floatBob3_3.5s_ease-in-out_infinite_0.8s]",
    zIndex: 25,
  },
  {
    id: 4,
    img: sticker4,
    alt: "04 Coding Mode",
    left: "49%",
    top: "26%",
    baseRot: 1,
    spawn: 25,
    exit: 56,
    floatClass: "animate-[floatBob1_3.0s_ease-in-out_infinite_0.2s]",
    zIndex: 10,
  },
  {
    id: 5,
    img: sticker5,
    alt: "05 Recharging",
    left: "51.5%",
    top: "61%",
    baseRot: 2,
    spawn: 32,
    exit: 58,
    floatClass: "animate-[floatBob2_3.4s_ease-in-out_infinite_0.6s]",
    zIndex: 25,
  },
  {
    id: 6,
    img: sticker6,
    alt: "06 It's Working",
    left: "71%",
    top: "44%",
    baseRot: -11,
    spawn: 39,
    exit: 60,
    floatClass: "animate-[floatBob3_2.9s_ease-in-out_infinite_1.0s]",
    zIndex: 10,
  },
  {
    id: 7,
    img: sticker7,
    alt: "07 Debugging",
    left: "63.5%",
    top: "80%",
    baseRot: 15,
    spawn: 46,
    exit: 62,
    floatClass: "animate-[floatBob1_3.6s_ease-in-out_infinite_0.5s]",
    zIndex: 10,
  },
]

export default function Loader({ onComplete }: LoaderProps) {
  const [displayPercent, setDisplayPercent] = useState(0)
  const [isDone, setIsDone] = useState(false)
  const percentRef = useRef(0)
  const assetsLoadedRef = useRef(0)
  const isTransitionStartedRef = useRef(false)

  const curtainRef = useRef<HTMLDivElement | null>(null)
  const flyingLogoRef = useRef<HTMLDivElement | null>(null)
  const counterRef = useRef<HTMLDivElement | null>(null)
  const baselineRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // Preload all assets for instantaneous 0ms display
    const imagesToPreload = [
      heroBlueImg,
      heroLightImg,
      logo3,
      syedFilled,
      faisalFilled,
      sticker1,
      sticker2,
      sticker3,
      sticker4,
      sticker5,
      sticker6,
      sticker7,
    ]

    imagesToPreload.forEach((src) => {
      const img = new Image()
      img.src = src
      img.onload = () => {
        assetsLoadedRef.current += 1
      }
      img.onerror = () => {
        assetsLoadedRef.current += 1
      }
    })

    let rafId: number
    const startTime = Date.now()
    // Cinematic duration (3.6s) for sequential baseline pop-up, float, and grand finale
    const MIN_DURATION = 3600

    const tick = () => {
      const elapsed = Date.now() - startTime
      const timeRatio = Math.min(1, elapsed / MIN_DURATION)
      const isAssetsReady = assetsLoadedRef.current >= 2

      // Target percentage advances smoothly
      const targetPercent = isAssetsReady
        ? timeRatio * 100
        : Math.min(timeRatio * 90, 92)

      // Smooth spring lerp toward target
      percentRef.current += (targetPercent - percentRef.current) * 0.1

      if (isAssetsReady && timeRatio >= 1 && percentRef.current >= 99) {
        percentRef.current = 100
        setDisplayPercent(100)

        // When 100% is hit, trigger the seamless fly-to-navbar logo transition!
        if (!isTransitionStartedRef.current) {
          isTransitionStartedRef.current = true

          setTimeout(() => {
            // 1. Fade out the number counter and baseline rule
            if (counterRef.current) {
              gsap.to(counterRef.current, { opacity: 0, duration: 0.25 })
            }
            if (baselineRef.current) {
              gsap.to(baselineRef.current, { opacity: 0, duration: 0.25 })
            }

            // 2. Measure target navbar logo position
            const targetEl = document.getElementById("navbar-brand-logo")
            const targetRect = targetEl?.getBoundingClientRect()
            const logoEl = flyingLogoRef.current

            if (logoEl && targetRect && targetRect.width > 0) {
              const logoRect = logoEl.getBoundingClientRect()
              const logoCenterX = logoRect.left + logoRect.width / 2
              const logoCenterY = logoRect.top + logoRect.height / 2
              const targetCenterX = targetRect.left + targetRect.width / 2
              const targetCenterY = targetRect.top + targetRect.height / 2

              const deltaX = targetCenterX - logoCenterX
              const deltaY = targetCenterY - logoCenterY
              const scaleRatio = targetRect.height / logoRect.height

              // Animate center logo directly into navbar top-left corner
              gsap.to(logoEl, {
                x: deltaX,
                y: deltaY,
                scale: scaleRatio,
                rotation: 0,
                duration: 0.95,
                ease: "power3.inOut",
                onComplete: () => {
                  onComplete?.()
                  setTimeout(() => {
                    setIsDone(true)
                  }, 60)
                },
              })

              // Simultaneously slide loader curtain up into ceiling
              if (curtainRef.current) {
                gsap.to(curtainRef.current, {
                  yPercent: -100,
                  duration: 0.95,
                  ease: "power3.inOut",
                })
              }
            } else {
              // Fallback if target not in DOM
              if (curtainRef.current) {
                gsap.to(curtainRef.current, {
                  yPercent: -100,
                  duration: 0.85,
                  ease: "power3.inOut",
                  onComplete: () => {
                    onComplete?.()
                    setIsDone(true)
                  },
                })
              }
            }
          }, 320)
        }
        return
      }

      setDisplayPercent(Math.floor(percentRef.current))
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [onComplete])

  if (isDone) return null

  // Format number: two digits with leading zero (00, 04, 39, 97) or 100
  const formattedNumber =
    displayPercent < 100
      ? String(displayPercent).padStart(2, "0")
      : "100"

  // 1. Kinetic Logo Animation (reveals in the last phase: 62% to 100%)
  const showLogo = displayPercent >= 62
  const logoProgress = showLogo ? Math.min(1, (displayPercent - 62) / 15) : 0
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
  const easedLogo = easeOutCubic(logoProgress)
  const syedTranslateX = (1 - easedLogo) * -140
  const faisalTranslateX = (1 - easedLogo) * 140
  const logoOpacity = Math.min(1, logoProgress * 2.5)

  // 2. Color Filling (74% to 100%): liquid pours inside letters once locked in center
  const fillRaw =
    displayPercent > 74
      ? Math.min(100, ((displayPercent - 74) / 26) * 100)
      : 0
  const fillPercent = Math.max(0, Math.min(100, fillRaw))

  return (
    <div className="fixed inset-0 z-50 pointer-events-none select-none">
      {/* 1. SLIDING CURTAIN LAYER (#edefed) */}
      <div
        ref={curtainRef}
        className="absolute inset-0 bg-[#edefed] pointer-events-auto flex items-center justify-center overflow-hidden will-change-transform"
      >
        {/* Responsive Stage Container for Stickers & Baseline */}
        <div className="relative w-full max-w-[1100px] h-full max-h-[620px] pointer-events-none select-none scale-75 sm:scale-90 md:scale-100 transition-transform">
          {/* THE 7 STICKERS: Emerge from below the baseline, pop up, float in air, then drift away */}
          {STICKER_CONFIGS.map((cfg) => {
            const isSpawned = displayPercent >= cfg.spawn
            const isExitingPhase = displayPercent >= cfg.exit

            if (!isSpawned) return null

            // Entrance progress: 0 to 1 over 8%
            const enterProgress = Math.min(1, (displayPercent - cfg.spawn) / 8)
            const enterScale = 0.4 + enterProgress * 0.6
            const enterY = (1 - enterProgress) * 140 // rises up from baseline

            // Exit progress: drifts upward and fades to 0 over 10%
            const exitProgress = isExitingPhase
              ? Math.min(1, (displayPercent - cfg.exit) / 10)
              : 0
            const exitY = -(exitProgress * 45)
            const stickerOpacity =
              (1 - exitProgress) * Math.min(1, enterProgress * 1.5)

            if (stickerOpacity <= 0.01) return null

            return (
              <div
                key={cfg.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto transition-opacity duration-200"
                style={{
                  left: cfg.left,
                  top: cfg.top,
                  zIndex: cfg.zIndex,
                  opacity: stickerOpacity,
                  transform: `translate(-50%, -50%) translate3d(0, ${enterY + exitY}px, 0) scale(${enterScale * (1 - exitProgress * 0.15)})`,
                }}
              >
                {/* Inner Floating Wrapper: keeps gently floating / drifting in air */}
                <div
                  className={`${cfg.floatClass} transition-transform hover:scale-110 cursor-pointer`}
                  style={{
                    transform: `rotate(${cfg.baseRot}deg)`,
                  }}
                >
                  <img
                    src={cfg.img}
                    alt={cfg.alt}
                    className="w-20 sm:w-24 md:w-28 lg:w-32 h-auto object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.14)] block"
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Horizontal Baseline Rule */}
        <div
          ref={baselineRef}
          className="absolute left-6 right-6 sm:left-10 sm:right-10 md:left-14 md:right-14 bottom-8 sm:bottom-10 md:bottom-12 h-[1.5px] bg-[#c5c8c5] transition-opacity duration-300"
        />

        {/* Bottom-Right Monumental Number Counter */}
        <div
          ref={counterRef}
          className="absolute bottom-9 sm:bottom-11 md:bottom-13 right-6 sm:right-10 md:right-14 select-none pointer-events-none transition-opacity duration-300"
        >
          <span
            className="font-black text-7xl sm:text-8xl md:text-[130px] lg:text-[150px] leading-none tracking-tighter text-[#abadab] font-mono tabular-nums block -mb-1"
            style={{
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
              letterSpacing: "-0.06em",
            }}
          >
            {formattedNumber}
          </span>
        </div>
      </div>

      {/* 2. SYED FAISAL ANIMATED LOGO LAYER (z-[60] above the curtain) */}
      {/* Smoothly scales and flies from screen center to the navbar top-left corner */}
      {showLogo && (
        <div
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] pointer-events-none transition-opacity duration-300"
          style={{ opacity: logoOpacity }}
        >
          <div
            ref={flyingLogoRef}
            className="will-change-transform origin-center"
            style={{
              filter: "drop-shadow(0 12px 30px rgba(0,0,0,0.08))",
            }}
          >
            <div className="flex flex-col items-center justify-center rotate-[-2deg]">
              {/* Top Word: "SYED" coming from LEFT + Neon Lime Color Fill */}
              <div
                className="relative will-change-transform"
                style={{
                  transform: `translateX(${syedTranslateX}%)`,
                }}
              >
                {/* Base: Black Outline */}
                <img
                  src={syedOutline}
                  alt="SYED outline"
                  className="h-16 sm:h-20 md:h-24 lg:h-28 w-auto object-contain block"
                />

                {/* Color Fill: Neon Lime Green Liquid fills from bottom to top */}
                <div
                  className="absolute inset-0 overflow-hidden pointer-events-none"
                  style={{
                    clipPath: `inset(${100 - fillPercent}% 0 0 0)`,
                    transition: "clip-path 0.05s linear",
                  }}
                >
                  <img
                    src={syedFilled}
                    alt="SYED filled"
                    className="h-16 sm:h-20 md:h-24 lg:h-28 w-auto object-contain block"
                  />
                </div>
              </div>

              {/* Bottom Word: "FAISAL" coming from RIGHT + Electric Yellow Color Fill */}
              <div
                className="relative -mt-3 sm:-mt-4 md:-mt-6 will-change-transform"
                style={{
                  transform: `translateX(${faisalTranslateX}%)`,
                }}
              >
                {/* Base: Black Outline */}
                <img
                  src={faisalOutline}
                  alt="FAISAL outline"
                  className="h-24 sm:h-32 md:h-40 lg:h-44 w-auto object-contain block"
                />

                {/* Color Fill: Electric Yellow Liquid fills from bottom to top */}
                <div
                  className="absolute inset-0 overflow-hidden pointer-events-none"
                  style={{
                    clipPath: `inset(${100 - fillPercent}% 0 0 0)`,
                    transition: "clip-path 0.05s linear",
                  }}
                >
                  <img
                    src={faisalFilled}
                    alt="FAISAL filled"
                    className="h-24 sm:h-32 md:h-40 lg:h-44 w-auto object-contain block"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
