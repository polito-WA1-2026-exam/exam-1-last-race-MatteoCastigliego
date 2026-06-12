import { Container, Button } from 'react-bootstrap'
import metroMap from '../assets/metro_map.svg'

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

export default SetupPhase