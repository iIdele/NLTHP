import React from 'react';

/**
 * Tracker functional component which tracks the raise 
 * slider bar users can perform bets/raises through.
 */
function Tracker({ source, target, getTrackProps }) {
  return (
    <div
      style={{
        left: `${source.percent}%`,
        width: `${target.percent - source.percent}%`,
      }}
      {...getTrackProps()}
    />
  )
}

export default Tracker;