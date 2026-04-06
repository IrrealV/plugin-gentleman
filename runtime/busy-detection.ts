const isRecord = (value: unknown): value is Record<string, unknown> => {
  return !!value && typeof value === "object" && !Array.isArray(value)
}

export const isBusySessionStatus = (statusValue: unknown): boolean => {
  const normalized = String(statusValue ?? "").toLowerCase()
  return normalized === "busy" || normalized === "retry"
}

export const isSessionBusy = (statusPayload: unknown): boolean => {
  if (!statusPayload) return false
  if (typeof statusPayload === "string") return isBusySessionStatus(statusPayload)
  if (!isRecord(statusPayload)) return false

  return (
    isBusySessionStatus(statusPayload.status) ||
    isBusySessionStatus(statusPayload.state) ||
    isBusySessionStatus(statusPayload.phase)
  )
}
