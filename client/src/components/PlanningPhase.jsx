import { Container, Button, Row, Col} from 'react-bootstrap'
import metroMapNoLines from '../assets/metro_map_no_lines.svg'

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

export default PlanningPhase