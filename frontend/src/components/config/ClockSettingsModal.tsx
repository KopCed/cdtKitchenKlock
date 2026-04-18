import type { CSSProperties } from 'react'
import { AppConfig, GlobeColor } from '../../types'
import { useTranslation } from '../../i18n/TranslationContext'
import { CLOCK_REGISTRY } from '../../clockRegistry'

interface Props {
  clockKey: string
  config: AppConfig
  onUpdate: <K extends keyof AppConfig>(key: K, value: AppConfig[K]) => void
  onClose: () => void
}

export default function ClockSettingsModal({ clockKey, config, onUpdate, onClose }: Props) {
  const { t } = useTranslation()

  const clock = CLOCK_REGISTRY.find(c => c.key === clockKey)
  const title  = clock
    ? `${t(clock.nameKey)} – ${t('config.clocks.openSettings')}`
    : t('config.clocks.settingsFallback')

  const overlayStyle: CSSProperties = {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.7)',
    zIndex: 1000,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }

  const modalStyle: CSSProperties = {
    background: '#1a1a2e',
    border: '1px solid #444',
    borderRadius: '10px',
    padding: '28px 32px',
    minWidth: '300px',
    maxWidth: '420px',
    width: '90%',
    fontFamily: 'monospace',
    color: '#fff',
  }

  const headingStyle: CSSProperties = {
    color: '#7eb8f7',
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '20px',
  }

  const labelStyle: CSSProperties = {
    color: '#aaa', fontSize: '13px', marginBottom: '6px', display: 'block',
  }

  const inputStyle: CSSProperties = {
    background: '#0d0d1a', border: '1px solid #444', color: '#fff',
    borderRadius: '4px', padding: '6px 10px', fontSize: '14px', width: '100%',
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <div style={headingStyle}>{title}</div>

        {/* Globe color */}
        {clockKey === 'digital-globe' && (
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>{t('config.sections.clockMode.globeColorLabel')}</label>
            <select
              style={inputStyle}
              value={config.globeColor}
              onChange={e => onUpdate('globeColor', e.target.value as GlobeColor)}
            >
              <option value="purple">{t('config.sections.clockMode.globeColorPurple')}</option>
              <option value="red">{t('config.sections.clockMode.globeColorRed')}</option>
              <option value="green">{t('config.sections.clockMode.globeColorGreen')}</option>
              <option value="blue">{t('config.sections.clockMode.globeColorBlue')}</option>
            </select>
          </div>
        )}

        {/* LED dim opacity */}
        {clockKey === 'digital-led' && (
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>
              {t('config.sections.clockMode.ledSegmentLabel', { value: config.ledDimOpacity })}
            </label>
            <input
              type="range" min={0} max={30} step={1}
              style={{ width: '100%', accentColor: '#7eb8f7' }}
              value={config.ledDimOpacity}
              onChange={e => onUpdate('ledDimOpacity', parseInt(e.target.value))}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#555', marginTop: '2px' }}>
              <span>{t('config.sections.clockMode.ledSegmentInvisible')}</span>
              <span>{t('config.sections.clockMode.ledSegmentWeak')}</span>
              <span>{t('config.sections.clockMode.ledSegmentStrong')}</span>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          style={{
            padding: '10px 28px',
            background: '#3a7bd5', color: '#fff',
            border: 'none', borderRadius: '6px',
            cursor: 'pointer', fontSize: '14px', fontFamily: 'monospace',
          }}
        >
          {t('config.closeButton')}
        </button>
      </div>
    </div>
  )
}
