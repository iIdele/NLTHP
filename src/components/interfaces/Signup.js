import React, { useRef, useState } from "react";
import { Alert, Button, Card, Container, Form } from "react-bootstrap";
import { Link, useHistory } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import '../../Game.css';
import Logo from '../helpers/Logo';

/**
 * Signup component to allow users to sign up
 * to the Poker App and create an account
 * for storing their game statistics.
 */
export default function Signup() {
  const emailRef = useRef()
  const passwordRef = useRef()
  const passwordConfirmRef = useRef()
  const { signup } = useAuth()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const history = useHistory()

  /*
     Signup user submission
  */
  async function handleSubmit(e) {
    e.preventDefault()

    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      return setError("Passwords do not match")
    }

    try {
      setError("")
      setLoading(true)
      await signup(emailRef.current.value, passwordRef.current.value)
      history.push("/dashboard")
    } catch {
      setError("Failed to create an account")
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
              <h2 className="text-center mb-4">Create an Account</h2>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group id="email">
                  <Form.Control type="email" autocomplete="email" placeholder="Email Address" aria-label="Email Address" ref={emailRef} required />
                </Form.Group>
                <Form.Group id="password">
                  <Form.Control type="password" ref={passwordRef} placeholder="Password" aria-label="Password"  required />
                </Form.Group>
                <Form.Group id="password-confirm">
                  <Form.Control type="password" placeholder="Confirm Password" aria-label="Re-Type Password"ref={passwordConfirmRef} required />
                </Form.Group>
                <Button disabled={loading} className="w-100" type="submit" aria-label="Create Accounr">
                  Create Account
            </Button>
              </Form>
            </Card.Body>
          </Card>
          <div className="help-text w-100 text-center mt-2">
            Already have an account? <Link to="/login">Log In</Link>
          </div>
        </div>
      </Container>
    </>
  )
}