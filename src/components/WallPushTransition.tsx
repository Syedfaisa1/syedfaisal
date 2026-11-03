import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import lottie, { type AnimationItem } from "lottie-web"
import { initPoke } from "../utils/poke"
import { playSound } from "../utils/sound"

gsap.registerPlugin(ScrollTrigger)

interface WallPushTransitionProps {
  isLightMode?: boolean
}

const whatChars = "WHAT I".split("")
const buildChars = "BUILD".split("")

/**
 * 1:1 Clean Scroll-Driven Layer Transition: The Pushing Wall Layer (Right-to-Left)
 * 
 * Flow:
 * - Under-layer: Pure lime green (#b6fe00) paper texture continuity.
 * - Incoming layer: Dark Projects layer (#060a12) enters from the RIGHT edge, sweeping towards the LEFT.
 * - The Boy: Pushing the barrier seam from right to left, facing LEFT (scaleX(-1)),
 *   palms planted firmly on the seam, perfectly centered vertically (top: 50%).
 * - Next Section: Bold kinetic "WHAT I BUILD" follows behind his back on the incoming dark layer.
 * - Zero clutter: No unnecessary badges, pills, or switcher text.
 */
export default function WallPushTransition({
  isLightMode: _isLightMode = false,
}: WallPushTransitionProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const incomingLayerRef = useRef<HTMLDivElement | null>(null)
  const lottieContainerRef = useRef<HTMLDivElement | null>(null)
  const headlineRef = useRef<HTMLHeadingElement | null>(null)
  const animRef = useRef<AnimationItem | null>(null)
  const [lottieLoaded, setLottieLoaded] = useState(false)
  const lastSoundProgressRef = useRef(0)

  // Interactive Character Poke spring physics on headline hover
  useEffect(() => {
    const headline = headlineRef.current
    if (!headline) return

    const unbind = initPoke(headline, {
      selector: ".char",
      radiusMultiplier: 0.95,
      maxLift: 0.14,
      maxRotate: 14,
    })

    return () => unbind()
  }, [])

  // 1. Initialize Lottie Web with authentic huyml_push_lottie.json
  useEffect(() => {
    const container = lottieContainerRef.current
    if (!container) return

    let isMounted = true

    fetch("/assets/huyml_push_lottie.json")
      .then((res) => {
        if (!res.ok) throw new Error(`Lottie load failed: ${res.status}`)
        return res.json()
      })
      .then((animationData) => {
        if (!isMounted || !container) return

        container.innerHTML = ""
        const anim = lottie.loadAnimation({
          container,
          renderer: "svg",
          loop: false,
          autoplay: false,
          animationData,
          rendererSettings: {
            preserveAspectRatio: "xMidYMid meet",
            progressiveLoad: true,
            hideOnTransparent: true,
          },
        })

        animRef.current = anim

        anim.addEventListener("DOMLoaded", () => {
          if (!isMounted) return
          anim.goToAndStop(0, true)
          setLottieLoaded(true)
        })
      })
      .catch((err) => {
        console.warn("Could not load huyml push lottie:", err)
      })

    return () => {
      isMounted = false
      if (animRef.current) {
        animRef.current.destroy()
        animRef.current = null
      }
    }
  }, [])

  // 2. Scroll-Scrubbed Layer Transition
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const updateScene = (progress: number) => {
      const p = Math.max(0, Math.min(1.08, progress))
      container.style.setProperty("--push-progress", `${p}`)

      // Scrub Lottie character animation: Footsteps and pushing struggle
      const anim = animRef.current
      if (anim) {
        const totalFrames = anim.totalFrames || 116
        // 2.8 walking stride cycles across the screen width
        const cycle = ((p * totalFrames * 2.8) % totalFrames + totalFrames) % totalFrames
        anim.goToAndStop(cycle, true)
      }

      // Tactile sound at key stride thresholds
      if (Math.abs(p - lastSoundProgressRef.current) > 0.22) {
        lastSoundProgressRef.current = p
        playSound("hover")
      }
    }

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: "+=1400",
      pin: true,
      scrub: 0.8,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        updateScene(self.progress)
      },
    })

    return () => {
      trigger.kill()
    }
  }, [])

  return (
    <section
      ref={containerRef}
      id="wall-push"
      className="relative z-20 w-full h-screen overflow-hidden select-none bg-[#b6fe00]"
      style={
        {
          "--push-progress": "0",
        } as React.CSSProperties
      }
    >
      {/* ======================================================== */}
      {/* 1. UNDER-LAYER: OUTGOING "HOW I BUILD" CONTINUITY       */}
      {/* Pure lime green background with paper texture only       */}
      {/* ======================================================== */}
      <div className="absolute inset-0 bg-[#b6fe00] overflow-hidden z-0 pointer-events-none">
        {/* Authentic paper overlay */}
        <div
          className="absolute inset-0 opacity-25 mix-blend-multiply pointer-events-none"
          style={{
            backgroundImage: "url('/assets/paper-overlay.webp')",
            backgroundRepeat: "repeat",
            backgroundSize: "600px auto",
          }}
          aria-hidden="true"
        />
      </div>

      {/* ======================================================== */}
      {/* 2. INCOMING LAYER: DARK WALL ENTERING FROM RIGHT EDGE    */}
      {/* Expands from right: 0 to left (width: 0% -> 100%)        */}
      {/* ======================================================== */}
      <div
        ref={incomingLayerRef}
        className="absolute inset-y-0 right-0 bg-[#060a12] z-10 overflow-hidden will-change-[width] pointer-events-none"
        style={{
          width: "calc(min(108%, max(0%, var(--push-progress) * 100%)))",
        }}
      >
        {/* Left Seam Edge: Clean Boundary where hands push to the left */}
        <div className="absolute top-0 bottom-0 left-0 w-[3px] bg-[#b6fe00] opacity-90" />

        {/* Fixed Viewport Interior (Follows behind the boy's back on the right) */}
        <div className="absolute top-0 right-0 w-screen h-screen flex flex-col items-center justify-center overflow-hidden pointer-events-auto">
          {/* Dark paper overlay */}
          <div
            className="absolute inset-0 opacity-15 mix-blend-multiply pointer-events-none"
            style={{
              backgroundImage: "url('/assets/paper-overlay.webp')",
              backgroundRepeat: "repeat",
              backgroundSize: "700px auto",
            }}
            aria-hidden="true"
          />

          {/* PERSONAL PROJECTS Pill (Positioned above WHAT I BUILD) */}
          <div className="relative z-10 mb-3 select-none">
            <span className="inline-block text-[clamp(10px,1vw,14px)] font-black tracking-widest px-3.5 py-1 rounded-full rotate-[-1.5deg] uppercase shadow-sm bg-[#b6fe00] text-[#013900]">
              PERSONAL PROJECTS
            </span>
          </div>

          {/* Playable Curved/Spring Arched Headline: WHAT I BUILD with cursor hover poke animation */}
          <h2
            ref={headlineRef}
            aria-label="WHAT I BUILD"
            className="relative z-10 text-center font-sweet-tape font-black tracking-tight uppercase leading-[0.82] select-none cursor-pointer"
          >
            {/* Line 1: WHAT I in #004afd */}
            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
              {whatChars.map((ch, i) => (
                <span key={`what-${i}`} className="inline-block overflow-visible">
                  <span className="char inline-block will-change-transform text-[clamp(44px,9.5vw,140px)] text-[#004afd]">
                    {ch === " " ? "\u00A0" : ch}
                  </span>
                </span>
              ))}
            </div>

            {/* Line 2: BUILD in #b6fe00 */}
            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
              {buildChars.map((ch, i) => (
                <span key={`build-${i}`} className="inline-block overflow-visible">
                  <span className="char inline-block will-change-transform text-[clamp(60px,13.5vw,195px)] text-[#b6fe00]">
                    {ch === " " ? "\u00A0" : ch}
                  </span>
                </span>
              ))}
            </div>
          </h2>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. THE BOY: FACING LEFT, PUSHING TOWARDS THE LEFT        */}
      {/* Hands and palms 100% flush-aligned with the glowing line */}
      {/* ======================================================== */}
      <div
        className="absolute top-1/2 z-30 pointer-events-none will-change-[left]"
        style={{
          left: "calc(100% - min(108%, max(0%, var(--push-progress) * 100%)))",
          transform: "translate(-11.0%, -50%) scaleX(-1)",
          width: "clamp(340px, 42vw, 620px)",
          height: "clamp(360px, 44vw, 650px)",
          opacity: lottieLoaded ? 1 : 0,
          transition: "opacity 0.2s ease-out",
        }}
      >
        {/* Lottie SVG Render Target */}
        <div
          ref={lottieContainerRef}
          className="w-full h-full"
        />
      </div>
    </section>
  )
}
