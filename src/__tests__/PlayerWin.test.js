import React from 'react';
import { Button, Card, Container } from 'react-bootstrap';
import renderer from 'react-test-renderer';

// mock properties for testing
var props = {
    winner: 'Player 1'
}

/* 
Test to create a copy of PlayerWin and verify
that it renders correctly.
 */
test('render winner', () => {

    const component = renderer.create(
        <Container
                className="d-flex flex-column align-items-center justify-content-center"
                style={{ minHeight: "100vh" }}
            >
                <div className="w-100" style={{ maxWidth: "400px" }}>
                    <Card>
                        <Card.Body>
                            <div className="w-200 text-center">
                                <img className="logo mr-2" src="/assets/win-trophy.png" />
                            </div>
                            <div className="w-100 m-100">
                                <h2>
                                    {props.winner} Wins!
                                </h2>
                            </div>
                            <Button className="w-100 mt-3">
                                Return to Dashboard
                        </Button>
                        </Card.Body>
                    </Card>
                </div>
            </Container>
    )

    let tree = component.toJSON()
    expect(tree).toMatchSnapshot()
})

/* 
Test to verify the correct winner is displayed.
*/
test('check winner', () => {
    expect("Player 1").toBe(props.winner)
})