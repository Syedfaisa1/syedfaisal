import Hero from "../components/Hero"
import WhyWeExist from "../components/WhyWeExist"
import WallPushTransition from "../components/WallPushTransition"
import Projects from "../components/Projects"
import Contact from "../components/Contact"
import Footer from "../components/Footer"

interface HomeProps {
  isLightMode?: boolean
}

export default function Home({ isLightMode = false }: HomeProps) {
  return (
    <main>
      {/* 1. Hero Stage with Tech Text and Crossfade */}
      <Hero isLightMode={isLightMode} />
      {/* 2. 1:1 Sweet Tape "Why We Exist" Pinned 2D Scroll Experience */}
      <WhyWeExist isLightMode={isLightMode} />
      {/* 3. Cinematic Wall Push Reveal (Huyml-inspired boy pushing wall transition) */}
      <WallPushTransition isLightMode={isLightMode} />
      {/* 4. Tactile 3D Projects & Portfolio Showcase */}
      <Projects isLightMode={isLightMode} />
      {/* 5. 1:1 Sweet Tape Contact Section with Pokable Headline & Interactive Form */}
      <Contact isLightMode={isLightMode} />
      {/* 6. 1:1 Sweet Tape Site Footer with Pokable Letters & Holdable Physics Balls */}
      <Footer isLightMode={isLightMode} />
    </main>
  )
}
