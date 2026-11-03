import React, { useEffect, useRef, useState } from "react"
import { addPropertyControls, ControlType } from "framer"

/**
 * ============================================================================
 * CursorScrubVideo — Framer Code Component
 * ============================================================================
 * 
 * Renders a video whose playhead is driven interactively by cursor / pointer position.
 * 
 * ----------------------------------------------------------------------------
 * FRAME-ACCURATE PLAYBACK REQUIREMENT (IMPORTANT):
 * Standard streaming videos have keyframes (I-frames) only every 1-2 seconds.
 * For buttery smooth scrubbing without stutter or frame drops, the uploaded video
 * MUST be encoded with every frame as an intra-frame (keyframe / GOP = 1).
 * 
 * Recommended FFmpeg command:
 * ffmpeg -i in.mp4 -c:v libx264 -preset slow -crf 18 -g 1 -keyint_min 1 -x264-params "scenecut=0" -profile:v high -pix_fmt yuv420p -movflags +faststart -an out.mp4
 * ----------------------------------------------------------------------------
 */

export interface CursorScrubVideoProps {
    videoFile?: string | { src: string }
    axis?: "horizontal" | "vertical"
    reverse?: boolean
    trackingArea?: "component" | "window"
    smoothing?: number
    objectFit?: "cover" | "contain" | "fill"
    showPoster?: boolean
    borderRadius?: number
    style?: React.CSSProperties
    className?: string
}

