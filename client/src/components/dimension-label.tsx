import type { LifeDimension } from '../app/types'
import { DIMENSIONS } from '../lib/dimensions'
import { DimensionMark } from './dimension-mark'

export function DimensionLabel({ dim }: { dim: LifeDimension }) {
  return <span className="ody-dim-label"><DimensionMark dimension={dim} size={21} />{DIMENSIONS[dim].label}</span>
}
