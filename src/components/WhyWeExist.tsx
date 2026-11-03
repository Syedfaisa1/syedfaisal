import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { initPoke } from "../utils/poke"
import StickerPeel from "./StickerPeel"
import stickerDesignerArt from "../assets/what-i-do/Curly-Haired Designer Creating UI Art-Photoroom.png"
import whatIDo1 from "../assets/what-i-do/whatIDo (1).png"
import whatIDo2 from "../assets/what-i-do/whatIDo (2).png"
import whatIDo4 from "../assets/what-i-do/whatIDo (4).png"
import whatIDo5 from "../assets/what-i-do/whatIDo (5).png"
import stickerItsWorking from "../assets/what-i-do/its-working.png"

gsap.registerPlugin(ScrollTrigger)

interface WhyWeExistProps {
  isLightMode?: boolean
}

export default function WhyWeExist({ isLightMode: _isLightMode = false }: WhyWeExistProps) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const canvasRef = useRef<HTMLDivElement | null>(null)
  const propCardsRef = useRef<(HTMLImageElement | HTMLDivElement | null)[]>([])
  const topHeadingRef = useRef<HTMLHeadingElement | null>(null)
  const row1HeadingRef = useRef<HTMLHeadingElement | null>(null)
  const row2HeadingRef = useRef<HTMLHeadingElement | null>(null)
  const row3HeadingRef = useRef<HTMLHeadingElement | null>(null)

  const renderChars = (text: string) => {
    return text.split("").map((ch, i) => (
      <span key={i} className="inline-block overflow-visible">
        <span className="char inline-block will-change-transform">
          {ch === " " ? "\u00A0" : ch}
        </span>
      </span>
    ))
  }

  // Interactive Character Poke spring physics on hover
  useEffect(() => {
    const unbinds = [
      topHeadingRef.current
        ? initPoke(topHeadingRef.current, {
            selector: ".char",
            radiusMultiplier: 0.9,
            maxLift: 0.12,
            maxRotate: 12,
          })
        : null,
      row1HeadingRef.current
        ? initPoke(row1HeadingRef.current, {
            selector: ".char",
            radiusMultiplier: 0.85,
            maxLift: 0.1,
            maxRotate: 10,
          })
        : null,
      row2HeadingRef.current
        ? initPoke(row2HeadingRef.current, {
            selector: ".char",
            radiusMultiplier: 0.85,
            maxLift: 0.1,
            maxRotate: 10,
          })
        : null,
      row3HeadingRef.current
        ? initPoke(row3HeadingRef.current, {
            selector: ".char",
            radiusMultiplier: 0.85,
            maxLift: 0.1,
            maxRotate: 10,
          })
        : null,
    ]

    return () => {
      unbinds.forEach((unbind) => unbind?.())
    }
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    const canvas = canvasRef.current
    if (!section || !canvas) return

    const ctx = gsap.context(() => {
      // MASTER TIMELINE:
      // Phase 1: Pure Vertical Rise
      //   - Top heading scrolls up and offscreen
      //   - Row 1 "TO DESIGN" rises from below into central view (x = 0vw)
      // Phase 2: Smooth pan across Row 1 "TO DESIGN"
      // Phase 3: Diagonal descent to Row 2 "TO CODE" Start (VS Code card centered)
      // Phase 4: Smooth pan across Row 2 "TO CODE"
      // Phase 5: Diagonal ascent to Row 3 "TO SHIP" Start (Cloud Deploy card centered)
      // Phase 6: Smooth pan across Row 3 "TO SHIP"
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=4600",
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      // 1. Phase 1: Pure Vertical Rise (Heading scrolls UP, Row 1 enters center)
      tl.fromTo(
        canvas,
        { x: "0vw", y: "0vh" },
        {
          x: "0vw",
          y: "-54vh",
          duration: 1.25,
          ease: "power2.inOut",
        }
      )
        // 2. Phase 2: Smooth horizontal pan through Row 1 "TO DESIGN"
        .to(canvas, {
          x: "-95vw",
          y: "-54vh",
          duration: 1.6,
          ease: "power1.inOut",
        })
        // 3. Diagonal flight down to Row 2 "TO CODE" Start (VS Code card centered)
        .to(canvas, {
          x: "-190vw",
          y: "-114vh",
          duration: 1.4,
          ease: "power1.inOut",
        })
        // 4. Smooth horizontal pan through Row 2 "TO CODE"
        .to(canvas, {
          x: "-290vw",
          y: "-114vh",
          duration: 1.6,
          ease: "power1.inOut",
        })
        // 5. Diagonal flight up to Row 3 "TO SHIP" Start (Cloud Deploy card, Telemetry, and It's Working sticker all fully visible)
        .to(canvas, {
          x: "-392vw",
          y: "-54vh",
          duration: 1.4,
          ease: "power1.inOut",
        })
        // 6. Smooth horizontal pan settling on Telemetry & It's Working sticker
        .to(canvas, {
          x: "-418vw",
          y: "-54vh",
          duration: 1.2,
          ease: "power1.inOut",
        })

      // Multi-layer Parallax drift on floating product props and cards (gentle, zero-collision)
      propCardsRef.current.forEach((card, idx) => {
        if (!card) return
        const driftFactor = (idx % 2 === 0 ? 1 : -1) * (12 + (idx % 3) * 6)
        const rotFactor = (idx % 2 === 0 ? 1 : -1) * 2.5

        gsap.to(card, {
          x: driftFactor,
          rotation: `+=${rotFactor}`,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=4600",
            scrub: true,
          },
        })
      })
    }, section)

    return () => {
      ctx.revert()
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      id="how-i-build"
      className="relative z-10 w-full h-screen overflow-hidden bg-[#b6fe00] text-[#013900] select-none"
      style={{
        backgroundColor: "#b6fe00",
      }}
    >
      {/* 1. CRUMPLED / FOLDED PAPER TEXTURE OVERLAY (Matches Sweet Tape 1:1) */}
      <div
        className="absolute inset-0 pointer-events-none z-20 opacity-25 mix-blend-multiply"
        style={{
          backgroundImage: "url('/assets/paper-overlay.webp')",
          backgroundRepeat: "repeat",
          backgroundSize: "600px auto",
        }}
        aria-hidden="true"
      />

      {/* 2. GIANT SCROLLING 2D CANVAS */}
      <div
        ref={canvasRef}
        className="absolute inset-0 w-[580vw] h-[240vh] will-change-transform"
      >
        {/* ======================================================== */}
        {/* 0. TOP TITLE BLOCK (Matches Image 1 & Image 2)           */}
        {/* Centered initially, scrolls UP & out of view in Image 3  */}
        {/* ======================================================== */}
        <div
          className="absolute flex flex-col items-center gap-3 sm:gap-5 z-10 select-none"
          style={{
            left: "0vw",
            top: "12vh",
            width: "100vw",
            textAlign: "center",
          }}
        >
          {/* Subhead Badge with 3 dots on the left */}
          <div className="inline-flex items-center gap-2 bg-[#013900] text-[#b6fe00] px-4 py-1.5 sm:px-5 sm:py-2 rounded-lg -rotate-2 shadow-sm">
            <span
              className="flex flex-col gap-0.5 justify-center opacity-80"
              aria-hidden="true"
            >
              <span className="w-1 h-1 rounded-full bg-[#b6fe00]" />
              <span className="w-1 h-1 rounded-full bg-[#b6fe00]" />
              <span className="w-1 h-1 rounded-full bg-[#b6fe00]" />
            </span>
            <span className="font-sweet-tape text-xs sm:text-sm md:text-base font-black tracking-wider uppercase">
              HOW I BUILD
            </span>
          </div>

          {/* Bold Grotesque Heading (3 Stacked Lines) - Scaled down for sleek breathing room with character poke */}
          <h2
            ref={topHeadingRef}
            className="font-sweet-tape text-center text-[#013900] font-black uppercase text-[40px] sm:text-[60px] md:text-[76px] lg:text-[88px] leading-[0.86] tracking-tight m-0 select-none cursor-pointer"
          >
            <span className="block">{renderChars("TURNING IDEAS")}</span>
            <span className="block">{renderChars("INTO TACTILE")}</span>
            <span className="block">{renderChars("EXPERIENCES.")}</span>
          </h2>
        </div>

        {/* ======================================================== */}
        {/* 1. ROW 1: "TO DESIGN"                                   */}
        {/* ======================================================== */}
        <div
          className="absolute flex items-center z-10"
          style={{
            left: "6vw",
            top: "84vh",
          }}
        >
          <div className="relative flex items-center">
            {/* Giant Heading */}
            <h2
              ref={row1HeadingRef}
              className="font-sweet-tape text-[clamp(110px,26vw,310px)] font-black leading-[0.82] tracking-tighter m-0 flex items-center text-[#013900] whitespace-nowrap cursor-pointer select-none"
            >
              {/* Hand-drawn Circular Index Doodle (1) */}
              <img
                src="/assets/index-1.svg"
                alt="(1)"
                className="self-start w-[clamp(32px,3.2vw,56px)] h-auto mr-[1.4vw] mt-[2.2vw]"
              />

              <span>{renderChars("TO")}</span>

              {/* Figma Design System Card Taped into the Word */}
              <div
                className="relative inline-flex items-center justify-center mx-[1.8vw] z-20 cursor-pointer group"
                style={{
                  width: "clamp(160px,20vw,320px)",
                  transform: "rotate(3deg) translateY(-1vw)",
                }}
              >
                <img
                  src="/assets/dev/design-system-figma.svg"
                  alt="Figma Design System Architecture"
                  className="w-full h-auto rounded-[1.3vw] shadow-2xl transition-transform duration-300 group-hover:scale-105"
                />
                {/* Masking Tape Strip across the card */}
                <img
                  src="/assets/opp-tape-x4.png"
                  alt=""
                  className="absolute -top-[1.6vw] left-1/2 -translate-x-1/2 w-[clamp(75px,11vw,150px)] h-auto pointer-events-none drop-shadow"
                />
              </div>

              <span>{renderChars("DESIGN")}</span>
            </h2>

            {/* Handwritten Note below the Card with cross-rule */}
            <div
              className="absolute z-20 pointer-events-none select-none"
              style={{
                left: "22vw",
                top: "86%",
              }}
            >
              <div className="relative pl-3.5 pt-2">
                <svg
                  className="absolute -top-1 -left-1 w-8 h-8 stroke-[#013900] stroke-[1.5] fill-none overflow-visible"
                  viewBox="0 0 32 32"
                  aria-hidden="true"
                >
                  <path d="M6 -4 L6 36" />
                  <path d="M-4 6 L48 6" />
                </svg>
                <div className="text-[#013900] font-sans text-[clamp(11px,1.3vw,18px)] leading-tight font-medium italic lowercase">
                  every great product
                  <br />
                  begins with palette,
                  <br />
                  purpose &amp; shape.
                </div>
              </div>
            </div>

            {/* Sticker 1: Curly-Haired Designer Creating UI Art */}
            <div
              className="absolute z-20 pointer-events-auto"
              style={{
                left: "88vw",
                top: "14%",
                width: "clamp(180px,21vw,310px)",
                height: "clamp(180px,21vw,310px)",
                overflow: "visible",
              }}
            >
              <StickerPeel
                imageSrc={stickerDesignerArt}
                width={260}
                rotate={4}
                finish="gloss"
                curlRadius={14}
                shadowIntensity={0.65}
                swing={1.2}
                draggable={true}
                confine={false}
              />
            </div>

            {/* Floating Card 1: Mobile Prototype UI Card */}
            <div
              ref={(el) => {
                propCardsRef.current[1] = el
              }}
              className="absolute z-20 pointer-events-auto cursor-pointer group"
              style={{
                left: "114vw",
                top: "-18%",
                width: "clamp(120px,14vw,210px)",
                transform: "rotate(-7deg)",
              }}
            >
              <img
                src="/assets/dev/mobile-prototype-ui.svg"
                alt="Mobile Prototype UI"
                className="w-full h-auto rounded-[1.2vw] shadow-2xl transition-transform duration-300 group-hover:scale-105"
              />
              <img
                src="/assets/opp-tape-x4.png"
                alt=""
                className="absolute -top-[1.2vw] left-1/2 -translate-x-1/2 w-[9vw] h-auto drop-shadow"
              />
            </div>

            {/* Floating Tag Card: Zero Jank Tag */}
            <img
              ref={(el) => {
                propCardsRef.current[2] = el
              }}
              src="/assets/dev/tag-zero-jank.svg"
              alt="Zero Jank Tag"
              className="absolute z-10 pointer-events-none drop-shadow-xl"
              style={{
                left: "132vw",
                top: "42%",
                width: "clamp(130px,16vw,240px)",
                transform: "rotate(-10deg)",
              }}
            />

            {/* Sticker 2: What I Do 1 (Ideation & Workflow) */}
            <div
              className="absolute z-20 pointer-events-auto"
              style={{
                left: "152vw",
                top: "-14%",
                width: "clamp(160px,19vw,290px)",
                height: "clamp(160px,19vw,290px)",
                overflow: "visible",
              }}
            >
              <StickerPeel
                imageSrc={whatIDo1}
                width={240}
                rotate={3}
                finish="gloss"
                curlRadius={12}
                shadowIntensity={0.6}
                swing={1.1}
                draggable={true}
                confine={false}
              />
            </div>
          </div>
        </div>

        {/* Diagonal Down Doodle Arrow from Row 1 to Row 2 */}
        <div
          className="absolute z-10 pointer-events-none text-[#013900]/70"
          style={{
            left: "182vw",
            top: "98vh",
            width: "clamp(130px,22vw,300px)",
            height: "clamp(80px,14vw,200px)",
          }}
        >
          <svg
            viewBox="0 0 150 100"
            fill="none"
            className="w-full h-full stroke-current stroke-[3] stroke-linecap-round stroke-linejoin-round"
          >
            <path d="M4 8 C 46 14 100 42 132 84" />
            <path d="M111 80 L132 84 L123 65" />
          </svg>
        </div>

        {/* ======================================================== */}
        {/* 2. ROW 2: "TO CODE"                                      */}
        {/* ======================================================== */}
        <div
          className="absolute flex items-center z-10"
          style={{
            left: "210vw",
            top: "144vh",
          }}
        >
          <div className="relative flex items-center">
            {/* Giant Heading */}
            <h2
              ref={row2HeadingRef}
              className="font-sweet-tape text-[clamp(110px,26vw,310px)] font-black leading-[0.82] tracking-tighter m-0 flex items-center text-[#013900] whitespace-nowrap cursor-pointer select-none"
            >
              {/* Hand-drawn Circular Index Doodle (2) */}
              <img
                src="/assets/index-2.svg"
                alt="(2)"
                className="self-start w-[clamp(32px,3.2vw,56px)] h-auto mr-[1.4vw] mt-[2.2vw]"
              />

              <span>{renderChars("TO")}</span>

              {/* VS Code Editor Card Taped into the Word */}
              <div
                className="relative inline-flex items-center justify-center mx-[1.8vw] z-20 cursor-pointer group"
                style={{
                  width: "clamp(160px,20vw,320px)",
                  transform: "rotate(4deg) translateY(-1vw)",
                }}
              >
                <img
                  src="/assets/dev/code-editor-vscode.svg"
                  alt="VS Code IDE Development"
                  className="w-full h-auto rounded-[1.3vw] shadow-2xl transition-transform duration-300 group-hover:scale-105"
                />
                {/* Black Cloth Tape Strip */}
                <img
                  src="/assets/black-cloth-tape-x4.png"
                  alt=""
                  className="absolute -top-[1.6vw] left-1/2 -translate-x-1/2 w-[clamp(75px,11vw,150px)] h-auto pointer-events-none drop-shadow"
                />
              </div>

              <span>{renderChars("CODE")}</span>
            </h2>

            {/* Floating Card 2: Developer Terminal / CLI Window */}
            <div
              ref={(el) => {
                propCardsRef.current[4] = el
              }}
              className="absolute z-20 pointer-events-auto cursor-pointer group"
              style={{
                left: "82vw",
                top: "20%",
                width: "clamp(140px,17vw,260px)",
                transform: "rotate(-4deg)",
              }}
            >
              <img
                src="/assets/dev/terminal-cli.svg"
                alt="Developer Terminal & Build CLI"
                className="w-full h-auto rounded-[1.2vw] shadow-2xl transition-transform duration-300 group-hover:scale-105"
              />
              <img
                src="/assets/black-cloth-tape-x4.png"
                alt=""
                className="absolute -top-[1.2vw] left-1/2 -translate-x-1/2 w-[10vw] h-auto drop-shadow"
              />
            </div>

            {/* Sticker 3: What I Do 2 (Coding Mode) */}
            <div
              className="absolute z-20 pointer-events-auto"
              style={{
                left: "105vw",
                top: "-22%",
                width: "clamp(160px,19vw,290px)",
                height: "clamp(160px,19vw,290px)",
                overflow: "visible",
              }}
            >
              <StickerPeel
                imageSrc={whatIDo2}
                width={240}
                rotate={5}
                finish="gloss"
                curlRadius={12}
                shadowIntensity={0.6}
                swing={1.1}
                draggable={true}
                confine={false}
              />
            </div>

            {/* Sticker 4: What I Do 4 (Good Ideas & Coffee) */}
            <div
              className="absolute z-20 pointer-events-auto"
              style={{
                left: "128vw",
                top: "18%",
                width: "clamp(160px,19vw,290px)",
                height: "clamp(160px,19vw,290px)",
                overflow: "visible",
              }}
            >
              <StickerPeel
                imageSrc={whatIDo4}
                width={240}
                rotate={-4}
                finish="gloss"
                curlRadius={13}
                shadowIntensity={0.65}
                swing={1.1}
                draggable={true}
                confine={false}
              />
            </div>

            {/* Sticker 5: What I Do 5 (Deep Focus Engineering) */}
            <div
              className="absolute z-20 pointer-events-auto"
              style={{
                left: "152vw",
                top: "-16%",
                width: "clamp(150px,18vw,270px)",
                height: "clamp(150px,18vw,270px)",
                overflow: "visible",
              }}
            >
              <StickerPeel
                imageSrc={whatIDo5}
                width={230}
                rotate={6}
                finish="gloss"
                curlRadius={12}
                shadowIntensity={0.6}
                swing={1.0}
                draggable={true}
                confine={false}
              />
            </div>

            {/* Handwritten Note 2 with cross-rule */}
            <div
              className="absolute z-20 pointer-events-none select-none"
              style={{
                left: "18vw",
                top: "-26%",
              }}
            >
              <div className="relative pl-3.5 pt-2">
                <svg
                  className="absolute -top-1 -left-1 w-8 h-8 stroke-[#013900] stroke-[1.5] fill-none overflow-visible"
                  viewBox="0 0 32 32"
                  aria-hidden="true"
                >
                  <path d="M6 -4 L6 36" />
                  <path d="M-4 6 L48 6" />
                </svg>
                <div className="text-[#013900] font-sans text-[clamp(11px,1.3vw,18px)] leading-tight font-medium italic lowercase">
                  modular architecture,
                  <br />
                  zero jank &amp;
                  <br />
                  living physics.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Diagonal Up Doodle Arrow from Row 2 to Row 3 */}
        <div
          className="absolute z-10 pointer-events-none text-[#013900]/70"
          style={{
            left: "372vw",
            top: "112vh",
            width: "clamp(130px,20vw,280px)",
            height: "clamp(80px,13vw,190px)",
          }}
        >
          <svg
            viewBox="0 0 150 100"
            fill="none"
            className="w-full h-full stroke-current stroke-[3] stroke-linecap-round stroke-linejoin-round"
          >
            <path d="M4 92 C 46 86 100 58 132 16" />
            <path d="M111 20 L132 16 L123 35" />
          </svg>
        </div>

        {/* ======================================================== */}
        {/* 3. ROW 3: "TO SHIP"                                      */}
        {/* ======================================================== */}
        <div
          className="absolute flex items-center z-10"
          style={{
            left: "395vw",
            top: "84vh",
          }}
        >
          <div className="relative flex items-center">
            {/* Giant Heading */}
            <h2
              ref={row3HeadingRef}
              className="font-sweet-tape text-[clamp(110px,26vw,310px)] font-black leading-[0.82] tracking-tighter m-0 flex items-center text-[#013900] whitespace-nowrap cursor-pointer select-none"
            >
              {/* Hand-drawn Circular Index Doodle (3) */}
              <img
                src="/assets/index-3.svg"
                alt="(3)"
                className="self-start w-[clamp(32px,3.2vw,56px)] h-auto mr-[1.4vw] mt-[2.2vw]"
              />

              <span>{renderChars("TO")}</span>

              {/* Cloud Deployment Dashboard Card Taped into the Word */}
              <div
                className="relative inline-flex items-center justify-center mx-[1.8vw] z-20 cursor-pointer group"
                style={{
                  width: "clamp(150px,17vw,290px)",
                  transform: "rotate(-3.5deg) translateY(-1vw)",
                }}
              >
                <img
                  src="/assets/dev/cloud-deploy-dashboard.svg"
                  alt="Cloud Production CI/CD Dashboard"
                  className="w-full h-auto rounded-[1.3vw] shadow-2xl transition-transform duration-300 group-hover:scale-105"
                />
                {/* OPP Tape Strip */}
                <img
                  src="/assets/opp-tape-x4.png"
                  alt=""
                  className="absolute -top-[1.6vw] left-1/2 -translate-x-1/2 w-[clamp(75px,11vw,150px)] h-auto pointer-events-none drop-shadow"
                />
              </div>

              <span>{renderChars("SHIP")}</span>
            </h2>

            {/* Floating Card 3: Real-Time Telemetry & Systems Analytics */}
            <div
              ref={(el) => {
                propCardsRef.current[8] = el
              }}
              className="absolute z-20 pointer-events-auto cursor-pointer group"
              style={{
                left: "58vw",
                top: "10%",
                width: "clamp(130px,15vw,230px)",
                transform: "rotate(4deg)",
              }}
            >
              <img
                src="/assets/dev/telemetry-analytics.svg"
                alt="Real-time Systems Telemetry"
                className="w-full h-auto rounded-[1.2vw] shadow-2xl transition-transform duration-300 group-hover:scale-105"
              />
              <img
                src="/assets/opp-tape-x4.png"
                alt=""
                className="absolute -top-[1.2vw] left-1/2 -translate-x-1/2 w-[10vw] h-auto drop-shadow"
              />
            </div>

            {/* Sticker: It's Working! (Small wins, big motivation) */}
            <div
              className="absolute z-20 pointer-events-auto"
              style={{
                left: "77vw",
                top: "-8%",
                width: "clamp(160px,19vw,280px)",
                height: "clamp(160px,19vw,280px)",
                overflow: "visible",
              }}
            >
              <StickerPeel
                imageSrc={stickerItsWorking}
                width={250}
                rotate={-3}
                finish="gloss"
                curlRadius={14}
                shadowIntensity={0.7}
                swing={1.3}
                draggable={true}
                confine={false}
              />
            </div>

            {/* Handwritten Note 3 with cross-rule */}
            <div
              className="absolute z-20 pointer-events-none select-none"
              style={{
                left: "18vw",
                top: "86%",
              }}
            >
              <div className="relative pl-3.5 pt-2">
                <svg
                  className="absolute -top-1 -left-1 w-8 h-8 stroke-[#013900] stroke-[1.5] fill-none overflow-visible"
                  viewBox="0 0 32 32"
                  aria-hidden="true"
                >
                  <path d="M6 -4 L6 36" />
                  <path d="M-4 6 L48 6" />
                </svg>
                <div className="text-[#013900] font-sans text-[clamp(11px,1.35vw,18px)] leading-tight font-medium italic lowercase">
                  production ready,
                  <br />
                  60fps fluid,
                  <br />
                  built to convert.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
