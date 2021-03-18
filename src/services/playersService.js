import uuid from 'uuid/v1';
import Dashboard from '../components/interfaces/Dashboard';
import { anteUpBlinds, calculateBlindIndices, managePhaseShift, remakePot } from './betService.js';
import { dealOtherCommunityCards, dealPlayerCards, makeDeckOfCards, playerShowDown, shuffleCards } from './cardsService.js';

/** 
* The playerService provides services to handle
* player information and the passing of information
* to players.
*/

/* 
 Used to create agents of different difficulties
 */
 const makePersonality = (seed) => {
	switch (seed) {
		// intermediate/advanced ai
		case (seed > 0.5):
			return 'standard'
		// beginner ai
		case (seed > 0.35):
			return 'aggressive'
		case (seed > 0):
		// intermediate/advanced ai
		default:
			return 'conservative'
	}
}

/* 
Intialise user and agents data
*/
const axios = require('axios')
const makeTable = async (playerName = Dashboard.username ? Dashboard.username : "User") => {
	// a list containing both the user and the agents data
	const users = [{
		id: uuid(),
		name: playerName,
		avatar: '/assets/playerIcons/greenUser.svg',
		cards: [],
		showDownHand: {
			hand: [],
			descendingSortHand: [],
		},
		chips: 20000,
		roundStartChips: 20000,
		roundEndChips: 20000,
		currentRoundChipsInvested: 0,
		bet: 0,
		betReconciled: false,
		folded: false,
		allIn: false,
		canRaise: true,
		stackInvestment: 0,
		agent: false
	},
	{
		id: uuid(),
		name: 'Agent 1',
		avatar: '/assets/playerIcons/blueUser.svg',
		cards: [],
		showDownHand: {
			hand: [],
			descendingSortHand: [],
		},
		chips: 20000,
		roundStartChips: 20000,
		roundEndChips: 20000,
		currentRoundChipsInvested: 0,
		bet: 0,
		betReconciled: false,
		folded: false,
		allIn: false,
		canRaise: true,
		stackInvestment: 0,
		agent: true
	},
	{
		id: uuid(),
		name: 'Agent 2',
		avatar: '/assets/playerIcons/redUser.svg',
		cards: [],
		showDownHand: {
			hand: [],
			descendingSortHand: [],
		},
		chips: 20000,
		roundStartChips: 20000,
		roundEndChips: 20000,
		currentRoundChipsInvested: 0,
		bet: 0,
		betReconciled: false,
		folded: false,
		allIn: false,
		canRaise: true,
		stackInvestment: 0,
		agent: true
	},
	{
		id: uuid(),
		name: 'Agent 3',
		avatar: '/assets/playerIcons/purpleUser.svg',
		cards: [],
		showDownHand: {
			hand: [],
			descendingSortHand: [],
		},
		chips: 20000,
		roundStartChips: 20000,
		roundEndChips: 20000,
		currentRoundChipsInvested: 0,
		bet: 0,
		betReconciled: false,
		folded: false,
		allIn: false,
		canRaise: true,
		stackInvestment: 0,
		agent: true
	},
	{
		id: uuid(),
		name: 'Agent 4',
		avatar: '/assets/playerIcons/yellowUser.svg',
		cards: [],
		showDownHand: {
			hand: [],
			descendingSortHand: [],
		},
		chips: 20000,
		roundStartChips: 20000,
		roundEndChips: 20000,
		currentRoundChipsInvested: 0,
		bet: 0,
		betReconciled: false,
		folded: false,
		allIn: false,
		canRaise: true,
		stackInvestment: 0,
		agent: true
	},
	{
		id: uuid(),
		name: 'Agent 5',
		avatar: '/assets/playerIcons/brownUser.svg',
		cards: [],
		showDownHand: {
			hand: [],
			descendingSortHand: [],
		},
		chips: 20000,
		roundStartChips: 20000,
		roundEndChips: 20000,
		currentRoundChipsInvested: 0,
		bet: 0,
		betReconciled: false,
		folded: false,
		allIn: false,
		canRaise: true,
		stackInvestment: 0,
		agent: true
	}];

	return users
}

/* 
 Determines which players turn is next
 */
const chooseNextActivePlayer = (state) => {
	state.activePlayerIndex = manageOverflowIndex(state.activePlayerIndex, 1, state.players.length, 'up');
	const activePlayer = state.players[state.activePlayerIndex];

	const allButOnePlayersAreAllIn = (state.playersActive - state.playersAllIn === 1);
	if (state.playersActive === 1) {
		console.log("Only one player active, skipping to showdown.")
		return (playerShowDown(remakePot(dealOtherCommunityCards(state))));
	}
	if (activePlayer.folded) {
		console.log("Current player index is folded, going to next active player.")
		return chooseNextActivePlayer(state);
	}

	if (
		allButOnePlayersAreAllIn &&
		!activePlayer.folded &&
		activePlayer.betReconciled
	) {
		return (playerShowDown(remakePot(dealOtherCommunityCards(state))));
	}

	if (activePlayer.chips === 0) {
		if (state.playersAllIn === state.playersActive) {
			console.log("All players are all in.")
			return (playerShowDown(remakePot(dealOtherCommunityCards(state))));
		} else if (allButOnePlayersAreAllIn && activePlayer.allIn) {
			return (playerShowDown(remakePot(dealOtherCommunityCards(state))));
		} else {
			return chooseNextActivePlayer(state);
		}
	}

	if (activePlayer.betReconciled) {
		console.log("Player is reconciled with pot, round betting cycle complete, proceed to next round.")
		return managePhaseShift(state);
	}

	return state
}

