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
    applyFoldedClassname
  } = props;

  // display back of card (values hidden from user)
  return (
    <div
      key={`${suit} ${cardFace}`}
      className={`poker-card cardIn agent-card${(applyFoldedClassname ? ' folded' : '')}`}
      style={{ animationDelay: `${(applyFoldedClassname) ? 0 : animationDelay}ms` }}>
    </div>
  )
}

export default BackOfCard;