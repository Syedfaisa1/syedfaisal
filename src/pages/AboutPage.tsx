import { useEffect } from "react"
import About from "../components/About"
import Footer from "../components/Footer"

interface AboutPageProps {
  isLightMode?: boolean
}

export default function AboutPage({ isLightMode = false }: AboutPageProps) {
  useEffect(() => {
    // Scroll to top when arriving on About page
    window.scrollTo(0, 0)
    document.documentElement.setAttribute("data-active-section", "about")
  }, [])

  return (
    <div className="w-full min-h-screen flex flex-col">
      <About isLightMode={isLightMode} isStandalonePage={true} />
      <Footer isLightMode={isLightMode} />
    </div>
  )
}
