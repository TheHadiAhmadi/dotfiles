const { createCanvas } = require('canvas')
const fs = require('fs')

const WIDTH = 1920
const HEIGHT = 1080
const BLOCK_SIZE = 15

const COLS = Math.floor(WIDTH / BLOCK_SIZE)
const ROWS = Math.floor(HEIGHT / BLOCK_SIZE)
const BLOCKS = COLS * ROWS

const API_KEY = process.env.CLOCKIFY_API_KEY
const WORKSPACE_ID = process.env.CLOCKIFY_WORKSPACE_ID
const USER_ID = process.env.CLOCKIFY_USER_ID

function getMonthRange(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  start.setHours(4, 30, 0, 0)
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  end.setHours(23, 59, 59, 999)
  return { start: start.toISOString(), end: end.toISOString() }
}

async function fetchMonthlyMinutes() {
  const { start, end } = getMonthRange()
  let page = 1
  let entries = []
  let hasMore = true

  while (hasMore) {
    const url = `https://api.clockify.me/api/v1/workspaces/${WORKSPACE_ID}/user/${USER_ID}/time-entries?start=${start}&end=${end}&page=${page}&page-size=100`

    const res = await fetch(url, {
      headers: {
        'X-Api-Key': API_KEY,
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) throw new Error(`Clockify API error: ${res.status} ${res.statusText}`)

    const data = await res.json()
    entries = entries.concat(data)
    hasMore = data.length === 100
    page++
  }

  let totalMinutes = 0
  for (const entry of entries) {
    if (entry.timeInterval?.duration) {
      totalMinutes += parseISODurationToMinutes(entry.timeInterval.duration)
    }
  }

  return totalMinutes
}

function parseISODurationToMinutes(duration) {
  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/
  const matches = duration.match(regex)
  if (!matches) return 0
  const hours = parseInt(matches[1] || 0, 10)
  const minutes = parseInt(matches[2] || 0, 10)
  const seconds = parseInt(matches[3] || 0, 10)
  return hours * 60 + minutes + Math.floor(seconds / 60)
}

function getRandomRedColor(min = 45, max = 55) {
  const r = Math.floor(Math.random() * (max - min + 1)) + min
  const g = Math.floor(Math.random() * 30)
  const b = Math.floor(Math.random() * 30)
  return `rgb(${r}, ${g}, ${b})`
}

function getRandomGreenColor(min = 45, max = 60) {
  const r = Math.floor(Math.random() * 40)
  const g = Math.floor(Math.random() * (max - min + 1)) + min
  const b = Math.floor(Math.random() * 40)
  return `rgb(${r}, ${g}, ${b})`
}

function getRandomDarkColor(min = 15, max = 25) {
  const color = Math.floor(Math.random() * (max - min + 1)) + min
  return `rgb(${color}, ${color}, ${color})`
}

function getRandomLightColor(min = 45, max = 60) {
  const color = Math.floor(Math.random() * (max - min + 1)) + min
  return `rgb(${color}, ${color}, ${color})`
}

function createMatrix(rows, cols, defaultValue = 0) {
  const matrix = []
  for (let r = 0; r < rows; r++) {
    const row = new Array(cols).fill(defaultValue)
    matrix.push(row)
  }
  return matrix
}

async function main() {
  const workedMinutes = await fetchMonthlyMinutes()

  const shouldWorkMinutes = new Date().getDate() * 5 * 60 // 5 hours/day × days passed × 60min
  const missed = Math.max(0, shouldWorkMinutes - workedMinutes)
  const extra = Math.max(0, workedMinutes - shouldWorkMinutes)
  const normal = workedMinutes - extra

  const matrix = createMatrix(ROWS, COLS, 'empty')

  // We'll track used indexes to avoid overwriting
  const usedIndexes = new Set()

  // Helper to assign blocks randomly in matrix
  function assignBlocks(count, type) {
    let assigned = 0
    while (assigned < count) {
      const i = Math.floor(Math.random() * BLOCKS)
      if (usedIndexes.has(i)) continue
      usedIndexes.add(i)
      const r = Math.floor(i / COLS)
      const c = i % COLS
      matrix[r][c] = type
      assigned++
    }
  }

  assignBlocks(missed, 'missed')
  assignBlocks(extra, 'extra')
  assignBlocks(normal, 'normal')

  console.log(`Missed ${missed} minutes`)
  console.log(`Worked for ${normal} minutes`)

  renderImageFromMatrix(matrix)
}

function renderImageFromMatrix(matrix) {
  const canvas = createCanvas(WIDTH, HEIGHT)
  const ctx = canvas.getContext('2d')

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = c * BLOCK_SIZE
      const y = r * BLOCK_SIZE

      ctx.fillStyle = getRandomDarkColor()
      ctx.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE)

      switch (matrix[r][c]) {
        case 'missed': {
          const gradient = ctx.createLinearGradient(x, y, x, y + BLOCK_SIZE)
          gradient.addColorStop(0, getRandomRedColor())
          gradient.addColorStop(1, getRandomRedColor())
          ctx.fillStyle = gradient
          ctx.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE)
          break
        }
        case 'extra': {
          const gradient = ctx.createLinearGradient(x, y, x, y + BLOCK_SIZE)
          gradient.addColorStop(0, getRandomGreenColor())
          gradient.addColorStop(1, getRandomGreenColor())
          ctx.fillStyle = gradient
          ctx.fillRect(x, y , BLOCK_SIZE, BLOCK_SIZE )
          break
        }
        case 'normal': {
          ctx.shadowColor = getRandomLightColor()
          ctx.shadowBlur = 20
          const gradient = ctx.createLinearGradient(x, y, x, y + BLOCK_SIZE)
          gradient.addColorStop(0, getRandomLightColor())
          gradient.addColorStop(1, getRandomLightColor())
          ctx.fillStyle = gradient
          ctx.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE)
          ctx.shadowColor = 'transparent'
          ctx.shadowBlur = 0
          break
        }
        case 'empty':
        default:
          // already filled dark background, nothing else
          break
      }
    }
  }

  const buffer = canvas.toBuffer('image/png')
  fs.writeFileSync('/home/hadi/clockify-bg.png', buffer)
  fs.writeFileSync('./clockify-bg.png', buffer)
  // console.log('✅ Saved background image using matrix')
}

main().catch(console.error)
