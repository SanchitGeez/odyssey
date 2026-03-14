import type { AuthTokens } from '../app/types'

const TOKENS_KEY = 'odyssey.tokens.v1'
const ONBOARDING_KEY = 'odyssey.onboarding-complete.v1'

export function getStoredTokens(): AuthTokens | null {
  const raw = localStorage.getItem(TOKENS_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthTokens
  } catch {
    localStorage.removeItem(TOKENS_KEY)
    return null
  }
}

export function setStoredTokens(tokens: AuthTokens | null): void {
  if (!tokens) {
    localStorage.removeItem(TOKENS_KEY)
    return
  }
  localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens))
}

export function isOnboardingComplete(userId: string | null): boolean {
  if (!userId) return false
  return localStorage.getItem(`${ONBOARDING_KEY}:${userId}`) === 'true'
}

export function setOnboardingComplete(userId: string): void {
  localStorage.setItem(`${ONBOARDING_KEY}:${userId}`, 'true')
}
