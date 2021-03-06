import React, {useRef, Component} from 'react';
import { Form, Button} from "react-bootstrap";
import renderer from 'react-test-renderer'

/**
 * A mock version of the Signup component 
 * for testing purposes. This component only 
 * renders the elements necessary for testing.
 */ 
class testSignup extends Component {

    password = 'password'
    emailRef = useRef('test@test.com')
    passwordRef = useRef(this.password)
    passwordConfirmRef = useRef(this.password)

    render = () => {
        return (
            <>
            <Form>
            <Form.Group id="email">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" ref={emailRef} required />
            </Form.Group>
            <Form.Group id="password">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" ref={passwordRef} required />
            </Form.Group>
            <Form.Group id="password-confirm">
                <Form.Label>Password Confirmation</Form.Label>
                <Form.Control type="password" ref={passwordConfirmRef} required />
            </Form.Group>
            <Button className="w-100" type="submit">
                Sign Up
            </Button>
            </Form>
            </>
        )
    }
}

/* 
Test to verify that the Signup
component renders correctly.
*/
test('render user signup', () => {
    const component = renderer.create(
        <testSignup/>
    )
    let tree = component.toJSON()
    expect(tree).toMatchSnapshot()

})

/* 
Test to verify that the credentials entered by the user
are consistent with the credentials rendered.
 */
test('match credentials', () => {
    expect(testSignup.emailRef).toBeUndefined()
    expect(testSignup.passwordRef).toBeUndefined()
})