import { cloneDeep } from 'lodash';
import { choosePhaseStartActivePlayer, manageOverflowIndex } from './playersService.js';

/**
 * cardsService provides key services to the App that
 * regard the Poker game cards. Such services include 
 * shuffling the cards, dealing the cards finding 
 * the best hand, etc.
 */

const totalNumCards = 52;
const cards = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const suits = ['Heart', 'Spade', 'Club', 'Diamond'];

// start from 2 as A (or 1) is the higest ranking card
const VALUE_MAP = {
	2: 1,
	3: 2,
	4: 3,
	5: 4,
	6: 5,
	7: 6,
	8: 7,
	9: 8,
	10: 9,
	J: 10,
	Q: 11,
	K: 12,
	A: 13,
};



/*
  Generate the deck of 52 cards 
 */
const makeDeckOfCards = () => {
	const deck = [];

	// get every combination of suit and value
	for (let suit of suits) {
		for (let card of cards) {
			deck.push({
				cardFace: card,
				suit: suit,
				value: VALUE_MAP[card]
			})
		}
	}
	return deck
}


/*
  Shuffle cards to randomize their order
 */
const shuffleCards = (deck) => {
	let shuffledDeck = new Array(totalNumCards);
	let filledSlots = [];
	for (let i = 0; i < totalNumCards; i++) {
		// if all cards except 1 are given 
		if (i === 51) {
			// assign the last slot to the remaining card
			const lastSlot = shuffledDeck.findIndex((el) => typeof el == 'undefined');
			shuffledDeck[lastSlot] = deck[i];
			filledSlots.push(lastSlot);
		} else {
			// randomize order of all cards one by one
			let shuffleToPosition = randomStartPosition(0, totalNumCards - 1);
			while (filledSlots.includes(shuffleToPosition)) {
				shuffleToPosition = randomStartPosition(0, totalNumCards - 1);
			}
			shuffledDeck[shuffleToPosition] = deck[i];
			filledSlots.push(shuffleToPosition);
		}
	}
	return shuffledDeck
}


/*
  Deal players cards at start of each hand
 */
const dealPlayerCards = (state) => {
	state.clearCards = false;
	let animationDelay = 0;
	// deal cards until every player at table has 2
	while (state.players[state.activePlayerIndex].cards.length < 2) {
		const { mutableDeckCopy, chosenCards } = getCards(state.deck, 1);

		// add animation delay 
		chosenCards.animationDelay = animationDelay;
		animationDelay = animationDelay + 250;

		const newDeck = [...mutableDeckCopy];
		state.players[state.activePlayerIndex].cards.push(chosenCards);

		state.deck = newDeck;
		state.activePlayerIndex = manageOverflowIndex(state.activePlayerIndex, 1, state.players.length, 'up');
	}
	if (state.players[state.activePlayerIndex].cards.length === 2) {
		state.activePlayerIndex = manageOverflowIndex(state.blindIndex.big, 1, state.players.length, 'up');
		// set first phase of betting
		state.phase = 'betting1';
		return state;
	}
}


/*
  Find random start position for giving cards (assigns dealer chip)
 */
const randomStartPosition = (min, max) => {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}


/*
  Get cards dealt to a player
 */
const getCards = (deck, numToGet) => {
	// make shallow copy of deck to not alter original deck attributes
	const mutableDeckCopy = [...deck];
	let chosenCards;
	if (numToGet === 1) {
		// get last card 
		chosenCards = mutableDeckCopy.pop();
	} else {
		// get chosen cards from mutable deck copy one by one
		chosenCards = [];
		for (let i = 0; i < numToGet; i++) {
			chosenCards.push(mutableDeckCopy.pop());
		}
	}
	return { mutableDeckCopy, chosenCards }
}


/*
  Deal flop cards
 */
const dealFlopCards = (state) => {
	let animationDelay = 0;
	const { mutableDeckCopy, chosenCards } = getCards(state.deck, 3);

	// deal first 3 chosen flop cards
	for (let card of chosenCards) {
		// add animation delay 
		card.animationDelay = animationDelay;
		animationDelay = animationDelay + 250;
		state.communityCards.push(card);
	}

	state.deck = mutableDeckCopy;
	state = choosePhaseStartActivePlayer(state)
	// set second phase of betting
	state.phase = 'betting2';

	return state;
}

/*
  Deal turn cards
 */
const dealTurnCards = (state) => {
	const { mutableDeckCopy, chosenCards } = getCards(state.deck, 1);
	chosenCards.animationDelay = 0;

	state.communityCards.push(chosenCards);
	state.deck = mutableDeckCopy;
	state = choosePhaseStartActivePlayer(state)
	// set third phase of betting
	state.phase = 'betting3'

	return state
}


/*
  Deal river cards
 */
const dealRiverCards = (state) => {
	const { mutableDeckCopy, chosenCards } = getCards(state.deck, 1);
	chosenCards.animationDelay = 0;

	state.communityCards.push(chosenCards);
	state.deck = mutableDeckCopy;
	state = choosePhaseStartActivePlayer(state)
	// set fourth phase of betting
	state.phase = 'betting4'

	return state
}

