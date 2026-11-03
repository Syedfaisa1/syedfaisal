// Audio sound utility using Sweet Tape sound effects
const sounds: Record<string, HTMLAudioElement> = {}

// Global audio mute state - persists in localStorage
let isSoundEnabled = true

if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('faisal_sound_enabled')
  if (saved !== null) {
    isSoundEnabled = saved === 'true'
  }
}

export function setSoundEnabled(enabled: boolean) {
  isSoundEnabled = enabled
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('faisal_sound_enabled', String(enabled))
      window.dispatchEvent(
        new CustomEvent('sound-toggle', { detail: { enabled } })
      )
    } catch {
      // Ignore storage errors
    }
  }
}

export function getIsSoundEnabled(): boolean {
  return isSoundEnabled
}

export type SoundType =
  | 'click'
  | 'pull'
  | 'hover'
  | 'ballHit'
  | 'toggle'
  | 'pop'

const SOUND_FILES: Record<SoundType, string> = {
  click: '/assets/sounds/cursor-click.mp3',
  pull: '/assets/sounds/menu-pull.mp3',
  hover: '/assets/sounds/menu-hover.mp3',
  ballHit: '/assets/sounds/box-pop.mp3',
  toggle: '/assets/sounds/sound-toggle.mp3',
  pop: '/assets/sounds/box-pop.mp3',
}

export function getSound(name: SoundType): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null
  if (!sounds[name]) {
    const filename = SOUND_FILES[name] || SOUND_FILES.click
    const audio = new Audio(filename)
    audio.preload = 'auto'
    sounds[name] = audio
  }
  return sounds[name]
}

export function playSound(name: SoundType, volume = 1) {
  // Respect global mute state - 100% silence when muted
  if (!isSoundEnabled) return

  try {
    const audio = getSound(name)
    if (!audio) return

    // Clone or reuse to allow rapid successive hits
    const soundInstance = audio.cloneNode() as HTMLAudioElement
    const baseVolume =
      name === 'hover' ? 0.35 : name === 'ballHit' ? 0.55 : 0.65
    soundInstance.volume = Math.max(0, Math.min(1, baseVolume * volume))
    soundInstance.play().catch(() => {
      // Audio autoplay policy handled
    })
  } catch {
    // Ignore audio playback errors
  }
}
