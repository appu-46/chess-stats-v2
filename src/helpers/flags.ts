import type { Country } from './normalizePlayer'

// Flag images served from our own site (the flag-icons package), rather
// than fetched one by one from a flag API, which could fail to load. Only
// this map of URLs is bundled; each SVG is its own small file, fetched
// when shown. no-inline keeps the small ones from being inlined into the
// script as data URIs.
const FLAGS = import.meta.glob<string>(
  '/node_modules/flag-icons/flags/4x3/*.svg',
  { eager: true, query: '?no-inline', import: 'default' },
)

function flagFile(name: string): string | null {
  return FLAGS[`/node_modules/flag-icons/flags/4x3/${name}.svg`] ?? null
}

// Places the sites list on their own that share a country code with their
// parent (see helpers/countries), but have a flag of their own.
const REGION_FLAGS: Partial<Record<string, string>> = {
  England: 'gb-eng',
  Scotland: 'gb-sct',
  Wales: 'gb-wls',
  'Northern Ireland': 'gb-nir',
  Catalonia: 'es-ct',
  Galicia: 'es-ga',
  'Basque Country': 'es-pv',
  'Canary Islands': 'ic',
}

// Null for "International" and anything without a flag: callers show a
// globe instead.
export function flagSrc(country: Country): string | null {
  const region = REGION_FLAGS[country.name]
  if (region) return flagFile(region)
  if (!/^[A-Z]{2}$/.test(country.code) || country.code === 'XX') return null
  return flagFile(country.code.toLowerCase())
}
