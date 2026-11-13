import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useAuth } from '../app/auth'
import { AppShell } from '../components/layout'
import { DimensionLabel } from '../components/dimension-label'
import { Icon } from '../components/icons'
import { SwipeCard } from '../components/swipe-card'
import type { DailyItemsResponse } from '../app/types'
import { shiftDays, todayIso, formatDate } from '../lib/date'
import '../checkin.css'

type DailyResponse = 'done' | 'skipped' | 'value_logged'
function messageFrom(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') return error.message
  return fallback
}

export function CheckInPage() {
  const { api } = useAuth()
  const reducedMotion = useReducedMotion()
  const [day, setDay] = useState(todayIso)
  const [data, setData] = useState<DailyItemsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [responseError, setResponseError] = useState('')
  const [valueInput, setValueInput] = useState('')
  const [valueNotice, setValueNotice] = useState('')
  const [responding, setResponding] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  const [lastResponse, setLastResponse] = useState<DailyResponse | null>(null)
  const responseLock = useRef(false)
  const requestVersion = useRef(0)

  const load = useCallback(async () => {
    const version = ++requestVersion.current
    setLoading(true)
    setLoadError('')
    setResponseError('')
    try {
      const result = await api.dailyItems(day)
      if (version === requestVersion.current) setData(result)
    } catch (error) {
      if (version === requestVersion.current) setLoadError(messageFrom(error, 'Your check-in could not load. Try again.'))
    } finally {
      if (version === requestVersion.current) setLoading(false)
    }
  }, [api, day])
  useEffect(() => {
    setData(null)
    setValueInput('')
    setValueNotice('')
    setLastResponse(null)
    void load()
    return () => { requestVersion.current += 1 }
  }, [load])

  const pendingItems = data?.items.filter((item) => item.response === null) ?? []
  const activeItem = pendingItems[0]
  const total = data?.total ?? 0
  const answered = data?.answered ?? 0
  const isToday = day === todayIso()
  const isComplete = !loading && !loadError && total > 0 && pendingItems.length === 0

  const respond = async (response: DailyResponse): Promise<boolean> => {
    if (!activeItem || responseLock.current || loading) return false
    setLastResponse(response)
    if (response === 'value_logged' && (!valueInput.trim() || !Number.isFinite(Number(valueInput)))) {
      setResponseError('Enter a number before recording a value.')
      return false
    }
    responseLock.current = true
    setResponding(true)
    setResponseError('')
    try {
      await api.respondDaily(activeItem.task_id, response, day, response === 'value_logged' ? { value: Number(valueInput) } : undefined)
      if (response === 'value_logged') {
        // Measurements are activity, not daily Done/Skip responses. Match the
        // backend: keep this commitment pending until the user reviews it.
        const notice = `Recorded ${valueInput}. Mark Done or Skip to review this commitment.`
        setValueNotice(notice)
        setAnnouncement(notice)
        setValueInput('')
        setLastResponse(null)
        return true
      }
      // Keep acknowledged responses in this session. Reloading the daily list can
      // remove a one-time task because the server archives it immediately.
      setData((current) => current ? {
        ...current, answered: current.answered + 1, pending: Math.max(0, current.pending - 1),
        items: current.items.map((item) => item.task_id === activeItem.task_id ? { ...item, response } : item),
      } : current)
      setValueInput('')
      setValueNotice('')
      setAnnouncement(`${activeItem.title}: ${response === 'done' ? 'done' : 'skipped'}. Progress saved.`)
      setLastResponse(null)
      return true
    } catch (error) {
      setResponseError(messageFrom(error, 'Your response was not saved. Try again.'))
      setAnnouncement('Your response could not be saved. Your card is still here.')
      return false
    } finally {
      responseLock.current = false
      setResponding(false)
    }
  }

  return (
    <AppShell title="Check-In" subtitle="One commitment at a time." actions={
      <div className="checkin-date-nav" aria-label="Check-in date">
        <button className="ody-icon-btn" type="button" onClick={() => setDay((value) => shiftDays(value, -1))} disabled={responding} aria-label="Previous day"><Icon name="arrow-left" size={18} /></button>
        <span>{isToday ? 'Today' : formatDate(day)}</span>
        <button className="ody-icon-btn" type="button" onClick={() => setDay((value) => shiftDays(value, 1))} disabled={responding || isToday} aria-label="Next day"><Icon name="arrow-right" size={18} /></button>
      </div>
    }>
      <section className="checkin-stage" aria-label="Daily check-in">
        <div className="checkin-landscape" aria-hidden="true" />
        <div className="checkin-introduction"><h2>{isComplete ? 'Carry this forward.' : 'Meet the day.'}</h2><p>{isComplete ? 'Make a little space to reflect on what comes next.' : 'Show up for the things that matter to you.'}</p></div>
        <div className="checkin-workspace">
          {!loading && !loadError && total > 0 ? <div className="checkin-progress">
            <div className="checkin-progress-label"><span>{answered === total ? 'Check-in complete' : 'Your daily commitments'}</span><span>{answered} / {total} reviewed</span></div>
            <div className="checkin-progress-track" role="progressbar" aria-label="Commitments reviewed" aria-valuemin={0} aria-valuemax={total} aria-valuenow={answered}><motion.div className="checkin-progress-fill" initial={false} animate={{ scaleX: answered / total }} transition={{ duration: reducedMotion ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }} /></div>
          </div> : null}
          {loading ? <div className="checkin-loading" role="status" aria-label="Loading your check-in"><div className="ody-skeleton" style={{ height: 26, width: '36%' }} /><div className="ody-skeleton" style={{ height: 40, width: '85%' }} /><div className="ody-skeleton" style={{ height: 18, width: '60%' }} /><div className="ody-skeleton" style={{ height: 48, width: '100%', marginTop: 34 }} /><span className="checkin-sr-only">Loading your commitments...</span></div>
          : loadError ? <div className="checkin-result"><Icon name="shield" size={34} /><h3>Let’s reconnect.</h3><p role="alert">{loadError}</p><button className="ody-btn" type="button" onClick={() => void load()}>Try again</button></div>
          : isComplete ? <motion.div className="checkin-result checkin-complete" initial={{ opacity: 0, y: reducedMotion ? 0 : 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <span className="checkin-complete-mark"><Icon name="check" size={30} /></span><h3>You showed up.</h3><p>{answered} of {total} commitments reviewed for {isToday ? 'today' : formatDate(day)}. Your responses are saved.</p>
            <div className="checkin-result-actions"><Link className="ody-btn" to="/journals/new"><Icon name="book" size={18} /> Write a reflection</Link><Link className="ody-btn secondary" to="/insights">View Insights <Icon name="arrow-right" size={16} /></Link></div>
          </motion.div>
          : activeItem ? <>
            <AnimatePresence mode="wait" initial={false}><SwipeCard key={`${day}-${activeItem.task_id}`} disabled={responding} onCommit={(direction) => respond(direction === 'right' ? 'done' : 'skipped')}>
              <div className="checkin-card-top" data-no-swipe><DimensionLabel dim={activeItem.category} /><Icon name="shield" size={25} /></div>
              <h3 className="checkin-task-title">{activeItem.title}</h3><p className="checkin-card-prompt">How did this commitment go?</p>
              <div className="checkin-card-actions" data-no-swipe>
                <button className="ody-btn secondary checkin-skip" type="button" disabled={responding} onClick={() => void respond('skipped')}><Icon name="x" size={19} /> Skip</button>
                <button className="ody-btn checkin-done" type="button" disabled={responding} onClick={() => void respond('done')}><Icon name="check" size={19} /> {responding ? 'Saving...' : 'Done'}</button>
              </div>
              <details className="checkin-value-details" data-no-swipe><summary>Record a number</summary><form className="checkin-value-form" onSubmit={(event) => { event.preventDefault(); void respond('value_logged') }}><label htmlFor="checkin-value">Value</label><div><input id="checkin-value" className="ody-input" type="number" step="any" inputMode="decimal" placeholder="e.g. 20" value={valueInput} disabled={responding} onChange={(event) => setValueInput(event.target.value)} /><button className="ody-btn secondary" type="submit" disabled={responding || !valueInput.trim()}>Record</button></div>{valueNotice ? <p role="status">{valueNotice}</p> : <p>Record a measurement, then mark Done or Skip.</p>}</form></details>
            </SwipeCard></AnimatePresence>
            {responseError ? <div className="checkin-response-error" role="alert"><p>{responseError}</p><button className="ody-btn secondary" type="button" disabled={responding} onClick={() => void respond(lastResponse ?? 'done')}>Retry save</button></div> : null}
            <p className="checkin-swipe-hint" id="checkin-swipe-hint"><Icon name="arrow-left" size={14} /> Swipe left to skip <span /> Swipe right for done <Icon name="arrow-right" size={14} /></p>
            <p className="checkin-save-note">{responding ? 'Saving your response...' : answered > 0 ? 'Progress saved. You can continue later.' : 'Every response counts. Return whenever you need.'}</p>
          </>
          : <div className="checkin-result"><span className="checkin-complete-mark"><Icon name="compass" size={30} /></span><h3>A little room to begin.</h3><p>No commitments are scheduled for {isToday ? 'today' : 'this day'}. Set a task that moves you toward what matters.</p><Link className="ody-btn" to="/tasks"><Icon name="plus" size={18} /> Plan your tasks</Link></div>}
        </div>
      </section>
      <div className="checkin-sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</div>
    </AppShell>
  )
}
