import { useState, useEffect } from 'react'
import { Container } from 'react-bootstrap'
import { fetchRanking } from '../api/api'
import f1Podium from '../assets/f1_podium.jpg'

function RankingPage() {
  const [ranking, setRanking] = useState([])

  // call to the relative API
  useEffect(() => {
    fetchRanking().then(data => setRanking(data))
  }, [])

  return (
    <div className="ranking-page-bg" style={{ '--f1-podium': `url(${f1Podium})` }}>
      <Container className="pt-4 pb-5">
        <div className="f1-eyebrow mb-1">Global</div>
        <h2 className="game-title">Ranking</h2>
        <div className="f1-red-line-left mb-4"></div>
        <div className="f1-ranking-table">
          <div className="f1-ranking-header">
            <span className="f1-ranking-col-pos">#</span>
            <span className="f1-ranking-col-player">Player</span>
            <span className="f1-ranking-col-score">Best score</span>
          </div>
          <Classification ranking={ranking} />
        </div>
      </Container>
    </div>
  )
}

function Classification({ ranking }) {
  return ranking.map((entry, i) => {
    const pos = i + 1
    const medalClass = pos === 1 ? ' f1-rank-gold' : pos === 2 ? ' f1-rank-silver' : pos === 3 ? ' f1-rank-bronze' : ''
    return (
      <div key={i} className={`f1-ranking-row${medalClass}`}>
        <span className="f1-ranking-col-pos">
          <span className={`f1-pos-num${medalClass}`}>{pos}</span>
        </span>
        <span className="f1-ranking-col-player">{entry.name} {entry.surname}</span>
        <span className="f1-ranking-col-score">
          <span className="f1-score-value">{entry.best_score}</span>
          <span className="f1-score-label">coins</span>
        </span>
      </div>
    )
  })
}

export default RankingPage
