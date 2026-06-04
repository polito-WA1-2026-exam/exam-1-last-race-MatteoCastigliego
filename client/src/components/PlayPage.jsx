import { Container, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router'
import metroMap from '../assets/metro_map.svg'

function PlayPage() {
  const navigate = useNavigate()

  return (
    <Container className="mt-4">
      <h1>Underground Network</h1>
      <p>Study the network map, then start a new game when you're ready.</p>
      <img src={metroMap} alt="Metro map" className='metro-map' />
      <div className="mt-3">
        <Button variant="primary" onClick={() => navigate('/game')}>Start new game</Button>
      </div>
    </Container>
  )
}

export default PlayPage