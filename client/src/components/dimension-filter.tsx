import type { LifeDimension } from '../app/types'
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
        className={`ody-filter-tab${value === 'all' ? ' active' : ''}`}
        onClick={() => onChange('all')}
      >
        All
      </button>
      {DIMENSION_KEYS.map((dimensionKey) => (
        <button
          key={dimensionKey}
          type="button"
          className={`ody-filter-tab${value === dimensionKey ? ' active' : ''}`}
          onClick={() => onChange(dimensionKey)}
        >
          {DIMENSIONS[dimensionKey].label}
        </button>
      ))}
    </div>
  )
}