/*
  Deal table Community cards 
 */
const dealOtherCommunityCards = (state) => {
	// check number of cards left to deal
	const cardsToPop = 5 - state.communityCards.length
	if (cardsToPop >= 1) {
		let animationDelay = 0;
		const { mutableDeckCopy, chosenCards } = getShowdownCards(state.deck, cardsToPop);

		for (let card of chosenCards) {
			card.animationDelay = animationDelay;
			animationDelay = animationDelay + 250;
			state.communityCards.push(card);
		}

		state.deck = mutableDeckCopy;
	}
	// when completed move to showdown phase (phase to check winners of hand)
	state.phase = 'showdown'
	return state
}

/*
  Perform player showdown at end of hand
 */
const playerShowDown = (state) => {
	// find players that are still in the hand
	for (let player of state.players) {
		const frequencyHistogram = {};
		const suitHistogram = {};

		// build each player's best hand
		player.showDownHand.hand = player.cards.concat(state.communityCards);
		player.showDownHand.descendingSortHand = player.showDownHand.hand.map(el => el).sort((a, b) => b.value - a.value); // This mutates showDownHand.hand in place(!!)

		player.showDownHand.descendingSortHand.forEach(card => {
			frequencyHistogram[card.cardFace] = (frequencyHistogram[card.cardFace] + 1 || 1);
			suitHistogram[card.suit] = (suitHistogram[card.suit] + 1 || 1);
		})

		player.frequencyHistogram = frequencyHistogram;
		player.suitHistogram = suitHistogram;

		const valueSet = generateValueSet(player.showDownHand.descendingSortHand);

		// check value of each player's hand
		const { isFlush, flushedSuit } = checkIfFlush(suitHistogram);
		const flushCards = (isFlush) && player.showDownHand.descendingSortHand.filter(card => card.suit === flushedSuit);
		const isRoyalFlush = (isFlush) && checkIfRoyalFlush(flushCards);
		const { isStraightFlush, isLowStraightFlush, concurrentSFCardValues, concurrentSFCardValuesLow } = (isFlush) && checkIfStraightFlush(flushCards)
		const { isStraight, isLowStraight, concurrentCardValues, concurrentCardValuesLow } = checkIfStraight(valueSet);
		const { isFourOfAKind, isFullHouse, isThreeOfAKind, isTwoPair, isPair, frequencyHistogramMetaData } = checkFrequencyHistogram(player.showDownHand.descendingSortHand, frequencyHistogram);
		const isNoPair = ((!isRoyalFlush) && (!isStraightFlush) && (!isFourOfAKind) && (!isFullHouse) && (!isFlush) && (!isStraight) && (!isThreeOfAKind) && (!isTwoPair) && (!isPair))

		// set value of each player's hand
		player.showDownHand.bools = {
			isRoyalFlush,
			isStraightFlush,
			isFourOfAKind,
			isFullHouse,
			isFlush,
			isStraight,
			isThreeOfAKind,
			isTwoPair,
			isPair,
			isNoPair,
		}

		player.showDownHand.heldRankHierarchy = [{
			name: 'Royal Flush',
			match: isRoyalFlush,
		}, {
			name: 'Straight Flush',
			match: isStraightFlush
		}, {
			name: 'Four Of A Kind',
			match: isFourOfAKind,
		}, {
			name: 'Full House',
			match: isFullHouse,
		}, {
			name: 'Flush',
			match: isFlush,
		}, {
			name: 'Straight',
			match: isStraight,
		}, {
			name: 'Three Of A Kind',
			match: isThreeOfAKind,
		}, {
			name: 'Two Pair',
			match: isTwoPair,
		}, {
			name: 'Pair',
			match: isPair,
		}, {
			name: 'No Pair',
			match: isNoPair
		}];

		player.metaData = frequencyHistogramMetaData

		// get best hand between players in showdown
		const highRankPosition = player.showDownHand.heldRankHierarchy.findIndex(el => el.match === true);
		player.showDownHand.bestHandRank = player.showDownHand.heldRankHierarchy[highRankPosition].name;
		player.showDownHand.bestHand = findBestHand(player.showDownHand.descendingSortHand, player.showDownHand.bestHandRank, flushedSuit, flushCards, concurrentCardValues, concurrentCardValuesLow, isLowStraight, isLowStraightFlush, concurrentSFCardValues, concurrentSFCardValuesLow, frequencyHistogramMetaData)

	}

	return assignSidePots(state)

}

/*
  Get cards of players that are part of showdown
 */
const getShowdownCards = (deck, numToPop) => {
	// make shallow copy of deck to not alter original deck attributes
	const mutableDeckCopy = [...deck];
	let chosenCards;
	// get last card 
	if (numToPop === 1) {
		chosenCards = [mutableDeckCopy.pop()];
	} else {
		// get chosen cards from mutable deck copy one by one
		chosenCards = [];
		for (let i = 0; i < numToPop; i++) {
			chosenCards.push(mutableDeckCopy.pop());
		}
	}
	return { mutableDeckCopy, chosenCards }
}

