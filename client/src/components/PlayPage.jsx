import { Container, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router'

function PlayPage() {
  const navigate = useNavigate()

  return (
    <Container className="mt-5 text-center">
      <h2>Ready for another race?</h2>
      <p className="text-muted">Your result has been saved to the ranking.</p>
      <Button variant="primary" size="lg" onClick={() => navigate('/game')}>Play again</Button>
    </Container>
  )
}

export default PlayPage