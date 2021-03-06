import React from 'react';
import { CSSTransition } from 'react-transition-group';

/**
 * This component controls the animations 
 * and transitional effects of player actions.
 */
function PlayerStatus({ index, isActive, content, endTransition }) {
    return (
        <CSSTransition
            in={isActive}
            timeout={{
                appear: 0,
                enter: 0,
                exit: 1250,
            }}
            classNames="trans-notification"
            onEntered={() => endTransition(index)}
        >
            <div className="notification">
                {`${content}`}
            </div>
        </CSSTransition>
    )
}

export default PlayerStatus;