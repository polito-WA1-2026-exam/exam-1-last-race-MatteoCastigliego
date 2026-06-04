import { Container, Row, Col, Card, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router'

function PublicPage() {
  const navigate = useNavigate()

  return (
    <Container className="mt-5">

      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold">Last Race</h1>
        <p className="lead text-muted">A single-player underground strategy game inspired by "Race the Rails"</p>
        <Button variant="dark" size="lg" onClick={() => navigate('/login')}>Login to play</Button>
      </div>

      <h4 className="mb-3">How it works</h4>
      <HowItWorksSection />
      
      <h4 className="mb-3">Rules</h4>
      <RulesSection />

    </Container>
  )
}

function HowItWorksSection(){
  return(
    <Row className="g-3 mb-5">
        <Col xs={12} sm={6} lg={3}>
          <Card className="h-100 text-center shadow-sm">
            <Card.Body>
              <div className="fs-1 fw-bold text-secondary">1</div>
              <Card.Title>Setup</Card.Title>
              <Card.Text className="text-muted">Study the underground map with all stations and lines before the game begins.</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="h-100 text-center shadow-sm">
            <Card.Body>
              <div className="fs-1 fw-bold text-secondary">2</div>
              <Card.Title>Planning</Card.Title>
              <Card.Text className="text-muted">You have 90 seconds to plan your route. The map shows only station names — no lines.</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="h-100 text-center shadow-sm">
            <Card.Body>
              <div className="fs-1 fw-bold text-secondary">3</div>
              <Card.Title>Execution</Card.Title>
              <Card.Text className="text-muted">The app validates your route and runs each step, applying random events that affect your coins.</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="h-100 text-center shadow-sm">
            <Card.Body>
              <div className="fs-1 fw-bold text-secondary">4</div>
              <Card.Title>Result</Card.Title>
              <Card.Text className="text-muted">Your final score is shown and added to the global ranking. Play again to improve!</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
  )
}

function RulesSection(){
  return(
    <Row className="g-3">
        <Col xs={12} md={6}>
          <Card body className="shadow-sm">You start each game with 20 coins.</Card>
        </Col>
        <Col xs={12} md={6}>
          <Card body className="shadow-sm">The destination is at least 3 stops away from the starting station.</Card>
        </Col>
        <Col xs={12} md={6}>
          <Card body className="shadow-sm">Route changes are only allowed at interchange stations.</Card>
        </Col>
        <Col xs={12} md={6}>
          <Card body className="shadow-sm">An invalid or incomplete route costs you all 20 coins.</Card>
        </Col>
        <Col xs={12} md={6}>
          <Card body className="shadow-sm">If your final score is negative, it is stored as zero.</Card>
        </Col>
      </Row>
  )
}

export default PublicPage