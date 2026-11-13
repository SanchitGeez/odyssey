import { useRef, type ReactNode } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Icon } from './icons'

export function SlideOver({ open, onClose, title, subtitle, children, width }: { open: boolean; onClose: () => void; title: string; subtitle?: string; children: ReactNode; width?: string }) {
  const returnFocus = useRef<HTMLElement | null>(null)
  return <Dialog.Root open={open} onOpenChange={value => { if (!value) onClose() }}><Dialog.Portal><Dialog.Overlay className="ody-overlay" /><Dialog.Content className="ody-slide-panel" style={width ? { maxWidth: width } : undefined} onOpenAutoFocus={() => { returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null }} onCloseAutoFocus={event => { event.preventDefault(); returnFocus.current?.focus(); returnFocus.current = null }}>
    <header className="ody-slide-header"><div><Dialog.Title className="ody-slide-title">{title}</Dialog.Title><Dialog.Description className={subtitle ? 'ody-slide-subtitle' : 'sr-only'}>{subtitle || `Complete the ${title.toLowerCase()} form.`}</Dialog.Description></div><Dialog.Close asChild><button className="ody-icon-btn" aria-label="Close panel"><Icon name="x" /></button></Dialog.Close></header><div className="ody-slide-body">{children}</div>
  </Dialog.Content></Dialog.Portal></Dialog.Root>
}
