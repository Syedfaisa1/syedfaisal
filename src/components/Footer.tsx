import { useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { initPoke } from "../utils/poke"
import { setupFooterPhysics } from "../utils/footerPhysics"
import { playSound } from "../utils/sound"
import { scrollToSection } from "../utils/scroll"
import userLogo from "../assets/logo/logo_3.png"
import mernBadge from "../assets/footer_sticker/MERN Stack Coding Badge.png"
import designBadge from "../assets/footer_sticker/Design Tools Badge.png"
import cloudBadge from "../assets/footer_sticker/Cloud & DevOps Badge.png"
import adsBadge from "../assets/footer_sticker/Glossy Digital Ads Marketing Badge.png"

interface FooterProps {
  isLightMode?: boolean
}

const FOOTER_NAV = [
  { label: "PROJECTS", href: "#projects" },
  { label: "ABOUT", href: "/about" },
  { label: "CONTACT", href: "#contact" },
]

export default function Footer({ isLightMode: _isLightMode = false }: FooterProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const footerRef = useRef<HTMLElement | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const headlineRef = useRef<HTMLHeadingElement | null>(null)
  const ballsRef = useRef<(HTMLDivElement | HTMLAnchorElement | null)[]>([])

  useEffect(() => {
    const footer = footerRef.current
    if (!footer) return

    // 1. Tactile, springy character poke interaction on STICK BY YOU
    const unbindPoke = initPoke(headlineRef.current, {
      selector: ".char",
      radiusMultiplier: 0.95,
      maxLift: 0.13,
      maxRotate: 14,
      maxScale: 0.1,
    })

    // 2. 1:1 Matter.js Rigid-Body Physics for tape rolls and social discs
    let physicsInstance: { destroy: () => void } | null = null
    if (bottomRef.current) {
      physicsInstance = setupFooterPhysics(bottomRef.current, ballsRef.current)
    }

    return () => {
      unbindPoke()
      physicsInstance?.destroy()
    }
  }, [])

  return (
    <footer
      ref={footerRef}
      id="footer"
      className="site-footer relative z-20 w-full bg-[#034102] text-[#b6fe00] select-none overflow-hidden"
      style={{
        backgroundColor: "#034102",
        color: "#b6fe00",
      }}
    >
      {/* 1. CRUMPLED PAPER TEXTURE OVERLAY */}
      <div
        className="absolute inset-0 pointer-events-none z-10 opacity-20 mix-blend-multiply"
        style={{
          backgroundImage: "url('/assets/paper-overlay.webp')",
          backgroundRepeat: "repeat",
          backgroundSize: "600px auto",
        }}
        aria-hidden="true"
      />

      {/* 2. TOP SCOOPED ARCHED CURVE (Bridges directly from Contact Section) */}
      <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none overflow-hidden">
        <svg
          viewBox="0 0 1456 160"
          preserveAspectRatio="none"
          className="w-full h-[10.5vw] min-h-[55px] max-h-[145px] block fill-current text-[#b6fe00]"
        >
          <path d="M0 0 L1456 0 C801.9 272 212.833 113.333 0 0 Z" />
        </svg>
      </div>

      {/* 3. MAIN FOOTER CONTENT CONTAINER */}
      <div className="relative z-20 w-full pt-[60px] sm:pt-[10vw] pb-3 sm:pb-6 px-4 sm:px-8 md:px-12 flex flex-col justify-between min-h-0 sm:min-h-screen">
        {/* A. TOP NAVIGATION BAR */}
        <nav className="footer-nav w-full z-30" aria-label="Footer Navigation">
          <ul className="flex items-center justify-between list-none p-0 m-0 w-full">
            {FOOTER_NAV.map((item) => (
              <li key={item.label} className="flex flex-col items-center">
                <a
                  href={item.href}
                  onMouseEnter={() => playSound("hover")}
                  onClick={(e) => {
                    e.preventDefault()
                    playSound("click")
                    if (item.label === "ABOUT") {
                      if (location.pathname !== "/about") {
                        navigate("/about")
                      } else {
                        window.scrollTo({ top: 0, behavior: "smooth" })
                      }
                    } else if (item.label === "PROJECTS") {
                      if (location.pathname !== "/") {
                        navigate("/#projects")
                      } else {
                        scrollToSection("#projects")
                      }
                    } else if (item.label === "CONTACT") {
                      if (location.pathname !== "/") {
                        navigate("/#contact")
                      } else {
                        scrollToSection("#contact")
                      }
                    }
                  }}
                  className="footer-link group flex flex-col items-center gap-2 no-underline text-[#b6fe00] transition-transform duration-300 hover:-translate-y-1 cursor-pointer"
                >
                  {/* Tumble Roll Letter Characters */}
                  <span className="font-sweet-tape text-[clamp(18px,2.6vw,40px)] font-black tracking-tight leading-none flex items-center">
                    {item.label.split("").map((ch, idx) => (
                      <span
                        key={idx}
                        className="inline-block overflow-hidden h-[1em]"
                      >
                        <span
                          className="footer-char inline-block"
                          style={{
                            animationDelay: `${idx * 30}ms`,
                          }}
                        >
                          {ch === " " ? "\u00A0" : ch}
                        </span>
                      </span>
                    ))}
                  </span>

                  {/* Dot indicator */}
                  <span className="footer-link-dot w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#b6fe00] opacity-90 transition-transform duration-300 group-hover:scale-150" />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* B. MIDDLE & BOTTOM INTERACTIVE STAGE (Headline, Physics Balls, Bottom Logo) */}
        <div
          ref={bottomRef}
          className="footer-bottom relative w-full h-[360px] sm:h-auto sm:flex-1 flex flex-col items-center justify-start mt-2 sm:mt-[2vw] sm:min-h-[48vw] overflow-visible touch-none"
        >
          {/* 1:1 Playable Pokable Curved Arched Headline: LET'S BUILD TOGETHER */}
          <h2
            ref={headlineRef}
            aria-label="LET'S BUILD TOGETHER"
            className="footer-headline font-sweet-tape font-extrabold tracking-tight text-[clamp(28px,7.5vw,150px)] leading-[0.76] text-center select-none cursor-pointer z-10 pt-1 sm:pt-[2vw]"
          >
            {/* Line 1: LET'S BUILD (11 characters) */}
            <span
              className="line flex items-end justify-center"
              style={{ ["--letters" as string]: 11 }}
            >
              {"LET'S BUILD".split("").map((ch, idx) => (
                <span
                  key={idx}
                  className={`clip ${ch === " " ? "is-space" : ""}`}
                  style={{ ["--i" as string]: idx }}
                >
                  <span className="char">{ch === " " ? "\u00A0" : ch}</span>
                </span>
              ))}
            </span>

            {/* Line 2: TOGETHER (8 characters) */}
            <span
              className="line flex items-end justify-center mt-[-0.03em]"
              style={{ ["--letters" as string]: 8 }}
            >
              {"TOGETHER".split("").map((ch, idx) => (
                <span
                  key={idx}
                  className="clip"
                  style={{ ["--i" as string]: idx }}
                >
                  <span className="char">{ch}</span>
                </span>
              ))}
            </span>
          </h2>

          {/* 1:1 INTERACTIVE RIGID-BODY PHYSICS BALLS LAYER */}
          <div className="footer-balls absolute inset-0 pointer-events-none overflow-visible z-20">
            {/* 1. STATIONERY TAPE ROLL */}
            {/* 1. MERN STACK CODING BADGE */}
            <div
              ref={(el) => {
                ballsRef.current[0] = el
              }}
              aria-hidden="true"
              className="footer-ball absolute pointer-events-auto cursor-grab active:cursor-grabbing will-change-transform select-none"
              style={{
                left: "calc((9.6 - 18.7 / 2) * 1vw)",
                top: "calc((18.7 - 18.7 / 2) * 1vw)",
                width: "18.7vw",
                height: "18.7vw",
                minWidth: "75px",
                minHeight: "75px",
              }}
            >
              <img
                src={mernBadge}
                alt="MERN Stack Coding Badge"
                draggable={false}
                className="footer-ball-art w-full h-full object-contain pointer-events-none drop-shadow-2xl"
              />
            </div>

            {/* 2. DESIGN TOOLS BADGE (Figma, Canva, Adobe) */}
            <div
              ref={(el) => {
                ballsRef.current[1] = el
              }}
              aria-hidden="true"
              className="footer-ball absolute pointer-events-auto cursor-grab active:cursor-grabbing will-change-transform select-none"
              style={{
                left: "calc((22.6 - 18.7 / 2) * 1vw)",
                top: "calc((35.6 - 18.7 / 2) * 1vw)",
                width: "18.7vw",
                height: "18.7vw",
                minWidth: "75px",
                minHeight: "75px",
              }}
            >
              <img
                src={designBadge}
                alt="Design Tools Badge"
                draggable={false}
                className="footer-ball-art w-full h-full object-contain pointer-events-none drop-shadow-2xl"
              />
            </div>

            {/* 3. CLOUD & DEVOPS BADGE */}
            <div
              ref={(el) => {
                ballsRef.current[2] = el
              }}
              aria-hidden="true"
              className="footer-ball absolute pointer-events-auto cursor-grab active:cursor-grabbing will-change-transform select-none"
              style={{
                left: "calc((65.5 - 18.7 / 2) * 1vw)",
                top: "calc((37.3 - 18.7 / 2) * 1vw)",
                width: "18.7vw",
                height: "18.7vw",
                minWidth: "75px",
                minHeight: "75px",
              }}
            >
              <img
                src={cloudBadge}
                alt="Cloud & DevOps Badge"
                draggable={false}
                className="footer-ball-art w-full h-full object-contain pointer-events-none drop-shadow-2xl"
              />
            </div>

            {/* 4. GLOSSY DIGITAL ADS MARKETING BADGE */}
            <div
              ref={(el) => {
                ballsRef.current[3] = el
              }}
              aria-hidden="true"
              className="footer-ball absolute pointer-events-auto cursor-grab active:cursor-grabbing will-change-transform select-none"
              style={{
                left: "calc((89.9 - 18.7 / 2) * 1vw)",
                top: "calc((37.5 - 18.7 / 2) * 1vw)",
                width: "18.7vw",
                height: "18.7vw",
                minWidth: "75px",
                minHeight: "75px",
              }}
            >
              <img
                src={adsBadge}
                alt="Digital Ads Marketing Badge"
                draggable={false}
                className="footer-ball-art w-full h-full object-contain pointer-events-none drop-shadow-2xl"
              />
            </div>

            {/* 5. GITHUB SOCIAL DISC */}
            <a
              ref={(el) => {
                ballsRef.current[4] = el
              }}
              href="https://github.com/syedfaisa1"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              title="GitHub"
              className="footer-ball footer-ball--disc absolute pointer-events-auto rounded-full bg-[#b6fe00] text-[#013900] flex items-center justify-center shadow-2xl cursor-grab active:cursor-grabbing will-change-transform select-none no-underline border-none"
              style={{
                left: "calc((80.6 - 12.7 / 2) * 1vw)",
                top: "calc((22.0 - 12.7 / 2) * 1vw)",
                width: "12.7vw",
                height: "12.7vw",
                minWidth: "55px",
                minHeight: "55px",
              }}
            >
              <svg
                aria-hidden="true"
                fill="currentColor"
                viewBox="0 0 496 512"
                className="w-[44%] h-[44%] pointer-events-none"
              >
                <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z" />
              </svg>
            </a>

            {/* 6. LINKEDIN SOCIAL DISC */}
            <a
              ref={(el) => {
                ballsRef.current[5] = el
              }}
              href="https://www.linkedin.com/in/syed-faisal-a05995251"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              title="LinkedIn"
              className="footer-ball footer-ball--disc absolute pointer-events-auto rounded-full bg-[#b6fe00] text-[#013900] flex items-center justify-center shadow-2xl cursor-grab active:cursor-grabbing will-change-transform select-none no-underline border-none"
              style={{
                left: "calc((93.6 - 12.7 / 2) * 1vw)",
                top: "calc((20.2 - 12.7 / 2) * 1vw)",
                width: "12.7vw",
                height: "12.7vw",
                minWidth: "55px",
                minHeight: "55px",
              }}
            >
              <svg
                aria-hidden="true"
                fill="currentColor"
                viewBox="0 0 448 512"
                className="w-[40%] h-[40%] pointer-events-none"
              >
                <path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z" />
              </svg>
            </a>

            {/* 7. INSTAGRAM SOCIAL DISC */}
            <a
              ref={(el) => {
                ballsRef.current[6] = el
              }}
              href="https://www.instagram.com/1.syedfaisal/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              title="Instagram"
              className="footer-ball footer-ball--disc absolute pointer-events-auto rounded-full bg-[#b6fe00] text-[#013900] flex items-center justify-center shadow-2xl cursor-grab active:cursor-grabbing will-change-transform select-none no-underline border-none"
              style={{
                left: "calc((38.7 - 12.7 / 2) * 1vw)",
                top: "calc((38.6 - 12.7 / 2) * 1vw)",
                width: "12.7vw",
                height: "12.7vw",
                minWidth: "55px",
                minHeight: "55px",
              }}
            >
              <svg
                aria-hidden="true"
                fill="currentColor"
                viewBox="0 0 448 512"
                className="w-[42%] h-[42%] pointer-events-none"
              >
                <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
              </svg>
            </a>
          </div>

          {/* C. BOTTOM BRAND LOGO & CENTERED COPYRIGHT (Perfect middle alignment in all resolutions with dedicated space) */}
          <div
            className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none select-none flex flex-col items-center gap-2 sm:gap-3 text-center w-full px-4"
          >
            <img
              src={userLogo}
              alt="Syed Faisal"
              className="w-[clamp(70px,10vw,140px)] h-auto object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.4)]"
              draggable={false}
            />
            <p className="footer-legal text-[10px] sm:text-xs font-medium text-[#b6fe00]/75 tracking-wider select-none z-30 m-0 text-center whitespace-nowrap">
              Copyright © 2026. Syed Faisal. All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
