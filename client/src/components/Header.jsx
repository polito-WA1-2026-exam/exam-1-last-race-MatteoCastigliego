import { useContext } from "react";
import { Button, Container, Navbar, Nav } from "react-bootstrap";
import { Link, useNavigate } from 'react-router';
import UserContext from '../contexts/UserContext.js';
import { doLogout } from '../api/auth.js';


function Header({ doLogout: handleLogout }) {
  const user = useContext(UserContext);

  const logout = async () => {
    await doLogout();
    handleLogout();
  };

  return (
    <Navbar bg='dark' variant='dark'>
      <Container fluid>
        <Navbar.Brand><Link to={user.id ? '/home' : '/'} className="text-white text-decoration-none">Last Race</Link></Navbar.Brand>        <Nav className="ms-auto">
          {user.id ? (
            <>
              <Nav.Link as={Link} to='/home'>Home</Nav.Link>
              <Nav.Link as={Link} to='/ranking'>Ranking</Nav.Link>
              <UserInfo name = {user.name} />
              <LogoutButton logout = {logout}/>
            </>
          ) : (
            <LoginButton />
          )}
        </Nav>
      </Container>
    </Navbar>
  );
}

function LoginButton(){
  const navigate = useNavigate();
  return <Button variant='outline-light' onClick={() => navigate('/login')}>Login</Button>
}

function LogoutButton(prop){
  return <Button variant='outline-light' onClick={prop.logout}>Logout</Button>
}

function UserInfo(props){
  return <Nav.Item className="d-flex align-items-center text-white me-3">{props.name}</Nav.Item>
}

export default Header;