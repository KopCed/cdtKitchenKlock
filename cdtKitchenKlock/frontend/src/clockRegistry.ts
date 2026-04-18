export interface ClockDef {
  key: string
  nameKey: string
  hasSettings: boolean
}

export const CLOCK_REGISTRY: ClockDef[] = [
  { key: 'digital-default', nameKey: 'config.clocks.digitalDefault', hasSettings: false },
  { key: 'digital-led',     nameKey: 'config.clocks.digitalLed',     hasSettings: true  },
  { key: 'digital-scifi',   nameKey: 'config.clocks.digitalScifi',   hasSettings: false },
  { key: 'digital-flip',    nameKey: 'config.clocks.digitalFlip',    hasSettings: false },
  { key: 'digital-globe',   nameKey: 'config.clocks.digitalGlobe',   hasSettings: true  },
  { key: 'analog-classic',  nameKey: 'config.clocks.analogClassic',  hasSettings: false },
  { key: 'analog-pilot',    nameKey: 'config.clocks.analogPilot',    hasSettings: false },
  { key: 'analog-vintage',  nameKey: 'config.clocks.analogVintage',  hasSettings: false },
  { key: 'analog-cosmic',   nameKey: 'config.clocks.analogCosmic',   hasSettings: false },
]
