import { useState, useEffect } from "react"
import { doLogin, doLogout } from "../api/auth"
import { useNavigate } from "react-router"
import { Form, Button, Container } from "react-bootstrap"
import f1Cockpit from '../assets/f1_cockpit.jpg'

function LoginForm(props) {

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [errormsg, setErrormsg] = useState('')

    const doSubmit = async (ev) => {
        ev.preventDefault()
        setErrormsg('')

        try {
            // validations ...
            const user = await doLogin(username, password)
            props.doLogin(user)
        } catch (ex) {
            setErrormsg(ex.message)
            setTimeout(() => setErrormsg(''), 3000)
        }
    }

    return (
        <div className="login-page-bg" style={{ '--f1-cockpit': `url(${f1Cockpit})` }}>
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 56px - 42px)' }}>
                <div className="login-card">
                    <div className="f1-eyebrow text-center mb-1">Last Race</div>
                    <h2 className="login-title">Login</h2>
                    <div className="f1-red-line mb-4"></div>
                    <Form onSubmit={doSubmit}>
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label className="login-label">Username</Form.Label>
                            <Form.Control className="login-input" type="text" placeholder="Please enter your username" value={username} onChange={(ev) => setUsername(ev.target.value)} />
                        </Form.Group>
                        <Form.Group className="mb-4" controlId="formBasicPassword">
                            <Form.Label className="login-label">Password</Form.Label>
                            <Form.Control className="login-input" type="password" placeholder="Password" value={password} onChange={(ev) => setPassword(ev.target.value)} />
                        </Form.Group>
                        <div className="d-grid">
                            <Button className="f1-btn" type="submit">Log in</Button>
                        </div>
                        {errormsg && <div className="text-danger mt-3 text-center">{errormsg}</div>}
                    </Form>
                </div>
            </Container>
        </div>
    );
}

function Logout(props) {
    const navigate = useNavigate()

    useEffect(() => {
        doLogout().then(() => {
            props.doLogout()
            navigate('/')
        })
    }, [])
    return "Logging out..."
}

export { LoginForm, Logout }