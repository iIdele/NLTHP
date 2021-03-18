import React from 'react';

/** 
 * This is an alternate player component that
 * creates the player entity shown in the 
 * showdown phase of the game.
 */
const PlayerShowdown = (props) => {
  const {
    name,
  } = props;

  return (
    <div className="player-div">
      <div className="player-icon-div">
        <h5 className="player-data-name">
          {`${name}`}
        </h5>
      </div>
    </div>
  )
}

export default PlayerShowdown;