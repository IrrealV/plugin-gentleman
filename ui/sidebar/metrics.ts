import type { Message } from "../../types.ts"
import { getContextTokens, getMessageCost, getMessageRole, hasTokenData } from "../../utils/message-utils.ts"

export const deriveLiveAssistantStats = (messages: Message[]) => {
  let totalCost = 0
  let contextTokens = 0
  let hasContextTokens = false

  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index]
    if (getMessageRole(message) !== "assistant") continue

    totalCost += getMessageCost(message)

    if (!hasContextTokens && hasTokenData(message)) {
      contextTokens = getContextTokens(message)
      hasContextTokens = true
    }
  }

  return { contextTokens, totalCost }
}
