import 'core-js/es/array';
import 'core-js/es/map';
import 'core-js/es/set';
import "core-js/stable";
import { cloneDeep } from 'lodash';
import 'raf/polyfill';
import React, { Component } from 'react';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import { Link } from "react-router-dom";
import "regenerator-runtime/runtime";
import '../../App.css';
import '../../Game.css';
import {
  aiHandler as aiHandlerUtil
} from '../../services/aiService.js';
import {
  anteUpBlinds, calculateBlindIndices,

  calculateMinBet,
  manageBet,
  managePlayerFold
} from '../../services/betService.js';
import {
  dealPlayerCards, makeDeckOfCards,
  shuffleCards
} from '../../services/cardsService.js';
import {
  checkWin, makeTable, startNextRound
} from '../../services/playersService.js';
import {
  makeActionButtonText,

  makeActionMenu, makeNetPlayerEarnings, makeShowdownMessages
} from '../../services/uiService.js';
import Card from "../cards/Card";
import SpinnerLoading from '../helpers/SpinnerLoading';
import Player from "../players/Player";
import Dashboard from './Dashboard';
import PlayerWin from './PlayerWin';

/**
 * Game component that manages all aspects of the Poker Game
 * and allows user to compete with AI Agents.
 */
class Game extends Component {
  state = {
    playerAnimationCase: {
      0: { isAnimating: false, content: null },
      1: { isAnimating: false, content: null },
      2: { isAnimating: false, content: null },
      3: { isAnimating: false, content: null },
      4: { isAnimating: false, content: null },
      5: { isAnimating: false, content: null }
    },
    loading: true,
    winnerFound: null,
    winner: null,
    blindIndex: null,
    playerHierarchy: [],
    showDownMessages: [],
    playActionMessages: [],
    deck: null,
    communityCards: [],
    pot: null,
    highBet: null,
    betInputValue: null,
    sidePots: [],
    minBet: 20,
    phase: 'loading', 
    players: null,
    playersActive: null,
    playersFolded: null,
    playersAllIn: null,
    activePlayerIndex: null,
    dealerIndex: null,  
  }

  // animation delay for cards which gives real dealer effect
  cardanimationDelay = 0;

  /*
   On component load create game with table, players, etc.
  */
  async componentDidMount() {
    const players = await makeTable(Dashboard.username);
    // randomly assign dealer chip
    const dealerIndex = Math.floor(Math.random() * Math.floor(players.length));

    // assign blinds to respective players
    const blindIndicies = calculateBlindIndices(dealerIndex, players.length);
    const playersBoughtIn = anteUpBlinds(players, blindIndicies, this.state.minBet);

    const imageLoaderRequest = new XMLHttpRequest();

    // wait for table to load
    imageLoaderRequest.addEventListener("load", e => {
      console.log(`${e.type}`);
      console.log(e);
      console.log("Table Loaded!");
      this.setState({
        loading: false,
      })
    });


    imageLoaderRequest.addEventListener("loadstart", e => {
      console.log(`${e.type}`);
      console.log(e);
    });

    imageLoaderRequest.addEventListener("loadend", e => {
      console.log(`${e.type}`);
      console.log(e);
    });

    imageLoaderRequest.addEventListener("progress", e => {
      console.log(`${e.type}`);
      console.log(e);
    });

    imageLoaderRequest.addEventListener("abort", e => {
      console.log(`${e.type}`);
      console.log(e);
    });

    imageLoaderRequest.addEventListener("error", e => {
      console.log(`${e.type}`);
      console.log(e);
    });

    imageLoaderRequest.open("GET", "./assets/table.svg");
    imageLoaderRequest.send();

    // set initial game state
    this.setState(prevState => ({
      players: playersBoughtIn,
      playersActive: players.length,
      playersFolded: 0,
      playersAllIn: 0,
      activePlayerIndex: dealerIndex,
      dealerIndex,
      blindIndex: {
        big: blindIndicies.bigBlindIndex,
        small: blindIndicies.smallBlindIndex,
      },
      deck: shuffleCards(makeDeckOfCards()),
      pot: 0,
      highBet: prevState.minBet,
      betInputValue: prevState.minBet,
      phase: 'initialDeal',
    }))
    // game executes until there is a winner
    this.executeGame();
  }

