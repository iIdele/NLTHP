import React, { useEffect } from "react"
import { Button, Card, Container } from "react-bootstrap"
import { useHistory, useLocation } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import firebaseDb from "../../firebase"
import Dashboard from './Dashboard'

/**
 * PlayerWin component to display Winning player
 * name and record user statistics.
 */
export default function PlayerWin(props) {
    const { currentUser } = useAuth()
    const history = useHistory()

    const search = useLocation().search;
    const difficulty = new URLSearchParams(search).get('difficulty');


    useEffect(() => {
        recordUserStatistics()
    });

    // Increase games played and/or wins for difficulty played
    async function recordUserStatistics(e) {
        var userStatistics = new Object();
        firebaseDb.database().ref().child(currentUser.uid).once("value").then(function (snapshot) {
            var countValues = 0;
            snapshot.forEach(function (childSnapshot) {
                var key = childSnapshot.key;
                var childData = childSnapshot.val();
                userStatistics[key] = childData;
                countValues += 1;
            });
            if (countValues == 0) {
                firebaseDb.database().ref().child(currentUser.uid).set({
                    "num_beginner_games": 0, "num_beginner_wins": 0,
                    "num_intermediate_games": 0, "num_intermediate_wins": 0,
                    "num_expert_games": 0, "num_expert_wins": 0,
                    "num_ultimate_games": 0, "num_ultimate_wins": 0,
                })
                userStatistics = {
                    "num_beginner_games": 0, "num_beginner_wins": 0,
                    "num_intermediate_games": 0, "num_intermediate_wins": 0,
                    "num_expert_games": 0, "num_expert_wins": 0,
                    "num_ultimate_games": 0, "num_ultimate_wins": 0,
                }
            }

            // Add results to DB
            if (difficulty == "beginner") {
                userStatistics["num_beginner_games"] = userStatistics["num_beginner_games"] + 1
                if (props.winner.name == Dashboard.username)
                    userStatistics["num_beginner_wins"] = userStatistics["num_beginner_wins"] + 1
            }
            else if (difficulty == "intermediate") {
                userStatistics["num_intermediate_games"] = userStatistics["num_intermediate_games"] + 1
                if (props.winner.name == Dashboard.username)
                    userStatistics["num_intermediate_wins"] = userStatistics["num_intermediate_wins"] + 1
            }
            else if (difficulty == "expert") {
                userStatistics["num_expert_games"] = userStatistics["num_expert_games"] + 1
                if (props.winner.name == Dashboard.username)
                    userStatistics["num_expert_wins"] = userStatistics["num_expert_wins"] + 1
            }
            else if (difficulty == "ultimate") {
                userStatistics["num_ultimate_games"] = userStatistics["num_ultimate_games"] + 1
                if (props.winner.name == Dashboard.username)
                    userStatistics["num_ultimate_wins"] = userStatistics["num_ultimate_wins"] + 1
            }

            firebaseDb.database().ref().child(currentUser.uid).set({
                "num_beginner_games": userStatistics["num_beginner_games"], "num_beginner_wins": userStatistics["num_beginner_wins"],
                "num_intermediate_games": userStatistics["num_intermediate_games"], "num_intermediate_wins": userStatistics["num_intermediate_wins"],
                "num_expert_games": userStatistics["num_expert_games"], "num_expert_wins": userStatistics["num_expert_wins"],
                "num_ultimate_games": userStatistics["num_ultimate_games"], "num_ultimate_wins": userStatistics["num_ultimate_wins"],
            })

        }, function (error) {
            console.log("Error reading player statistics from DB")
        });
    }

    /*
     Return user to dashboard menu
    */
    async function handleReturnToDashboard(e) {
        e.preventDefault()
        console.log("Returning to dashboard...")
        try {
            history.push("/dashboard")
        } catch {
            console.log("Error returning to dashboard. Please try again.")
        }
    }

    return (
        <Container
            className="d-flex flex-column align-items-center justify-content-center"
            style={{ minHeight: "100vh" }}
        >
            <div className="w-100" style={{ maxWidth: "400px" }}>
                <Card>
                    <Card.Body>
                        <div className="w-200 text-center">
                            <img className="logo mr-2" src="/assets/win-trophy.png" alt="Winner Trophy"/>
                        </div>
                        <div className="w-100 m-100">
                            <h2>
                                {props.winner.name} Wins!
                            </h2>
                        </div>
                        <Button className="w-100 mt-3" onClick={handleReturnToDashboard}>
                            Return to Dashboard
                    </Button>
                    </Card.Body>
                </Card>
            </div>
        </Container>
    )
}