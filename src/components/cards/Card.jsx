import React from 'react';

/**
 * Card component which represents the private Poker game cards 
 * dealt to the User and the Community cards dealt on the table.
 */
const Card = (props) => {
  const {
    cardData: {
      suit,
      cardFace,
      animationDelay
    },
    setFoldedClassName
  } = props;

  // get suit of card
  var suitOfCard = suit.substring(0, 1).toUpperCase();

  // display card according to value and suit given
  return (
    <div 
      className={`poker-card cardIn ${determineName(setFoldedClassName)}`}
      style={
        {animationDelay: `${determineStall(setFoldedClassName, animationDelay)}ms` }
        }>
      <img src={`${process.env.PUBLIC_URL}/assets/cardFaces/${cardFace}${suitOfCard}.svg`}></img>
    </div>
  )
}

/* 
Selects the class name depending on 
the state of the players cards.
*/
function determineName(className){
  if (className) {
    return ' folded'
  }
  else {
    return ''
  }
}

/* 
Determines how long the stall animations 
takes to complete.
*/
function determineStall(name, time) {
  if(name) {
    return 0
  }
  else{
    return time
  }
}

export default Card;