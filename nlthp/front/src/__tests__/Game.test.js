import React, {Component} from 'react';
import renderer from 'react-test-renderer';

/**
 * A mock version of the Game component 
 * for testing purposes. This component only 
 * renders the elements necessary for testing.
 */ 
class testGame extends Component {
  state = {
    loading: true,
    winnerFound: null,
    winner: null,
    players: null,
    playersActive: null,
    playersFolded: null,
    playersAllIn: null,
    activePlayerIndex: null,
    dealerIndex: null,
    blindIndex: null,
    deck: null,
    communityCards: [],
    pot: null,
    highBet: null,
    betInputValue: null,
    sidePots: [],
    minBet: 20,
    phase: 'loading',
    playerHierarchy: [],
    showDownMessages: [],
    playActionMessages: [],
    playerAnimationCase: {
      0: { isAnimating: false, content: null },
      1: { isAnimating: false, content: null },
      2: { isAnimating: false, content: null },
      3: { isAnimating: false, content: null },
      4: { isAnimating: false, content: null },
      5: { isAnimating: false, content: null }
    }
  }

  renderGame = () => {
    const { highBet, players, activePlayerIndex, phase } = this.state;
    return (
      <div className='app-background'>
        <div className="title-text" style={{ maxWidth: "400px" }}></div>
        <div className="poker-table-div">
        <div className="title-logo">
          <img src={"./assets/logo.svg"} alt="App Logo"></img>
          <h3>No-Limit Texas Hold'em Poker</h3>
          <DropdownButton id="dropdown-basic-button" title="">
            <Dropdown.Item href="#"> <Link to="/dashboard">Return to Dashboard</Link></Dropdown.Item>
            <Dropdown.Item href="#"> <Link to="/login">Log out</Link></Dropdown.Item>
          </DropdownButton>
        </div>
          <img className="poker-table-image" src={"./assets/table.svg"} alt="Poker Table" />
          {this.renderTable()}
          <div className='community-hand-div' >
            {this.renderTableCommunityCards()}
          </div>
          <div className='pot-div'>
            <img src={'./assets/pot.svg'} alt="Community Pot" />
            <h4> {`${this.state.pot}`} </h4>
          </div>
        </div>
        { (this.state.phase === 'showdown') && this.renderPlayerShowdown()}
        <div className='game-bar' >
          <div className='game-buttons'>
            {this.renderPlayerActionButtons()}
          </div>
          <div className='slider'>
            {(!this.state.loading) && makeActionMenu(highBet, players, activePlayerIndex, phase, this.manageBetChange)}
          </div>
        </div>
      </div>
    )
  }
}

/* 
Test to verify that the game 
component renders correctly
*/
test('render main game', () => {
  const component = renderer.create( <testGame/>)
  let tree = component.toJSON()
  expect(tree).toMatchSnapshot()
})