  /*
   Game execution which iterates through each phase of the 
   Poker game repeatedly until there is a winner at the table
  */
  executeGame = () => {
    // deal player cards
    const newState = dealPlayerCards(cloneDeep(this.state))
    // update state after each action
    this.setState(newState, () => {
      if ((this.state.players[this.state.activePlayerIndex].agent) && (this.state.phase !== 'showdown')) {
        setTimeout(() => {
          this.aiHandler()
        }, 1200)
      }
    })
  }

  /*
   Handler for Artificial Intelligence Agents performs action
   according to their in game decisions
  */
  aiHandler = () => {
    const { playerAnimationCase, ...appState } = this.state;
    // change state according to AI decision/action
    const newState = aiHandlerUtil(cloneDeep(appState), this.changePlayerAnimationState)

    // update state after action
    this.setState({
      ...newState,
      betInputValue: newState.minBet
    }, () => {
      if ((this.state.players[this.state.activePlayerIndex].agent) && (this.state.phase !== 'showdown')) {
        setTimeout(() => {

          this.aiHandler()
        }, 1200)
      }
    })
  }

  /*
   Handle player bet change action
  */
  manageBetChange = (val, min, max) => {
    if (val === '') val = min
    if (val > max) val = max
    // handle player bet change
    this.setState({
      betInputValue: parseInt(val, 10),
    });
  }

  /*
   Handle player bet submit action
  */
  manageBetSubmit = (bet, min, max) => {
    const { playerAnimationCase, ...appState } = this.state;
    // get active player
    const { activePlayerIndex } = appState;
    // execute player action 
    this.changePlayerAnimationState(activePlayerIndex, `${makeActionButtonText(this.state.highBet, this.state.betInputValue, this.state.players[this.state.activePlayerIndex])} ${(bet > this.state.players[this.state.activePlayerIndex].bet) ? (bet) : ""}`);;
    const newState = manageBet(cloneDeep(appState), parseInt(bet, 10), parseInt(min, 10), parseInt(max, 10));

    // continue to next player if hand is not over
    this.setState(newState, () => {
      if ((this.state.players[this.state.activePlayerIndex].agent) && (this.state.phase !== 'showdown')) {
        setTimeout(() => {

          this.aiHandler()
        }, 1200)
      }
    });
  }

  /*
   Handle Raise Slider bar value change (by user)
  */
  manageSliderInputChange = (val) => {
    this.setState({
      betInputValue: val[0]
    })
  }

  /*
   Handle Player fold action
  */
  managePlayerFold = () => {
    const { playerAnimationCase, ...appState } = this.state
    // player fold action
    const newState = managePlayerFold(cloneDeep(appState));

    // continue to next player if hand is not over
    this.setState(newState, () => {
      if ((this.state.players[this.state.activePlayerIndex].agent) && (this.state.phase !== 'showdown')) {
        setTimeout(() => {

          this.aiHandler()
        }, 1200)
      }
    })
  }

  /*
   Handle next game hand
  */
  manageNextRound = () => {
    // remove cards from table
    this.setState({ clearCards: true })
    // start fresh round
    const newState = startNextRound(cloneDeep(this.state))
    var winner;
    // if there is a winner the game is over
    if (checkWin(newState.players)) {
      const players = newState.players
      players.forEach(element => {
        if (element.chips > 0)
          winner = element
      });
      this.setState({ winner: winner });
      this.setState({ winnerFound: true })

      return;
    }
    // continue to next round if hand is over
    this.setState(newState, () => {
      if ((this.state.players[this.state.activePlayerIndex].agent) && (this.state.phase !== 'showdown')) {
        setTimeout(() => this.aiHandler(), 1200)
      }
    })
  }

