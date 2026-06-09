import { Container, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router'

function PlayPage() {
  const navigate = useNavigate()

  return (
    <div className="play-page-bg">
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 56px - 42px)' }}>
        <div className="text-center">
          <div className="f1-eyebrow mb-1">Last Race</div>
          <h2 className="game-title mb-2">Ready for another race?</h2>
          <div className="f1-red-line mb-4"></div>
          <p className="game-text">Your result has been saved to the ranking.</p>
          <Button className="f1-btn" size="lg" onClick={() => navigate('/game')}>Play again</Button>
        </div>
      </Container>
    </div>
  )
}

export default PlayPage