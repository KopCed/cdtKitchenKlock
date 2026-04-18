import { useState, type CSSProperties } from 'react'
import { CLOCK_REGISTRY } from '../../clockRegistry'
import { AppConfig } from '../../types'
import { useTranslation } from '../../i18n/TranslationContext'
import ClockPreview from '../ClockPreview'
import ClockSettingsModal from './ClockSettingsModal'

interface Props {
  config: AppConfig
  onUpdate: <K extends keyof AppConfig>(key: K, value: AppConfig[K]) => void
}

export default function ClockGrid({ config, onUpdate }: Props) {
  const { t } = useTranslation()
  const [settingsKey, setSettingsKey] = useState<string | null>(null)

  const enabled = new Set(config.enabledClockStyles)

  function toggle(key: string) {
    const next = enabled.has(key)
      ? [...enabled].filter(k => k !== key)
      : [...enabled, key]
    // Always keep at least one clock selected
    if (next.length === 0) return
    onUpdate('enabledClockStyles', next)
  }

  const cardStyle = (active: boolean): CSSProperties => ({
    position: 'relative',
    background: active ? '#1e2d45' : '#111',
    border: `2px solid ${active ? '#3a7bd5' : '#333'}`,
    borderRadius: '10px',
    padding: '10px 10px 12px',
    cursor: 'pointer',
    transition: 'border-color 0.15s, background 0.15s',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    userSelect: 'none',
  })

  const nameStyle: CSSProperties = {
    fontSize: '12px',
    color: '#ccc',
    textAlign: 'center',
    lineHeight: 1.3,
  }

  const gearStyle: CSSProperties = {
    position: 'absolute',
    top: '6px',
    right: '6px',
    background: 'rgba(0,0,0,0.5)',
    border: '1px solid #555',
    borderRadius: '4px',
    color: '#aaa',
    fontSize: '13px',
    padding: '2px 5px',
    cursor: 'pointer',
    lineHeight: 1,
    zIndex: 1,
  }

  const checkStyle = (active: boolean): CSSProperties => ({
    width: '18px',
    height: '18px',
    borderRadius: '4px',
    border: `2px solid ${active ? '#3a7bd5' : '#555'}`,
    background: active ? '#3a7bd5' : 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  })

  // Colors used in preview — reflect current config
  const previewClockColor  = config.backgroundStyle !== 'solid' ? '#FFFFFF' : config.clockColor
  const previewBgColor     = config.backgroundStyle !== 'solid' ? 'rgba(7,7,26,0.60)' : config.backgroundColor
  const previewDateColor   = config.backgroundStyle !== 'solid' ? '#FFFFFF' : config.dateColor

  return (
    <>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
      }}>
        {CLOCK_REGISTRY.map(clock => {
          const active = enabled.has(clock.key)
          return (
            <div
              key={clock.key}
              style={cardStyle(active)}
              onClick={() => toggle(clock.key)}
              title={t(clock.nameKey)}
            >
              {/* Gear button for clocks with settings */}
              {clock.hasSettings && (
                <button
                  type="button"
                  style={gearStyle}
                  title={t('config.clocks.openSettings')}
                  onClick={e => { e.stopPropagation(); setSettingsKey(clock.key) }}
                >
                  ⚙
                </button>
              )}

              {/* Live preview */}
              <ClockPreview
                clockKey={clock.key}
                globeColor={config.globeColor}
                ledDimOpacity={config.ledDimOpacity}
                clockColor={previewClockColor}
                backgroundColor={previewBgColor}
                dateColor={previewDateColor}
              />

              {/* Name + checkbox row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%', justifyContent: 'center' }}>
                <div style={checkStyle(active)}>
                  {active && <span style={{ color: '#fff', fontSize: '11px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                </div>
                <span style={nameStyle}>{t(clock.nameKey)}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Info when multiple clocks selected */}
      {enabled.size > 1 && (
        <div style={{ fontSize: '12px', color: '#666', marginTop: '12px' }}>
          {t('config.clocks.multipleInfo', { count: enabled.size })}
        </div>
      )}

      {/* Per-clock settings modal */}
      {settingsKey && (
        <ClockSettingsModal
          clockKey={settingsKey}
          config={config}
          onUpdate={onUpdate}
          onClose={() => setSettingsKey(null)}
        />
      )}
    </>
  )
}
