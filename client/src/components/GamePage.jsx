import { useState, useEffect, useRef } from 'react'
import { Container, Button, Badge, ListGroup, Row, Col, Alert } from 'react-bootstrap'
import { useNavigate } from 'react-router'
import metroMap from '../assets/metro_map.svg'
import metroMapNoLines from '../assets/metro_map_no_lines.svg'
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
  const timerRef = useRef(null)
  const routeRef = useRef([])

  const usedKeys = new Set(route.map(seg => seg.index))

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
    const last = route[route.length - 1]
    setRoute(prev => prev.slice(0, -1))
  }

  if (phase === 'setup') return <SetupPhase onReady={startNewGame} />

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
    />
  )

  if (phase === 'result') return (
    <ResultPhase result={result} onNewGame={() => navigate('/play')} />
  )
}

function SetupPhase({ onReady }) {
  return (
    <Container className="mt-4">
      <h2>Setup</h2>
      <p>Study the map carefully.:</p>
      <img src={metroMap} alt="Metro map" className="metro-map" />
      <div className="mt-3">
        <Button variant="primary" onClick={onReady}>Play</Button>
      </div>
    </Container>
  )
}

function PlanningPhase({ startStation, endStation, segments, route, usedKeys, timeLeft, addSegment, removeLastSegment, onSubmit }) {
  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Planning</h2>
        <Badge bg={timeLeft < 20 ? 'danger' : 'secondary'} className="fs-5">⏱ {timeLeft}s</Badge>
      </div>
      <p>From <strong>{startStation.name}</strong> to <strong>{endStation.name}</strong>.</p>
      <img src={metroMapNoLines} alt="Metro map - no lines" className="metro-map" />

      <Row className="mt-3 g-3">
        <Col md={6}>
          <h5>Available segments:</h5>
          <ListGroup>
            {segments.map((seg, i) => {
              const isUsed = usedKeys.has(i)
              return (
                <ListGroup.Item action={!isUsed} disabled={isUsed} onClick={() => !isUsed && addSegment(seg, i)}>
                  {seg.fromName} — {seg.toName}
                </ListGroup.Item>
              )
            })}
          </ListGroup>
        </Col>

        <Col md={6}>
          <h5>Your route:</h5>
          <ListGroup className="mb-3">
            {route.map((seg, i) => (
              <ListGroup.Item key={i}>{seg.fromName} → {seg.toName}</ListGroup.Item>
            ))}
          </ListGroup>
          <div className="d-flex gap-2">
            <Button variant="outline-secondary" onClick={removeLastSegment} disabled={route.length === 0}>Undo</Button>
            <Button variant="success" onClick={onSubmit} disabled={route.length === 0}>Submit route</Button>
          </div>
        </Col>
      </Row>
    </Container>
  )
}

function ResultPhase({ result, onNewGame }) {
  return (
    <Container className="mt-4">
      <h2>Result</h2>
      {result.valid ? (
        <>
          <Alert variant="success">Valid route! Final score: <strong>{result.finalScore}</strong> coins</Alert>
          <h5>Steps:</h5>
          <PathTable result={result} />
        </>
      ) : (
        <Alert variant="danger">Invalid or incomplete route. You scored 0 coins.</Alert>
      )}
      <Button variant="primary" onClick={onNewGame}>Back to home!</Button>
    </Container>
  )
}

function PathTable({ result }) {
  return (
    <ListGroup className="mb-3">
      {result.steps.map((step) => (
        <ListGroup.Item >
          {step.from} → {step.to} |
          {step.event} |
          <Badge bg={step.coinsChange >= 0 ? 'success' : 'danger'}>{step.coinsChange >= 0 ? '+' : ''}{step.coinsChange} coins</Badge>
          Total: {step.total}
        </ListGroup.Item>
      ))}
    </ListGroup>
  )
}

export default GamePage