/*
  Find best hand amongst players still in a hand
 */
const findBestHand = (hand, bestRank, flushedSuit, flushCards, concurrentCardValues, concurrentCardValuesLow, isLowStraight, isLowStraightFlush, concurrentSFCardValues, concurrentSFCardValuesLow, frequencyHistogramMetaData) => {
	// check if hand matches any value from best to worst (Royal Flush to High Card)
	switch (bestRank) {
		// check if hand is Ten, Jack, Queen, King and Ace (all of same suit)
		case ('Royal Flush'): {
			return flushCards.slice(0, 5)
		}
		// check if hand is five cards in sequence (all of same suit)
		case ('Straight Flush'): {
			if (isLowStraightFlush && concurrentSFCardValues.length < 5) {
				concurrentSFCardValuesLow[0] = 13
				return concurrentSFCardValuesLow.reduce((acc, cur, index) => {
					if (index < 5) {
						acc.push(flushCards[flushCards.findIndex(match => match.value === cur)]);
					}
					return acc;
				}, []).reverse();
			} else {
				return concurrentSFCardValues.reduce((acc, cur, index) => {
					if (index < 5) {
						acc.push(flushCards[flushCards.findIndex(match => match.value === cur)]);
					}
					return acc;
				}, []);
			}
		}
		// check if hand is four cards all of the same denomination
		case ('Four Of A Kind'): {
			const bestHand = [];
			let mutableHand = cloneDeep(hand);

			for (let i = 0; i < 4; i++) {
				const indexOfQuad = mutableHand.findIndex(match => match.cardFace === frequencyHistogramMetaData.quads[0].face);
				bestHand.push(mutableHand[indexOfQuad])
				mutableHand = mutableHand.filter((match, index) => index !== indexOfQuad)
			}

			return bestHand.concat(mutableHand.slice(0, 1))
		}
		// check if hand is three cards of one denomination and two cards of another denomination
		case ('Full House'): {
			const bestHand = [];
			let mutableHand = cloneDeep(hand);
			if (frequencyHistogramMetaData.tripples.length > 1) {
				for (let i = 0; i < 3; i++) {
					const indexOfTripple = mutableHand.findIndex(match => match.cardFace === frequencyHistogramMetaData.tripples[0].face);
					bestHand.push(mutableHand[indexOfTripple])
					mutableHand = mutableHand.filter((match, index) => index !== indexOfTripple)
				}
				for (let i = 0; i < 2; i++) {
					const indexOfPair = mutableHand.findIndex(match => match.cardFace === frequencyHistogramMetaData.tripples[1].face);
					bestHand.push(mutableHand[indexOfPair])
					mutableHand = mutableHand.filter((match, index) => index !== indexOfPair)
				}
				return bestHand
			} else {
				for (let i = 0; i < 3; i++) {
					const indexOfTripple = mutableHand.findIndex(match => match.cardFace === frequencyHistogramMetaData.tripples[0].face);
					bestHand.push(mutableHand[indexOfTripple])
					mutableHand = mutableHand.filter((match, index) => index !== indexOfTripple)
				}
				for (let i = 0; i < 2; i++) {
					const indexOfPair = mutableHand.findIndex(match => match.cardFace === frequencyHistogramMetaData.pairs[0].face);
					bestHand.push(mutableHand[indexOfPair])
					mutableHand = mutableHand.filter((match, index) => index !== indexOfPair)
				}
				return bestHand
			}
		}
		// check if hand is five cards all of the same suit
		case ('Flush'): {
			return flushCards.slice(0, 5)
		}
		// check if hand is five cards of any suit in sequence
		case ('Straight'): {
			if (isLowStraight && concurrentCardValues.length < 5) {
				concurrentCardValuesLow[0] = 13
				return concurrentCardValuesLow.reduce((acc, cur, index) => {
					if (index < 5) {
						acc.push(hand[hand.findIndex(match => match.value === cur)]);
					}
					return acc;
				}, []).reverse();
			} else {
				return concurrentCardValues.reduce((acc, cur, index) => {
					if (index < 5) {
						acc.push(hand[hand.findIndex(match => match.value === cur)]);
					}
					return acc;
				}, []);
			}
		}
		// check if hand is three cards of the same denomination and two unmatched cards
		case ('Three Of A Kind'): {
			const bestHand = [];
			let mutableHand = cloneDeep(hand);

			for (let i = 0; i < 3; i++) {
				const indexOfTripple = mutableHand.findIndex(match => match.cardFace === frequencyHistogramMetaData.tripples[0].face);
				bestHand.push(mutableHand[indexOfTripple])
				mutableHand = mutableHand.filter((match, index) => index !== indexOfTripple)
			}

			return bestHand.concat(mutableHand.slice(0, 2))
		}
		// check if hand is two sets of two cards of the same denomination and any fifth card
		case ('Two Pair'): {
			const bestHand = [];
			let mutableHand = cloneDeep(hand);
			for (let i = 0; i < 2; i++) {
				const indexOfPair = mutableHand.findIndex(match => match.cardFace === frequencyHistogramMetaData.pairs[0].face);
				bestHand.push(mutableHand[indexOfPair])
				mutableHand = mutableHand.filter((match, index) => index !== indexOfPair)
			}

			for (let i = 0; i < 2; i++) {

				const indexOfPair = mutableHand.findIndex(match => match.cardFace === frequencyHistogramMetaData.pairs[1].face);
				bestHand.push(mutableHand[indexOfPair])
				mutableHand = mutableHand.filter((match, index) => index !== indexOfPair)
			}
			return bestHand.concat(mutableHand.slice(0, 1))

		}
		// check if hand is two cards of the same denomination and three unmatched cards
		case ('Pair'): {
			const bestHand = [];
			let mutableHand = cloneDeep(hand);
			for (let i = 0; i < 2; i++) {
				const indexOfPair = mutableHand.findIndex(card => card.cardFace === frequencyHistogramMetaData.pairs[0].face);
				// CONSIDER : 
				bestHand.push(mutableHand[indexOfPair])
				mutableHand = mutableHand.filter((card, index) => index !== indexOfPair)
			}
			return bestHand.concat(mutableHand.slice(0, 3))


		}
		// check if hand is all five cards are unmatched
		case ('No Pair'): {
			return hand.slice(0, 5)
		}
		default: throw Error('Recieved unfamiliar rank argument in findBestHand()');
	}
}

