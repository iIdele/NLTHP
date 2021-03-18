import React from 'react';

/**
 * Back of Card component which represents the private Poker game cards 
 * dealt to AI players which remain hidden from the user.
 */
const BackOfCard = (props) => {
  const {
    cardData: {
      suit,
      cardFace,
      animationDelay
    },
    setFoldedClassName
  } = props;

  // display back of card (values hidden from user)
  return (
    <div
      key={`${suit} ${cardFace}`}
      className={`poker-card cardIn agent-card${determineName(setFoldedClassName)}`}
      style={
        {animationDelay: `${determineStall(setFoldedClassName, animationDelay)}ms` }
        }>
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

export default BackOfCard;