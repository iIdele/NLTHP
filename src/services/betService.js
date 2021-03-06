import { dealFlopCards, dealRiverCards, dealTurnCards, playerShowDown } from './cardsService.js';
import { chooseNextActivePlayer } from './playersService.js';

/**
* The betService provides all services players
* need to make bets. It also handles calculations
* relating to bets and the betting pot.
*/

const calculateBlindIndices = (dealerIndex, numPlayers) => {
	return ({
		bigBlindIndex: (dealerIndex + 2) % numPlayers,
		smallBlindIndex: (dealerIndex + 1) % numPlayers,
	});
}

const anteUpBlinds = (players, blindIndices, minBet) => {
	const { bigBlindIndex, smallBlindIndex } = blindIndices;
	players[bigBlindIndex].bet = minBet;
	players[bigBlindIndex].chips = players[bigBlindIndex].chips - minBet;
	players[smallBlindIndex].bet = minBet / 2;
	players[smallBlindIndex].chips = players[smallBlindIndex].chips - (minBet / 2);
	return players
}

const calculateMinBet = (highBet, playerChipsStack, playerBet) => {
	const playerTotalChips = playerChipsStack + playerBet
	if (playerTotalChips < highBet) {
		return playerTotalChips;
	} else {
		return highBet;
	}
}

/* 
Determines the integrity of all bets.
*/
const manageBet = (state, bet, min, max) => {
	if (bet < min) {
		state.betInputValue = min;
		return console.log("Invalid Bet")
	}
	if (bet > max) {
		state.betInputValue = max;
		return console.log("Invalid Bet")
	}

	if (bet > state.highBet) {
		// minbet and highbet may be condensed to a single property
		state.highBet = bet;
		state.minBet = state.highBet;
		for (let player of state.players) {
			if (!player.folded || !player.chips === 0) {
				player.betReconciled = false;
			}
		}
	}

	const activePlayer = state.players[state.activePlayerIndex];
	const subtractableChips = bet - activePlayer.bet;
	activePlayer.bet = bet;

	activePlayer.chips = activePlayer.chips - subtractableChips;
	if (activePlayer.chips === 0) {
		activePlayer.allIn = true;
		state.numPlayersAllIn++
	}
	activePlayer.betReconciled = true;
	return chooseNextActivePlayer(state)
}

const managePlayerFold = (state) => {
	const activePlayer = state.players[state.activePlayerIndex];
	activePlayer.folded = true;
	activePlayer.betReconciled = true;
	state.numPlayersFolded++
	state.numPlayersActive--

	const nextState = chooseNextActivePlayer(state)
	return nextState
}

const managePhaseShift = (state) => {
	switch (state.phase) {
		case ('betting1'): {
			state.phase = 'flop';
			return dealFlopCards(remakePot(state));
		}
		case ('betting2'): {
			state.phase = 'turn';
			return dealTurnCards(remakePot(state));
		}
		case ('betting3'): {
			state.phase = 'river'
			return dealRiverCards(remakePot(state));
		}
		case ('betting4'): {
			state.phase = 'showdown'
			return playerShowDown(remakePot(state));
		}
		default: throw Error("managePhaseShift() called from non-betting phase")
	}
}

/* 
Combine sidepots into a single pot to save resources.
*/
const remakePot = (state) => {
	for (let player of state.players) {

		state.pot = state.pot + player.bet;

		player.sidePotStack = player.bet;
		player.betReconciled = false;
	}

	// condense pots as processing each one requires expensive card comparator functions
	state = condensePots(calculatePots(state, state.players));

	for (let player of state.players) {
		player.currentRoundChipsInvested += player.bet;
		player.bet = 0 // reset all player bets to 0 for the start of the next round
	}

	state.minBet = 0; // reset markers which control min/max bet validation
	state.highBet = 0;
	state.betInputValue = 0;
	return state
}

/* 
 Determine which players are included in the current pot.
*/
const calculatePots = (state, playerStacks) => {
	// remove players who did not bet from pot
	const investedPlayers = playerStacks.filter(player => player.sidePotStack > 0)
	if (investedPlayers.length === 0) {
		return state
	}
	if (investedPlayers.length === 1) {
		// refund players who bet in excess of pot
		const playerToRefund = state.players[state.players.findIndex(player => player.name === investedPlayers[0].name)];
		playerToRefund.chips = playerToRefund.chips + investedPlayers[0].sidePotStack;
		state.pot -= investedPlayers[0].sidePotStack
		return state
	}
	// sort players
	const ascBetPlayers = investedPlayers.sort((a, b) => a.sidePotStack - b.sidePotStack);
	const smallStackValue = ascBetPlayers[0].sidePotStack;

	const builtSidePot = ascBetPlayers.reduce((acc, cur) => {
		if (!cur.folded) {
			acc.contestants.push(cur.name);
		}
		acc.potValue = acc.potValue + smallStackValue;
		cur.sidePotStack = cur.sidePotStack - smallStackValue;
		return acc
	}, {
		contestants: [],
		potValue: 0,
	});
	state.sidePots.push(builtSidePot);
	return calculatePots(state, ascBetPlayers)

}

/* 
 Condenses mutiple pots into a single pot. 
*/
const condensePots = (state) => {
	if (state.sidePots.length > 1) {
		for (let i = 0; i < state.sidePots.length; i++) {
			for (let n = i + 1; n < state.sidePots.length; n++) {
				if (arrayIdentical(state.sidePots[i].contestants, state.sidePots[n].contestants)) {
					state.sidePots[i].potValue = state.sidePots[i].potValue + state.sidePots[n].potValue;
					state.sidePots = state.sidePots.filter((el, index) => index !== n);
				}
			}
		}
	}
	return state
}

const arrayIdentical = (arr1, arr2) => {

	if (arr1.length !== arr2.length) {
		return false
	}
	return arr1.map(el => arr2.includes(el)).filter(bool => bool !== true).length !== 0 ? false : true;
}
export {
	calculateBlindIndices,
	anteUpBlinds,
	calculateMinBet,
	manageBet,
	managePlayerFold,
	managePhaseShift,
	remakePot
};

