import { createEffect, onCleanup, type Accessor, type Setter } from "solid-js"
import { pickBusyPhrase } from "../../phrases.ts"
import type { DetectedStack } from "../../utils/detection.ts"
import type { MustachiVisualState } from "../../utils/animation-utils.ts"
import { pupilPositionFrames, tongueFrames } from "../../ascii-frames.ts"

export const setupPupilMovementEffect = (input: {
  animations: Accessor<boolean>
  visualState: Accessor<MustachiVisualState>
  setPupilIndex: Setter<number>
}) => {
  createEffect(() => {
    if (!input.animations() || input.visualState() !== "idle") {
      input.setPupilIndex(0)
      return
    }

    const interval = setInterval(() => {
      if (Math.random() < 0.6) {
        input.setPupilIndex(0)
      } else {
        const randomDir = 1 + Math.floor(Math.random() * (pupilPositionFrames.length - 1))
        input.setPupilIndex(randomDir)
      }
    }, 3000)

    onCleanup(() => clearInterval(interval))
  })
}

export const setupBlinkEffect = (input: {
  animations: Accessor<boolean>
  setBlinkFrame: Setter<number>
}) => {
  createEffect(() => {
    if (!input.animations()) return

    const timeoutIds = new Set<ReturnType<typeof setTimeout>>()
    const schedule = (fn: () => void, delay: number) => {
      const timeoutId = setTimeout(() => {
        timeoutIds.delete(timeoutId)
        fn()
      }, delay)
      timeoutIds.add(timeoutId)
    }

    const blinkSequence = () => {
      input.setBlinkFrame(0)
      schedule(() => input.setBlinkFrame(1), 100)
      schedule(() => input.setBlinkFrame(2), 180)
      schedule(() => input.setBlinkFrame(1), 260)
      schedule(() => input.setBlinkFrame(0), 340)
    }

    const interval = setInterval(() => {
      if (Math.random() < 0.35) blinkSequence()
    }, 2000)

    onCleanup(() => {
      clearInterval(interval)
      for (const timeoutId of timeoutIds) {
        clearTimeout(timeoutId)
      }
      timeoutIds.clear()
    })
  })
}

export const setupTongueAndPhraseEffect = (input: {
  animations: Accessor<boolean>
  shouldShowExpression: Accessor<boolean>
  detectedStack: Accessor<DetectedStack | undefined>
  setTongueFrame: Setter<number>
  setBusyPhrase: Setter<string>
  setExpressiveCycle: Setter<boolean>
  setPhraseCycle: Setter<number>
}) => {
  createEffect(() => {
    if (!input.animations()) {
      input.setTongueFrame(0)
      input.setBusyPhrase("")
      input.setExpressiveCycle(false)
      return
    }

    if (!input.shouldShowExpression()) {
      input.setTongueFrame(0)
      input.setBusyPhrase("")
      return
    }

    let currentFrame = 0
    let tongueTimeoutId: ReturnType<typeof setTimeout> | undefined

    const growTongue = () => {
      if (currentFrame < tongueFrames.length - 1) {
        currentFrame += 1
        input.setTongueFrame(currentFrame)
      }
    }

    tongueTimeoutId = setTimeout(growTongue, 200)

    const rotatePhrase = () => {
      input.setPhraseCycle(previousCycle => {
        const nextCycle = previousCycle + 1
        input.setBusyPhrase(previous => pickBusyPhrase({ framework: input.detectedStack(), cycle: nextCycle, previous }))
        return nextCycle
      })
    }

    rotatePhrase()
    const phraseInterval = setInterval(rotatePhrase, 3500)

    onCleanup(() => {
      if (tongueTimeoutId !== undefined) clearTimeout(tongueTimeoutId)
      clearInterval(phraseInterval)
    })
  })
}

export const setupExpressiveCycleEffect = (input: {
  animations: Accessor<boolean>
  isBusy: Accessor<boolean>
  runtimeHint: Accessor<MustachiVisualState | undefined>
  setExpressiveCycle: Setter<boolean>
}) => {
  createEffect(() => {
    if (!input.animations() || input.isBusy()) {
      input.setExpressiveCycle(false)
      return
    }

    if (input.runtimeHint() === "working" || input.runtimeHint() === "thinking") {
      input.setExpressiveCycle(false)
      return
    }

    let cycleEndTimeout: ReturnType<typeof setTimeout> | undefined

    const triggerExpressiveCycle = () => {
      input.setExpressiveCycle(true)
      cycleEndTimeout = setTimeout(() => {
        input.setExpressiveCycle(false)
      }, 8000)
    }

    const firstDelay = 45000 + Math.random() * 15000
    const firstTimeout = setTimeout(triggerExpressiveCycle, firstDelay)

    const interval = setInterval(() => {
      triggerExpressiveCycle()
    }, 45000 + Math.random() * 15000)

    onCleanup(() => {
      clearTimeout(firstTimeout)
      clearInterval(interval)
      if (cycleEndTimeout !== undefined) clearTimeout(cycleEndTimeout)
      input.setExpressiveCycle(false)
    })
  })
}