  /*
   Handle player animation according to state of game
  */
  changePlayerAnimationState = (index, content) => {
    const newAnimationSwitchboard = Object.assign(
      {},
      this.state.playerAnimationCase,
      { [index]: { isAnimating: true, content } }
    )
    this.setState({ playerAnimationCase: newAnimationSwitchboard });
  }

  /*
   Stop latest player animation 
  */
  popPlayerAnimationState = (index) => {
    const persistContent = this.state.playerAnimationCase[index].content;
    const newAnimationSwitchboard = Object.assign(
      {},
      this.state.playerAnimationCase,
      { [index]: { isAnimating: false, content: persistContent } }
    )
    this.setState({ playerAnimationCase: newAnimationSwitchboard });
  }

  /*
   Render Poker Table with Players, cards, etc.
  */
  renderTable = () => {
    // update table features according to current game state
    const {
      players,
      activePlayerIndex,
      dealerIndex,
      clearCards,
      phase,
      playerAnimationCase
    } = this.state;

    // changes turn of player each hand
    const reversedPlayers = players.reduce((result, player, index) => {

      const isActive = (index === activePlayerIndex);
      const hasDealerChip = (index === dealerIndex);


      // shift player in array to allow move dealer chip to each player counter clock-wise
      result.unshift(
        <Player
          key={index}
          arrayIndex={index}
          isActive={isActive}
          hasDealerChip={hasDealerChip}
          player={player}
          clearCards={clearCards}
          phase={phase}
          playerAnimationCase={playerAnimationCase}
          endTransition={this.popPlayerAnimationState}
        />
      )
      return result
    }, []);
    return reversedPlayers.map(component => component);
  }

  /*
   Render action buttons for user such as check/call/raise/allin and fold
  */
  renderPlayerActionButtons = () => {
    const { highBet, players, activePlayerIndex, phase, betInputValue } = this.state
    // calculate min bet user has to place
    const min = calculateMinBet(highBet, players[activePlayerIndex].chips, players[activePlayerIndex].bet)
    // calculate max bet user can place
    const max = players[activePlayerIndex].chips + players[activePlayerIndex].bet

    // render different buttons/text according to user input 
    return ((players[activePlayerIndex].agent) || (phase === 'showdown')) ? null : (
      <React.Fragment>
        <button className='fold-button' onClick={() => this.managePlayerFold()}>
          Fold
        </button>
        <button className='bet-button' onClick={() => this.manageBetSubmit(betInputValue, min, max)}>
          {makeActionButtonText(highBet, betInputValue, players[activePlayerIndex])}
        </button>
      </React.Fragment>
    )
  }

  /*
   Render community cards that dealer deals on flop, turn and river
  */
  renderTableCommunityCards = (purgeAnimation) => {
    return this.state.communityCards.map((card, index) => {
      let cardData = { ...card };
      if (purgeAnimation) {
        cardData.animationDelay = 0;
      }
      // render card according to its value and suit
      return (
        <Card key={index} cardData={cardData} />
      );
    });
  }

  /*
   Render player showdown at end of each hand.
   Compares players' hands and indicates winnings 
   (win/losses of each active player)
  */
  renderPlayerShowdown = () => {
    return (
      <div className='showdown-div-wrapper'>
        <h5 className="showdown-div-title">
          Hand Complete!
        </h5>
        <div className="showdown-div-messages">
          {makeShowdownMessages(this.state.showDownMessages)}
        </div>
        <h5 className="showdown-div-community-card-label">
          Community Cards
        </h5>
        <div className='showdown-div-community-cards'>
          {this.renderTableCommunityCards(true)}
        </div>
        <button className="showdown-nextRound-button" onClick={() => this.manageNextRound()}> Next Hand </button>
        { this.renderBestHands()}
      </div>
    )
  }

