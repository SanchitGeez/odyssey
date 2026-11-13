import { useRef, type PointerEvent, type ReactNode } from 'react'
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import { Icon } from './icons'

type SwipeCardProps = { children: ReactNode; disabled: boolean; onCommit: (direction: 'left' | 'right') => Promise<boolean> }
type Gesture = { pointerId: number; x: number; y: number; startedAt: number; dragging: boolean }

export function SwipeCard({ children, disabled, onCommit }: SwipeCardProps) {
  const element = useRef<HTMLElement>(null)
  const gesture = useRef<Gesture | null>(null)
  const committing = useRef(false)
  const reducedMotion = useReducedMotion()
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-260, 0, 260], reducedMotion ? [0, 0, 0] : [-7, 0, 7])
  const doneOpacity = useTransform(x, [20, 100], [0, 1])
  const skipOpacity = useTransform(x, [-100, -20], [1, 0])
  const settle = () => {
    element.current?.style.removeProperty('user-select')
    return animate(x, 0, reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 370, damping: 32 })
  }

  const start = (event: PointerEvent<HTMLElement>) => {
    if (disabled || committing.current || !event.isPrimary || event.button !== 0) return
    if (event.clientX < 25 || event.clientX > window.innerWidth - 25) return
    if ((event.target as HTMLElement).closest('button, input, textarea, a, select, summary, [data-no-swipe]')) return
    if (window.getSelection()?.toString()) return
    x.stop()
    gesture.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, startedAt: performance.now(), dragging: false }
  }
  const move = (event: PointerEvent<HTMLElement>) => {
    const current = gesture.current
    if (!current || disabled || current.pointerId !== event.pointerId) return
    const deltaX = event.clientX - current.x
    const deltaY = event.clientY - current.y
    if (!current.dragging) {
      // Vertical scrolling and long presses belong to the browser. Only clear
      // horizontal intent turns the surrounding card surface into a drag.
      if (Math.abs(deltaY) > 12 || performance.now() - current.startedAt > 260) { gesture.current = null; return }
      if (Math.abs(deltaX) < 14 || Math.abs(deltaX) < Math.abs(deltaY) * 1.35) return
      current.dragging = true
      element.current?.style.setProperty('user-select', 'none')
      window.getSelection()?.removeAllRanges()
      event.currentTarget.setPointerCapture(event.pointerId)
    }
    event.preventDefault()
    x.set(Math.max(-280, Math.min(280, deltaX)))
  }
  const finish = async (event: PointerEvent<HTMLElement>) => {
    const current = gesture.current
    gesture.current = null
    if (!current || current.pointerId !== event.pointerId || !current.dragging) return
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    const threshold = Math.max(72, Math.min(120, (element.current?.clientWidth ?? 400) * 0.25))
    const offset = x.get()
    if (Math.abs(offset) < threshold || disabled || committing.current) { settle(); return }
    committing.current = true
    const direction = offset > 0 ? 'right' : 'left'
    // The next card appears only after an acknowledged server response.
    await animate(x, direction === 'right' ? threshold : -threshold, { duration: reducedMotion ? 0 : 0.16 })
    try { await onCommit(direction) } finally { committing.current = false; settle() }
  }
  return <div className="checkin-card-stack">
    <div className="checkin-card-underlay" aria-hidden="true" />
    <motion.div className="checkin-swipe-cue checkin-swipe-cue-done" style={{ opacity: doneOpacity }} aria-hidden="true"><Icon name="check" size={25} /><span>Done</span></motion.div>
    <motion.div className="checkin-swipe-cue checkin-swipe-cue-skip" style={{ opacity: skipOpacity }} aria-hidden="true"><Icon name="x" size={25} /><span>Skip</span></motion.div>
    <motion.article ref={element} className="checkin-commitment-card" style={{ x, rotate, touchAction: 'pan-y pinch-zoom' }} initial={{ opacity: 0, y: reducedMotion ? 0 : 14, scale: reducedMotion ? 1 : 0.975 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: reducedMotion ? 0 : -8, scale: reducedMotion ? 1 : 0.985 }} transition={{ duration: reducedMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }} onPointerDown={start} onPointerMove={move} onPointerUp={(event) => { void finish(event) }} onPointerCancel={() => { gesture.current = null; settle() }} aria-label="Current commitment" aria-describedby="checkin-swipe-hint" aria-busy={disabled}>{children}</motion.article>
  </div>
}