/* 
 The dealer chip is assigned to the 
 player acting as the dealer in 
 a given round.
 */
const moveDealerChip = (state) => {
	state.dealerIndex = manageOverflowIndex(state.dealerIndex, 1, state.players.length, 'up');
	const nextDealer = state.players[state.dealerIndex]
	if (nextDealer.chips === 0) {
		return moveDealerChip(state)
	}

	return findBrokePlayers(state, nextDealer.name);
}


/* 
 Finds and remove players with no funds remaining,
 shifts dealer if necessary and prepares state for 
 next game phase.
 */
const findBrokePlayers = (state, dealerID) => {
	state.players = state.players.filter(player => player.chips > 0);
	const newDealerIndex = state.players.findIndex(player => player.name === dealerID)
	state.dealerIndex = newDealerIndex
	state.activePlayerIndex = newDealerIndex
	if (state.players.length === 1) {
		// winner determined
		return state
	} else if (state.players.length === 2) {
		state.blindIndex.small = newDealerIndex;
		state.blindIndex.big = manageOverflowIndex(newDealerIndex, 1, state.players.length, 'up');
		state.players = anteUpBlinds(state.players, { bigBlindIndex: state.blindIndex.big, smallBlindIndex: state.blindIndex.small }, state.minBet).map(player => ({
			...player,
			cards: [],
			showDownHand: {
				hand: [],
				descendingSortHand: [],
			},
			roundStartChips: player.chips + player.bet,
			currentRoundChipsInvested: 0,
			betReconciled: false,
			folded: false,
			allIn: false,
		}))
		state.playersAllIn = 0;
		state.playersFolded = 0;
		state.playersActive = state.players.length;
	} else {
		const blindIndicies = calculateBlindIndices(newDealerIndex, state.players.length);
		state.blindIndex = {
			big: blindIndicies.bigBlindIndex,
			small: blindIndicies.smallBlindIndex,
		}
		state.players = anteUpBlinds(state.players, blindIndicies, state.minBet).map(player => ({
			...player,
			cards: [],
			showDownHand: {
				hand: [],
				descendingSortHand: [],
			},
			roundStartChips: player.chips + player.bet,
			currentRoundChipsInvested: 0,
			betReconciled: false,
			folded: false,
			allIn: false,
		}))
		state.playersAllIn = 0;
		state.playersFolded = 0;
		state.playersActive = state.players.length;
	}
	return dealPlayerCards(state)
}

/* 
 Increments state to next game phase and 
 shifts dealer.
 */
const startNextRound = (state) => {
	state.communityCards = [];
	state.sidePots = [];
	state.playerHierarchy = [];
	state.showDownMessages = [];
	state.deck = shuffleCards(makeDeckOfCards())
	state.highBet = 20;
	state.betInputValue = 20;
	state.minBet = 20; // can export out to initialState
	// Unmount all cards so react can re-trigger animations
	const { players } = state;
	const clearPlayerCards = players.map(player => ({ ...player, cards: player.cards.map(card => { }) }))
	state.players = clearPlayerCards;
	return moveDealerChip(state)
}

/* 
 Check if the game has a winner.
 */
const checkWin = players => {
	return (players.filter(player => player.chips > 0).length === 1)
}

const manageOverflowIndex = (currentIndex, incrementBy, arrayLength, direction) => {
	switch (direction) {
		case ('up'): {
			return (
				(currentIndex + incrementBy) % arrayLength
			)
		}
		case ('down'): {
			return (
				((currentIndex - incrementBy) % arrayLength) + arrayLength
			)
		}
		default: throw Error("Attempted to overfow index on unfamiliar direction");
	}
}

/* 
 Determines which player starts the round
 */
const choosePhaseStartActivePlayer = (state, recursion = false) => {
	if (!recursion) {
		state.activePlayerIndex = manageOverflowIndex(state.blindIndex.big, 1, state.players.length, 'up');
	} else if (recursion) {
		state.activePlayerIndex = manageOverflowIndex(state.activePlayerIndex, 1, state.players.length, 'up');
	}
	if (state.players[state.activePlayerIndex].folded) {
		return choosePhaseStartActivePlayer(state, true)
	}
	if (state.players[state.activePlayerIndex].chips === 0) {
		return choosePhaseStartActivePlayer(state, true)
	}
	return state
}

export { makeTable, manageOverflowIndex, chooseNextActivePlayer, choosePhaseStartActivePlayer, startNextRound, checkWin };

