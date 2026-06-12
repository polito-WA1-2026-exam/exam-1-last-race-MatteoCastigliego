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

  //a ref to the route is needed for validate the route in case the timer ends
  const routeRef = useRef([])

  const usedKeys = new Set(route.map(seg => seg.index))

  const bgStyle = { '--f1-grid': `url(${f1Grid})` }

  const startNewGame = async () => {
    const game = await createGame()
    const segmentList = await fetchSegments()
    setGameId(game.gameId)
    setStartStation(game.startStation)
    setEndStation(game.endStation)
    setSegments(segmentList)
    setPhase('planning')
  }

  useEffect(() => { routeRef.current = route }, [route])

  useEffect(() => {
    if (phase !== 'planning') return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          handleExecute(routeRef.current)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [phase])

  const handleExecute = async (currentRoute) => {
    const res = await executeGame(gameId, currentRoute)
    setResult(res)
    setPhase('result')
  }

  const addSegment = (seg, index) => {
    setRoute(prev => [...prev, { ...seg, index }])
  }

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
