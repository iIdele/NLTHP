import React, { useRef, useState } from "react";
import { Alert, Button, Card, Container, Form } from "react-bootstrap";
import { Link, useHistory } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import '../../Game.css';
import Logo from '../helpers/Logo';

/**
 * Login component to allow users to 
 * login to their accounts and play.
 */
export default function Login() {
  const emailRef = useRef()
  const passwordRef = useRef()
  const { login } = useAuth()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const history = useHistory()

  /*
     Login user submission
  */
  async function handleSubmit(e) {
    e.preventDefault()

    try {
      setError("")
      setLoading(true)
      await login(emailRef.current.value, passwordRef.current.value)
      history.push("/dashboard")
    } catch {
      setError("Invalid email or password")
    }

    setLoading(false)
  }

  /*
    Login guest submission
  */
  async function handleSubmitGuest(e) {
    e.preventDefault()
    console.log("Guest log in")
    try {
      setError("")
      setLoading(true)
      await login("guest@guest.com", "password")
      console.log(login)
      history.push("/dashboard")
    } catch {
      setError("Error. Cannot play as guest")
    }

    setLoading(false)
  }

  return (
    <>
      <Container
        className="d-flex flex-column align-items-center justify-content-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="w-200 text-center">
          <Logo />
        </div>
        <div className="w-100" style={{ maxWidth: "400px" }}>
          <Card>
            <Card.Body>
              <h2 className="text-center mb-4">Log In</h2>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group id="email">
                  <Form.Control type="email" autoComplete="email" placeholder="Email Address" aria-label="Email Address" ref={emailRef} required />
                </Form.Group>
                <Form.Group id="password">
                  <Form.Control type="password" placeholder="Password" aria-label="Password" ref={passwordRef} required />
                </Form.Group>
                <Button disabled={loading} className="w-100" type="submit" aria-label="Log In">
                  Log In
            </Button>
              </Form>
              <Button disabled={loading} variant="warning" className="w-100 mt-3" aria-label="Play as Guest" onClick={handleSubmitGuest}>
                Play as Guest
            </Button>
              <div className="w-100 text-center mt-3">
                <Link to="/forgot-password">Forgot Password?</Link>
              </div>
            </Card.Body>
          </Card>
          <div className="help-text text-center mt-2">
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </div>
        </div>
      </Container>
    </>
  )
}