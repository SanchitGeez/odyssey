import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AppShell } from '../components/layout'
import { Icon } from '../components/icons'
import { DimensionMark } from '../components/dimension-mark'
import type { LifeDimension } from '../app/types'
import { DIMENSIONS, DIMENSION_KEYS } from '../lib/dimensions'

export function HelpPage() {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState<Record<LifeDimension, boolean>>({
    vitality: true,
    psyche: false,
    prowess: false,
    wealth: false,
    alliance: false,
    legacy: false,
  })

  const toggleSection = (dimensionKey: LifeDimension) => {
    setExpanded((prev) => ({ ...prev, [dimensionKey]: !prev[dimensionKey] }))
  }

  const openTaskPrefill = (dimensionKey: LifeDimension, title: string, taskType: 'recurring' | 'one_time') => {
    const params = new URLSearchParams({
      prefill: 'true',
      title,
      category: dimensionKey,
      type: taskType,
    })
    navigate(`/tasks?${params.toString()}`)
  }

  const openQuestPrefill = (dimensionKey: LifeDimension, title: string) => {
    const params = new URLSearchParams({
      prefill: 'true',
      title,
      category: dimensionKey,
    })
    navigate(`/quests?${params.toString()}`)
  }

  return (
    <AppShell
      title="Life Dimensions"
      subtitle="Explore each dimension and turn an example into your next commitment."
    >
      <div className="ody-card">
        {DIMENSION_KEYS.map((dimensionKey) => {
          const dimension = DIMENSIONS[dimensionKey]
          const isOpen = expanded[dimensionKey]
          return (
            <section key={dimensionKey}>
              <h2 className="ody-accordion-title"><button
                type="button"
                className="ody-accordion-header"
                onClick={() => toggleSection(dimensionKey)}
                aria-expanded={isOpen}
                aria-controls={`dimension-${dimensionKey}`}
                id={`dimension-trigger-${dimensionKey}`}
              >
                <DimensionMark dimension={dimensionKey} size={32} />
                <span>
                  <span className="ody-help-title">{dimension.label}</span>
                  <span className="ody-help-desc">{dimension.description}</span>
                </span>
                <Icon name={isOpen ? 'x' : 'plus'} size={14} className="ody-muted" />
              </button></h2>

                <div hidden={!isOpen} className="ody-accordion-body" id={`dimension-${dimensionKey}`} role="region" aria-labelledby={`dimension-trigger-${dimensionKey}`}>
                  <img className="ody-dimension-illustration" src={`/art/dimensions/${dimensionKey}.webp`} alt="" width={160} height={160} loading="lazy" />
                  <p className="ody-help-quote">{dimension.philosophy}</p>
                  <p className="ody-help-entails">{dimension.entails}</p>

                  <h3 className="ody-help-sub">Example Habits</h3>
                  <ul className="ody-help-list">
                    {dimension.exampleRecurring.map((item) => (
                      <li key={`${dimensionKey}-rec-${item}`}>
                        <button
                          type="button"
                          className="ody-example-item"
                          onClick={() => openTaskPrefill(dimensionKey, item, 'recurring')}
                        >
                          {item}
                          <span className="ody-help-use">Use this</span>
                        </button>
                      </li>
                    ))}
                    {dimension.exampleOneTime.map((item) => (
                      <li key={`${dimensionKey}-one-${item}`}>
                        <button
                          type="button"
                          className="ody-example-item"
                          onClick={() => openTaskPrefill(dimensionKey, item, 'one_time')}
                        >
                          {item}
                          <span className="ody-help-use">Use this</span>
                        </button>
                      </li>
                    ))}
                  </ul>

                  <h3 className="ody-help-sub">Example Goals</h3>
                  <ul className="ody-help-list">
                    {dimension.exampleQuests.map((item) => (
                      <li key={`${dimensionKey}-quest-${item}`}>
                        <button
                          type="button"
                          className="ody-example-item"
                          onClick={() => openQuestPrefill(dimensionKey, item)}
                        >
                          {item}
                          <span className="ody-help-use">Use this</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
            </section>
          )
        })}
      </div>

      <div className="ody-card" style={{ marginTop: 16 }}>
        <div className="ody-row">
          <Link to="/settings" className="ody-help-link">
            <Icon name="gear" size={14} /> Back to Settings
          </Link>

        </div>
      </div>
    </AppShell>
  )
}
