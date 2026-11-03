import { useState, useEffect } from "react"

export function useTypewriter(
  text: string,
  speed: number = 38,
  startDelay: number = 600,
  enabled: boolean = true
): { displayed: string; done: boolean } {
  const [displayed, setDisplayed] = useState("")
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!enabled) return

    let intervalId: ReturnType<typeof setInterval> | null = null

    const timeoutId = setTimeout(() => {
      if (!text) {
        setDone(true)
        return
      }

      let currentIndex = 0
      setDisplayed("")
      setDone(false)

      intervalId = setInterval(() => {
        if (currentIndex < text.length) {
          currentIndex += 1
          setDisplayed(text.slice(0, currentIndex))
          if (currentIndex >= text.length) {
            setDone(true)
            if (intervalId) clearInterval(intervalId)
          }
        } else {
          setDone(true)
          if (intervalId) clearInterval(intervalId)
        }
      }, speed)
    }, startDelay)

    return () => {
      clearTimeout(timeoutId)
      if (intervalId) clearInterval(intervalId)
    }
  }, [text, speed, startDelay, enabled])

  return {
    displayed: enabled ? displayed : "",
    done: enabled ? done : false,
  }
}
