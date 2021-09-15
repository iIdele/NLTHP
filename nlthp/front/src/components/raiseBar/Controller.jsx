import React from 'react';

/**
 * Controller functional component which represents the base 
 * of the raise bar users can perform  call, fold or raise
 * actions through.
 */
function Controller({
  handle: { id, value, percent },
  getHandleProps
}) {
  return (
    <div
      style={{
        left: `${percent}%`
      }}
      {...getHandleProps(id)}
    >
      <div >
        {value}
      </div>
    </div>

  )
}

export default Controller;