/*
  Determine ranking order of players' hands
 */
const determinePlayerHandsHierarchy = (sortedComparator, handRank) => {
	let winnerHierarchy = [];
	let loserHierarchy = [];
	const processComparator = (comparator, round = 0) => {
		if (comparator[0].length === 1) {
			const { name, bestHand } = comparator[0][0]
			winnerHierarchy = winnerHierarchy.concat([{ name, bestHand, handRank }])
			return;
		}
		let filterableComparator = sortedComparator.map(el => el);
		const frame = comparator[round];
		const { winningFrame, losingFrame } = handleSnapshotFrame(frame);
		// find order of players who did not win hand
		if (losingFrame.length > 0) {
			const lowerTierComparator = filterableComparator.map(frame => {
				return frame.filter(snapshot => {
					return losingFrame.some(snapshotToMatchName => {
						return snapshotToMatchName.name === snapshot.name;
					})
				})
			})
			// Push the filtered comparator to the start of the losers queue. 
			loserHierarchy = [lowerTierComparator].concat(loserHierarchy);
		}
		// if only one winner they are best hand
		if (winningFrame.length === 1) {
			const { name, bestHand } = winningFrame[0];
			winnerHierarchy = winnerHierarchy.concat([{
				name,
				bestHand,
				handRank
			}])
			// find order of players who won hand if more than one
		} else if (round === (sortedComparator.length - 1)) {
			const filteredWinnerSnapshots = winningFrame.map(snapshot => ({
				name: snapshot.name,
				bestHand: snapshot.bestHand,
				handRank
			}))
			winnerHierarchy = winnerHierarchy.concat([filteredWinnerSnapshots]);
		} else {
			const higherTierComparator = filterableComparator.map(frame => {
				return frame.filter(snapshot => {
					return winningFrame.some(snapshotToMatchName => {
						return snapshotToMatchName.name === snapshot.name;
					})
				})
			})
			processComparator(higherTierComparator, (round + 1));
		}
	}

	const processLowTierComparators = (loserHierarchyFrame) => {
		if (loserHierarchy.length > 0) {
			const loserComparatorToProcess = loserHierarchyFrame[0];
			loserHierarchy = loserHierarchyFrame.slice(1);
			processComparator(loserComparatorToProcess);
			processLowTierComparators(loserHierarchy);
		}
	}
	processComparator(sortedComparator);
	processLowTierComparators(loserHierarchy);
	return winnerHierarchy;
}

/*
  Build ranking of hands of each player still in hand
 */
const buildPlayerRankings = (state) => {

	// only consider players still active in hand
	const activePlayers = state.players.filter(player => !player.folded);
	let hierarchy = [];
	// map of possible hand rankings
	const rankMap = new Map([
		['Royal Flush', []],
		['Straight Flush', []],
		['Four Of A Kind', []],
		['Full House', []],
		['Flush', []],
		['Straight', []],
		['Three Of A Kind', []],
		['Two Pair', []],
		['Pair', []],
		['No Pair', []]
	]);

	// for each player find rank and add to ranking map
	activePlayers.forEach((player, playerIndex) => {
		const {
			name,
			showDownHand: { bestHandRank, bestHand }
		} = player;
		rankMap.get(bestHandRank).push({
			name,
			bestHand,
			playerIndex
		})
	})

	for (const [handRank, playersWhoHoldThisRank] of rankMap) {
		if (playersWhoHoldThisRank.length > 0) {
			// only one player can have Royal Flush so they would win regardless of the rest
			if (handRank === 'Royal Flush') {
				const formattedPlayersWhoHoldThisRank = playersWhoHoldThisRank.map(player => ({
					name: player.name,
					bestHand: player.bestHand,
					handRank
				}))
				hierarchy = hierarchy.concat(formattedPlayersWhoHoldThisRank);
				continue;
			}
			// if only one player has a ranking that player is the best for that ranking
			if (playersWhoHoldThisRank.length === 1) {
				const { name, bestHand } = playersWhoHoldThisRank[0];
				hierarchy = hierarchy.concat([{
					name,
					bestHand,
					handRank
				}]);
				// if more than one player has same ranking must find which one has higher value
			} else if (playersWhoHoldThisRank.length > 1) {
				const sortedComparator = createRankingsComparator(handRank, playersWhoHoldThisRank)
					.map((snapshot) => {
						return snapshot.sort((a, b) => b.card.value - a.card.value)
					});
				const winnerHierarchy = determinePlayerHandsHierarchy(sortedComparator, handRank);
				hierarchy = hierarchy.concat(winnerHierarchy);
			}
		}
	}

	return hierarchy;
}

