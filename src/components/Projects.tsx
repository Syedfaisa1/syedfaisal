import { useState, useRef, useEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { playSound } from "../utils/sound"

gsap.registerPlugin(ScrollTrigger)

interface ProjectsProps {
  isLightMode?: boolean
}

interface ProjectCardData {
  id: string
  number: string
  tabLabel: string
  date: string
  title: string
  subtitle: string
  description: string
  tags: string[]
  tapeImg: string
  bgColor: string
  textColor: string
  descColor: string
  tagBg: string
  tagText: string
  tagBorder: string
  tabBg: string
  tabText: string
  tabLeftClass: string
  accentColor: string
  buttonBg: string
  buttonText: string
  liveUrl?: string
  githubUrl?: string
}

const PROJECTS_DATA: ProjectCardData[] = [
  {
    id: "locomotive",
    number: "01",
    tabLabel: "+ PROJECT 01",
    date: "● APR 12, 2026",
    title: "Locomotive",
    subtitle: "Fluid 3D Physics E-Commerce",
    description:
      "From 'who owes who' to an interactive 3D physics store that finally feels tactile, playful, and responsive.",
    tags: ["REACT", "THREE.JS", "MATTER.JS", "GSAP", "TAILWIND"],
    tapeImg: "/assets/dev/project-locomotive.svg",
    bgColor: "#191a1d",
    textColor: "#ffffff",
    descColor: "#a1a1aa",
    tagBg: "rgba(255, 255, 255, 0.08)",
    tagText: "#e4e4e7",
    tagBorder: "rgba(255, 255, 255, 0.12)",
    tabBg: "#2563eb",
    tabText: "#ffffff",
    tabLeftClass: "left-0",
    accentColor: "#2563eb",
    buttonBg: "#2563eb",
    buttonText: "#ffffff",
    liveUrl: "https://sweet-tape.com",
    githubUrl: "https://github.com",
  },
  {
    id: "nexus-suite",
    number: "02",
    tabLabel: "+ PROJECT 02",
    date: "● MAR 2, 2026",
    title: "Forge & Nexus",
    subtitle: "Enterprise Analytics & System",
    description:
      "Getting an enterprise telemetry pipeline from day one to high-velocity shipping without the panic.",
    tags: ["NEXT.JS", "TYPESCRIPT", "POSTGRES", "TAILWIND", "PRISMA"],
    tapeImg: "/assets/dev/project-forge-nexus.svg",
    bgColor: "#f5c638",
    textColor: "#111215",
    descColor: "#3f3f46",
    tagBg: "rgba(0, 0, 0, 0.07)",
    tagText: "#18181b",
    tagBorder: "rgba(0, 0, 0, 0.12)",
    tabBg: "#f5c638",
    tabText: "#111215",
    tabLeftClass: "left-[22%] sm:left-[24%]",
    accentColor: "#111215",
    buttonBg: "#111215",
    buttonText: "#f5c638",
    liveUrl: "https://github.com",
    githubUrl: "https://github.com",
  },
  {
    id: "chroma-ai",
    number: "03",
    tabLabel: "+ PROJECT 03",
    date: "● FEB 18, 2026",
    title: "Chroma Studio",
    subtitle: "Autonomous Design Workflow",
    description:
      "Multi-agent creative orchestration suite automating vector asset generation, typography harmonizing, and real-time palette exploration.",
    tags: ["CANVA", "FIGMA", "WEBGL", "REACT", "TAILWIND"],
    tapeImg: "/assets/dev/project-chroma-studio.svg",
    bgColor: "#092514",
    textColor: "#ffffff",
    descColor: "#cbd5e1",
    tagBg: "rgba(182, 254, 0, 0.12)",
    tagText: "#b6fe00",
    tagBorder: "rgba(182, 254, 0, 0.25)",
    tabBg: "#b6fe00",
    tabText: "#013900",
    tabLeftClass: "left-[45%] sm:left-[48%]",
    accentColor: "#b6fe00",
    buttonBg: "#b6fe00",
    buttonText: "#013900",
    liveUrl: "https://github.com",
    githubUrl: "https://github.com",
  },
  {
    id: "vortex-engine",
    number: "04",
    tabLabel: "+ PROJECT 04",
    date: "● JAN 15, 2026",
    title: "Vortex Growth",
    subtitle: "High-ROAS Ad & Conversion Suite",
    description:
      "Multi-channel automated creative ad optimization system delivering 4.6x average ROAS across high-velocity paid acquisition channels with full attribution tracking.",
    tags: ["CANVA", "PERFORMANCE ADS", "ANALYTICS", "CRO", "META API"],
    tapeImg: "/assets/dev/project-vortex-growth.svg",
    bgColor: "#1c1228",
    textColor: "#ffffff",
    descColor: "#94a3b8",
    tagBg: "rgba(255, 77, 109, 0.12)",
    tagText: "#ff85a1",
    tagBorder: "rgba(255, 77, 109, 0.25)",
    tabBg: "#ff4d6d",
    tabText: "#ffffff",
    tabLeftClass: "left-[68%] sm:left-[72%]",
    accentColor: "#ff4d6d",
    buttonBg: "#ff4d6d",
    buttonText: "#ffffff",
    liveUrl: "https://github.com",
    githubUrl: "https://github.com",
  },
]

export default function Projects({ isLightMode = false }: ProjectsProps) {
  const [activeModalProject, setActiveModalProject] = useState<ProjectCardData | null>(null)

  const sectionRef = useRef<HTMLElement | null>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null)

  // 1:1 BUTTER-SMOOTH CONTINUOUS CARD-ON-CARD STACK TIMELINE (ZERO DEAD ZONES, ZERO STICKINESS)
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[]
    if (cards.length < 4) return

    // Set initial state
    gsap.set(cards[0], { yPercent: 0, scale: 1, y: 0, zIndex: 10, filter: "brightness(1)" })
    gsap.set(cards[1], { yPercent: 100, scale: 1, y: 0, zIndex: 20, filter: "brightness(1)" })
    gsap.set(cards[2], { yPercent: 100, scale: 1, y: 0, zIndex: 30, filter: "brightness(1)" })
    gsap.set(cards[3], { yPercent: 100, scale: 1, y: 0, zIndex: 40, filter: "brightness(1)" })

    // Pinned Master Timeline - perfectly smooth, continuous, snappy scroll
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "+=1700", // Snappy, effortless scroll distance
        pin: true,
        scrub: 0.35, // Light and responsive, no sluggish delay
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    })

    scrollTriggerRef.current = tl.scrollTrigger ?? null

    // STEP 1: Card 1 glides UP and lands directly on top of Card 0 (Timeline: 0 -> 1)
    tl.to(
      cards[1],
      {
        yPercent: 0,
        ease: "none", // Pure linear mapping to scroll - no jarring pauses or dead zones
        duration: 1,
      },
      0
    )
    tl.to(
      cards[0],
      {
        scale: 0.96,
        y: -14,
        filter: "brightness(0.82)",
        ease: "none",
        duration: 1,
      },
      0
    )

    // STEP 2: Card 2 glides UP and lands directly on top of Card 1 (Timeline: 1 -> 2) - ZERO GAPS
    tl.to(
      cards[2],
      {
        yPercent: 0,
        ease: "none",
        duration: 1,
      },
      1
    )
    tl.to(
      cards[1],
      {
        scale: 0.96,
        y: -14,
        filter: "brightness(0.82)",
        ease: "none",
        duration: 1,
      },
      1
    )
    tl.to(
      cards[0],
      {
        scale: 0.92,
        y: -28,
        filter: "brightness(0.68)",
        ease: "none",
        duration: 1,
      },
      1
    )

    // STEP 3: Card 3 glides UP and lands directly on top of Card 2 (Timeline: 2 -> 3) - ZERO GAPS
    tl.to(
      cards[3],
      {
        yPercent: 0,
        ease: "none",
        duration: 1,
      },
      2
    )
    tl.to(
      cards[2],
      {
        scale: 0.96,
        y: -14,
        filter: "brightness(0.82)",
        ease: "none",
        duration: 1,
      },
      2
    )
    tl.to(
      cards[1],
      {
        scale: 0.92,
        y: -28,
        filter: "brightness(0.68)",
        ease: "none",
        duration: 1,
      },
      2
    )
    tl.to(
      cards[0],
      {
        scale: 0.88,
        y: -42,
        filter: "brightness(0.55)",
        ease: "none",
        duration: 1,
      },
      2
    )

    return () => {
      tl.scrollTrigger?.kill()
      tl.kill()
    }
  }, [])

  // Smoothly scroll to a card when clicking its tab
  const jumpToCard = (cardIdx: number) => {
    playSound("pull")
    const st = scrollTriggerRef.current
    if (!st) return
    const targetProgress = cardIdx / 3
    const targetScroll = st.start + (st.end - st.start) * targetProgress
    window.scrollTo({
      top: targetScroll,
      behavior: "smooth",
    })
  }

  return (
    <section
      ref={sectionRef}
      id="projects"
      className={`relative w-full h-screen min-h-[660px] max-h-[960px] flex flex-col justify-center select-none transition-colors duration-700 overflow-hidden ${
        isLightMode
          ? "bg-[#f8f7f2] text-[#0d130e]"
          : "bg-[#0b0e14] text-[#f4f7f4]"
      }`}
      style={{
        backgroundImage: isLightMode
          ? "linear-gradient(to bottom, transparent 27px, rgba(0, 0, 0, 0.05) 28px)"
          : "linear-gradient(to bottom, transparent 27px, rgba(255, 255, 255, 0.04) 28px)",
        backgroundSize: "100% 28px",
      }}
    >
      {/* 1. PAPER CRUMPLE OVERLAY */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20 mix-blend-multiply z-0"
        style={{
          backgroundImage: "url('/assets/paper-overlay.webp')",
          backgroundRepeat: "repeat",
          backgroundSize: "700px auto",
        }}
        aria-hidden="true"
      />

      {/* 2. PINNED STACK CONTAINER (All 4 cards stacked directly one upon the other) */}
      <div className="relative z-10 w-full max-w-5xl h-[500px] sm:h-[530px] md:h-[560px] mx-auto px-4 sm:px-6 md:px-8">
        <div className="relative w-full h-full">
          {PROJECTS_DATA.map((project, idx) => {
            const nextIdx = (idx + 1) % PROJECTS_DATA.length
            const nextProject = PROJECTS_DATA[nextIdx]

            return (
              <div
                key={project.id}
                ref={(el) => {
                  cardRefs.current[idx] = el
                }}
                className="absolute inset-0 w-full h-full will-change-transform"
                style={{
                  transformOrigin: "center top",
                }}
              >
                {/* A. CHAMFERED FILE-FOLDER TABS ON TOP EDGE */}
                <div className="relative w-full h-11 sm:h-12">
                  {/* Primary Tab (Active tab for this card, positioned in its designated slot) */}
                  <div
                    onClick={() => jumpToCard(idx)}
                    onMouseEnter={() => playSound("hover")}
                    className={`absolute bottom-0 ${project.tabLeftClass} inline-flex items-center h-full px-4 sm:px-6 font-mono text-xs sm:text-sm font-black tracking-wider uppercase cursor-pointer select-none rounded-t-xl transition-transform hover:-translate-y-0.5 shadow-md z-20`}
                    style={{
                      backgroundColor: project.tabBg,
                      color: project.tabText,
                    }}
                  >
                    {/* Left Chamfer Wing (if not at left edge) */}
                    {idx > 0 && (
                      <div
                        className="absolute top-0 -left-4 sm:-left-5 w-4 sm:w-5 h-full pointer-events-none"
                        style={{
                          clipPath: "polygon(100% 0, 0 100%, 100% 100%)",
                          backgroundColor: project.tabBg,
                        }}
                      />
                    )}

                    <span>{project.tabLabel}</span>

                    {/* Right Chamfer Wing */}
                    <div
                      className="absolute top-0 -right-4 sm:-right-5 w-4 sm:w-5 h-full pointer-events-none"
                      style={{
                        clipPath: "polygon(0 0, 0 100%, 100% 100%)",
                        backgroundColor: project.tabBg,
                      }}
                    />
                  </div>

                  {/* Secondary Tab Hint (Poking beside it) */}
                  <div
                    onClick={() => jumpToCard(nextIdx)}
                    onMouseEnter={() => playSound("hover")}
                    className="hidden sm:inline-flex absolute bottom-0 right-4 items-center h-9 px-4 font-mono text-[11px] font-bold tracking-wider uppercase cursor-pointer select-none rounded-t-lg opacity-70 hover:opacity-100 transition-all z-10"
                    style={{
                      backgroundColor: nextProject.tabBg,
                      color: nextProject.tabText,
                    }}
                  >
                    <span>NEXT: {nextProject.tabLabel}</span>
                  </div>
                </div>

                {/* B. MAIN FOLDER CARD BODY */}
                <div
                  className="relative w-full h-[calc(100%-44px)] sm:h-[calc(100%-48px)] rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.45)] border border-black/15 overflow-hidden flex flex-col justify-between"
                  style={{
                    backgroundColor: project.bgColor,
                    color: project.textColor,
                  }}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center h-full">
                    {/* LEFT COLUMN: Project Details */}
                    <div className="lg:col-span-6 flex flex-col justify-between h-full">
                      <div>
                        {/* Date Label */}
                        <div className="flex items-center gap-2 mb-2 sm:mb-3">
                          <span
                            className="font-mono text-xs sm:text-sm font-bold tracking-widest uppercase opacity-80"
                            style={{ color: project.descColor }}
                          >
                            {project.date}
                          </span>
                        </div>

                        {/* Project Big Title */}
                        <h3
                          className="font-sans text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-none mb-2 sm:mb-3 m-0"
                          style={{ color: project.textColor }}
                        >
                          {project.title}
                        </h3>

                        {/* Subtitle / Description */}
                        <p
                          className="text-xs sm:text-sm md:text-base leading-relaxed mb-4 sm:mb-6 font-medium line-clamp-3"
                          style={{ color: project.descColor }}
                        >
                          {project.description}
                        </p>

                        {/* Tech Stack Tags */}
                        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                          {project.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] sm:text-xs font-bold tracking-wider px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md"
                              style={{
                                backgroundColor: project.tagBg,
                                color: project.tagText,
                                border: `1px solid ${project.tagBorder}`,
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* View Project Underlined Link & Actions */}
                      <div className="flex items-center gap-6 pt-3 sm:pt-4 border-t border-current/15">
                        {project.liveUrl && (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => playSound("click")}
                            onMouseEnter={() => playSound("hover")}
                            className="group/link inline-flex items-center gap-1.5 font-mono text-xs sm:text-sm md:text-base font-extrabold tracking-wider uppercase no-underline transition-transform hover:translate-x-1"
                            style={{ color: project.textColor }}
                          >
                            <span className="border-b-2 border-current pb-0.5">
                              VIEW PROJECT
                            </span>
                            <span className="text-sm transition-transform group-hover/link:translate-x-1 group-hover/link:-translate-y-0.5">
                              ↗
                            </span>
                          </a>
                        )}

                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => playSound("click")}
                            onMouseEnter={() => playSound("hover")}
                            className="font-mono text-xs sm:text-sm font-bold tracking-wider uppercase opacity-70 hover:opacity-100 transition-opacity no-underline"
                            style={{ color: project.textColor }}
                          >
                            SOURCE CODE ↗
                          </a>
                        )}
                      </div>
                    </div>

                    {/* RIGHT COLUMN: Pinned Visual with 4 Translucent Masking Tapes */}
                    <div className="lg:col-span-6 relative flex items-center justify-center h-full">
                      <div className="relative w-full max-w-[460px] h-[200px] sm:h-[240px] md:h-[280px] rounded-xl sm:rounded-2xl overflow-hidden bg-black/40 border border-white/10 shadow-2xl flex items-center justify-center group/card">
                        {/* 4 TRANSLUCENT MASKING TAPE STRIPS PINNING THE 4 CORNERS */}
                        <div
                          className="absolute -top-3.5 -left-5 w-12 sm:w-16 h-5 sm:h-6 bg-white/75 backdrop-blur-sm shadow-sm pointer-events-none z-20 border-t border-b border-black/10"
                          style={{ transform: "rotate(-38deg)" }}
                        />
                        <div
                          className="absolute -top-3.5 -right-5 w-12 sm:w-16 h-5 sm:h-6 bg-white/75 backdrop-blur-sm shadow-sm pointer-events-none z-20 border-t border-b border-black/10"
                          style={{ transform: "rotate(38deg)" }}
                        />
                        <div
                          className="absolute -bottom-3.5 -left-5 w-12 sm:w-16 h-5 sm:h-6 bg-white/75 backdrop-blur-sm shadow-sm pointer-events-none z-20 border-t border-b border-black/10"
                          style={{ transform: "rotate(38deg)" }}
                        />
                        <div
                          className="absolute -bottom-3.5 -right-5 w-12 sm:w-16 h-5 sm:h-6 bg-white/75 backdrop-blur-sm shadow-sm pointer-events-none z-20 border-t border-b border-black/10"
                          style={{ transform: "rotate(-38deg)" }}
                        />

                        {/* Interactive Project Visual Preview */}
                        <img
                          src={project.tapeImg}
                          alt={project.title}
                          className="w-40 sm:w-52 md:w-64 h-auto object-contain transition-transform duration-500 group-hover/card:scale-105 group-hover/card:rotate-2 drop-shadow-2xl select-none"
                          draggable={false}
                        />

                        {/* Subhead Corner Overlay */}
                        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between pointer-events-none">
                          <span className="font-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-white/70 bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm">
                            {project.subtitle}
                          </span>
                        </div>
                      </div>

                      {/* Right Edge Floating Action Buttons */}
                      <div className="absolute -right-2 sm:-right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-30">
                        {/* Expand / Lightbox Button */}
                        <button
                          type="button"
                          onClick={() => {
                            playSound("pull")
                            setActiveModalProject(project)
                          }}
                          onMouseEnter={() => playSound("hover")}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/20 hover:bg-white/35 backdrop-blur-md border border-white/30 text-white flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-xl cursor-pointer"
                          title="Expand Full Case Study"
                          aria-label="Expand Project"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-4 h-4 sm:w-5 sm:h-5"
                          >
                            <polyline points="15 3 21 3 21 9" />
                            <polyline points="9 21 3 21 3 15" />
                            <line x1="21" y1="3" x2="14" y2="10" />
                            <line x1="3" y1="21" x2="10" y2="14" />
                          </svg>
                        </button>

                        {/* Sparkles Action Button */}
                        <button
                          type="button"
                          onClick={() => {
                            playSound("click")
                            setActiveModalProject(project)
                          }}
                          onMouseEnter={() => playSound("hover")}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/20 hover:bg-white/35 backdrop-blur-md border border-white/30 text-white flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-xl cursor-pointer"
                          title="Interactive Features"
                          aria-label="Project Features"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-4 h-4 sm:w-5 sm:h-5"
                          >
                            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 3. FULL PROJECT EXPAND MODAL / LIGHTBOX */}
      {activeModalProject && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => {
            playSound("pull")
            setActiveModalProject(null)
          }}
        >
          <div
            className="relative w-full max-w-3xl rounded-3xl p-6 sm:p-9 shadow-2xl border border-white/20 text-white"
            style={{ backgroundColor: activeModalProject.bgColor }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-current/15 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold uppercase tracking-wider">
                  {activeModalProject.tabLabel} • {activeModalProject.date}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  playSound("pull")
                  setActiveModalProject(null)
                }}
                className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-sm font-bold cursor-pointer transition-colors"
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="relative h-60 sm:h-72 rounded-2xl bg-black/40 flex items-center justify-center overflow-hidden border border-white/10">
                <img
                  src={activeModalProject.tapeImg}
                  alt={activeModalProject.title}
                  className="w-48 sm:w-56 h-auto object-contain drop-shadow-2xl"
                />
              </div>

              <div>
                <h2
                  className="font-sans text-3xl sm:text-4xl font-black tracking-tight mb-2 m-0"
                  style={{ color: activeModalProject.textColor }}
                >
                  {activeModalProject.title}
                </h2>
                <p
                  className="font-mono text-xs font-bold uppercase tracking-wider mb-4 opacity-80"
                  style={{ color: activeModalProject.descColor }}
                >
                  {activeModalProject.subtitle}
                </p>
                <p
                  className="text-sm leading-relaxed mb-6 font-medium"
                  style={{ color: activeModalProject.descColor }}
                >
                  {activeModalProject.description}
                </p>

                {/* Tech Pills */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {activeModalProject.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-md"
                      style={{
                        backgroundColor: activeModalProject.tagBg,
                        color: activeModalProject.tagText,
                        border: `1px solid ${activeModalProject.tagBorder}`,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  {activeModalProject.liveUrl && (
                    <a
                      href={activeModalProject.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => playSound("click")}
                      className="flex-1 py-3 px-5 rounded-xl font-mono text-sm font-black tracking-wider uppercase text-center no-underline transition-transform hover:scale-102 flex items-center justify-center gap-1.5 shadow-lg"
                      style={{
                        backgroundColor: activeModalProject.buttonBg,
                        color: activeModalProject.buttonText,
                      }}
                    >
                      <span>VISIT LIVE PROJECT</span>
                      <span>↗</span>
                    </a>
                  )}

                  {activeModalProject.githubUrl && (
                    <a
                      href={activeModalProject.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => playSound("click")}
                      className="py-3 px-4 rounded-xl border border-white/20 text-white hover:bg-white/10 transition-colors font-mono text-xs font-bold uppercase tracking-wider no-underline"
                    >
                      CODE ↗
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