export default function CursorScrubVideo({
    videoFile,
    axis = "horizontal",
    reverse = false,
    trackingArea = "component",
    smoothing = 0.22,
    objectFit = "cover",
    showPoster = true,
    borderRadius = 0,
    style,
    className,
}: CursorScrubVideoProps) {
    // Resolve asset URL (handles string URL or Framer asset object)
    const videoSrc = typeof videoFile === "string" ? videoFile : videoFile?.src || ""

    const containerRef = useRef<HTMLDivElement>(null)
    const videoRef = useRef<HTMLVideoElement>(null)

    // State for readiness and loading indicator
    const [isBuffered, setIsBuffered] = useState(false)
    const [hasError, setHasError] = useState(false)

    // Tracking references for RAF loop to prevent stale closures and React re-renders
    const targetPosRef = useRef<number>(0)
    const currentPosRef = useRef<number>(0)
    const seekingRef = useRef<boolean>(false)
    const canScrubRef = useRef<boolean>(false)
    const rafIdRef = useRef<number | null>(null)

    // Sync latest props to refs for high-performance RAF loop
    const propsRef = useRef({
        axis,
        reverse,
        smoothing: Math.max(0.02, Math.min(1, smoothing)),
    })

    useEffect(() => {
        propsRef.current = {
            axis,
            reverse,
            smoothing: Math.max(0.02, Math.min(1, smoothing)),
        }
    }, [axis, reverse, smoothing])

    // =========================================================================
    // 1. VIDEO INITIALIZATION & BUFFERING
    // =========================================================================
    useEffect(() => {
        const video = videoRef.current
        if (!video || !videoSrc) return

        setIsBuffered(false)
        setHasError(false)
        canScrubRef.current = false
        seekingRef.current = false

        // Configure video element attributes explicitly
        video.muted = true
        video.playsInline = true
        video.preload = "auto"
        video.setAttribute("disableRemotePlayback", "")
        video.disableRemotePlayback = true

        let isCancelled = false

        const handleCanPlayThrough = () => {
            if (isCancelled) return
            setIsBuffered(true)
            canScrubRef.current = true
        }

        const handleSeeking = () => {
            seekingRef.current = true
        }

        const handleSeeked = () => {
            seekingRef.current = false
        }

        const handleError = () => {
            if (isCancelled) return
            setHasError(true)
            seekingRef.current = false
        }

        video.addEventListener("canplaythrough", handleCanPlayThrough)
        video.addEventListener("seeking", handleSeeking)
        video.addEventListener("seeked", handleSeeked)
        video.addEventListener("error", handleError)

        // Load media
        video.load()

        // Prime the decodable frame pipeline silently (allowed in modern browsers since muted)
        video
            .play()
            .then(() => {
                if (!isCancelled) {
                    video.pause()
                    video.currentTime = 0
                }
            })
            .catch(() => {
                // Autoplay policy fallback (silent catch)
                if (!isCancelled) {
                    video.currentTime = 0
                }
            })

        return () => {
            isCancelled = true
            video.removeEventListener("canplaythrough", handleCanPlayThrough)
            video.removeEventListener("seeking", handleSeeking)
            video.removeEventListener("seeked", handleSeeked)
            video.removeEventListener("error", handleError)
        }
    }, [videoSrc])

    // =========================================================================
    // 2. CURSOR / POINTER TRACKING
    // =========================================================================
    useEffect(() => {
        const container = containerRef.current
        if (!videoSrc) return

        const handlePointerMove = (e: PointerEvent) => {
            let normalizedX = 0.5
            let normalizedY = 0.5

            if (trackingArea === "window") {
                const w = window.innerWidth || 1
                const h = window.innerHeight || 1
                normalizedX = e.clientX / w
                normalizedY = e.clientY / h
            } else if (container) {
                const rect = container.getBoundingClientRect()
                if (rect.width > 0 && rect.height > 0) {
                    normalizedX = (e.clientX - rect.left) / rect.width
                    normalizedY = (e.clientY - rect.top) / rect.height
                }
            }

            // Clamp normalized position to [0, 1]
            const clampedX = Math.max(0, Math.min(1, normalizedX))
            const clampedY = Math.max(0, Math.min(1, normalizedY))

            // Compute target normalized position based on axis & reverse
            let pos = propsRef.current.axis === "horizontal" ? clampedX : clampedY
            if (propsRef.current.reverse) {
                pos = 1 - pos
            }

            targetPosRef.current = pos
        }

        const targetElement = trackingArea === "window" ? window : container

        if (targetElement) {
            targetElement.addEventListener(
                "pointermove",
                handlePointerMove as EventListener,
                { passive: true }
            )
        }

        return () => {
            if (targetElement) {
                targetElement.removeEventListener(
                    "pointermove",
                    handlePointerMove as EventListener
                )
            }
        }
    }, [trackingArea, videoSrc])

    // =========================================================================
    // 3. SMOOTH LERP REQUEST ANIMATION FRAME LOOP
    // =========================================================================
    useEffect(() => {
        if (!videoSrc) return

        const tick = () => {
            const video = videoRef.current

            if (
                video &&
                canScrubRef.current &&
                Number.isFinite(video.duration) &&
                video.duration > 0
            ) {
                const targetPos = targetPosRef.current
                const currentPos = currentPosRef.current
                const alpha = propsRef.current.smoothing

                // Lerp current normalized position toward target position
                const nextPos = currentPos + (targetPos - currentPos) * alpha
                currentPosRef.current = nextPos

                const targetTime = nextPos * video.duration

                // Seek only if:
                // 1. Previous seek has completed (!seekingRef.current)
                // 2. delta is above 0.008s threshold to avoid seek-storm jitter
                if (
                    !seekingRef.current &&
                    Math.abs(video.currentTime - targetTime) > 0.008
                ) {
                    seekingRef.current = true
                    video.currentTime = targetTime
                }
            }

            rafIdRef.current = requestAnimationFrame(tick)
        }

        rafIdRef.current = requestAnimationFrame(tick)

        return () => {
            if (rafIdRef.current !== null) {
                cancelAnimationFrame(rafIdRef.current)
                rafIdRef.current = null
            }
        }
    }, [videoSrc])

    // =========================================================================
    // 4. FRAMER CANVAS EMPTY PLACEHOLDER
    // =========================================================================
    if (!videoSrc) {
        return (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    minWidth: 160,
                    minHeight: 120,
                    borderRadius: `${borderRadius}px`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    background: "rgba(125, 125, 125, 0.08)",
                    border: "1px dashed rgba(125, 125, 125, 0.35)",
                    color: "rgba(125, 125, 125, 0.8)",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    fontSize: 13,
                    fontWeight: 500,
                    userSelect: "none",
                    boxSizing: "border-box",
                    ...style,
                }}
                className={className}
            >
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ opacity: 0.6 }}
                >
                    <polygon points="23 7 16 12 23 17 23 7" />
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
                <span>Add a video file</span>
                <span style={{ fontSize: 10, opacity: 0.6 }}>
                    CursorScrubVideo
                </span>
            </div>
        )
    }

    // =========================================================================
    // 5. MAIN RENDERED COMPONENT
    // =========================================================================
    return (
        <div
            ref={containerRef}
            className={className}
            style={{
                width: "100%",
                height: "100%",
                position: "relative",
                overflow: "hidden",
                borderRadius: `${borderRadius}px`,
                backgroundColor: "#000000",
                touchAction: trackingArea === "component" ? "none" : "auto",
                ...style,
            }}
        >
            <video
                ref={videoRef}
                src={videoSrc}
                muted
                playsInline
                preload="auto"
                disableRemotePlayback
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit,
                    borderRadius: `${borderRadius}px`,
                    display: "block",
                    pointerEvents: "none",
                    opacity: !isBuffered && showPoster ? 0.85 : 1,
                    transition: "opacity 0.25s ease-out",
                }}
            />

            {/* Buffering Indicator */}
            {!isBuffered && !hasError && (
                <div
                    style={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        padding: "4px 8px",
                        borderRadius: 12,
                        background: "rgba(0, 0, 0, 0.45)",
                        backdropFilter: "blur(8px)",
                        color: "rgba(255, 255, 255, 0.75)",
                        fontFamily: "-apple-system, BlinkMacSystemFont, monospace",
                        fontSize: 10,
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        pointerEvents: "none",
                    }}
                >
                    Buffering...
                </div>
            )}

            {/* Error Overlay */}
            {hasError && (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(0,0,0,0.7)",
                        color: "#ff6b6b",
                        fontSize: 12,
                        fontFamily: "sans-serif",
                    }}
                >
                    Failed to load video asset
                </div>
            )}
        </div>
    )
}