/*
  Rank hands of players still active in hand
 */
const rankPlayersHands = (state, contestants) => {

	// map of possible hand rankings
	const rankMap = new Map([
		['Royal Flush', []],
		['Straight Flush', []],
		['Four Of A Kind', []],
		['Full House', []],
		['Flush', []],
		['Straight', []],
		['Three Of A Kind', []],
		['Two Pair', []],
		['Pair', []],
		['No Pair', []]
	]);

	for (let contestant of contestants) {
		const playerIndex = state.players.findIndex(player => player.name === contestant);
		const player = state.players[playerIndex];
		// if player is active in hand
		if (!player.folded) {
			// rank player hand
			rankMap.get(player.showDownHand.bestHandRank).push({
				name: player.name,
				playerIndex,
				bestHand: player.showDownHand.bestHand,
			});
		}
	}
	return rankMap;
}

/*
  Handle and get snapshot with winners and losers of hand
 */
const handleSnapshotFrame = (frame) => {
	const highValue = frame[0].card.value;
	const winningFrame = frame.filter(snapshot => snapshot.card.value === highValue);
	const losingFrame = frame.filter(snapshot => snapshot.card.value < highValue);
	return { winningFrame, losingFrame }
}

/*
  Assign winnings to hand winners (handles pot splits too)
 */
const assignWinnings = (state, rankMap, prize) => {
	let winnerFound = false;

	// find hand winners
	rankMap.forEach((contestants, rank, map) => {
		if (!winnerFound) {
			// if only one player active in hand they win
			if (contestants.length === 1) {
				winnerFound = true
				console.log("Winner, ", contestants[0].name, " , beating out the competition with a ", rank)
				state = payWinnings(state, contestants, prize, rank)
				// if more than one player active in hand find winner
			} else if (contestants.length > 1) {
				console.log(contestants)
				winnerFound = true
				// get active players hand rankings
				const winners = findHandWinner(createRankingsComparator(rank, contestants), rank)
				// if only one player wins they get all the pot
				if (winners.length === 1) {
					console.log("Winner, ", winners[0].name, " , beating out the competition with a ", rank)
					state = payWinnings(state, winners, prize, rank)
					// if multilple players win the pot is split amongst them
				} else {
					console.log("We have a tie! Split the pot amongst ", winners, " Who will take the pot with their ", rank)
					state = payWinnings(state, winners, prize, rank)
				}
			}
		}
	})
	return state
}

/*
  Assign side pots when there are multiple winners for the same hand
 */
const assignSidePots = (state) => {
	// find winners of hand
	state.playerHierarchy = buildPlayerRankings(state);
	console.log("Ultimate Player Hierarchy Determined:")
	console.log(state.playerHierarchy);

	// assign each side pot to the corresponding winner
	for (let sidePot of state.sidePots) {
		const rankMap = rankPlayersHands(state, sidePot.contestants);
		state = assignWinnings(state, rankMap, sidePot.potValue)
	}

	state.players = state.players.map(player => ({
		...player,
		roundEndChips: player.chips
	}));

	return state
}

/*
  Pay winnings to hand winners
 */
const payWinnings = (state, winners, prize, rank) => {
	// if only one winner they win all the pot
	if (winners.length === 1) {
		state.showDownMessages = state.showDownMessages.concat([{
			users: [winners[0].name],
			prize,
			rank
		}]);
		console.log("Transferring ", prize, " chips to ", winners[0].name)
		state.players[winners[0].playerIndex].chips += prize
		state.pot -= prize
		// if more than one winner split pot accordingly between them
	} else if (winners.length > 1) {
		const overflow = prize % winners.length;
		const splitPot = Math.floor(prize / winners.length)
		console.log("Mediating Tie. Total Prize ", prize, " split into ", winners.length, " portions with an overflow of ", overflow)
		state.showDownMessages = state.showDownMessages.concat([{
			users: winners.map(winner => winner.name),
			prize: splitPot,
			rank
		}])
		winners.forEach(winner => {
			state.players[winner.playerIndex].chips += splitPot
			state.pot -= splitPot
		})
	}
	return state
}

