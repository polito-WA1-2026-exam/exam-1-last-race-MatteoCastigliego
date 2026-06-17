import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import f1Grid from '../assets/f1_grid.jpg'
import SetupPhase from './SetupPhase'
import PlanningPhase from './PlanningPhase'
import ResultPhase from './ResultPhase'
import { createGame, fetchSegments, executeGame } from '../api/api'

function GamePage() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState('setup')
  const [gameId, setGameId] = useState(null)
  const [startStation, setStartStation] = useState(null)
  const [endStation, setEndStation] = useState(null)
  const [segments, setSegments] = useState([])
  const [route, setRoute] = useState([])       // array di { from, to, fromName, toName }
  const [timeLeft, setTimeLeft] = useState(90)
  const [result, setResult] = useState(null)

  // a ref to the timer is needed to stop the timer when a route is submitted
  const timerRef = useRef(null)

  // a ref to the route is needed for validate the route in case the timer ends
  const routeRef = useRef([])

  const usedKeys = new Set(route.map(seg => seg.index)) // structure derived from the state 'route'

  const bgStyle = { '--f1-grid': `url(${f1Grid})` }

  // for a new game, new state need to be defined
  const startNewGame = async () => {
    const game = await createGame()
    const segmentList = await fetchSegments()
    setGameId(game.gameId)
    setStartStation(game.startStation)
    setEndStation(game.endStation)
    setSegments(segmentList)
    setPhase('planning')
  }

  // gives the full route to the server in case the timer expires
  useEffect(() => { routeRef.current = route }, [route])

  // manages the phase planning
  useEffect(() => {
    if (phase !== 'planning') return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { // timer out, must reset the timer to 90 sec and pass to the next phase
          clearInterval(timerRef.current)
          handleExecute(routeRef.current)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current) // stops the timer if we pass to the next phase before the 90 sec
  }, [phase])

  const handleExecute = async (currentRoute) => {
    const res = await executeGame(gameId, currentRoute)
    setResult(res)
    setPhase('result')
  }

  // adds a new segment to the actual route (seg is an array)
  const addSegment = (seg, index) => {
    setRoute(prev => [...prev, { ...seg, index }])
  }

  // remove the last segment inserted in case it is an error
  const removeLastSegment = () => {
    if (route.length === 0) return
    setRoute(prev => prev.slice(0, -1))
  }

  if (phase === 'setup') return <SetupPhase onReady={startNewGame} bgStyle={bgStyle} />

  if (phase === 'planning') return (
    <PlanningPhase
      startStation={startStation}
      endStation={endStation}
      segments={segments}
      route={route}
      usedKeys={usedKeys}
      timeLeft={timeLeft}
      addSegment={addSegment}
      removeLastSegment={removeLastSegment}
      onSubmit={() => { clearInterval(timerRef.current); handleExecute(route) }}
      bgStyle={bgStyle}
    />
  )

  if (phase === 'result') return (
    <ResultPhase result={result} onNewGame={() => navigate('/play')} bgStyle={bgStyle} />
  )
}

export default GamePage
