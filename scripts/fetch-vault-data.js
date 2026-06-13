import * as cheerio from 'cheerio'
import { writeFileSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const VAULT_URL = 'https://wiki.warframe.com/w/Prime_Vault'
const OUTPUT = join(__dirname, '..', 'public', 'items.json')

function cleanName(text) {
  return text.trim().replace(/\u00a0/g, ' ')
}

function parseCategory(raw) {
  const t = raw.toLowerCase()
  if (t.includes('warframe')) return 'Warframe'
  if (t.includes('primary')) return 'Primary'
  if (t.includes('secondary')) return 'Secondary'
  if (t.includes('melee')) return 'Melee'
  if (t.includes('archgun') || t.includes('archwing')) return 'Archwing'
  if (t.includes('sentinel')) return 'Companion'
  if (t.includes('kubrow')) return 'Companion'
  return 'Weapon'
}

function extractDate(text) {
  const m = text.match(/\d{4}-\d{2}-\d{2}/)
  return m ? m[0] : null
}

function isHeaderOrEmpty(cells) {
  if (cells.length === 0) return true
  const first = cells.eq(0).text().trim().toLowerCase()
  return first === '' || first === 'item name'
}

async function fetchItems() {
  console.log('Fetching wiki page...')
  const resp = await fetch(VAULT_URL)
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
  const html = await resp.text()
  const $ = cheerio.load(html)

  const items = []
  let id = 0

  $('table.article-table').each((ti, table) => {
    const $table = $(table)
    const headers = []
    $table.find('th').each((_, th) => {
      headers.push($(th).text().trim().toLowerCase())
    })

    const headerKey = headers.join(' | ')

    let tableType = 'skip'
    if (headerKey.includes('initial vaulting') && headerKey.includes('resurgence') && !headerKey.includes('permanent')) {
      tableType = 'vaulted'
    } else if (headerKey.includes('permanent unvaulting')) {
      tableType = 'formerly-vaulted'
    } else if (headerKey.includes('release date') && headerKey.includes('item type')) {
      tableType = 'never-vaulted'
    }

    if (tableType === 'skip') return

    const rows = $table.find('tbody tr, > tr')
    rows.each((ri, row) => {
      const $row = $(row)
      const cells = $row.find('td')
      if (isHeaderOrEmpty(cells)) return

      id++
      const name = cleanName(cells.eq(0).text())

      if (tableType === 'vaulted') {
        const rawType = cells.eq(3).text().trim()
        const rawStatus = cells.eq(4).text().trim()
        const resurgenceDate = extractDate(cells.eq(2).text())
        items.push({
          id,
          name,
          category: parseCategory(rawType),
          vaulted: !rawStatus.includes('☑'),
          lastUnvault: resurgenceDate || null,
        })
      } else if (tableType === 'formerly-vaulted') {
        const rawType = cells.eq(4).text().trim()
        const rawStatus = cells.eq(5).text().trim()
        const resurgenceDate = extractDate(cells.eq(2).text())
        items.push({
          id,
          name,
          category: parseCategory(rawType),
          vaulted: !rawStatus.includes('☑'),
          lastUnvault: resurgenceDate || null,
        })
      } else if (tableType === 'never-vaulted') {
        const rawType = cells.eq(2).text().trim()
        items.push({
          id,
          name,
          category: parseCategory(rawType),
          vaulted: false,
          lastUnvault: null,
        })
      }
    })
  })

  return items
}

try {
  const items = await fetchItems()
  console.log(`Found ${items.length} items`)

  const dir = join(__dirname, '..', 'public')
  writeFileSync(OUTPUT, JSON.stringify(items, null, 2), 'utf-8')
  console.log(`Written to ${OUTPUT}`)
} catch (err) {
  console.error('Failed:', err.message)

  // Preserve existing cache if available
  try {
    const existing = readFileSync(OUTPUT, 'utf-8')
    console.log('Preserved existing cache')
  } catch {
    // No existing file, write empty array
    writeFileSync(OUTPUT, '[]', 'utf-8')
    console.log('No existing cache, wrote empty array')
  }
}
