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
  
  /* 
  Convert card face into readable string
  for alt tag to improve accessiblity.
  */
  const matchFace = (card) => {
    var face
    switch(card){
      case 'A':
        face = "Ace"
        break
      case '2':
        face = "Two"
        break
      case '3':
        face = "Three"
        break
      case '4':
        face = "Four"
        break
      case '5':
        face = "Five"
        break
      case '6':
        face = "Six"
        break
      case '7':
        face = "Seven"
        break
      case '8':
        face = "Eight"
        break
      case '9':
        face = "Nine"
        break
      case '10':
        face = "Ten"
        break
      case 'J':
        face = "Jack"
        break
      case 'Q':
        face = "Queen"
        break
      case 'K':
        face = "King"
        break
    }
    
    return face
  }

  // display card according to value and suit given
  return (
    <div 
      className={`poker-card cardIn ${determineName(setFoldedClassName)}`}
      style={
        {animationDelay: `${determineStall(setFoldedClassName, animationDelay)}ms` }
        }>
      <img src={`${process.env.PUBLIC_URL}/assets/cardFaces/${cardFace}${suitOfCard}.svg`} aria-label={`User Card: ${matchFace(cardFace)} of ${suit}s`} alt={`${matchFace(cardFace)} of ${suit}s`}></img>
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