/*
  Create hand rankings comparator to compare hand rankings
 */
const createRankingsComparator = (rank, playerData) => {
	let comparator;
	switch (rank) {
		// check if hand is Ten, Jack, Queen, King and Ace (all of same suit)
		case ('Royal Flush'): {
			comparator = Array.from({ length: 1 });
			playerData.forEach((playerShowdownData, index) => {
				comparator.push({
					// there can only be one royal flush which will be the winner regardless of other hand rankings
					name: playerData[index].name,
					playerIndex: playerData[index].playerIndex,
					bestHand: playerData[index].bestHand
				})
			})
			break
		}
		// check if hand is four cards all of the same denomination
		case ('Four Of A Kind'): {
			comparator = Array.from({ length: 2 }, () => Array.from({ length: 0 }))
			playerData.forEach((playerShowdownData, index) => {
				comparator[0].push({
					// four cards all of the same denomination
					card: playerData[index].bestHand[0],
					name: playerData[index].name,
					playerIndex: playerData[index].playerIndex,
					bestHand: playerData[index].bestHand
				})
				comparator[1].push({
					// last card is unmatched
					card: playerData[index].bestHand[4],
					name: playerData[index].name,
					playerIndex: playerData[index].playerIndex,
					bestHand: playerData[index].bestHand
				})
			})
			break
		}
		// check if hand is three cards of one denomination and two cards of another denomination
		case ('Full House'): {
			comparator = Array.from({ length: 2 }, () => Array.from({ length: 0 }))
			playerData.forEach((playerShowdownData, index) => {
				comparator[0].push({
					// three cards of one denomination
					card: playerData[index].bestHand[0],
					name: playerData[index].name,
					playerIndex: playerData[index].playerIndex,
					bestHand: playerData[index].bestHand
				})
				comparator[1].push({
					// two cards of another denomination
					card: playerData[index].bestHand[3],
					name: playerData[index].name,
					playerIndex: playerData[index].playerIndex,
					bestHand: playerData[index].bestHand
				})
			})
			break
		}
		// check if hand is three cards of one denomination and two cards of another denomination
		// or if all five cards are unmatched
		case ('Flush'):
		case ('No Pair'): {
			comparator = Array.from({ length: 5 }, () => Array.from({ length: 0 }))
			playerData.forEach((playerShowdownData, index) => {
				for (let i = 0; i < 5; i++) {
					comparator[i].push({
						// check all 5 cards of a flush or no-pair
						card: playerData[index].bestHand[i],
						name: playerData[index].name,
						playerIndex: playerData[index].playerIndex,
						bestHand: playerData[index].bestHand
					})
				}
			})
			break
		}
		// check if hand is three cards of the same denomination and two unmatched cards
		case ('Three Of A Kind'): {
			comparator = Array.from({ length: 3 }, () => Array.from({ length: 0 }))
			playerData.forEach((playerShowdownData, index) => {
				comparator[0].push({
					// three cards of the same denomination
					card: playerData[index].bestHand[0],
					name: playerData[index].name,
					playerIndex: playerData[index].playerIndex,
					bestHand: playerData[index].bestHand
				});
				comparator[1].push({
					// fourth card is unmatched
					card: playerData[index].bestHand[3],
					name: playerData[index].name,
					playerIndex: playerData[index].playerIndex,
					bestHand: playerData[index].bestHand
				});
				comparator[2].push({
					// fifth card is unmatched
					card: playerData[index].bestHand[4],
					name: playerData[index].name,
					playerIndex: playerData[index].playerIndex,
					bestHand: playerData[index].bestHand
				});
			})
			break
		}
		// check if hand is five cards of any suit in sequence
		// or if hand is five cards in sequence (all of same suit)
		case ('Straight'):
		case ('Straight Flush'): {
			comparator = Array.from({ length: 1 }, () => Array.from({ length: 0 }))
			playerData.forEach((playerShowdownData, index) => {
				comparator[0].push({
					// check highest card of a straight as it will determine the straight value
					card: playerData[index].bestHand[0],
					name: playerData[index].name,
					playerIndex: playerData[index].playerIndex,
					bestHand: playerData[index].bestHand
				})
			})
			break
		}
		// check if hand is two sets of two cards of the same denomination and any fifth card
		case ('Two Pair'): {
			comparator = Array.from({ length: 3 }, () => Array.from({ length: 0 }))
			playerData.forEach((playerShowdownData, index) => {
				comparator[0].push({
					// two cards of the same denomination
					card: playerData[index].bestHand[0],
					name: playerData[index].name,
					playerIndex: playerData[index].playerIndex,
					bestHand: playerData[index].bestHand
				})
				comparator[1].push({
					// another two cards of the same denomination
					card: playerData[index].bestHand[2],
					name: playerData[index].name,
					playerIndex: playerData[index].playerIndex,
					bestHand: playerData[index].bestHand
				})
				comparator[2].push({
					// fifth unmatched card
					card: playerData[index].bestHand[4],
					name: playerData[index].name,
					playerIndex: playerData[index].playerIndex,
					bestHand: playerData[index].bestHand
				})
			})
			break
		}
		// check if hand is two cards of the same denomination and three unmatched cards
		case ('Pair'): {
			comparator = Array.from({ length: 4 }, () => Array.from({ length: 0 }))
			playerData.forEach((playerShowdownData, index) => {
				comparator[0].push({
					// two cards of the same denomination
					card: playerData[index].bestHand[0],
					name: playerData[index].name,
					playerIndex: playerData[index].playerIndex,
					bestHand: playerData[index].bestHand
				});
				comparator[1].push({
					// third unmtached card
					card: playerData[index].bestHand[2],
					name: playerData[index].name,
					playerIndex: playerData[index].playerIndex,
					bestHand: playerData[index].bestHand
				});
				comparator[2].push({
					// fourth unmtached card
					card: playerData[index].bestHand[3],
					name: playerData[index].name,
					playerIndex: playerData[index].playerIndex,
					bestHand: playerData[index].bestHand
				});
				comparator[3].push({
					// fifth unmtached card
					card: playerData[index].bestHand[4],
					name: playerData[index].name,
					playerIndex: playerData[index].playerIndex,
					bestHand: playerData[index].bestHand
				});
			})
			break
		}
		default: throw Error('Recieved unfamiliar rank argument in createRankingsComparator()');
	}
	return comparator
}

