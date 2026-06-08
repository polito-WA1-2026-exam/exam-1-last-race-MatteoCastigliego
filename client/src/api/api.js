async function createGame() {
  const res = await fetch(`http://localhost:3001/api/game`, { method: 'POST', credentials: 'include' })
  if (res.ok) return await res.json()
  throw new Error('Failed to create game')
}

async function fetchSegments() {
  const res = await fetch('http://localhost:3001/api/segments', { credentials: 'include' })
  if (res.ok) return await res.json()
  throw new Error('Failed to fetch segments')
}

async function executeGame(gameId, segments) {
  const res = await fetch(`http://localhost:3001/api/game/${gameId}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ segments })
  })
  if (res.ok) return await res.json()
  throw new Error('Failed to execute game')
}

async function fetchRanking() {
  const res = await fetch('http://localhost:3001/api/ranking', { credentials: 'include' })
  if (res.ok) return await res.json()
  throw new Error('Failed to fetch ranking')
}

export { createGame, fetchSegments, executeGame, fetchRanking }