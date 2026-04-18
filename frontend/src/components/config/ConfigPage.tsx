import { useState, type FormEvent, type CSSProperties } from 'react'
import { AppConfig } from '../../types'
import { useTranslation } from '../../i18n/TranslationContext'
import { formatDate } from '../../utils/formatDate'
import ClockGrid from './ClockGrid'

interface Props {
  config: AppConfig
  onSave: (config: AppConfig) => Promise<AppConfig | null>
  onRefresh: () => Promise<AppConfig | null>
}

type Tab = 'clock' | 'date' | 'appearance' | 'weather'

export default function ConfigPage({ config, onSave, onRefresh }: Props) {
  const { t, availableLocales } = useTranslation()
  const [local, setLocal] = useState<AppConfig>(config)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [refreshStatus, setRefreshStatus] = useState<'idle' | 'loading' | 'done'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('appearance')

  function update<K extends keyof AppConfig>(key: K, value: AppConfig[K]) {
    setLocal(prev => ({ ...prev, [key]: value }))
    setSaveStatus('idle')
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setSaveStatus('saving')
    const serverConfig = await onSave(local)
    if (serverConfig) {
      setLocal(serverConfig)
      setSaveStatus('saved')
      setError(null)
    } else {
      setSaveStatus('error')
      setError(t('config.buttons.saveError'))
    }
  }

  async function handleRefresh() {
    setRefreshStatus('loading')
    const fresh = await onRefresh()
    if (fresh) {
      setLocal(fresh)
      setSaveStatus('idle')
      setError(null)
      setRefreshStatus('done')
      setTimeout(() => setRefreshStatus('idle'), 2000)
    } else {
      setRefreshStatus('idle')
    }
  }

  const inputStyle: CSSProperties = {
    background: '#1a1a2e',
    border: '1px solid #444',
    color: '#fff',
    borderRadius: '4px',
    padding: '6px 10px',
    fontSize: '14px',
    width: '100%',
  }

  const labelStyle: CSSProperties = {
    color: '#aaa',
    fontSize: '13px',
    marginBottom: '4px',
    display: 'block',
  }

  const fieldStyle: CSSProperties = {
    marginBottom: '16px',
  }

  const sectionStyle: CSSProperties = {
    marginBottom: '28px',
    paddingBottom: '16px',
    borderBottom: '1px solid #333',
  }

  const headingStyle: CSSProperties = {
    color: '#7eb8f7',
    fontSize: '16px',
    marginBottom: '12px',
    fontWeight: 'bold',
  }

  return (
    <div style={{
      height: '100vh',
      backgroundColor: '#0d0d1a',
      color: '#fff',
      fontFamily: 'monospace',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Fixed header */}
      <div style={{ padding: '24px 24px 0', flexShrink: 0 }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '8px', color: '#fff' }}>
            {t('config.title')}
          </h1>
          <div style={{ marginBottom: '16px' }}>
            <a href="/" style={{
              display: 'inline-block',
              padding: '12px 32px',
              background: '#3a7bd5',
              color: '#fff',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '16px',
              fontFamily: 'monospace',
              border: 'none',
            }}>
              {t('config.closeButton')}
            </a>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '0' }}>
            {([
              ['appearance', t('config.tabs.appearance')],
              ['clock',      t('config.tabs.clock')],
              ['date',       t('config.tabs.date')],
              ['weather',    t('config.tabs.weather')],
            ] as [Tab, string][]).map(([tabKey, label]) => (
              <button
                key={tabKey}
                type="button"
                onClick={() => setTab(tabKey)}
                style={{
                  padding: '8px 20px',
                  border: 'none',
                  borderRadius: '6px 6px 0 0',
                  cursor: 'pointer',
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  background: tab === tabKey ? '#1a1a2e' : '#111',
                  color: tab === tabKey ? '#7eb8f7' : '#666',
                  borderBottom: tab === tabKey ? '2px solid #7eb8f7' : '2px solid transparent',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ background: '#1a1a2e', borderRadius: '0 6px 6px 6px', padding: '24px', marginTop: '0' }}>
            <form onSubmit={handleSave}>

              {tab === 'clock' && (
                <>
                  {/* Time format */}
                  <div style={sectionStyle}>
                    <div style={headingStyle}>{t('config.sections.datetime.timeFormatLabel')}</div>
                    <div style={fieldStyle}>
                      <div style={{ display: 'flex', gap: '24px' }}>
                        {(['24h', '12h'] as const).map(fmt => (
                          <label key={fmt} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', cursor: 'pointer' }}>
                            <input
                              type="radio"
                              name="timeFormat"
                              value={fmt}
                              checked={local.timeFormat === fmt}
                              onChange={() => update('timeFormat', fmt)}
                              style={{ accentColor: '#7eb8f7' }}
                            />
                            {t(`config.sections.datetime.${fmt}`)}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Clock grid */}
                  <div style={sectionStyle}>
                    <div style={headingStyle}>{t('config.sections.clockMode.heading')}</div>
                    <ClockGrid config={local} onUpdate={update} />
                  </div>

                  {/* Rotation settings — only relevant when more than one clock could be active */}
                  <div style={sectionStyle}>
                    <div style={headingStyle}>{t('config.sections.clockMode.rotationHeading')}</div>
                    <div style={fieldStyle}>
                      <label style={labelStyle}>{t('config.sections.clockMode.switchEvery')}</label>
                      <input
                        type="number" min={1} max={60}
                        style={inputStyle}
                        value={local.randomSwitchMinutes}
                        onChange={e => update('randomSwitchMinutes', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div style={fieldStyle}>
                      <label style={labelStyle}>{t('config.sections.clockMode.switchTriggerLabel')}</label>
                      <select
                        style={inputStyle}
                        value={local.clockSwitchTrigger}
                        onChange={e => update('clockSwitchTrigger', e.target.value as AppConfig['clockSwitchTrigger'])}
                      >
                        <option value="timed">{t('config.sections.clockMode.triggerTimed')}</option>
                        <option value="onWeatherReturn">{t('config.sections.clockMode.triggerOnWeatherReturn')}</option>
                      </select>
                    </div>
                  </div>

                  {/* Display */}
                  <div style={sectionStyle}>
                    <div style={headingStyle}>{t('config.sections.display.heading')}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                      {([
                        ['showDate', 'config.sections.display.showDate'],
                        ['showTemperature', 'config.sections.display.showTemperature'],
                      ] as [keyof AppConfig, string][]).map(([key, tKey]) => (
                        <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#aaa', cursor: 'pointer' }}>
                          <input type="checkbox" checked={local[key] as boolean}
                            onChange={e => update(key, e.target.checked as AppConfig[typeof key])} />
                          {t(tKey)}
                        </label>
                      ))}
                    </div>
                    {local.showTemperature && (
                      <div style={fieldStyle}>
                        <label style={labelStyle}>{t('config.sections.display.tempPositionLabel')}</label>
                        <select
                          style={inputStyle}
                          value={local.temperaturePosition}
                          onChange={e => update('temperaturePosition', e.target.value as AppConfig['temperaturePosition'])}
                        >
                          <option value="top-left">{t('config.sections.display.posTopLeft')}</option>
                          <option value="top-right">{t('config.sections.display.posTopRight')}</option>
                          <option value="bot-left">{t('config.sections.display.posBotLeft')}</option>
                          <option value="bot-right">{t('config.sections.display.posBotRight')}</option>
                        </select>
                      </div>
                    )}
                  </div>

                </>
              )}

              {tab === 'date' && (
                <>
                  <div style={sectionStyle}>
                    <div style={headingStyle}>{t('config.sections.datetime.heading')}</div>
                    <div style={fieldStyle}>
                      <label style={labelStyle}>{t('config.sections.datetime.dateFormatLabel')}</label>
                      <input
                        type="text"
                        style={inputStyle}
                        value={local.dateFormat}
                        onChange={e => update('dateFormat', e.target.value)}
                        spellCheck={false}
                      />
                      <div style={{ marginTop: '6px', fontSize: '13px', color: '#7eb8f7', fontFamily: 'monospace' }}>
                        {t('config.sections.datetime.preview')}: {formatDate(new Date(), local.dateFormat, t)}
                      </div>
                    </div>
                    <div style={{ fontSize: '11px', color: '#555', lineHeight: 1.8 }}>
                      <table style={{ borderCollapse: 'collapse' }}>
                        <tbody>
                          {[
                            ['YYYY', '2026'],
                            ['YY',   '26'],
                            ['MMMM', t('locale.months.3')],
                            ['MMM',  t('locale.monthsShort.3')],
                            ['MM',   '04'],
                            ['M',    '4'],
                            ['dddd', t('locale.weekdays.4')],
                            ['ddd',  t('locale.weekdaysShort.4')],
                            ['DD',   '09'],
                            ['D',    '9'],
                            ['WW',   '15'],
                          ].map(([token, example]) => (
                            <tr key={token}>
                              <td style={{ color: '#7eb8f7', fontFamily: 'monospace', paddingRight: '12px', minWidth: '52px' }}>{token}</td>
                              <td style={{ color: '#666' }}>{example}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {tab === 'appearance' && (
                <>
                  {/* Language */}
                  <div style={sectionStyle}>
                    <div style={headingStyle}>{t('config.sections.language.heading')}</div>
                    <div style={fieldStyle}>
                      <label style={labelStyle}>{t('config.sections.language.label')}</label>
                      <select
                        style={inputStyle}
                        value={local.language}
                        onChange={e => update('language', e.target.value)}
                      >
                        {availableLocales.map(lang => (
                          <option key={lang} value={lang}>{lang.toUpperCase()}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Colors */}
                  <div style={sectionStyle}>
                    <div style={headingStyle}>{t('config.sections.colors.heading')}</div>

                    {/* Background style selector */}
                    <div style={{ ...fieldStyle, marginBottom: '20px' }}>
                      <label style={labelStyle}>{t('config.sections.colors.backgroundStyleLabel')}</label>
                      <select
                        style={inputStyle}
                        value={local.backgroundStyle}
                        onChange={e => update('backgroundStyle', e.target.value as AppConfig['backgroundStyle'])}
                      >
                        <option value="solid">{t('config.sections.colors.backgroundSolid')}</option>
                        <option value="lavaLamp">{t('config.sections.colors.backgroundLavaLamp')}</option>
                        <option value="nightSky">{t('config.sections.colors.backgroundNightSky')}</option>
                      </select>
                      {(local.backgroundStyle === 'lavaLamp' || local.backgroundStyle === 'nightSky') && (
                        <div style={{ fontSize: '12px', color: '#888', marginTop: '6px' }}>
                          {t('config.sections.colors.animatedBgInfo')}
                        </div>
                      )}
                    </div>

                    {/* Stjärnstorlek — visas bara för natthimmel */}
                    {local.backgroundStyle === 'nightSky' && (
                      <div style={fieldStyle}>
                        <label style={labelStyle}>
                          {t('config.sections.colors.starSizeLabel', { value: local.starSize.toFixed(1) })}
                        </label>
                        <input
                          type="range" min={0.5} max={3.0} step={0.25}
                          style={{ width: '100%', accentColor: '#7eb8f7' }}
                          value={local.starSize}
                          onChange={e => update('starSize', parseFloat(e.target.value))}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#555', marginTop: '2px' }}>
                          <span>{t('config.sections.colors.starSizeSmall')}</span>
                          <span>{t('config.sections.colors.starSizeLarge')}</span>
                        </div>
                      </div>
                    )}

                    {/* Color pickers — greyed out when animated background is active */}
                    <div style={{ opacity: local.backgroundStyle !== 'solid' ? 0.3 : 1, pointerEvents: local.backgroundStyle !== 'solid' ? 'none' : 'auto', transition: 'opacity 0.2s' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div style={fieldStyle}>
                          <label style={labelStyle}>{t('config.sections.colors.background')}</label>
                          <input type="color" style={{ ...inputStyle, height: '40px', padding: '2px' }}
                            value={local.backgroundColor}
                            onChange={e => update('backgroundColor', e.target.value)} />
                        </div>
                        <div style={fieldStyle}>
                          <label style={labelStyle}>{t('config.sections.colors.clock')}</label>
                          <input type="color" style={{ ...inputStyle, height: '40px', padding: '2px' }}
                            value={local.clockColor}
                            onChange={e => update('clockColor', e.target.value)} />
                        </div>
                        <div style={fieldStyle}>
                          <label style={labelStyle}>{t('config.sections.colors.date')}</label>
                          <input type="color" style={{ ...inputStyle, height: '40px', padding: '2px' }}
                            value={local.dateColor}
                            onChange={e => update('dateColor', e.target.value)} />
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#aaa', cursor: 'pointer' }}>
                          <input type="checkbox" checked={local.randomClockColor}
                            onChange={e => update('randomClockColor', e.target.checked)} />
                          {t('config.sections.colors.randomClock')}
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#aaa', cursor: 'pointer' }}>
                          <input type="checkbox" checked={local.randomDateColor}
                            onChange={e => update('randomDateColor', e.target.checked)} />
                          {t('config.sections.colors.randomDate')}
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Dimming */}
                  <div style={sectionStyle}>
                    <div style={headingStyle}>{t('config.sections.dimming.heading')}</div>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', cursor: 'pointer', fontSize: '14px' }}>
                        <input type="checkbox" checked={local.dimEnabled}
                          onChange={e => update('dimEnabled', e.target.checked)} />
                        <span>{t('config.sections.dimming.enable')}</span>
                      </label>
                    </div>

                    <div style={{ opacity: local.dimEnabled ? 1 : 0.3, pointerEvents: local.dimEnabled ? 'auto' : 'none', transition: 'opacity 0.2s' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                        <div style={fieldStyle}>
                          <label style={labelStyle}>{t('config.sections.dimming.startLabel')}</label>
                          <input
                            type="text"
                            pattern="\d{2}:\d{2}"
                            placeholder="22:00"
                            style={inputStyle}
                            value={local.dimStart}
                            onChange={e => update('dimStart', e.target.value)}
                          />
                        </div>
                        <div style={fieldStyle}>
                          <label style={labelStyle}>{t('config.sections.dimming.endLabel')}</label>
                          <input
                            type="text"
                            pattern="\d{2}:\d{2}"
                            placeholder="07:00"
                            style={inputStyle}
                            value={local.dimEnd}
                            onChange={e => update('dimEnd', e.target.value)}
                          />
                        </div>
                      </div>
                      <div style={fieldStyle}>
                        <label style={labelStyle}>
                          {t('config.sections.dimming.levelLabel', { value: local.dimLevel })}
                        </label>
                        <input
                          type="range" min={5} max={95} step={5}
                          style={{ width: '100%', accentColor: '#7eb8f7' }}
                          value={local.dimLevel}
                          onChange={e => update('dimLevel', parseInt(e.target.value))}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#555', marginTop: '2px' }}>
                          <span>{t('config.sections.dimming.levelDark')}</span>
                          <span>{t('config.sections.dimming.levelHalf')}</span>
                          <span>{t('config.sections.dimming.levelFull')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {tab === 'weather' && (
                <>
                  {/* Temperature unit */}
                  <div style={sectionStyle}>
                    <div style={headingStyle}>{t('config.sections.temperatureUnit.heading')}</div>
                    <div style={fieldStyle}>
                      <div style={{ display: 'flex', gap: '24px' }}>
                        {(['celsius', 'fahrenheit'] as const).map(unit => (
                          <label key={unit} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', cursor: 'pointer' }}>
                            <input
                              type="radio"
                              name="temperatureUnit"
                              value={unit}
                              checked={local.temperatureUnit === unit}
                              onChange={() => update('temperatureUnit', unit)}
                              style={{ accentColor: '#7eb8f7' }}
                            />
                            {t(`config.sections.temperatureUnit.${unit}`)}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Weather on/off + display times */}
                  <div style={sectionStyle}>
                    <div style={headingStyle}>{t('config.sections.weatherScreen.heading')}</div>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#aaa', cursor: 'pointer' }}>
                        <input type="checkbox" checked={local.showWeather}
                          onChange={e => update('showWeather', e.target.checked)} />
                        {t('config.sections.weatherScreen.showWeather')}
                      </label>
                    </div>

                    {local.showWeather && (
                      <>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <div style={fieldStyle}>
                            <label style={labelStyle}>{t('config.sections.weatherScreen.clockSeconds')}</label>
                            <input type="number" min={10} max={3600}
                              style={inputStyle}
                              value={local.clockDisplaySeconds}
                              onChange={e => update('clockDisplaySeconds', parseInt(e.target.value) || 60)} />
                          </div>
                          <div style={fieldStyle}>
                            <label style={labelStyle}>{t('config.sections.weatherScreen.weatherSeconds')}</label>
                            <input type="number" min={10} max={3600}
                              style={inputStyle}
                              value={local.weatherDisplaySeconds}
                              onChange={e => update('weatherDisplaySeconds', parseInt(e.target.value) || 30)} />
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Time corner on weather view */}
                  <div style={sectionStyle}>
                    <div style={headingStyle}>{t('config.sections.weatherTime.heading')}</div>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#aaa', cursor: 'pointer' }}>
                        <input type="checkbox" checked={local.showWeatherTime}
                          onChange={e => update('showWeatherTime', e.target.checked)} />
                        {t('config.sections.weatherTime.showTime')}
                      </label>
                    </div>
                    {local.showWeatherTime && (
                      <div style={fieldStyle}>
                        <label style={labelStyle}>{t('config.sections.weatherTime.positionLabel')}</label>
                        <select
                          style={inputStyle}
                          value={local.weatherTimePosition}
                          onChange={e => update('weatherTimePosition', e.target.value as AppConfig['weatherTimePosition'])}
                        >
                          <option value="top-left">{t('config.sections.display.posTopLeft')}</option>
                          <option value="top-right">{t('config.sections.display.posTopRight')}</option>
                          <option value="bot-left">{t('config.sections.display.posBotLeft')}</option>
                          <option value="bot-right">{t('config.sections.display.posBotRight')}</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Weather service */}
                  <div style={sectionStyle}>
                    <div style={headingStyle}>{t('config.sections.weatherService.heading')}</div>
                    <div style={fieldStyle}>
                      <label style={labelStyle}>{t('config.sections.weatherService.serviceLabel')}</label>
                      <select
                        style={inputStyle}
                        value={local.weatherService}
                        onChange={e => update('weatherService', e.target.value as AppConfig['weatherService'])}
                      >
                        <option value="smhi">{t('config.sections.weatherService.smhi')}</option>
                        <option value="yr">{t('config.sections.weatherService.yr')}</option>
                        <option value="accuweather">{t('config.sections.weatherService.accuweather')}</option>
                      </select>
                    </div>

                    {local.weatherService === 'accuweather' && (
                      <div style={fieldStyle}>
                        <label style={labelStyle}>{t('config.sections.weatherService.apiKeyLabel')}</label>
                        <input
                          type="text"
                          style={inputStyle}
                          placeholder={t('config.sections.weatherService.apiKeyPlaceholder')}
                          value={local.weatherApiKey}
                          onChange={e => update('weatherApiKey', e.target.value)}
                        />
                        <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                          {t('config.sections.weatherService.apiKeyInfo')}{' '}
                          <span style={{ color: '#7eb8f7' }}>developer.accuweather.com</span>
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div style={fieldStyle}>
                        <label style={labelStyle}>{t('config.sections.weatherService.latLabel')}</label>
                        <input type="number" step="0.0001"
                          style={inputStyle}
                          value={local.weatherLat}
                          onChange={e => update('weatherLat', parseFloat(e.target.value) || 59.33)} />
                      </div>
                      <div style={fieldStyle}>
                        <label style={labelStyle}>{t('config.sections.weatherService.lonLabel')}</label>
                        <input type="number" step="0.0001"
                          style={inputStyle}
                          value={local.weatherLon}
                          onChange={e => update('weatherLon', parseFloat(e.target.value) || 18.07)} />
                      </div>
                    </div>
                    <div style={fieldStyle}>
                      <label style={labelStyle}>{t('config.sections.weatherService.cityLabel')}</label>
                      <input type="text"
                        style={inputStyle}
                        value={local.weatherCity}
                        onChange={e => update('weatherCity', e.target.value)} />
                    </div>
                    <div style={fieldStyle}>
                      <label style={labelStyle}>{t('config.sections.weatherService.refreshLabel')}</label>
                      <input type="number" min={1} max={1440}
                        style={inputStyle}
                        value={local.weatherRefreshMinutes}
                        onChange={e => update('weatherRefreshMinutes', parseInt(e.target.value) || 30)} />
                    </div>
                  </div>
                </>
              )}

              {/* Buttons — always visible inside scrollable area */}
              <div style={{ paddingTop: '8px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <button type="submit" disabled={saveStatus === 'saving'} style={{
                  background: '#3a7bd5',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '12px 32px',
                  fontSize: '16px',
                  cursor: saveStatus === 'saving' ? 'default' : 'pointer',
                  fontFamily: 'monospace',
                  opacity: saveStatus === 'saving' ? 0.7 : 1,
                }}>
                  {saveStatus === 'saving' ? t('config.buttons.saving') : t('config.buttons.save')}
                </button>
                <button type="button" onClick={handleRefresh} disabled={refreshStatus === 'loading'} style={{
                  background: refreshStatus === 'done' ? '#2e7d32' : '#2a6099',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '12px 20px',
                  fontSize: '16px',
                  cursor: refreshStatus === 'loading' ? 'default' : 'pointer',
                  fontFamily: 'monospace',
                  opacity: refreshStatus === 'loading' ? 0.7 : 1,
                }}>
                  {refreshStatus === 'loading'
                    ? t('config.buttons.refreshing')
                    : refreshStatus === 'done'
                    ? t('config.buttons.refreshed')
                    : t('config.buttons.refresh')}
                </button>
                {saveStatus === 'saved' && (
                  <span style={{ color: '#4caf50', fontSize: '14px' }}>{t('config.buttons.saved')}</span>
                )}
                {saveStatus === 'error' && error && (
                  <span style={{ color: '#f44336', fontSize: '14px' }}>{error}</span>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
