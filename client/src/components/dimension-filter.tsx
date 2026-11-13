import type { LifeDimension } from '../app/types'
import { DimensionMark } from './dimension-mark'
import { DIMENSIONS, DIMENSION_KEYS } from '../lib/dimensions'

type DimensionFilterValue = LifeDimension | 'all'

interface DimensionFilterProps {
  value: DimensionFilterValue
  onChange: (dim: DimensionFilterValue) => void
}

export function DimensionFilter({ value, onChange }: DimensionFilterProps) {
  return (
    <div className="ody-filter-bar">
      <button
        type="button"
        aria-pressed={value === 'all'}
        className={`ody-filter-tab${value === 'all' ? ' active' : ''}`}
        onClick={() => onChange('all')}
      >
        All
      </button>
      {DIMENSION_KEYS.map((dimensionKey) => (
        <button
          key={dimensionKey}
          type="button"
          aria-pressed={value === dimensionKey}
          className={`ody-filter-tab${value === dimensionKey ? ' active' : ''}`}
          onClick={() => onChange(dimensionKey)}
        >
          <DimensionMark dimension={dimensionKey} size={20} />{DIMENSIONS[dimensionKey].label}
        </button>
      ))}
    </div>
  )
}
