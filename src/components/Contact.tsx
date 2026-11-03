import { useEffect, useRef, useState } from "react"
import { initPoke } from "../utils/poke"
import { playSound } from "../utils/sound"

interface ContactProps {
  isLightMode?: boolean
}

export default function Contact({ isLightMode: _isLightMode = false }: ContactProps) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const titleRef = useRef<HTMLHeadingElement | null>(null)
  const noteRef = useRef<HTMLDivElement | null>(null)

  const [copiedField, setCopiedField] = useState<string | null>(null)

  // 1. Text Poke Interaction on Headline: LET'S STICK TOGETHER
  useEffect(() => {
    const unbindTitle = initPoke(titleRef.current, {
      selector: ".char",
      radiusMultiplier: 0.85,
    })

    return () => {
      unbindTitle()
    }
  }, [])

  // 2. 3D Interactive Tilting Sticky Note (reacts playfully to pointer movement)
  useEffect(() => {
    const note = noteRef.current
    if (!note) return

    let currentTiltX = 0
    let currentTiltY = 0
    let targetTiltX = 0
    let targetTiltY = 0
    let rafId = 0

    const onPointerMove = (e: PointerEvent) => {
      const rect = note.getBoundingClientRect()
      const noteCenterX = rect.left + rect.width / 2
      const noteCenterY = rect.top + rect.height / 2

      const dx = (e.clientX - noteCenterX) / (window.innerWidth / 2)
      const dy = (e.clientY - noteCenterY) / (window.innerHeight / 2)

      targetTiltX = Math.max(-14, Math.min(14, -dy * 18))
      targetTiltY = Math.max(-16, Math.min(16, dx * 20))
    }

    const onPointerLeave = () => {
      targetTiltX = 0
      targetTiltY = 0
    }

    const updateTilt = () => {
      currentTiltX += (targetTiltX - currentTiltX) * 0.08
      currentTiltY += (targetTiltY - currentTiltY) * 0.08

      if (note) {
        note.style.transform = `perspective(900px) rotateX(${currentTiltX.toFixed(
          2
        )}deg) rotateY(${currentTiltY.toFixed(2)}deg) rotate(-3.5deg)`
      }

      rafId = requestAnimationFrame(updateTilt)
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true })
    window.addEventListener("pointerleave", onPointerLeave, { passive: true })
    rafId = requestAnimationFrame(updateTilt)

    return () => {
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("pointerleave", onPointerLeave)
      cancelAnimationFrame(rafId)
    }
  }, [])

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      playSound("pop", 0.9)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2400)
    })
  }

  const line1Chars = "LET’S STICK".split("")
  const line2Chars = "TOGETHER".split("")

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="contact-section relative w-full bg-[#b6fe00] text-[#013900] py-16 sm:py-24 md:py-32 select-none overflow-hidden transition-colors duration-500"
      style={{
        backgroundColor: "#b6fe00",
        color: "#013900",
      }}
    >
      {/* A. Paper Crumple Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20 mix-blend-multiply z-0"
        style={{
          backgroundImage: "url('/assets/paper-overlay.webp')",
          backgroundRepeat: "repeat",
          backgroundSize: "700px auto",
        }}
        aria-hidden="true"
      />

      {/* B. Two-Column Layout: Left Text & Right Sticky Note */}
      <div className="relative z-10 w-[92vw] max-w-6xl mx-auto flex flex-col lg:flex-row items-center lg:items-center justify-between gap-12 lg:gap-16">
        {/* LEFT SIDE: Big Headline & Intro Text */}
        <div className="flex-1 flex flex-col items-start text-left max-w-2xl">
          {/* Chip Badge */}
          <div className="inline-block text-[clamp(11px,1.15vw,16px)] font-black tracking-widest bg-[#013900] text-[#b6fe00] px-4 py-1.5 rounded-full rotate-[-2deg] mb-4 uppercase shadow-sm">
            GET IN TOUCH
          </div>

          {/* 1:1 Pokable Big Arched Headline: LET'S STICK TOGETHER */}
          <h1
            ref={titleRef}
            aria-label="LET’S STICK TOGETHER"
            className="contact-title font-sweet-tape font-extrabold tracking-tight text-[clamp(44px,9vw,120px)] leading-[0.82] uppercase cursor-pointer select-none text-left m-0"
          >
            {/* Line 1: LET'S STICK */}
            <span
              className="line flex items-end justify-start"
              style={{ ["--letters" as string]: 11 }}
            >
              {line1Chars.map((ch, i) => (
                <span
                  key={i}
                  className="clip"
                  style={{ ["--i" as string]: i }}
                >
                  <span className="char inline-block will-change-transform transition-transform">
                    {ch === " " ? "\u00A0" : ch}
                  </span>
                </span>
              ))}
            </span>

            {/* Line 2: TOGETHER */}
            <span
              className="line flex items-end justify-start mt-[-0.04em]"
              style={{ ["--letters" as string]: 8 }}
            >
              {line2Chars.map((ch, i) => (
                <span
                  key={i}
                  className="clip"
                  style={{ ["--i" as string]: i }}
                >
                  <span className="char inline-block will-change-transform transition-transform">
                    {ch === " " ? "\u00A0" : ch}
                  </span>
                </span>
              ))}
            </span>
          </h1>

          {/* Descriptive Subtitle */}
          <p className="mt-6 text-base sm:text-lg md:text-xl font-bold text-[#013900]/80 leading-relaxed max-w-lg">
            Have a project in mind, want to collaborate on modern fullstack development,
            or create award-winning interactive experiences? Let&apos;s build something extraordinary.
          </p>

          {/* Quick Action Pill Button */}
          <div className="mt-8 flex items-center gap-4">
            <a
              href="mailto:faisalsyed7786@gmail.com"
              onClick={() => playSound("click")}
              onMouseEnter={() => playSound("hover")}
              className="inline-flex items-center gap-2 bg-[#013900] hover:bg-black text-[#b6fe00] font-sweet-tape font-black text-base sm:text-lg px-6 py-3.5 rounded-full no-underline transition-all duration-300 shadow-md hover:scale-105 active:scale-95"
            >
              <span>SEND AN EMAIL</span>
              <span className="text-sm">↗</span>
            </a>

            <a
              href="tel:+919010006532"
              onClick={() => playSound("click")}
              onMouseEnter={() => playSound("hover")}
              className="inline-flex items-center gap-2 bg-transparent hover:bg-[#013900]/10 text-[#013900] border-2 border-[#013900] font-sweet-tape font-black text-base sm:text-lg px-6 py-3 rounded-full no-underline transition-all duration-300"
            >
              <span>CALL DIRECTLY</span>
            </a>
          </div>
        </div>

        {/* RIGHT SIDE: Interactive Pinned Sticky Note with Masking Tape */}
        <div className="flex-shrink-0 w-full max-w-[340px] sm:max-w-[400px] md:max-w-[440px] relative">
          <div
            ref={noteRef}
            className="contact-note relative w-full will-change-transform"
            style={{
              transformOrigin: "50% 15%",
            }}
          >
            {/* Real Masking Tape Pin Strip on Top Edge */}
            <div className="absolute -top-6 sm:-top-7 left-1/2 -translate-x-1/2 w-44 sm:w-52 z-30 pointer-events-none drop-shadow-md">
              <img
                src="/assets/masking-tape-x2.png"
                alt="Masking Tape Strip"
                className="w-full h-auto rotate-[-3deg] select-none"
                draggable={false}
              />
            </div>

            {/* Note Paper Background */}
            <div
              className="w-full rounded-2xl sm:rounded-3xl p-6 sm:p-8 pt-9 sm:pt-10 shadow-[0_25px_50px_rgba(0,0,0,0.25)] flex flex-col justify-between overflow-hidden text-[#7b5406] border border-amber-300/40"
              style={{
                background: "linear-gradient(180deg, #f9dd55 0%, #f2cf3e 100%)",
              }}
            >
              {/* EMAIL Entry */}
              <div className="flex flex-col gap-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="bg-[#7b5406] text-[#fedd49] text-xs font-black px-3 py-1 rounded-full inline-flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#fedd49]" />
                    EMAIL
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard("faisalsyed7786@gmail.com", "email")
                    }
                    onMouseEnter={() => playSound("hover")}
                    className="font-mono text-[11px] font-bold text-[#7b5406] hover:text-black uppercase tracking-wider bg-black/5 hover:bg-black/10 px-2.5 py-1 rounded-md transition-all cursor-pointer"
                  >
                    {copiedField === "email" ? "COPIED! ✓" : "COPY"}
                  </button>
                </div>

                <a
                  href="mailto:faisalsyed7786@gmail.com"
                  onClick={() => playSound("click")}
                  onMouseEnter={() => playSound("hover")}
                  className="font-sweet-tape font-extrabold text-xl sm:text-2xl tracking-tight text-[#7b5406] hover:text-[#013900] transition-colors no-underline break-all mt-1"
                >
                  faisalsyed7786@gmail.com
                </a>
                <div className="w-full border-b-2 border-dashed border-[#7b5406]/35 my-2" />
              </div>

              {/* PHONE Entry */}
              <div className="flex flex-col gap-2 pb-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="bg-[#7b5406] text-[#fedd49] text-xs font-black px-3 py-1 rounded-full inline-flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#fedd49]" />
                    PHONE
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard("+91 901 000 6532", "phone")
                    }
                    onMouseEnter={() => playSound("hover")}
                    className="font-mono text-[11px] font-bold text-[#7b5406] hover:text-black uppercase tracking-wider bg-black/5 hover:bg-black/10 px-2.5 py-1 rounded-md transition-all cursor-pointer"
                  >
                    {copiedField === "phone" ? "COPIED! ✓" : "COPY"}
                  </button>
                </div>

                <a
                  href="tel:+919010006532"
                  onClick={() => playSound("click")}
                  onMouseEnter={() => playSound("hover")}
                  className="font-sweet-tape font-extrabold text-xl sm:text-2xl tracking-tight text-[#7b5406] hover:text-[#013900] transition-colors no-underline mt-1"
                >
                  +91 901 000 6532
                </a>
                <div className="w-full border-b-2 border-dashed border-[#7b5406]/35 my-2" />
              </div>

              {/* Footer Stamp on Note */}
              <div className="flex items-center justify-between pt-2 text-[#7b5406]/70 text-[11px] font-mono font-bold uppercase tracking-wider">
                <span>📍 HYDERABAD / REMOTE</span>
                <span>AVAILABILITY: OPEN</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