/*
  Find current hand winner
 */
const findHandWinner = (comparator, rank) => {
	let winners;
	if (rank === 'Royal Flush') return comparator
	for (let i = 0; i < comparator.length; i++) {
		let highValue = 0;
		let losers = [];
		// sort player rankings comparator 
		winners = comparator[i].sort((a, b) => b.card.value - a.card.value).reduce((acc, cur, index) => {
			// add player with higher ranking hands first
			if (cur.card.value > highValue) {

				highValue = cur.card.value;
				acc.push({
					name: cur.name,
					playerIndex: cur.playerIndex,
				});
				return acc;
			} else if (cur.card.value === highValue) {
				acc.push({
					name: cur.name,
					playerIndex: cur.playerIndex,
				});
				return acc;
				// then add non active players (back of list)
			} else if (cur.card.value < highValue) {
				losers.push(cur.name);
				return acc;
			}
		}, [])

		if (winners.length === 1 || i === comparator.length) {
			return winners
		} else {
			if (losers.length >= 1) {
				losers.forEach((nameToExtract) => {
					comparator = comparator.map(snapshot => snapshot.filter((el) => el.name !== nameToExtract));
				})
			}
		}
	}
	return winners

}

/*
  Check if hand is a Flush
 */
const checkIfFlush = (suitHistogram) => {
	let isFlush;
	let flushedSuit;
	// check if all five cards have the same suit
	for (let suit in suitHistogram) {
		if (suitHistogram[suit] >= 5) {
			return {
				isFlush: true,
				flushedSuit: suit,
			}
		}
	}
	return {
		isFlush: false,
		flushedSuit: null,
	}
}

/*
  Check if hand is a Royal Flush
 */
const checkIfRoyalFlush = (flushMatchCards) => {
	// check if hand is Ten, Jack, Queen, King and Ace (all of same suit)
	if ((flushMatchCards[0].value === 13) &&
		(flushMatchCards[1].value === 12) &&
		(flushMatchCards[2].value === 11) &&
		(flushMatchCards[3].value === 10) &&
		(flushMatchCards[4].value === 10)) {
		return true
	} else { return false }
}

/*
  Check if hand is a Straight
 */
const checkIfStraight = (valueSet) => {
	// if less than five cards are valuable to the hand it is not a straight
	if (valueSet.length < 5) return false
	let numConcurrentCards = 0;
	let concurrentCardValues = [];
	// check if hand is five cards of any suit in sequence
	for (let i = 1; i < valueSet.length; i++) {
		if (numConcurrentCards === 5) {
			return {
				isStraight: true,
				concurrentCardValues
			}
		}
		if ((valueSet[i] - valueSet[i - 1]) === -1) {
			if (numConcurrentCards === 0) {
				numConcurrentCards = 2;
				concurrentCardValues.push(valueSet[i - 1]);
				concurrentCardValues.push(valueSet[i]);

			} else {
				numConcurrentCards++;
				concurrentCardValues.push(valueSet[i]);
			}
		} else {
			numConcurrentCards = 0;
			concurrentCardValues = [];
		}
	}
	if (numConcurrentCards >= 5) {
		return {
			isStraight: true,
			concurrentCardValues
		}
	} else {
		// check if is straight with Ace, two, three, four, five
		if (valueSet[0] === 13) {
			let { isLowStraight, concurrentCardValuesLow } = checkIfLowerStraight(cloneDeep(valueSet));

			if (isLowStraight) return {
				isStraight: true,
				isLowStraight,
				concurrentCardValues,
				concurrentCardValuesLow,
			}
		}
		return {
			isStraight: false,
			isLowStraight: false,
			concurrentCardValues,
		}
	}
}

