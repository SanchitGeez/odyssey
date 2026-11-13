import { useLayoutEffect, useState, type CSSProperties, type ReactNode } from 'react'
import * as Select from '@radix-ui/react-select'
import { Icon } from './icons'

export type SelectOption = { value: string; label: string; icon?: string; content?: ReactNode; disabled?: boolean }
type SelectFieldProps = {
  value: string
  onValueChange: (value: string) => void
  options: readonly SelectOption[]
  label: string
  disabled?: boolean
  required?: boolean
  name?: string
  id?: string
  className?: string
  style?: CSSProperties
  onCloseAutoFocus?: (event: Event) => void
}
const emptyValue = '__odyssey_empty__'
function OptionLabel({ option }: { option: SelectOption }) {
  return option.content || <span className="ody-select-option-label">{option.icon && <Icon name={option.icon} size={18} />}<span>{option.label}</span></span>
}

export function SelectField({ value, onValueChange, options, label, disabled, required, name, id, className = '', style, onCloseAutoFocus }: SelectFieldProps) {
  const [open, setOpen] = useState(false)
  const [menuRegion, setMenuRegion] = useState<HTMLElement | null>(null)
  useLayoutEffect(() => {
    if (!open || !menuRegion) return
    const background = [...document.body.children].filter((element): element is HTMLElement => element instanceof HTMLElement && !element.contains(menuRegion) && !element.hasAttribute('data-radix-focus-guard') && !['SCRIPT', 'STYLE', 'LINK'].includes(element.tagName))
    const previous = background.map(element => ({ element, inert: element.inert }))
    background.forEach(element => { element.inert = true })
    return () => previous.forEach(({ element, inert }) => { element.inert = inert })
  }, [open, menuRegion])
  const selectedOption = options.find(option => option.value === value)
  return <Select.Root open={open} onOpenChange={setOpen} value={value || emptyValue} onValueChange={next => onValueChange(next === emptyValue ? '' : next)} disabled={disabled} required={required} name={name}>
    <Select.Trigger id={id} className={`ody-select-field ${className}`} aria-label={label} style={style}>
      <Select.Value>{selectedOption ? <OptionLabel option={selectedOption} /> : 'Choose an option'}</Select.Value><Select.Icon className="ody-select-caret"><Icon name="chevron-down" size={16} /></Select.Icon>
    </Select.Trigger>
    {open && <Select.Portal><section ref={setMenuRegion} aria-label={`${label} options`}><Select.Content className="ody-select-menu" position="popper" sideOffset={7} collisionPadding={12} onCloseAutoFocus={onCloseAutoFocus}>
      <Select.ScrollUpButton className="ody-select-scroll" aria-label="More options above"><Icon name="chevron-down" size={15} /></Select.ScrollUpButton>
      <Select.Viewport className="ody-select-options">
        {options.map(option => <Select.Item key={option.value} value={option.value || emptyValue} disabled={option.disabled} textValue={option.label} className="ody-select-option">
          <Select.ItemText><OptionLabel option={option} /></Select.ItemText>
          <Select.ItemIndicator className="ody-select-check"><Icon name="check" size={17} /></Select.ItemIndicator>
        </Select.Item>)}
      </Select.Viewport>
      <Select.ScrollDownButton className="ody-select-scroll" aria-label="More options below"><Icon name="chevron-down" size={15} /></Select.ScrollDownButton>
    </Select.Content></section></Select.Portal>}
  </Select.Root>
}
