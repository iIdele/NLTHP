import React from 'react';
import { Handles, Rail, Slider, Tracks } from 'react-compound-slider';
import Handle from "../components/raiseBar/Controller";
import { railStyle, sliderStyle } from "../components/raiseBar/styles";
import Track from "../components/raiseBar/Tracker";
import {
	calculateMinBet
} from './betService.js';

/** 
* The uiService provides services to handle
* UI animations assignments and renderings.
*/


/* 
 Set next game phase
*/
const makePhaseStatement = (phase) => {
	switch (phase) {
		case ('loading'): return 'Finding a Table, Please Wait';
		case ('initialDeal'): return 'Dealing out the cards';
		case ('betting1'): return 'Betting 1';
		case ('flop'): return 'Flop';
		case ('betting2'): return 'Flop';
		case ('turn'): return 'Turn';
		case ('betting3'): return 'Turn';
		case ('river'): return 'River';
		case ('betting4'): return 'River';
		case ('showdown'): return 'Show Your Cards!';
		default: throw Error('Unfamiliar phase returned from makePhaseStatement()');
	}
}

/* 
 Render Action Button text (Fold, Call, Raise, All in, etc.)
*/
const makeActionButtonText = (highBet, betInputValue, activePlayer) => {
	if ((highBet === 0) && (betInputValue === 0)) {
		return 'Check'
	} else if ((highBet === betInputValue)) {
		return 'Call'
	} else if ((betInputValue < highBet) || (betInputValue === activePlayer.chips + activePlayer.bet)) {
		return 'All-in!'
	} else if ((betInputValue > highBet)) {
		return 'Raise'
	}
}

/* 
 Show player winning after each hand
*/
const makeNetPlayerEarnings = (endChips, startChips) => {
	const netChipEarnings = (endChips - startChips);
	const win = (netChipEarnings > 0);
	const none = (netChipEarnings === 0);
	return (
		<div class={`showdown-player-earnings ${(win) ? ('positive') : (none) ? ('') : ('negative')}`}>
			{`${(win) ? ('+') : ('')}${netChipEarnings}`}
		</div>
	)
}

/* 
 Show Showdown messages
*/
const makeShowdownMessages = (showDownMessages) => {
	return showDownMessages.map((message, index) => {
		const { users, prize, rank } = message;
		if (users.length > 1) {
			return (
				<React.Fragment key={index}>
					<div className="message-div">
						<span className="message-user">
							{`${users.length} players `}
						</span>
						<span className="message-content">
							{`split the pot with a `}
						</span>
						<span className="message-rank">
							{`${rank}!`}
						</span>
					</div>
					{
						users.map(user => {
							return (
								<div key={index + user} class="message-div">
									<span className="message-player">
										{`${user} `}
									</span>
									<span className="message-content">
										{`takes `}
									</span>
									<span className="message-earnings">
										{`${prize} chips `}
									</span>
									<span className="message-content">
										{`from the pot.`}
									</span>
								</div>
							)
						})
					}
				</React.Fragment>
			)
		} else if (users.length === 1) {
			return (
				<div key={index} className="message-div">
					<span className="message-player">
						{`${users[0]} `}
					</span>
					<span className="message-content">
						{`wins `}
					</span>
					<span className="message-earnings">
						{`${prize} chips `}
					</span>
					<span className="message-content">
						{`from the pot with a `}
					</span>
					<span className="message-rank">
						{`${rank}!`}
					</span>
				</div>
			)
		}
	})
}

/* 
 Render User Action menu for actions and slider (for raising)
*/
const makeActionMenu = (highBet, players, activePlayerIndex, phase, changeSliderInputFn) => {
	const min = calculateMinBet(highBet, players[activePlayerIndex].chips, players[activePlayerIndex].bet)
	const max = players[activePlayerIndex].chips + players[activePlayerIndex].bet
	return (
		(phase === 'betting1' || phase === 'betting2' || phase === 'betting3' || phase === 'betting4') ? (players[activePlayerIndex].robot) ? (<h4 className="current-move-head"> {`Current Move: ${players[activePlayerIndex].name}`}</h4>) : (
			<React.Fragment>
				<Slider
					rootStyle={sliderStyle}
					domain={[min, max]}
					values={[min]}
					step={1}

					onChange={changeSliderInputFn}
					mode={2}
				>
					<Rail>
						{
							({ getRailProps }) => (
								<div style={railStyle} {...getRailProps()} />
							)
						}
					</Rail>
					<Handles>
						{
							({ handles, getHandleProps }) => (
								<div className='slider-handles'>
									{
										handles.map(handle => (
											<Handle
												key={handle.id}
												handle={handle}
												getHandleProps={getHandleProps}
											/>
										))
									}
								</div>
							)
						}
					</Handles>
					<Tracks right={false}>
						{
							({ tracks, getTrackProps }) => (
								<div className='slider-tracks'>
									{
										tracks.map(
											({ id, source, target }) => (
												<Track
													key={id}
													source={source}
													target={target}
													getTrackProps={getTrackProps}
												/>
											)
										)
									}
								</div>
							)
						}
					</Tracks>
				</Slider>
			</React.Fragment>
		) : null
	)
}

export {
	makePhaseStatement,
	makeShowdownMessages,
	makeNetPlayerEarnings,
	makeActionMenu,
	makeActionButtonText
};

