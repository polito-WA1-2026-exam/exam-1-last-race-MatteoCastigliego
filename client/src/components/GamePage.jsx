import { useState, useEffect, useRef } from 'react'
import { Container, Button, Badge, ListGroup, Row, Col, Alert } from 'react-bootstrap'
import { useNavigate } from 'react-router'
import metroMap from '../assets/metro_map.svg'
import metroMapNoLines from '../assets/metro_map_no_lines.svg'
import f1Grid from '../assets/f1_grid.jpg'
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

function SetupPhase({ onReady, bgStyle }) {
  return (
    <div className="game-page-bg" style={bgStyle}>
      <Container className="pt-4 pb-5">
        <div className="f1-eyebrow mb-1">Phase 1 of 3</div>
        <h2 className="game-title">Setup</h2>
        <div className="f1-red-line-left mb-4"></div>
        <p className="game-text">Study the map carefully.</p>
        <img src={metroMap} alt="Metro map" className="metro-map mb-4" />
        <div>
          <Button className="f1-btn" onClick={onReady}>Play</Button>
        </div>
      </Container>
    </div>
  )
}

function PlanningPhase({ startStation, endStation, segments, route, usedKeys, timeLeft, addSegment, removeLastSegment, onSubmit, bgStyle }) {
  return (
    <div className="game-page-bg" style={bgStyle}>
      <Container className="pt-4 pb-5">

        {/* Header row */}
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <div className="f1-eyebrow mb-1">Phase 2 of 3</div>
            <h2 className="game-title mb-0">Planning</h2>
          </div>
          <div className={`f1-timer${timeLeft < 20 ? ' f1-timer-urgent' : ''}`}>
            <div className="f1-timer-label">TIME</div>
            <div className="f1-timer-value">{timeLeft}s</div>
          </div>
        </div>
        <div className="f1-red-line-left mb-3"></div>

        {/* Route info */}
        <div className="f1-route-info mb-4">
          <div className="f1-route-station">
            <span className="f1-station-label">From</span>
            <span className="f1-station-name">{startStation.name}</span>
          </div>
          <div className="f1-route-arrow">→</div>
          <div className="f1-route-station">
            <span className="f1-station-label">To</span>
            <span className="f1-station-name">{endStation.name}</span>
          </div>
        </div>

        <img src={metroMapNoLines} alt="Metro map - no lines" className="metro-map mb-4" />

        <Row className="g-4">
          <Col md={6}>
            <div className="f1-panel-label">Available segments:</div>
            <AvailableSegments segments={segments} usedKeys={usedKeys} addSegment={addSegment} />
          </Col>

          <Col md={6}>
            <div className="f1-panel-label">Your route:</div>
            <ChosenRoute route={route} />
            <div className="d-flex gap-2 mt-3">
              <Button className="f1-btn-outline" onClick={removeLastSegment} disabled={route.length === 0}>Undo</Button>
              <Button className="f1-success-btn" onClick={onSubmit} disabled={route.length === 0}>Submit route</Button>
            </div>
          </Col>
        </Row>

      </Container>
    </div>
  )
}

function AvailableSegments({ segments, usedKeys, addSegment }) {
  return (
    <div className="f1-segment-list">
      {segments.map((seg, i) => {
        const isUsed = usedKeys.has(i)
        return (
          <div
            key={i}
            className={`f1-segment-item${isUsed ? ' f1-segment-used' : ''}`}
            onClick={() => !isUsed && addSegment(seg, i)}
          >
            <span className="f1-segment-dot"></span>
            <span className="f1-segment-text">{seg.fromName} — {seg.toName}</span>
            {isUsed && <span className="f1-segment-used-badge">used</span>}
          </div>
        )
      })}
    </div>
  )
}

function ChosenRoute({ route }) {
  if (route.length === 0) {
    return <div className="f1-route-empty">No segments selected yet.</div>
  }
  return (
    <div className="f1-chosen-route">
      {route.map((seg, i) => (
        <div key={i} className="f1-chosen-item">
          <span className="f1-chosen-num">{String(i + 1).padStart(2, '0')}</span>
          <span className="f1-chosen-text">{seg.fromName} ↔ {seg.toName}</span>
        </div>
      ))}
    </div>
  )
}

function ResultPhase({ result, onNewGame, bgStyle }) {
  const [shown, setShown] = useState(1)

  // if the route is empty or the route is wrong, you get 0 coins and a message is shown
  if (!result.valid) {
    return (
      <div className="game-page-bg" style={bgStyle}>
        <Container className="pt-4 pb-5">
          <div className="f1-eyebrow mb-1">Phase 3 of 3</div>
          <h2 className="game-title">Result</h2>
          <div className="f1-red-line-left mb-4"></div>
          <Alert variant="danger">Invalid or incomplete route. You scored 0 coins.</Alert>
          <Button className="f1-btn" onClick={onNewGame}>Play again</Button>
        </Container>
      </div>
    )
  }

  // variable used to keep track of shown segments
  // when it's 'true' the page shows total coins of the game and the user can start a new one
  const done = shown >= result.steps.length

  return (
    <div className="game-page-bg" style={bgStyle}>
      <Container className="pt-4 pb-5">
        <div className="f1-eyebrow mb-1">Phase 3 of 3</div>
        <h2 className="game-title">Your journey</h2>
        <div className="f1-red-line-left mb-4"></div>
        <PathTable steps={result.steps.slice(0, shown)} />
        {done ? (
          <>
            <div className="f1-final-score">
              Final score: <span className="f1-final-score-value">{result.finalScore}</span> coins
            </div>
            <Button className="f1-btn mt-3" onClick={onNewGame}>Play again</Button>
          </>
        ) : (
          <Button className="f1-btn-outline" onClick={() => setShown(s => s + 1)}>Next step</Button>
        )}
      </Container>
    </div>
  )
}

function PathTable({ steps }) {
  return (
    <div className="f1-steps-list mb-4">
      {steps.map((step, i) => (
        <div key={i} className="f1-step-card">
          <div className="f1-step-num">{String(i + 1).padStart(2, '0')}</div>
          <div className="f1-step-body">
            <div className="f1-step-route">{step.from} ↔ {step.to}</div>
            <div className="f1-step-event">{step.event}</div>
          </div>
          <div className="f1-step-coins-col">
            <Badge bg={step.coinsChange >= 0 ? 'success' : 'danger'} className="f1-coins-badge">
              {step.coinsChange >= 0 ? '+' : ''}{step.coinsChange} coins
            </Badge>
            <div className="f1-step-total">Total: {step.total}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default GamePage
