import type { CSSProperties } from 'react'
import type { LifeDimension } from '../app/types'
import { DIMENSIONS } from '../lib/dimensions'

// Original dimension emblems commissioned by the UI brief, drawn as a single family.
const symbols = {
  vitality: <><path d="M14 27C6 23 3 16 6 7m12 20c8-4 11-11 8-20M6 10c5-1 7 1 7 5-4 0-6-1-7-5Zm0 8c4-2 7-1 8 3-4 1-6 0-8-3Zm20-8c-5-1-7 1-7 5 4 0 6-1 7-5Zm0 8c-4-2-7-1-8 3 4 1 6 0 8-3Z" /><path d="m13 28 3-3 3 3" /></>,
  psyche: <><path d="m7 5 4 3a13 13 0 0 1 10 0l4-3v14c0 6-4 9-9 10-5-1-9-4-9-10V5Z" /><circle cx="11.5" cy="14" r="4" /><circle cx="20.5" cy="14" r="4" /><path d="m14 19 2 3 2-3M12 25l4 4 4-4" /><circle cx="11.5" cy="14" r=".7" fill="currentColor" /><circle cx="20.5" cy="14" r=".7" fill="currentColor" /></>,
  prowess: <><path d="m10 21 13-16 4-1-1 5-14 14M7 17l9 9M6 26l5-5M4 27l2-2 3 3-2 2-3-3Z" /><path d="m13 19 9-11" /></>,
  wealth: <><ellipse cx="12" cy="9" rx="8" ry="4" /><path d="M4 9v6c0 2 4 4 8 4m-8-7c0 2 4 4 8 4m8-7v5" /><ellipse cx="21" cy="20" rx="7" ry="3.5" /><path d="M14 20v6c0 2 3 3 7 3s7-1 7-3v-6m-14 3c0 2 3 3 7 3s7-1 7-3" /></>,
  alliance: <><path d="m3 13 5-5 5 1 5-2 5 3 6 6-5 6-6 5-6-2-9-8 4-5m2-1 5-1-4 5c2 2 4 2 6 0l2-2 7 7M3 13l-2 3 4 5 3-2m21-6 2 3-4 5-3-2M12 20l5 5m0-9 6 6" /></>,
  legacy: <><path d="m3 11 13-7 13 7H3Zm2 4h22M4 28h24M7 15v10m6-10v10m6-10v10m6-10v10M3 25h26" /><path d="M12 9h8" /></>,
}

export function DimensionMark({ dimension, size = 24, className = '' }: { dimension: LifeDimension; size?: number; className?: string }) {
  return <span className={`ody-dimension-mark ody-dimension-${dimension} ${className}`} style={{ '--dimension-color': `var(${DIMENSIONS[dimension].cssVar})` } as CSSProperties} aria-hidden="true">
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round">{symbols[dimension]}</svg>
  </span>
}
