import { useState, useEffect } from "react"
import { doLogin, doLogout } from "../api/auth"
import { useNavigate } from "react-router"
import { Form, Button, Container } from "react-bootstrap"

function LoginForm(props) {

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [errormsg, setErrormsg] = useState('')

    const doSubmit = async (ev) => {
        ev.preventDefault()
        setErrormsg('')
        console.log(username, password)

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
        <Container>
            <h2>Login</h2>
            <Form onSubmit={doSubmit}>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Username</Form.Label>
                    <Form.Control type="text" placeholder="Please enter your username" value={username} onChange={(ev) => setUsername(ev.target.value)} />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" placeholder="Password" value={password} onChange={(ev) => setPassword(ev.target.value)} />
                </Form.Group>
                <Button variant="primary" type="submit">
                    Log in
                </Button> {errormsg && <div className="text-danger">{errormsg}</div>}
            </Form>
        </Container>
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