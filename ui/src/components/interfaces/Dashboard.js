import React, { useState } from "react";
import { Alert, Button, Card, Container } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import '../../Game.css';
import Logo from '../helpers/Logo';


/**
 * Dashboard component to provide users with menu 
 * where they can join a Poker game or view their 
 * individual game statistics.
 */
export default function Dashboard() {
    const [error, setError] = useState("")
    const { currentUser, logout } = useAuth()
    const history = useHistory()

    Dashboard.username = getUsername(currentUser.email)

    /*
     Logout user
    */
    async function handleLogout() {
        setError("")

        try {
            await logout()
            history.push("/login")
        } catch {
            setError("Failed to log out")
        }
    }

    /*
     Show user statistics
    */
    async function viewStatistics() {
        setError("")
        try {
            history.push("/Statistics")
        } catch {
            setError("Failed to view statistics")
        }
    }

    /*
     Start Game
    */
    async function playPoker(difficulty = "Beginner") {
        setError("")
        try {
            history.push("/?difficulty=" + difficulty)
        } catch {
            setError("Failed to enter game")
        }
    }

    /*
     Get username from email address
    */
    function getUsername(emailAddress) {
        return emailAddress.substring(0, emailAddress.indexOf("@"));
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
                            <h2 className="text-center mb-4">Dashboard</h2>
                            {error && <Alert variant="danger">{error}</Alert>}
                            <div className="text-center mb-2">Welcome <strong> {Dashboard.username}</strong>!</div>
                            <div className="w-100 text-center mt-2">
                                <Button className="w-100 mb-3" onClick={() => playPoker("beginner")}>
                                    Join Beginner Table
                                </Button>
                                <Button className="w-100 mb-3" onClick={() => playPoker("intermediate")}>
                                    Join Intermediate Table
                                </Button>
                                <Button className="w-100 mb-3" onClick={() => playPoker("expert")}>
                                    Join Expert Table
                                </Button>
                                <Button className="w-100 mb-3" onClick={() => playPoker("ultimate")}>
                                    Join Ultimate Poker Pro Table
                                </Button>
                                <Button variant="warning" className="w-100" onClick={viewStatistics}>
                                    View Personal Statistics
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                    <div className="w-100 text-center mt-2">
                        <Button variant="link" onClick={handleLogout}>
                            Log Out
                </Button>
                    </div>
                </div>
            </Container>
        </>
    )
}
