import React, { Component } from 'react';

/**
 * Logo component which represents the Logo image of the Poker App
 * aligned with the name of the App.
 */
class Logo extends Component {
    render() {
        return (
            <div className="logo-main mb-4">
                <span className="navbar-brand">
                    <span ><img className="logo mr-2" src="/assets/logo.svg" /></span>
                    <h3 className="navbar-text">No-Limit Texas Hold'em Poker</h3>
                </span>
            </div>
        )
    }
}

export default Logo;