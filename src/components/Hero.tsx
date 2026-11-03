import TechText from "./TechText"
import heroBlueImg from "../assets/Me/hero.me.png"
import heroLightImg from "../assets/Me/hero.me-light.png"

interface HeroProps {
  isLightMode?: boolean
}

export default function Hero({ isLightMode = false }: HeroProps) {
  return (
    <section
      id="home"
      className={`relative z-0 w-full h-screen overflow-hidden select-none transition-colors duration-700 ease-in-out ${
        isLightMode ? "bg-white" : "bg-[#004afd]"
      }`}
    >
      {/* 1. Electric Blue Hero Image */}
      <img
        src={heroBlueImg}
        alt="Syed Faisal (Blue Theme)"
        fetchPriority="high"
        decoding="async"
        className={`absolute inset-0 w-full h-full object-cover select-none pointer-events-none transition-opacity duration-700 ease-in-out ${
          isLightMode ? "opacity-0" : "opacity-100"
        }`}
        style={{
          objectPosition: "72% center",
        }}
      />

      {/* 2. Crisp White Light Mode Hero Image */}
      <img
        src={heroLightImg}
        alt="Syed Faisal (Light Theme)"
        decoding="async"
        className={`absolute inset-0 w-full h-full object-cover select-none pointer-events-none transition-opacity duration-700 ease-in-out ${
          isLightMode ? "opacity-100" : "opacity-0"
        }`}
        style={{
          objectPosition: "72% center",
        }}
      />

      {/* 3. Tech Text Interactive Typography Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-end lg:justify-center px-6 sm:px-10 md:px-14 lg:px-20 pb-16 sm:pb-20 md:pb-24 lg:pb-0">
        <div className="pointer-events-auto flex flex-col items-start w-full max-w-[94vw] sm:max-w-[85vw] md:max-w-[72vw] lg:max-w-[54vw]">
          {/* Subtle Technical Status Tag */}
          <div
            className={`mb-3 sm:mb-4 inline-flex items-center gap-2.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-mono font-bold tracking-widest uppercase border backdrop-blur-md transition-all duration-500 shadow-sm ${
              isLightMode
                ? "bg-black/[0.04] border-black/15 text-black"
                : "bg-black/25 border-white/20 text-[#b6fe00]"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full animate-pulse ${
                isLightMode ? "bg-[#004afd]" : "bg-[#b6fe00]"
              }`}
            />
            <span className="tracking-wider">CREATIVE TECH &bull; CODE &bull; DESIGN</span>
          </div>

          {/* Line 1: Syed Faisal */}
          <div className="w-full h-[65px] sm:h-[90px] md:h-[115px] lg:h-[135px] xl:h-[150px]">
            <TechText
              text="Syed Faisal"
              fontFamily="'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              fontWeight={800}
              fontSize={140}
              color={isLightMode ? "#0a0a0a" : "#ffffff"}
              accentColor={isLightMode ? "#004afd" : "#b6fe00"}
              align="left"
              lineStyle="dashed"
              labels={true}
              specks={16}
              selection={true}
              draggable={true}
              clickKick={true}
              sweep={true}
              speed={1}
            />
          </div>

          {/* Line 2: Frontend Developer */}
          <div className="w-full h-[34px] sm:h-[46px] md:h-[58px] lg:h-[68px] xl:h-[76px] -mt-1 sm:-mt-2">
            <TechText
              text="Frontend Developer"
              fontFamily="'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              fontWeight={700}
              fontSize={72}
              color={isLightMode ? "#004afd" : "#b6fe00"}
              accentColor={isLightMode ? "#0a0a0a" : "#ffffff"}
              align="left"
              lineStyle="dashed"
              labels={true}
              specks={12}
              selection={true}
              draggable={true}
              clickKick={true}
              sweep={true}
              speed={1}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

