import { useRef, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Icon } from './icons'

export function ConfirmDialog({ open, onClose, onConfirm, title, description, busy = false }: { open: boolean; onClose: () => void; onConfirm: () => void | Promise<void>; title: string; description: string; busy?: boolean }) {
  const cancel = useRef<HTMLButtonElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const locked = busy || pending
  return <Dialog.Root open={open} onOpenChange={value => { if (!value && !locked) { setError(''); onClose() } }}><Dialog.Portal><Dialog.Overlay className="ody-overlay" /><Dialog.Content className="ody-confirm-dialog" onOpenAutoFocus={event => { returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; event.preventDefault(); cancel.current?.focus() }} onCloseAutoFocus={event => { event.preventDefault(); returnFocus.current?.focus(); returnFocus.current = null }} onEscapeKeyDown={event => { if (locked) event.preventDefault() }} onPointerDownOutside={event => { if (locked) event.preventDefault() }}>
    <Icon name="trash" size={30} /><Dialog.Title>{title}</Dialog.Title><Dialog.Description>{description}</Dialog.Description>{error && <p role="alert" className="ody-error">{error}</p>}<div className="ody-row"><button ref={cancel} className="ody-btn secondary" onClick={onClose} disabled={locked}>Cancel</button><button className="ody-btn danger" disabled={locked} onClick={async () => { setPending(true); setError(''); try { await onConfirm() } catch (err) { setError(err instanceof Error ? err.message : 'Could not delete. Try again.') } finally { setPending(false) } }}>{locked ? 'Deleting...' : 'Delete'}</button></div>
  </Dialog.Content></Dialog.Portal></Dialog.Root>
}
