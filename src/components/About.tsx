import { useState, useRef, useEffect } from "react"
import LanyardProfile from "./LanyardProfile"
import { scrollToSection } from "../utils/scroll"
import { playSound } from "../utils/sound"
import { initPoke } from "../utils/poke"

interface AboutProps {
  isLightMode?: boolean
  isStandalonePage?: boolean
}

export default function About({
  isLightMode = false,
  isStandalonePage = false,
}: AboutProps) {
  const [activeTab, setActiveTab] = useState<"story" | "skills" | "approach">("story")
  const [skillCategory, setSkillCategory] = useState<string>("all")
  const headingRef = useRef<HTMLHeadingElement | null>(null)

  // Initialize poke physics on heading
  useEffect(() => {
    if (headingRef.current) {
      const unbind = initPoke(headingRef.current, {
        selector: ".char",
        radiusMultiplier: 0.9,
        maxLift: 0.12,
        maxRotate: 12,
      })
      return () => unbind()
    }
  }, [])

  const skillsList: {
    name: string
    category: "frontend" | "design" | "motion" | "tools"
    highlight?: boolean
  }[] = [
    // Frontend Core & Frameworks
    { name: "React 19 & Next.js", category: "frontend" },
    { name: "TypeScript", category: "frontend" },
    { name: "JavaScript (ES6+)", category: "frontend" },
    { name: "HTML5 & Semantic Web", category: "frontend" },
    { name: "CSS3 & Modern Sass", category: "frontend" },
    { name: "Tailwind CSS", category: "frontend" },
    { name: "Vite & Modern Tooling", category: "frontend" },
    { name: "Redux Toolkit & Zustand", category: "frontend" },
    { name: "REST APIs & GraphQL", category: "frontend" },
    { name: "Responsive & Adaptive UI", category: "frontend" },
    // Design & Creative (Featuring Canva prominently)
    { name: "Canva (Asset & Visual Design)", category: "design", highlight: true },
    { name: "Figma & Design Systems", category: "design" },
    { name: "UI/UX & Wireframing", category: "design" },
    { name: "Visual Identity & Social Assets", category: "design" },
    // Motion, 3D & Physics
    { name: "Three.js & WebGL", category: "motion" },
    { name: "GSAP & ScrollTrigger", category: "motion" },
    { name: "Matter.js 2D Physics", category: "motion" },
    { name: "Motion & Micro-interactions", category: "motion" },
    // Workflow & Engineering
    { name: "Web Performance & Core Web Vitals", category: "tools" },
    { name: "Git & GitHub Workflow", category: "tools" },
    { name: "Cross-Browser Compatibility", category: "tools" },
  ]

  const renderChars = (text: string) => {
    return text.split("").map((ch, i) => (
      <span key={i} className="inline-block overflow-visible">
        <span className="char inline-block will-change-transform">
          {ch === " " ? "\u00A0" : ch}
        </span>
      </span>
    ))
  }

  return (
    <section
      id="about"
      className={`relative w-full ${
        isStandalonePage
          ? "pt-28 sm:pt-32 md:pt-36 lg:pt-40 pb-16 sm:pb-24 min-h-[calc(100vh-80px)] flex flex-col justify-center"
          : "pt-12 sm:pt-16 pb-12 sm:pb-16"
      } overflow-hidden transition-colors duration-700 ease-in-out ${
        isLightMode ? "bg-[#ffffff] text-[#111317]" : "bg-[#004afd] text-white"
      }`}
    >
      {/* ======================================================== */}
      {/* 1. BLUE PAPER TEXTURE BACKGROUND (Lines Pattern Removed)  */}
      {/* ======================================================== */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20 mix-blend-multiply z-0"
        style={{
          backgroundImage: "url('/assets/paper-overlay.webp')",
          backgroundRepeat: "repeat",
          backgroundSize: "600px auto",
        }}
        aria-hidden="true"
      />

      {/* Radial soft glow gradient */}
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-40"
        style={{
          background: isLightMode
            ? "radial-gradient(circle at 75% 35%, rgba(182, 254, 0, 0.12), transparent 60%)"
            : "radial-gradient(circle at 75% 35%, rgba(182, 254, 0, 0.15), rgba(0, 74, 253, 0) 65%)",
        }}
        aria-hidden="true"
      />

      {/* ======================================================== */}
      {/* 2. MAIN TWO-COLUMN CONTENT GRID                         */}
      {/* ======================================================== */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* ====================================================== */}
          {/* LEFT COLUMN: BRAND STATEMENT & NARRATIVE (7 Cols)      */}
          {/* ====================================================== */}
          <div className="lg:col-span-7 relative z-10 flex flex-col gap-8">
            
            {/* Category Pill */}
            <div className="inline-flex items-center gap-2 self-start">
              <span
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold tracking-widest uppercase border ${
                  isLightMode
                    ? "bg-[#013900]/5 border-[#013900]/20 text-[#013900]"
                    : "bg-[#b6fe00]/15 border-[#b6fe00]/40 text-[#b6fe00]"
                }`}
              >
                ● THE PERSON BEHIND THE PIXELS
              </span>
            </div>

            {/* Big Pokable Heading */}
            <div className="relative">
              <h2
                ref={headingRef}
                className="font-sweet-tape text-[clamp(2.5rem,5.5vw,4.5rem)] font-black leading-[0.92] tracking-tighter uppercase m-0 select-none cursor-pointer"
                title="Move cursor over to poke characters!"
              >
                <span className="block">{renderChars("EXPERIENCES.")}</span>
                <span className={`block ${isLightMode ? "text-[#013900]" : "text-[#b6fe00]"}`}>
                  {renderChars("CREATING THOUGHTFUL")}
                </span>
                <span className="block">{renderChars("DIGITAL PRODUCTS.")}</span>
              </h2>
            </div>

            {/* Interactive Tab Switcher */}
            <div className="flex items-center gap-2 border-b border-current/15 pb-2">
              {(["story", "skills", "approach"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    playSound("click")
                    setActiveTab(tab)
                  }}
                  onMouseEnter={() => playSound("hover")}
                  className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-mono uppercase tracking-wider font-bold transition-all duration-300 cursor-pointer ${
                    activeTab === tab
                      ? isLightMode
                        ? "bg-[#013900] text-[#b6fe00] shadow-sm"
                        : "bg-[#b6fe00] text-[#013900] shadow-sm"
                      : "opacity-60 hover:opacity-100 hover:bg-current/5"
                  }`}
                >
                  {tab === "story" && "01. Story & Bio"}
                  {tab === "skills" && "02. Tech Arsenal"}
                  {tab === "approach" && "03. Design Philosophy"}
                </button>
              ))}
            </div>

            {/* Tab 1: Story & Bio */}
            {activeTab === "story" && (
              <div className="flex flex-col gap-4 text-base sm:text-lg leading-relaxed font-sans opacity-90 animate-fadeIn">
                <p>
                  I&apos;m <strong className="font-bold underline decoration-[#b6fe00] decoration-2 underline-offset-4">Syed Faisal</strong> — a frontend developer, creative technologist, and digital craftsman with a deep obsession for tactile web experiences, responsive physics, and kinetic motion.
                </p>
                <p>
                  Bridging the gap between engineering rigor and expressive art, I build websites that don&apos;t just display information — they react, swing, collide, and breathe under your fingertips.
                </p>
                <p className="text-sm sm:text-base opacity-80 font-mono">
                  Mastering modern React, Next.js, and TypeScript architectures alongside creative tooling like Canva, Figma, and Three.js to transform static ideas into memorable digital toys.
                </p>
              </div>
            )}

            {/* Tab 2: Tech Arsenal */}
            {activeTab === "skills" && (
              <div className="flex flex-col gap-4 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <p className="text-sm font-mono opacity-80 m-0">
                    Frontend developer stack & creative tools I use daily:
                  </p>
                  {/* Category Filter Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                      { id: "all", label: "ALL" },
                      { id: "frontend", label: "FRONTEND" },
                      { id: "design", label: "CANVA & DESIGN" },
                      { id: "motion", label: "MOTION & 3D" },
                      { id: "tools", label: "WORKFLOW" },
                    ].map((filter) => (
                      <button
                        key={filter.id}
                        type="button"
                        onClick={() => {
                          playSound("click")
                          setSkillCategory(filter.id)
                        }}
                        onMouseEnter={() => playSound("hover")}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-mono uppercase tracking-wider font-semibold transition-all duration-200 cursor-pointer ${
                          skillCategory === filter.id
                            ? isLightMode
                              ? "bg-[#013900] text-[#b6fe00]"
                              : "bg-[#b6fe00] text-[#013900]"
                            : "bg-current/10 hover:bg-current/20 opacity-70 hover:opacity-100"
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2.5 pt-1">
                  {skillsList
                    .filter((skill) => skillCategory === "all" || skill.category === skillCategory)
                    .map((skill) => (
                      <span
                        key={skill.name}
                        onMouseEnter={() => playSound("hover")}
                        className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-mono font-medium border transition-all duration-300 hover:scale-105 select-none cursor-default flex items-center gap-1.5 ${
                          skill.highlight
                            ? isLightMode
                              ? "bg-[#00c4cc]/20 border-[#00c4cc] text-[#013900] font-bold shadow-sm"
                              : "bg-[#00c4cc]/25 border-[#00c4cc] text-[#2fe8f0] font-bold shadow-[0_0_15px_rgba(0,196,204,0.35)]"
                            : isLightMode
                              ? "bg-black/5 hover:bg-[#013900] hover:text-[#b6fe00] border-black/10"
                              : "bg-white/10 hover:bg-[#b6fe00] hover:text-[#013900] border-white/20"
                        }`}
                      >
                        {skill.highlight && <span className="text-[#00c4cc] text-sm font-black">★</span>}
                        {skill.name}
                      </span>
                    ))}
                </div>
              </div>
            )}

            {/* Tab 3: Design Philosophy */}
            {activeTab === "approach" && (
              <div className="flex flex-col gap-4 text-base sm:text-lg leading-relaxed font-sans opacity-90 animate-fadeIn">
                <div className="border-l-2 border-[#b6fe00] pl-4 italic">
                  &ldquo;A website should never feel like a dead document. It should invite curiosity, reward touch, and feel genuinely alive.&rdquo;
                </div>
                <p className="text-sm sm:text-base">
                  <strong>Three Core Tenets:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-sm sm:text-base opacity-85 font-mono">
                  <li><strong>Tactility First:</strong> Sound, physics, and haptics turn browsing into play.</li>
                  <li><strong>Performance Above All:</strong> Smooth 60fps animations engineered without lag.</li>
                  <li><strong>Brand Emotion:</strong> Distinctive typography that sticks in memory.</li>
                </ul>
              </div>
            )}

            {/* CTA */}
            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-current/15">
              <button
                type="button"
                onClick={() => {
                  playSound("pull")
                  scrollToSection("#projects")
                }}
                className={`px-6 py-3.5 rounded-xl font-sweet-tape text-sm font-black uppercase tracking-wider transition-all duration-300 hover:scale-105 active:scale-95 shadow-md cursor-pointer ${
                  isLightMode
                    ? "bg-[#013900] text-[#b6fe00] hover:bg-[#024d00]"
                    : "bg-[#b6fe00] text-[#013900] hover:bg-[#c6ff24]"
                }`}
              >
                EXPLORE WORK ↘
              </button>
            </div>

          </div>

          {/* ====================================================== */}
          {/* RIGHT COLUMN: 1:1 DRAGGABLE 3D LANYARD STRAP + CARD    */}
          {/* Physics swinging strap + metallic clamp/ring + ProfileCard */}
          {/* ====================================================== */}
          <div className="lg:col-span-5 relative z-30 flex items-center justify-center">
            <LanyardProfile />
          </div>

        </div>
      </div>
    </section>
  )
}
