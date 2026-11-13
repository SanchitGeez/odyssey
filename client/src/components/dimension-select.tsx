import type { LifeDimension } from '../app/types'
import { DIMENSIONS, DIMENSION_KEYS } from '../lib/dimensions'
import { DimensionLabel } from './dimension-label'
import { SelectField } from './select-field'

export function DimensionSelect({ value, onChange, allowEmpty = false, disabled = false }: { value: LifeDimension | ''; onChange: (value: LifeDimension | '') => void; allowEmpty?: boolean; disabled?: boolean }) {
  const options = DIMENSION_KEYS.map(key => ({ value: key, label: DIMENSIONS[key].label, content: <DimensionLabel dim={key} /> }))
  return <SelectField value={value} onValueChange={next => onChange(next as LifeDimension | '')} disabled={disabled} name="category" label="Category" className="ody-dimension-select" options={allowEmpty ? [{ value: '', label: 'No dimension', content: <span className="ody-muted">No dimension</span> }, ...options] : options} />
}