/*
  Check if hand is a Straight Flush
 */
const checkIfStraightFlush = (flushMatchCards) => {
	// check if hand is five cards in sequence (all of same suit)
	const valueSet = generateValueSet(flushMatchCards);
	const { isStraight, isLowStraight, concurrentCardValues, concurrentCardValuesLow } = checkIfStraight(valueSet);
	return {
		isStraightFlush: isStraight,
		isLowStraightFlush: isLowStraight,
		concurrentSFCardValues: concurrentCardValues,
		concurrentSFCardValuesLow: concurrentCardValuesLow,
	}
}

/*
  Check how many hand rankings have occured and with what frequence 
  and order
 */
const checkFrequencyHistogram = (hand, frequencyHistogram) => {

	// set hand rankings to not seen 
	let isFourOfAKind = false;
	let isFullHouse = false
	let isThreeOfAKind = false;
	let isTwoPair = false;
	let isPair = false;
	let numTripples = 0;
	let numPairs = 0;
	let frequencyHistogramMetaData = {
		pairs: [],
		tripples: [],
		quads: [],
	}
	// check if hand is four cards all of the same denomination
	for (let cardFace in frequencyHistogram) {
		if (frequencyHistogram[cardFace] === 4) {
			isFourOfAKind = true
			frequencyHistogramMetaData.quads.push({
				face: cardFace,
				value: VALUE_MAP[cardFace]
			})
		}
		// check if hand is three cards of the same denomination and two unmatched cards
		if (frequencyHistogram[cardFace] === 3) {
			isThreeOfAKind = true
			numTripples++
			frequencyHistogramMetaData.tripples.push({
				face: cardFace,
				value: VALUE_MAP[cardFace]
			})
		}
		// check if hand is two cards of the same denomination and three unmatched cards
		if (frequencyHistogram[cardFace] === 2) {
			isPair = true
			numPairs++
			frequencyHistogramMetaData.pairs.push({
				face: cardFace,
				value: VALUE_MAP[cardFace]
			})
		}
	}

	// sort histogram from best hand to worst hand
	frequencyHistogramMetaData.pairs = frequencyHistogramMetaData.pairs.map(el => el).sort((a, b) => b.value - a.value)
	frequencyHistogramMetaData.tripples = frequencyHistogramMetaData.tripples.map(el => el).sort((a, b) => b.value - a.value)
	frequencyHistogramMetaData.quads = frequencyHistogramMetaData.quads.map(el => el).sort((a, b) => b.value - a.value)

	// check if hand is three cards of one denomination and two cards of another denomination (full house)
	if ((numTripples >= 2) || (numPairs >= 1 && numTripples >= 1)) {
		isFullHouse = true
	}
	// check if hand is two sets of two cards of the same denomination and any fifth card (Two Pairs)
	if (numPairs >= 2) {
		isTwoPair = true
	}

	return {
		isFourOfAKind,
		isFullHouse,
		isThreeOfAKind,
		isTwoPair,
		isPair,
		frequencyHistogramMetaData
	}

}

/*
  Check if hand is straight with Ace, two, three, four, five
 */
const checkIfLowerStraight = (valueSetCopy) => {
	let numConcurrentCards = 0;
	let concurrentCardValuesLow = [];
	// Convert Ace which has highest value of 13 to lowest value 0 from which straight would start
	valueSetCopy[0] = 0;
	// sort card values
	const sortedValueSetCopy = valueSetCopy.map(el => el).sort((a, b) => a - b);
	// check if Ace, two, three, four, five are found
	for (let i = 1; i < 5; i++) {
		if (numConcurrentCards >= 5) {
			return {
				isLowStraight: true,
				concurrentCardValuesLow,
			}
		}
		if ((sortedValueSetCopy[i] - sortedValueSetCopy[i - 1]) === 1) {
			if (numConcurrentCards === 0) {
				numConcurrentCards = 2;
				concurrentCardValuesLow.push(sortedValueSetCopy[i - 1]);
				concurrentCardValuesLow.push(sortedValueSetCopy[i]);
			} else {
				numConcurrentCards++;
				concurrentCardValuesLow.push(sortedValueSetCopy[i]);
			}
		} else {
			numConcurrentCards = 0;
			concurrentCardValuesLow = [];
		}
	}
	if (numConcurrentCards >= 5) {
		return {
			isLowStraight: true,
			concurrentCardValuesLow,
		}
	} else {
		return {
			isLowStraight: false,
			concurrentCardValuesLow,
		}
	}
}

/*
  Generate set of five cards that add value to hand
 */
const generateValueSet = (hand) => {
	return Array.from(new Set(hand.map(cardInfo => cardInfo.value)))
}

export { makeDeckOfCards, shuffleCards, dealPlayerCards, getCards, dealFlopCards, dealTurnCards, dealRiverCards, dealOtherCommunityCards, playerShowDown, checkIfFlush, checkIfRoyalFlush, checkIfStraightFlush, checkIfStraight, checkFrequencyHistogram, generateValueSet };

