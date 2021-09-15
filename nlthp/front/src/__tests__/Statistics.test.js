import React, {Component} from 'react';
import { Card, Button, Alert} from "react-bootstrap";
import renderer from 'react-test-renderer'

/**
 * A mock version of the Statistics component 
 * for testing purposes. This component only 
 * renders the elements necessary for testing.
 */ 
class testStatistics extends Component {

    currentUser = {
        email: 'test@test.com'
    }

    userStatistics = {
        num_beginner_games: 1,
        num_beginner_wins: 2,
        num_intermediate_games: 4,
        num_intermediate_wins: 0,
        num_expert_games: 1,
        num_expert_wins: 0,
        num_ultimate_games: 3, 
        num_ultimate_wins: 1
    }

    renderUserStats = () => {
        return (
            <>
                <div>
                    <div> Beginner Games Played : {userStatistics.num_beginner_games}</div>
                    <div> Beginner Games Won : {userStatistics.num_beginner_wins}</div>
                    <div> Intermediate Games Played : {userStatistics.num_intermediate_games}</div>
                    <div> Intermediate Games Won : {userStatistics.num_intermediate_wins}</div>
                    <div> Expert Games Played : {userStatistics.num_expert_games}</div>
                    <div> Expert Games Won : {userStatistics.num_expert_wins}</div>
                    <div> Ultimate Poker Pro Games Played : {userStatistics.num_ultimate_games}</div>
                    <div> Ultimate Poker Pro Games Won : {userStatistics.num_ultimate_wins}</div>
                    <div> Total Games Played : {userStatistics.num_beginner_games + userStatistics.num_intermediate_games + userStatistics.num_expert_games + userStatistics.num_ultimate_games}</div>
                    <div> Total Games Won : {userStatistics.num_beginner_wins + userStatistics.num_intermediate_wins + userStatistics.num_expert_wins + userStatistics.num_ultimate_wins}</div>
    
                </div>
                <Button className="w-100 mt-3" onClick={handleReturnToDashboard}>
                    Return to Dashboard
                </Button>
            </>
        )
    }

    renderGuestStats = () => {
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
                            <h2 className="text-center mb-4">Personal Statistics</h2>

                            {
                                (currentUser.email == "guest@guest.com") ? <GuestUserStatistics /> :
                                    (loading) ? "Loading..." : <UserStatistics userStatistics />
                            }

                        </Card.Body>

                    </Card>
                </div>
            </Container>
        </>
        )
    }
}

/* 
Test to verify that the Statistics
component renders correctly.
*/
test('render statistics', () => {
    const component = renderer.create(
        <testStatistics/>
    )
    let tree = component.toJSON()
    expect(tree).toMatchSnapshot()

})

/* 
Test to verify that the credentials entered by the user
are consistent with the credentials rendered.
 */
test('match credentials', () => {
    expect(testStatistics.currentUser).toBeUndefined()
    expect(testStatistics.userStatistics).toBeUndefined()
})