  /*
   Render each active player's best hand
   (considering player's private cards and 
   available community cards). Handles ties.
  */
  renderBestHands = () => {
    // get best hands from current state of game
    const { playerHierarchy } = this.state;

    return playerHierarchy.map(rankSnapshot => {
      const tie = Array.isArray(rankSnapshot);
      return tie ? this.renderHandSplit(rankSnapshot) : this.renderHandWinner(rankSnapshot);
    })
  }

  /*
   Render pot split amongst winning players
   when there is more than a single best hand.
  */
  renderHandSplit = (rankSnapshot) => {
    return rankSnapshot.map(player => {
      return this.renderHandWinner(player);
    })
  }

  makeCards = (cards) => {
    return cards.map((card, index) => {
      const cardData = { ...card, animationDelay: 0 }
      return <Card key={index} cardData={cardData} />
    })
  }

  /*
   Render player winning showdown. Displays best hand, 
   hand rankings and amount of chips won by player.
  */
  renderHandWinner = (player) => {
    // get best hand and hand ranking from winning player
    const { name, bestHand, handRank } = player;
    // get info of winning player
    const playerStateData = this.state.players.find(statePlayer => statePlayer.name === name);
    // display winning player information
    return (
      <table class="showdown-table content-table">
        <thead>
          <tr>
            <th>Player</th>
            <th>Private Cards</th>
            <th>Best Hand</th>
            <th>Hand Ranking</th>
            <th>Win/Loss</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              {name}</td>
            <td>
              <div class="showdown-player-privateCards">
                <div class="showdown-player-cards">
                  {this.makeCards(playerStateData.cards)}
                </div>
              </div>
            </td>
            <td><div className="showdown-player-besthand-div">
              <div className='showdown-player-besthand-cards' style={{ alignItems: 'center' }}>
                {
                  bestHand.map((card, index) => {
                    // reset animation delay for next round
                    const cardData = { ...card, animationDelay: 0 }
                    return <Card key={index} cardData={cardData} />
                  })
                }
              </div>
            </div>
            </td>
            <td>{handRank}</td>
            <td>{makeNetPlayerEarnings(playerStateData.roundEndChips, playerStateData.roundStartChips)}</td>
          </tr>

        </tbody>
      </table>



    )
  }

  /*
   Render Poker Game and all its entities. Table, Players, chips
   action buttons, title, logo, etc. This renders the game in its
   entirety.
  */
  renderGame = () => {
    const { highBet, players, activePlayerIndex, phase } = this.state;
    return (
      <div className='app-background'>
        <div className="title-text" style={{ maxWidth: "400px" }}></div>
        <div className="poker-table-div">
          <div className="title-logo">
            <img src={"./assets/logo.svg"}></img>
            <h3>No-Limit Texas Hold'em Poker</h3>
            <DropdownButton id="dropdown-basic-button" title="">
              <Dropdown.Item href="#"> <Link to="/dashboard">Return to Dashboard</Link></Dropdown.Item>
              <Dropdown.Item href="#"> <Link to="/login">Logout</Link></Dropdown.Item>
            </DropdownButton>
          </div>
          <img className="poker-table-image" src={"./assets/table.svg"} alt="Poker Table" />
          {this.renderTable()}
          <div className='community-hand-div' >
            {this.renderTableCommunityCards()}
          </div>
          <div className='pot-div'>
            <img src={'./assets/pot.svg'} alt="Pot Value" />
            <h5> {`${this.state.pot}`} </h5>
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

  /*
   Render Poker Game until there is a winner. When that occurs 
   render "Player wins" page.
  */
  render() {
    return (
      <div className="App">
        <div className='poker-table-wrapper'>
          {


            (this.state.loading) ? <SpinnerLoading /> :
              (this.state.winnerFound) ? <PlayerWin winner={this.state.winner} /> :
                this.renderGame()

            // to test Player Wins page
            // <PlayerWin winner={this.state.winner} difficulty=""/>
          }

        </div>
      </div>
    );
  }
}

export default Game;
