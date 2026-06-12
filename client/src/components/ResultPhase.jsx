import { useState } from 'react'
import { Container, Button, Badge, Alert } from 'react-bootstrap'

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

export default ResultPhase