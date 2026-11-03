import Matter from "matter-js"
import { playSound } from "./sound"

export interface FooterPhysicsInstance {
  destroy: () => void
}

const {
  Bodies,
  Body,
  Composite,
  Constraint,
  Engine,
  Events,
  Sleeping,
  Vector,
} = Matter

export function setupFooterPhysics(
  container: HTMLElement,
  ballElements: (HTMLElement | null)[]
): FooterPhysicsInstance {
  const validElements = ballElements.filter(
    (el): el is HTMLElement => el !== null
  )
  if (!validElements.length || typeof window === "undefined") {
    return { destroy: () => {} }
  }

  // Check reduced motion
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return { destroy: () => {} }
  }

  const vw = (v: number) => (v * window.innerWidth) / 100

  let width = container.clientWidth
  let height = container.clientHeight
  if (!width || !height) {
    return { destroy: () => {} }
  }

  const engine = Engine.create({
    enableSleeping: false,
  })

  // Gravity scale (with minimum floor on small mobile viewports)
  engine.gravity.y = 1
  engine.gravity.scale = Math.max((60 * 1 * vw(1)) / 1e6, 0.0008)

  // --- MOBILE GYROSCOPE TILT & SHAKE PHYSICS ---
  let targetGravityX = 0
  let targetGravityY = 1

  // 1. Gyroscope Device Orientation (Tilting phone left/right/forward/back)
  const onDeviceOrientation = (e: DeviceOrientationEvent) => {
    if (e.gamma === null || e.beta === null) return

    // gamma: left-to-right tilt in degrees [-90 to 90]
    const gamma = Math.max(-65, Math.min(65, e.gamma))
    // beta: front-to-back tilt in degrees [-180 to 180]
    // Natural hand-held phone angle is ~40-50 degrees upright
    const beta = Math.max(-30, Math.min(85, e.beta - 45))

    const radGamma = (gamma * Math.PI) / 180
    const radBeta = (beta * Math.PI) / 180

    targetGravityX = Math.sin(radGamma) * 1.8
    targetGravityY = Math.max(0.2, Math.cos(radGamma) * Math.cos(radBeta) * 1.4)

    // Wake up bodies on tilt
    for (const { body } of balls) {
      if (body.isSleeping) {
        Sleeping.set(body, false)
      }
    }
  }

  // 2. Accelerometer Device Motion (Shaking phone)
  let lastAccX = 0
  let lastAccY = 0
  let lastAccZ = 0
  let lastShakeTimestamp = 0

  const onDeviceMotion = (e: DeviceMotionEvent) => {
    const acc = e.acceleration || e.accelerationIncludingGravity
    if (!acc) return

    const ax = acc.x ?? 0
    const ay = acc.y ?? 0
    const az = acc.z ?? 0

    const deltaX = Math.abs(ax - lastAccX)
    const deltaY = Math.abs(ay - lastAccY)
    const deltaZ = Math.abs(az - lastAccZ)

    lastAccX = ax
    lastAccY = ay
    lastAccZ = az

    const totalDelta = deltaX + deltaY + deltaZ
    const now = performance.now()

    // Shake threshold
    if (totalDelta > 13 && now - lastShakeTimestamp > 180) {
      lastShakeTimestamp = now
      const intensity = Math.min((totalDelta - 13) / 16, 2.0)

      for (const { body } of balls) {
        Sleeping.set(body, false)
        const angle = (Math.random() - 0.5) * Math.PI
        const forceMag = (0.015 + Math.random() * 0.02) * intensity

        Body.applyForce(body, body.position, {
          x: Math.sin(angle) * forceMag * 1.5 - ax * 0.003,
          y: -Math.abs(Math.cos(angle) * forceMag * 2.2) - 0.01 * intensity,
        })
        Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.4 * intensity)
      }

      playSound("ballHit", Math.min(0.25 + intensity * 0.35, 1))
    }
  }

  // 3. Attach orientation & motion listeners (with iOS permission handling)
  let sensorsActive = false
  const attachSensors = () => {
    if (sensorsActive) return
    sensorsActive = true
    window.addEventListener("deviceorientation", onDeviceOrientation, { passive: true })
    window.addEventListener("devicemotion", onDeviceMotion, { passive: true })
  }

  // Non-iOS browsers (Android, Chrome, DevTools) allow immediate binding
  if (
    typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => unknown })?.requestPermission !== "function" &&
    typeof (DeviceMotionEvent as unknown as { requestPermission?: () => unknown })?.requestPermission !== "function"
  ) {
    attachSensors()
  }

  // iOS Safari user gesture handler
  const requestSensorsOnGesture = async () => {
    if (sensorsActive) return

    type RequestableEvent = { requestPermission?: () => Promise<string> }
    const orientationEvent = DeviceOrientationEvent as unknown as RequestableEvent
    const motionEvent = DeviceMotionEvent as unknown as RequestableEvent

    if (typeof orientationEvent?.requestPermission === "function") {
      try {
        const state = await orientationEvent.requestPermission()
        if (state === "granted") {
          window.addEventListener("deviceorientation", onDeviceOrientation, { passive: true })
        }
      } catch {}
    }

    if (typeof motionEvent?.requestPermission === "function") {
      try {
        const state = await motionEvent.requestPermission()
        if (state === "granted") {
          window.addEventListener("devicemotion", onDeviceMotion, { passive: true })
        }
      } catch {}
    }

    sensorsActive = true
  }

  window.addEventListener("pointerdown", requestSensorsOnGesture, { once: true })
  window.addEventListener("touchstart", requestSensorsOnGesture, { once: true, passive: true })

  // Sound throttler on collision
  let lastHitTime = 0
  Events.on(engine, "collisionStart", ({ pairs }) => {
    let maxImpactSpeed = 0
    for (const { bodyA, bodyB, collision } of pairs) {
      const normal = collision.normal
      const relSpeed =
        (60 *
          Math.abs(
            (bodyA.velocity.x - bodyB.velocity.x) * normal.x +
              (bodyA.velocity.y - bodyB.velocity.y) * normal.y
          )) /
        vw(1)
      maxImpactSpeed = Math.max(maxImpactSpeed, relSpeed)
    }

    const now = performance.now()
    if (maxImpactSpeed > 7 && now - lastHitTime >= 90) {
      lastHitTime = now
      const vol = Math.min(Math.max((maxImpactSpeed - 7) / 45, 0.18), 1)
      playSound("ballHit", vol)
    }
  })

  // Calculate ball positions & initial setup
  let floorOffset = Math.max(vw(2.5), 26)
  let floorY = height - floorOffset

  const ballInfos = validElements.map((el) => {
    const radius = el.offsetWidth / 2
    const home = {
      x: el.offsetLeft + radius,
      y: el.offsetTop + radius,
    }
    return {
      el,
      radius,
      home,
      side: home.x < width / 2 ? -1 : 1,
    }
  })

  // Order balls for staggered entrance
  const lefts = ballInfos
    .map((b, i) => (b.side < 0 ? i : -1))
    .filter((i) => i >= 0)
  const rights = ballInfos
    .map((b, i) => (b.side > 0 ? i : -1))
    .filter((i) => i >= 0)

  const orderMap = new Map<number, number>()
  for (let i = 0; i < Math.max(lefts.length, rights.length); i++) {
    if (i < lefts.length) orderMap.set(lefts[i], orderMap.size)
    if (i < rights.length) orderMap.set(rights[i], orderMap.size)
  }

  // Create Matter Circle Bodies for each ball
  // Place them initially at their home or staggered spawn inside screen bounds
  const balls = ballInfos.map((info, idx) => {
    const { radius, home, side, el } = info
    const order = orderMap.get(idx) ?? 0

    // Spawn inside or near the top/sides without ever cutting
    const spawnX = Math.min(Math.max(home.x, radius + 10), width - radius - 10)
    const spawnY = Math.min(
      Math.max(home.y, radius + 10),
      floorY - radius - 10
    )

    const body = Bodies.circle(spawnX, spawnY, radius, {
      restitution: 0.42,
      friction: 0.12,
      frictionAir: 0.006,
      density: 0.001,
      collisionFilter: {
        category: 1,
        mask: -1,
        group: 0,
      },
    })

    return {
      el,
      body,
      home,
      side,
      radius,
      releaseAt: order * 0.16,
      released: true,
    }
  })

  // Boundary walls positioned so the inner faces are strictly inside or at screen edge
  const wallThick = 250

  const makeStaticRect = (
    x: number,
    y: number,
    w: number,
    h: number,
    friction = 0.1
  ) =>
    Bodies.rectangle(x, y, w, h, {
      isStatic: true,
      friction,
      restitution: 0.38,
      collisionFilter: {
        category: 1,
        mask: -1,
        group: 0,
      },
    })

  // Ceiling at top
  let ceiling = makeStaticRect(width / 2, -wallThick / 2, width * 2, wallThick)
  // Floor at floorY
  let floor = makeStaticRect(
    width / 2,
    floorY + wallThick / 2,
    width * 2,
    wallThick,
    0.2
  )
  // Left wall: surface at x = 0 (so ball center cannot go below ball.radius)
  let leftWall = makeStaticRect(
    -wallThick / 2,
    height / 2,
    wallThick,
    height * 3,
    0.05
  )
  // Right wall: surface at x = width (so ball center cannot exceed width - ball.radius)
  let rightWall = makeStaticRect(
    width + wallThick / 2,
    height / 2,
    wallThick,
    height * 3,
    0.05
  )

  Composite.add(engine.world, [
    ceiling,
    floor,
    leftWall,
    rightWall,
    ...balls.map((b) => b.body),
  ])

  // Mouse & Drag State
  let dragConstraint: Matter.Constraint | null = null
  let selectedBody: Matter.Body | null = null
  let pointerX = 0
  let pointerY = 0
  let pointerDeltaX = 0
  let pointerDeltaY = 0
  let isPointerInside = false
  let hasDragged = false
  let startDragX = 0
  let startDragY = 0

  const updatePointerCoord = (e: PointerEvent) => {
    const rect = container.getBoundingClientRect()
    const rx = e.clientX - rect.left
    const ry = e.clientY - rect.top
    pointerDeltaX = rx - pointerX
    pointerDeltaY = ry - pointerY
    pointerX = rx
    pointerY = ry

    const buffer = vw(4)
    isPointerInside =
      rx > -buffer &&
      ry > -buffer &&
      rx < rect.width + buffer &&
      ry < rect.height + buffer
  }

  const releaseConstraint = () => {
    if (dragConstraint) {
      Composite.remove(engine.world, dragConstraint)
      dragConstraint = null
    }
    selectedBody = null
  }

  const onPointerMove = (e: PointerEvent) => {
    updatePointerCoord(e)

    if (dragConstraint && selectedBody) {
      dragConstraint.pointA = { x: pointerX, y: pointerY }
      if (Math.hypot(pointerX - startDragX, pointerY - startDragY) > 8) {
        hasDragged = true
      }
    }
  }

  const onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0) return
    updatePointerCoord(e)

    // Check which ball was clicked
    const hit = balls.find(({ body, radius }) => {
      const d = Math.hypot(body.position.x - pointerX, body.position.y - pointerY)
      return d <= radius
    })

    if (!hit) return

    selectedBody = hit.body
    startDragX = pointerX
    startDragY = pointerY
    hasDragged = false
    Sleeping.set(hit.body, false)

    // Calculate local offset relative to rotated body
    const localDiff = Vector.sub(
      { x: pointerX, y: pointerY },
      hit.body.position
    )
    const rotatedDiff = Vector.rotate(localDiff, -hit.body.angle)
    const pointB = Vector.mult(rotatedDiff, 0.35)

    dragConstraint = Constraint.create({
      pointA: { x: pointerX, y: pointerY },
      bodyB: hit.body,
      pointB,
      length: 0,
      stiffness: 0.08,
      damping: 0.08,
    })

    Composite.add(engine.world, dragConstraint)
    e.preventDefault()
  }

  const onPointerUp = () => {
    releaseConstraint()
  }

  const onClickCapture = (e: MouseEvent) => {
    if (hasDragged) {
      e.preventDefault()
      e.stopPropagation()
      hasDragged = false
    }
  }

  window.addEventListener("pointermove", onPointerMove, { passive: true })
  window.addEventListener("pointerdown", onPointerDown)
  window.addEventListener("pointerup", onPointerUp, { passive: true })
  window.addEventListener("pointercancel", onPointerUp, { passive: true })
  container.addEventListener("click", onClickCapture, { capture: true })

  // Simulation loop
  let isRunning = true
  let rafId = 0
  let lastTime = performance.now()

  const syncDOM = () => {
    for (const { el, body, home } of balls) {
      const tx = (body.position.x - home.x).toFixed(2)
      const ty = (body.position.y - home.y).toFixed(2)
      const rot = body.angle.toFixed(4)
      el.style.transform = `translate3d(${tx}px, ${ty}px, 0) rotate(${rot}rad)`
    }
  }

  const tick = (now: number) => {
    if (!isRunning) return

    const dt = Math.min((now - lastTime) / 1000, 0.033)
    lastTime = now

    // 1. Dynamic Cursor push force (when mouse glides near any ball)
    if (isPointerInside) {
      const pointerSpeed = Math.min(
        Math.hypot(pointerDeltaX, pointerDeltaY),
        55
      )
      if (pointerSpeed > 0.6) {
        const influenceDist = vw(5.5)
        const speedNorm = pointerSpeed / 55
        const baseMass = Math.PI * Math.pow(vw(8), 2) * 0.001 * (vw(1) / 1e6)
        const pushMag = 200 * baseMass * speedNorm
        const dragNudge = 70 * baseMass

        for (const { body, radius } of balls) {
          if (body === selectedBody) continue
          const dx = body.position.x - pointerX
          const dy = body.position.y - pointerY
          const dist = Math.hypot(dx, dy) || 1e-4
          const clearance = dist - radius
          if (clearance > influenceDist) continue

          const falloff = Math.min(1 - clearance / influenceDist, 1)
          const nx = dx / dist
          const ny = dy / dist
          const contactPt = {
            x: body.position.x - nx * radius,
            y: body.position.y - ny * radius,
          }

          const fx =
            nx * pushMag * falloff + (pointerDeltaX / pointerSpeed) * dragNudge * falloff
          const fy =
            ny * pushMag * falloff + (pointerDeltaY / pointerSpeed) * dragNudge * falloff

          Sleeping.set(body, false)
          Body.applyForce(body, contactPt, { x: fx, y: fy })
        }
      }
    }

    // 1.5 Smoothly apply tilt gravity from device orientation
    if (targetGravityX !== 0 || targetGravityY !== 1) {
      engine.gravity.x += (targetGravityX - engine.gravity.x) * 0.12
      engine.gravity.y += (targetGravityY - engine.gravity.y) * 0.12
    }

    // 2. Step physics simulation with standard 60fps delta
    const deltaMs = Math.min(dt * 1000, 16.667)
    Engine.update(engine, deltaMs)

    // 3. Strict screen-edge boundary clamp so NO ball is EVER cut off
    for (const ball of balls) {
      const minX = ball.radius + 6
      const maxX = width - ball.radius - 6
      const maxY = floorY - ball.radius

      if (ball.body.position.x < minX) {
        Body.setPosition(ball.body, { x: minX, y: ball.body.position.y })
        if (ball.body.velocity.x < 0) {
          Body.setVelocity(ball.body, {
            x: -ball.body.velocity.x * 0.35,
            y: ball.body.velocity.y,
          })
        }
      } else if (ball.body.position.x > maxX) {
        Body.setPosition(ball.body, { x: maxX, y: ball.body.position.y })
        if (ball.body.velocity.x > 0) {
          Body.setVelocity(ball.body, {
            x: -ball.body.velocity.x * 0.35,
            y: ball.body.velocity.y,
          })
        }
      }

      if (ball.body.position.y > maxY) {
        Body.setPosition(ball.body, { x: ball.body.position.x, y: maxY })
        if (ball.body.velocity.y > 0) {
          Body.setVelocity(ball.body, {
            x: ball.body.velocity.x,
            y: -ball.body.velocity.y * 0.25,
          })
        }
      }
    }

    // 4. Angular damping when held
    if (selectedBody) {
      Body.setAngularVelocity(selectedBody, 0.92 * selectedBody.angularVelocity)
    }

    // Reset pointer deltas
    pointerDeltaX = 0
    pointerDeltaY = 0

    // 5. Update DOM
    syncDOM()

    rafId = requestAnimationFrame(tick)
  }

  // Handle window resize
  const onResize = () => {
    width = container.clientWidth
    height = container.clientHeight
    floorOffset = Math.max(vw(2.5), 26)
    floorY = height - floorOffset

    Body.setPosition(ceiling, { x: width / 2, y: -wallThick / 2 })
    Body.setPosition(floor, { x: width / 2, y: floorY + wallThick / 2 })
    Body.setPosition(leftWall, { x: -wallThick / 2, y: height / 2 })
    Body.setPosition(rightWall, { x: width + wallThick / 2, y: height / 2 })
  }
  window.addEventListener("resize", onResize, { passive: true })

  // Initial sync & start animation loop
  syncDOM()
  rafId = requestAnimationFrame(tick)

  return {
    destroy: () => {
      isRunning = false
      cancelAnimationFrame(rafId)
      window.removeEventListener("deviceorientation", onDeviceOrientation)
      window.removeEventListener("devicemotion", onDeviceMotion)
      window.removeEventListener("pointerdown", requestSensorsOnGesture)
      window.removeEventListener("touchstart", requestSensorsOnGesture)
      window.removeEventListener("resize", onResize)
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("pointerdown", onPointerDown)
      window.removeEventListener("pointerup", onPointerUp)
      window.removeEventListener("pointercancel", onPointerUp)
      container.removeEventListener("click", onClickCapture, { capture: true })
      releaseConstraint()
      Composite.clear(engine.world, false)
      Engine.clear(engine)
      validElements.forEach((el) => {
        el.style.transform = ""
      })
    },
  }
}
