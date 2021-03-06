import React from 'react';
import BackOfCard from '../cards/BackOfCard';
import Card from '../cards/Card';
import PlayerStatus from "./PlayerStatus";



const dealerChipImageURL = "/assets/logo.svg";
const chipCountImageURL = "./assets/chips.svg";
const playerBetImageURL = "./assets/bet.svg";


/**
 * Player component that creates the base player entity 
 * for both the user and AI agents.
 */
const Player = (props) => {
  const {
    arrayIndex,
    playerAnimationSwitchboard,
    endTransition,
    hasDealerChip,
    isActive,
    phase,
    clearCards,
    player: {
      robot,
      folded,
      cards,
      avatarURL,
      name,
      chips,
      bet
    }
  } = props;

  /*
     Assigns the correct format of card to players
  */
  const makePlayerCards = () => {
    let applyFoldedClassname;

    if (folded || clearCards) {
      applyFoldedClassname = true
    }

    // Hidden back of card for agents
    if (robot) {
      return cards.map((card, index) => {
        if (phase !== 'showdown') {
          return (
            <BackOfCard key={index} cardData={card} applyFoldedClassname={applyFoldedClassname} />
          );
        } else {
          // Reset Animation Delay
          const cardData = { ...card, animationDelay: 0 }
          return (
            <Card key={index} cardData={cardData} applyFoldedClassname={applyFoldedClassname} />
          );
        }
      });
    }
    // Visible front of card for user
    else {
      return cards.map((card, index) => {
        return (
          <Card key={index} cardData={card} applyFoldedClassname={applyFoldedClassname} />
        );
      });
    }
  }


  /*
     Assign dealer chip to current round dealer
  */
  const makeDealerChip = () => {
    if (hasDealerChip) {
      return (
        <div className="dealer-chips-div">
          <img src={dealerChipImageURL} alt="Dealer Chip" />
        </div>
      )
    } else return null;
  }

  /*
     Check if player should have animation
  */
  const Animating = (playerBoxIndex) => {
    if (playerAnimationSwitchboard[playerBoxIndex].Animating) {
      return true;
    } else {
      return false;
    }
  }


  return (
    <div className={`player-wrapper p${arrayIndex}`}>
      <PlayerStatus
        index={arrayIndex}
        isActive={Animating(arrayIndex)}
        content={playerAnimationSwitchboard[arrayIndex].content}
        endTransition={endTransition}
      />
      <div className='flex-row abscard'>
        {makePlayerCards()}
      </div>
      <div className="player-div">
        <div className="player-icon-div">
          <img
            className={`player-icon-image${(isActive ? ' activePlayer' : '')}`}
            src={avatarURL}
            alt="Player Avatar"
          />
          <h5 className="player-data-name" style={{ 'fontSize': (name.length < 14) ? 12 : 10 }}>
            {`${name}`}
          </h5>
          <div className="player-data-stash-div">
            <img className="player-data-stash-image" src={chipCountImageURL} alt="Player Stash" />
            <h5 className="player-data-stash-head">{`${chips}`}</h5>
          </div>
          <div className="player-data-bet-div">
            <img className="player-data-bet-image" src="./assets/pot.svg" alt="Player Bet" />
            <h5 className="player-data-bet-head">{`${bet}`}</h5>
          </div>
          {makeDealerChip()}
        </div>
      </div>
    </div>
  )
}

export default Player;