// ============================================================================
// FRAMER PROPERTY CONTROLS
// ============================================================================
addPropertyControls(CursorScrubVideo, {
    videoFile: {
        type: ControlType.File,
        title: "Video File",
        allowedFileTypes: ["mp4", "webm", "mov", "m4v"],
        description:
            "Upload an intraframe/All-I video (GOP=1) for smooth frame-accurate scrubbing.",
    },
    axis: {
        type: ControlType.Enum,
        title: "Axis",
        options: ["horizontal", "vertical"],
        optionTitles: ["Horizontal (X)", "Vertical (Y)"],
        defaultValue: "horizontal",
        displaySegmentedControl: true,
    },
    reverse: {
        type: ControlType.Boolean,
        title: "Reverse",
        defaultValue: false,
        enabledTitle: "Flipped",
        disabledTitle: "Normal",
    },
    trackingArea: {
        type: ControlType.Enum,
        title: "Tracking Area",
        options: ["component", "window"],
        optionTitles: ["Component Box", "Entire Window"],
        defaultValue: "component",
    },
    smoothing: {
        type: ControlType.Number,
        title: "Smoothing",
        min: 0.02,
        max: 1.0,
        step: 0.01,
        defaultValue: 0.22,
        displayStepper: true,
        description: "Lerp factor: 0.02 (high inertia) to 1.0 (instant snap).",
    },
    objectFit: {
        type: ControlType.Enum,
        title: "Object Fit",
        options: ["cover", "contain", "fill"],
        optionTitles: ["Cover", "Contain", "Fill"],
        defaultValue: "cover",
    },
    showPoster: {
        type: ControlType.Boolean,
        title: "Show Poster",
        defaultValue: true,
        description: "Displays frame 0 while video buffers.",
    },
    borderRadius: {
        type: ControlType.Number,
        title: "Radius",
        min: 0,
        max: 120,
        step: 1,
        unit: "px",
        defaultValue: 0,
    },
})
