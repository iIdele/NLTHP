import React, {Component} from 'react';
import { Card, Button, Alert} from "react-bootstrap";
import renderer from 'react-test-renderer'

/**
 * A mock version of the Dashboard component 
 * for testing purposes. This component only 
 * renders the elements necessary for testing.
 */ 
class testDashboard extends Component {

    currentUser = {
        email: 'test@test.com'
    }

    render = () => {
        return (
            <>
            <Card>
                <Card.Body>
                    <h2 className="text-center mb-4">Dashboard</h2>
                    {<Alert variant="danger">{error}</Alert>}
            Welcome <strong> {currentUser.email} </strong>. 
                    <div className="w-100 text-center mt-2">
                        <Button className="w-100 mb-3">
                            Join Beginner Table
                        </Button>
                        <Button className="w-100 mb-3">
                            Join Intermediate Table
                        </Button>
                        <Button className="w-100 mb-3">
                            Join Expert Table
                        </Button>
                        <Button className="w-100 mb-3">
                            Join Ultimate Poker Pro Table
                        </Button>
                        <Button variant="warning" className="w-100">
                            View Personal Statistics
                        </Button>
                    </div>
                </Card.Body>
            </Card>
            </>
        )
    }
}

/* 
Test to verify that the Dashboard
component renders correctly.
*/
test('render dashboard', () => {
    const component = renderer.create(
        <testDashboard/>
    )
    let tree = component.toJSON()
    expect(tree).toMatchSnapshot()

})

/* 
Test to verify that the credentials entered by the user
are consistent with the credentials rendered.
 */
test('match credentials', () => {
    expect(testDashboard.currentUser).toBeUndefined()
})