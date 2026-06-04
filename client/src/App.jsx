import 'bootstrap/dist/css/bootstrap.min.css';

import { useContext, useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { Navigate, Route, Routes, useNavigate } from 'react-router';
import Footer from './components/Footer.jsx';
import Header from './components/Header.jsx';
import { LoginForm, Logout } from './components/LoginForm.jsx';
import { checkSession } from './api/auth.js';
import UserContext from './contexts/UserContext.js';
import './App.css'



function App() {
  const navigate = useNavigate()
  const [user, setUser] = useState({ id: undefined, username: undefined, name: undefined })

  // try to restore the login session
  useEffect(() => {
    checkSession().then(result => {
      if (result) {
        setUser({ id: result.id, username: result.username, name: result.name })
      }
    })
  }, [])

  // Login action handler
  const doLogin = (newUser) => {
    setUser({ id: newUser.id, username: newUser.username, name: newUser.name })
    navigate('/home')
  }

   const doLogout = () => {
    setUser({ id: undefined, username: undefined, name: undefined });
    navigate('/');
  };

  return (
    <UserContext.Provider value={user}>
      <Header doLogout={doLogout} />
      <Container>
        <Routes>
            <Route path='/' element={<PublicPage />}/>
            <Route path='/home' element={user.id ? <HomeView /> : <Navigate to='/' />} />
            <Route path='/login' element={<LoginForm doLogin={doLogin} />} />
            <Route path='/logout' element={<Logout doLogout={doLogout} />} />
            <Route path='/game' element={user.id ? <GamePage /> : <Navigate to='/' />} />
            <Route path='/ranking' element={user.id ? <RankingPage /> : <Navigate to='/' />} />
            <Route path='*' element={<Navigate to='/' />} />
        </Routes>
      </Container>
      <Footer/>
    </UserContext.Provider>
  )
}

function PublicPage() { return <h1>Public Page</h1> }
function HomeView() { return <h1>Home</h1> }
function GamePage() { return <h1>Game</h1> }
function RankingPage() { return <h1>Ranking</h1> }

export default App
