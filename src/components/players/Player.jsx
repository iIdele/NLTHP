import React from 'react';
import BackOfCard from '../cards/BackOfCard';
import Card from '../cards/Card';

/**
 * Player component that creates the base player entity 
 * for both the user and AI agents.
 */
const Player = (props) => {
  const {
    player: {
      agent,
      folded,
      cards,
      avatar,
      name,
      chips,
      bet
    },
    arrayIndex,
    playerAnimationCase,
    hasDealerChip,
    isActive,
    phase,
    clearCards,
  } = props;

  const dealerChip = "/assets/logo.svg";
  const chipCount = "./assets/chips.svg";
  const playerBet = "./assets/bet.svg";

  /*
  Select class name depending on the value of the bool.
  */
  const determineName = (bool) => {
    if (bool){
      return ' activePlayer'
    }
    else {
      return ''
    }
  }

  /*
  Assigns the correct format of card to players
  */
  const makePlayerCards = () => {
    let setFoldedClassName;

    if (folded || clearCards) {
      setFoldedClassName = true
    }

    // Hidden back of card for agents
    if (agent) {
      return cards.map((card, index) => {
        if (phase !== 'showdown') {
          return (
            <BackOfCard key={index} cardData={card} setFoldedClassName={setFoldedClassName} />
          );
        } else {
          // Reset Animation Delay
          const cardData = { ...card, animationDelay: 0 }
          return (
            <Card key={index} cardData={cardData} setFoldedClassName={setFoldedClassName} />
          );
        }
      });
    }
    // Visible front of card for user
    else {
      return cards.map((card, index) => {
        return (
          <Card key={index} cardData={card} setFoldedClassName={setFoldedClassName} />
        );
      });
    }
  }

  /*
  Choose font size based on length of player name.
  */
  const fontSize = (name) => {
    var len = name.length
    if (len < 14) {
      return 12
    }
    else {
      return 10
    }
  }

  /*
  Assign dealer chip to current round dealer
  */
  const makeDealerChip = () => {
    if (hasDealerChip) {
      return (
        <div className="dealer-chips-div">
          <img src={dealerChip} alt="Dealer Chip" />
        </div>
      )
    } else return null;
  }

  /*
  Check if player should have animation
  */
  const Animating = (playerBoxIndex) => {
    if (playerAnimationCase[playerBoxIndex].Animating) {
      return true;
    } else {
      return false;
    }
  }

  return (
    <div className={`player-wrapper p${arrayIndex}`}>
      <div className='flex-row abscard'>
        {makePlayerCards()}
      </div>
      <div className="player-div">
        <div className="player-icon-div">
          <img
            className={`player-icon-image${determineName(isActive)}`}
            src={avatar}
            alt="Player Avatar"
          />
          <h4 className="player-data-name" style={{ 'fontSize': fontSize(name)}}>
            {`${name}`}
          </h4>
          <div className="player-data-stash-div" aria-label={`Player Stash: ${chips}`}>
            <img className="player-data-stash-image" src={chipCount} alt="Player Stash" aria-label={`Player Stash: ${chips}`} />
            <h4 className="player-data-stash-head" aria-label={`Player Stash: ${chips}`}>{`${chips}`}</h4>
          </div>
          <div className="player-data-bet-div">
            <img className="player-data-bet-image" src={playerBet} alt="Player Ante" aria-label={`Player Ante: ${bet}`} />
            <h4 className="player-data-bet-head" aria-label={`Player Ante: ${bet}`}>{`${bet}`} </h4>
          </div>
          {makeDealerChip()}
        </div>
      </div>
    </div>
  )
}

export default Player;