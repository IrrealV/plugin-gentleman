import { createEffect, createMemo, onCleanup, type Accessor, type Setter } from "solid-js"
import type { DetectedStack } from "../../utils/detection.ts"
import type { MustachiVisualState } from "../../utils/animation-utils.ts"
import { pupilPositionFrames, tongueFrames } from "../../ascii-frames.ts"
import { createMustachiPersonalityLayer } from "../../runtime/personality-layer.ts"
import { deriveMustachiContextSummary } from "../../runtime/mustachi-context.ts"
import type { RuntimeContext } from "../../types.ts"
import type { Cfg } from "../../config.ts"
import type { MustachiModelClient } from "../../runtime/model-client.ts"
import type { ProviderInfo } from "../../types.ts"

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
    if (!input.animations()) {
      input.setBlinkFrame(0)
      return
    }

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
  runtimeContext?: Accessor<RuntimeContext | undefined>
  personalityProviders?: Accessor<ReadonlyArray<ProviderInfo> | undefined>
  personalityEnabled?: Accessor<boolean>
  personalityMode?: Accessor<Cfg["personality_mode"]>
  personalityModel?: Accessor<string>
  personalityModelClient?: Accessor<MustachiModelClient | undefined>
  sessionId?: Accessor<string | undefined>
  setTongueFrame: Setter<number>
  setBusyPhrase: Setter<string>
  setExpressiveCycle: Setter<boolean>
  setPhraseCycle: Setter<number>
}) => {
  const resolveContextMode = () => {
    if (!input.personalityMode) return "auto"
    if (input.personalityMode() === "off") return "off"
    return input.personalityMode()
  }

  const isPersonalityEnabled = () => input.personalityEnabled?.() ?? true

  const resolvedPersonalityModel = () => input.personalityModel?.() ?? ""
  const resolvedPersonalityProviders = () => input.personalityProviders?.()
  const resolvedPersonalityModelClient = () => input.personalityModelClient?.()

  const mustachiPersonality = createMemo(() =>
    createMustachiPersonalityLayer({
      enabled: isPersonalityEnabled(),
      generationMode: resolveContextMode(),
      preferredModel: resolvedPersonalityModel(),
      providers: resolvedPersonalityProviders(),
      modelClient: resolvedPersonalityModelClient(),
    }),
  )

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
    let cancelled = false
    let lastPhrase = ""
    let activeRequestId = 0

    const growTongue = () => {
      if (currentFrame < tongueFrames.length - 1) {
        currentFrame += 1
        input.setTongueFrame(currentFrame)
      }
    }

    tongueTimeoutId = setTimeout(growTongue, 200)

    const rotatePhrase = () => {
      if (!input.animations()) return

      const requestId = ++activeRequestId

      input.setPhraseCycle(previousCycle => {
        const nextCycle = previousCycle + 1

        const signal = input.shouldShowExpression() ? "busy" : "idle"
        const stack = input.detectedStack()

        let context
        try {
          context = deriveMustachiContextSummary({
            signal,
            stack,
            runtimeContext: input.runtimeContext?.(),
            generationMode: resolveContextMode(),
            preferredModel: input.personalityModel?.() ?? "",
            providers: input.personalityProviders?.(),
          })
        } catch (error) {
          console.debug("[sidebar-mustachi-expression] failed to derive context, using stack-only context", error)
          context = deriveMustachiContextSummary({
            signal,
            stack,
            generationMode: resolveContextMode(),
            preferredModel: input.personalityModel?.() ?? "",
            providers: input.personalityProviders?.(),
          })
        }

        const layer = mustachiPersonality()
        const fallbackPhrase = layer.getFallbackPhrase({
          signal,
          stack,
          cycle: nextCycle,
          generationMode: resolveContextMode(),
          preferredModel: input.personalityModel?.() ?? "",
          runtimeContext: input.runtimeContext?.(),
          providers: input.personalityProviders?.(),
          previous: lastPhrase,
          sessionId: input.sessionId?.(),
          context,
        })

        lastPhrase = fallbackPhrase
        input.setBusyPhrase(fallbackPhrase)

        const canGenerate = layer.canGenerate({
          signal,
          stack,
          cycle: nextCycle,
          previous: lastPhrase,
          runtimeContext: input.runtimeContext?.(),
          providers: input.personalityProviders?.(),
          generationMode: resolveContextMode(),
          preferredModel: input.personalityModel?.() ?? "",
          context,
        })

        if (!canGenerate) {
          return nextCycle
        }

        void layer
          .resolvePhrase({
            signal,
            stack,
            cycle: nextCycle,
            previous: fallbackPhrase,
            generationMode: resolveContextMode(),
            preferredModel: input.personalityModel?.() ?? "",
            runtimeContext: input.runtimeContext?.(),
            providers: input.personalityProviders?.(),
            context,
            sessionId: input.sessionId?.(),
            fallbackPhrase,
          })
          .then(nextPhrase => {
            if (!cancelled && requestId === activeRequestId && nextPhrase && nextPhrase !== lastPhrase) {
              lastPhrase = nextPhrase
              input.setBusyPhrase(nextPhrase)
            }
          })
          .catch((error) => {
            console.debug("[sidebar-mustachi-expression] generate fallback failed", error)
          })
        return nextCycle
      })
    }

    rotatePhrase()
    const phraseInterval = setInterval(rotatePhrase, 3500)

    onCleanup(() => {
      cancelled = true
      activeRequestId += 1
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
