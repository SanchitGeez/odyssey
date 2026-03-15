import type { LifeDimension } from '../app/types'
import { DIMENSIONS } from '../lib/dimensions'

export function DimensionLabel({ dim }: { dim: LifeDimension }) {
  const dimension = DIMENSIONS[dim]
  return (
    <span className="ody-dim-label">
      <span className="ody-dim-dot" style={{ background: `var(${dimension.cssVar})` }} />
      {dimension.label}
    </span>
  )
}
