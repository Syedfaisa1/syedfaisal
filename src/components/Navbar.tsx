import { useState, useRef, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import gsap from "gsap"
import logo1 from "../assets/logo/logo_1.png"
import logo2 from "../assets/logo/logo_2.png"
import stickerHome from "../assets/stickers_7/01_deep_focus-Photoroom.png"
import stickerAbout from "../assets/stickers_7/02_good_ideas-Photoroom.png"
import stickerProjects from "../assets/stickers_7/04_coding_mode-Photoroom.png"
import stickerContact from "../assets/stickers_7/07_debugging-Photoroom.png"
import { playSound, getIsSoundEnabled, setSoundEnabled } from "../utils/sound"
import { scrollToSection } from "../utils/scroll"

interface NavbarProps {
  isLightMode?: boolean
  onToggleTheme?: () => void
  isReady?: boolean
}

interface MenuItem {
  id: string
  label: string
  href: string
  sticker: string
  bgColor: string
}

const MENU_ITEMS: MenuItem[] = [
  {
    id: "home",
    label: "HOME",
    href: "/",
    sticker: stickerHome,
    bgColor: "from-purple-600 to-indigo-700",
  },
  {
    id: "about",
    label: "ABOUT",
    href: "/about",
    sticker: stickerAbout,
    bgColor: "from-blue-600 to-cyan-600",
  },
  {
    id: "projects",
    label: "PROJECTS",
    href: "/#projects",
    sticker: stickerProjects,
    bgColor: "from-teal-500 to-emerald-700",
  },
  {
    id: "contact",
    label: "CONTACT",
    href: "/#contact",
    sticker: stickerContact,
    bgColor: "from-orange-500 to-pink-600",
  },
]

export default function Navbar({
  isLightMode = false,
  onToggleTheme,
  isReady = true,
}: NavbarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>("home")
  const [isSoundOn, setIsSoundOn] = useState(() => getIsSoundEnabled())

  const menuContainerRef = useRef<HTMLDivElement | null>(null)
  const menuPanelRef = useRef<HTMLDivElement | null>(null)
  const menuSheetRef = useRef<HTMLDivElement | null>(null)
  const rulesRef = useRef<(HTMLSpanElement | null)[]>([])
  const arrowsRef = useRef<(HTMLSpanElement | null)[]>([])
  const labelsRef = useRef<(HTMLSpanElement | null)[]>([])

  // Keep sound toggle state in sync across components
  useEffect(() => {
    const handleSoundChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ enabled: boolean }>
      if (customEvent.detail && typeof customEvent.detail.enabled === "boolean") {
        setIsSoundOn(customEvent.detail.enabled)
      }
    }
    window.addEventListener("sound-toggle", handleSoundChange)
    return () => window.removeEventListener("sound-toggle", handleSoundChange)
  }, [])

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault()
    onToggleTheme?.()
  }

  const toggleMenu = () => {
    playSound("pull")
    setIsOpen((prev) => !prev)
  }

  const toggleSound = () => {
    const nextState = !isSoundOn
    setSoundEnabled(nextState)
    setIsSoundOn(nextState)
    if (nextState) {
      playSound("click")
    }
  }

  // GSAP Menu open / close animation matching sweet-tape.com 1:1
  useEffect(() => {
    const panel = menuPanelRef.current
    const sheet = menuSheetRef.current
    if (!panel || !sheet) return

    if (isOpen) {
      // Play opening pull timeline
      gsap.killTweensOf([panel, sheet])
      gsap.fromTo(
        panel,
        { height: 0 },
        {
          height: "auto",
          duration: 0.65,
          ease: "power3.out",
        }
      )
      gsap.fromTo(
        sheet,
        { yPercent: -100 },
        {
          yPercent: 0,
          duration: 0.65,
          ease: "power3.out",
        }
      )

      // Animate perforated lines & arrows
      rulesRef.current.forEach((rule, idx) => {
        if (!rule) return
        gsap.fromTo(
          rule,
          { clipPath: "inset(0 100% 0 0)" },
          {
            clipPath: "inset(0 0% 0 0)",
            duration: 0.5,
            delay: 0.15 + idx * 0.08,
            ease: "power2.out",
          }
        )
      })

      arrowsRef.current.forEach((arrow, idx) => {
        if (!arrow) return
        gsap.fromTo(
          arrow,
          { scale: 0, rotate: -45 },
          {
            scale: 1,
            rotate: 0,
            duration: 0.45,
            delay: 0.2 + idx * 0.08,
            ease: "back.out(2.2)",
          }
        )
      })

      labelsRef.current.forEach((label, idx) => {
        if (!label) return
        gsap.fromTo(
          label,
          { y: 25, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.4,
            delay: 0.18 + idx * 0.07,
            ease: "power3.out",
          }
        )
      })
    } else {
      // Closing
      gsap.killTweensOf([panel, sheet])
      gsap.to(panel, {
        height: 0,
        duration: 0.55,
        ease: "power2.inOut",
      })
      gsap.to(sheet, {
        yPercent: -100,
        duration: 0.55,
        ease: "power2.inOut",
      })
    }
  }, [isOpen])

  // Close on Escape or click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        if (isSoundOn) playSound("pull")
        setIsOpen(false)
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        menuContainerRef.current &&
        !menuContainerRef.current.contains(e.target as Node)
      ) {
        if (isSoundOn) playSound("pull")
        setIsOpen(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, isSoundOn])

  return (
    <>
      {/* 1. TOP HEADER BAR */}
      <header className="fixed top-0 left-0 right-0 z-40 w-full px-5 sm:px-8 md:px-10 py-4 sm:py-5 flex items-center justify-between pointer-events-none">
        {/* TOP LEFT: Brand Logo with Light/Blue Mode Toggle */}
        <div className="pointer-events-auto flex items-center">
          <button
            id="navbar-brand-logo"
            type="button"
            onClick={handleLogoClick}
            className={`flex items-center cursor-pointer border-none bg-transparent p-0 focus:outline-none group transition-all duration-300 hover:scale-105 active:scale-95 ${
              isReady ? "opacity-100 scale-100" : "opacity-0 scale-90"
            }`}
            title="Click logo to toggle Light / Blue mode"
            aria-label="Toggle site theme and logo"
          >
            <img
              src={isLightMode ? logo2 : logo1}
              alt="Syed Faisal"
              className="h-12 sm:h-14 md:h-16 w-auto object-contain transition-all duration-500"
            />
          </button>
        </div>
      </header>

      {/* 2. SWEET TAPE "PULL ME" PULL-DOWN MENU SYSTEM */}
      <div
        ref={menuContainerRef}
        className={`fixed top-0 right-4 sm:right-8 md:right-12 z-50 flex flex-col items-end transition-all duration-500 ease-out ${
          isReady
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-20 pointer-events-none"
        }`}
      >
        {/* A. SLIDE-DOWN PAPER PANEL */}
        <div
          ref={menuPanelRef}
          className="overflow-hidden w-[310px] sm:w-[360px] md:w-[410px] bg-[#f4f3ef] rounded-bl-[28px] shadow-[-12px_24px_50px_rgba(0,0,0,0.35)]"
          style={{ height: 0 }}
        >
          <div ref={menuSheetRef} className="px-6 sm:px-8 pt-7 pb-6 select-none">
            {/* List of Menu Items */}
            <ul className="flex flex-col m-0 p-0 list-none">
              {MENU_ITEMS.map((item, idx) => {
                const isHovered = hoveredItem === item.id
                return (
                  <li key={item.id} className="relative">
                    {/* Perforated Dashed Divider Line */}
                    <span
                      ref={(el) => {
                        rulesRef.current[idx] = el
                      }}
                      className="block h-[2px] w-full"
                      style={{
                        backgroundImage:
                          "linear-gradient(to right, #013900 0 4px, transparent 4px)",
                        backgroundSize: "8px 100%",
                        backgroundRepeat: "repeat-x",
                      }}
                      aria-hidden="true"
                    />

                    {/* Nav Link Row */}
                    <a
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault()
                        if (isSoundOn) playSound("click")
                        setIsOpen(false)
                        setTimeout(() => {
                          if (item.id === "about") {
                            if (location.pathname !== "/about") {
                              navigate("/about")
                            } else {
                              window.scrollTo({ top: 0, behavior: "smooth" })
                            }
                          } else if (item.id === "home") {
                            if (location.pathname !== "/") {
                              navigate("/")
                              setTimeout(() => {
                                window.scrollTo({ top: 0, behavior: "smooth" })
                              }, 80)
                            } else {
                              scrollToSection("#home")
                            }
                          } else {
                            if (location.pathname !== "/") {
                              navigate(`/#${item.id}`)
                            } else {
                              scrollToSection(`#${item.id}`)
                            }
                          }
                        }, 120)
                      }}
                      onMouseEnter={() => {
                        setHoveredItem(item.id)
                        if (isSoundOn) playSound("hover")
                      }}
                      className="group flex items-center justify-between py-3.5 sm:py-4 cursor-pointer no-underline text-[#013900] transition-colors duration-200"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                        {/* Animated Pop-out Sticker Badge on Hover */}
                        <div
                          className={`shrink-0 overflow-hidden rounded-2xl p-1 bg-gradient-to-tr ${
                            item.bgColor
                          } shadow-md transition-all duration-300 ease-out ${
                            isHovered
                              ? "w-12 h-12 sm:w-14 sm:h-14 opacity-100 -rotate-6 scale-100"
                              : "w-0 h-12 sm:h-14 opacity-0 scale-50 -rotate-12"
                          }`}
                        >
                          <img
                            src={item.sticker}
                            alt=""
                            className="w-full h-full object-contain filter drop-shadow"
                          />
                        </div>

                        {/* Chunky Grotesque Condensed Typography */}
                        <span
                          ref={(el) => {
                            labelsRef.current[idx] = el
                          }}
                          className="font-sweet-tape text-[38px] sm:text-[46px] font-black leading-none tracking-tight transition-transform duration-200 group-hover:translate-x-1"
                        >
                          {item.label}
                        </span>
                      </div>

                      {/* Neon Lime Circular Arrow Pill */}
                      <span
                        ref={(el) => {
                          arrowsRef.current[idx] = el
                        }}
                        className="shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#b6fe00] text-[#013900] flex items-center justify-center transition-all duration-300 group-hover:rotate-45 group-hover:scale-110 shadow-sm"
                        aria-hidden="true"
                      >
                        <svg
                          viewBox="0 0 12 12"
                          fill="none"
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-current stroke-[2.4]"
                        >
                          <path
                            d="M1.4 10.6 10.6 1.4M3.6 1.4h7v7"
                            strokeLinecap="square"
                          />
                        </svg>
                      </span>
                    </a>
                  </li>
                )
              })}

              {/* Bottom Perforated Line */}
              <li className="relative">
                <span
                  className="block h-[2px] w-full"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, #013900 0 4px, transparent 4px)",
                    backgroundSize: "8px 100%",
                    backgroundRepeat: "repeat-x",
                  }}
                  aria-hidden="true"
                />
              </li>
            </ul>
          </div>
        </div>

        {/* B. THE "PULL ME" TICKET TAB (Hangs below the drawer or from top edge) */}
        <button
          type="button"
          onClick={toggleMenu}
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close menu" : "Pull me to open menu"}
          title={isOpen ? "Pull to close" : "Pull to open menu"}
          className="group relative cursor-pointer border-none bg-transparent p-0 focus:outline-none transition-transform duration-200 active:scale-95"
          style={{
            filter: "drop-shadow(0 6px 12px rgba(0, 0, 0, 0.22))",
          }}
        >
          {/* Ticket Header & Body */}
          <div className="relative bg-[#f4f3ef] text-[#013900] px-5 sm:px-6 pt-3 pb-1.5 min-w-[110px] sm:min-w-[125px] flex flex-col items-center">
            {/* Top Dashed Perforation Line */}
            <div
              className="h-[2px] w-full mb-1.5"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #013900 0 4px, transparent 4px)",
                backgroundSize: "8px 100%",
                backgroundRepeat: "repeat-x",
              }}
            />

            {/* "PULL ME" text with arrow hint */}
            <div className="flex items-center justify-center gap-1.5">
              <span className="font-sweet-tape text-[16px] sm:text-[18px] font-extrabold tracking-tight">
                {isOpen ? "CLOSE" : "PULL ME"}
              </span>
              <svg
                viewBox="0 0 10 10"
                className={`w-3 h-3 text-[#013900] transition-transform duration-300 ${
                  isOpen ? "rotate-180" : "group-hover:translate-y-0.5"
                }`}
                fill="currentColor"
              >
                <path d="M5 8L1 3h8L5 8z" />
              </svg>
            </div>
          </div>

          {/* Jagged / Wavy Perforated Ticket Teeth Bottom Edge */}
          <svg
            viewBox="0 0 100 15"
            preserveAspectRatio="none"
            className="w-full h-[14px] text-[#f4f3ef] fill-current block"
            aria-hidden="true"
          >
            <path d="M0 0L0 11Q0 15 4.29 12.43L20.71 2.57Q25 0 29.29 2.57L45.71 12.43Q50 15 54.29 12.43L70.71 2.57Q75 0 79.29 2.57L95.71 12.43Q100 15 100 11L100 0Z" />
          </svg>
        </button>
      </div>

      {/* 3. SWEET TAPE RETRO SOUND TOGGLE PILL (Bottom Right Corner) */}
      <div
        className={`fixed bottom-5 right-5 sm:bottom-6 sm:right-8 z-40 transition-all duration-500 ease-out ${
          isReady
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-20 pointer-events-none"
        }`}
      >
        <button
          type="button"
          onClick={toggleSound}
          aria-label={isSoundOn ? "Mute audio sound" : "Enable audio sound"}
          title={isSoundOn ? "Sound: ON" : "Sound: MUTED"}
          className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-[#013900]/25 shadow-lg transition-all duration-300 cursor-pointer ${
            isSoundOn
              ? "bg-[#b6fe00] text-[#013900] shadow-[0_4px_16px_rgba(182,254,0,0.35)]"
              : "bg-white text-neutral-600 shadow-md"
          }`}
        >
          <span className="font-sweet-tape text-[12px] font-bold tracking-wider uppercase">
            {isSoundOn ? "SOUND ON" : "MUTED"}
          </span>
          <span className="w-5 h-5 rounded-full bg-[#013900] text-white flex items-center justify-center">
            {isSoundOn ? (
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </svg>
            ) : (
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            )}
          </span>
        </button>
      </div>
    </>
  )
}
