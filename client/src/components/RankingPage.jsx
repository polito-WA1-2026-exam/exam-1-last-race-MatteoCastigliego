import { useState, useEffect } from 'react'
import { Container, Table, Badge } from 'react-bootstrap'
import { fetchRanking } from '../api/api'

function RankingPage() {
  const [ranking, setRanking] = useState([])

  // call to the relative API
  useEffect(() => {
    fetchRanking().then(data => setRanking(data))
  }, [])

  return (
    <Container className="mt-4">
      <h2>Ranking</h2>
      <Table striped bordered hover className="mt-3">
        <thead>
          <tr>
            <th>#</th>
            <th>Player</th>
            <th>Best score</th>
          </tr>
        </thead>
        <tbody>
          <Classification ranking = {ranking} />
        </tbody>
      </Table>
    </Container>
  )
}

function Classification({ ranking }) {
  return ranking.map((entry, i) => (
    <tr key={i}>
      <td>{i + 1}</td>
      <td>{entry.name} {entry.surname}</td>
      <td><Badge bg="success">{entry.best_score} coins</Badge></td>
    </tr>
  ))
}

export default RankingPage