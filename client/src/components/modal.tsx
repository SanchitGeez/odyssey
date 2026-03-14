import { useEffect, useRef, type ReactNode } from 'react'
import { Icon } from './icons'

type ModalProps = {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
  width?: string
}

export function SlideOver({ open, onClose, title, subtitle, children, width }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="ody-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div
        ref={panelRef}
        className="ody-slide-panel"
        style={width ? { maxWidth: width } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="ody-slide-header">
          <div>
            <h2 className="ody-slide-title">{title}</h2>
            {subtitle ? <p className="ody-slide-subtitle">{subtitle}</p> : null}
          </div>
          <button className="ody-icon-btn" onClick={onClose} aria-label="Close panel">
            <Icon name="x" size={18} />
          </button>
        </header>
        <div className="ody-slide-body">{children}</div>
      </div>
    </div>
  )
}
