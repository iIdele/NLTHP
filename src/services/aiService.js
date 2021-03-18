import { makeActionButtonText } from './uiService.js';
import { calculateMinBet, manageBet, managePlayerFold } from './betService.js';
import {
	checkFrequencyHistogram,
	checkIfFlush,
	checkIfRoyalFlush,
	checkIfStraight,
	checkIfStraightFlush,
	generateValueSet
} from './cardsService.js';

/**
* The aiService provides key services for the 
* functinality of Ai players. It handles 
* how the Ai determines what move to make.
*/

/* 
The main function to handle the behavior of an Ai player in a given situation 
*/
const aiHandler = (state, moveAnimationState) => {
	
	const { highBet } = state
	const activePlayer = state.players[state.activePlayerIndex];
	const min = calculateMinBet(highBet, activePlayer.chips, activePlayer.bet)
	const max = activePlayer.chips + activePlayer.bet
	const totalInvestment = activePlayer.chips + activePlayer.bet + activePlayer.stackInvestment;
	const investmentRequiredToRemain = (highBet / totalInvestment) * 100;
	const preFlopValues = activePlayer.cards.map(el => el.value)
	const highCard = Math.max(...preFlopValues)
	const lowCard = Math.min(...preFlopValues)
	const descendingSortHand = activePlayer.cards.concat(state.communityCards).sort((a, b) => b.value - a.value)
	const { frequencyHistogram, suitHistogram } = makeHistogram(descendingSortHand)
	const stakes = groupStakes(investmentRequiredToRemain);
	
	switch (state.phase) {
		// determine Ai action for round 1 of betting
		case ('first round'): {
			// use specific factors to determine fold, call/check or bet
			const suited = Object.entries(suitHistogram).find(keyValuePair => keyValuePair[1] === 2)
			const straightGap = (highCard - lowCard <= 4)
			const { 
				callLimit, 
				raiseChance, 
				raiseRange 
			} = createPreFlopDeterminant(highCard, lowCard, suited, straightGap)
			const callBool = (betting_hierarchy[stakes] <= betting_hierarchy[callLimit])
			const callValue = (activePlayer.chips + activePlayer.bet >= highBet) ? highBet : activePlayer.chips + activePlayer.bet
			if (callBool) {
				if (raiseBool(raiseChance)) {
					const determinedRaiseRange = raiseRange[Math.floor(Math.random() * (raiseRange.length - 0)) + 0];
					const wantRaise = (betting_hierarchy[stakes] <= betting_hierarchy[determinedRaiseRange])
					if (wantRaise) {
						let betValue = Math.floor(chooseBetProportion(determinedRaiseRange) * activePlayer.chips)
						if (betValue < highBet) {
							if (highBet < max) {
								betValue = highBet;
							}
						}
						if (betValue > max)
							activePlayer.canRaise = false
						moveAnimationState(state.activePlayerIndex, `${makeActionButtonText(highBet, betValue, activePlayer)} ${betValue}`);
						return manageBet(state, betValue, min, max);
					} else {
						// will not render the bet value if it's a "check"
						moveAnimationState(state.activePlayerIndex, `${makeActionButtonText(highBet, callValue, activePlayer)} ${(callValue > activePlayer.bet) ? (callValue) : ""}`);
						return manageBet(state, callValue, min, max);
					}
				} else {
					moveAnimationState(state.activePlayerIndex, `${makeActionButtonText(highBet, callValue, activePlayer)} ${(callValue > activePlayer.bet) ? (callValue) : ""}`);
					return manageBet(state, callValue, min, max);
				}
			} else {
				moveAnimationState(state.activePlayerIndex, `FOLD`);
				return managePlayerFold(state)
			}
		}
		// determine Ai action for subsequent betting rounds
		case ('second round'):
		case ('third round'):
		case ('fourth round'):
			// update freq histogram used to track hands
			const {

				isPair,
				isTwoPair,
				isThreeOfAKind,
				isFourOfAKind,
				isFullHouse,
				frequencyHistogramMetaData,

			} = checkFrequencyHistogram(descendingSortHand, frequencyHistogram);
			const valueSet = generateValueSet(descendingSortHand);
			const {

				isStraight,

			} = checkIfStraight(valueSet);
			const {

				isFlush,
				flushedSuit,

			} = checkIfFlush(suitHistogram);

			const flushCards = (isFlush) &&
				descendingSortHand
					.filter(card => card.suit === flushedSuit);

			const isStraightFlush = (isFlush) && checkIfStraightFlush(flushCards);
			const isRoyalFlush = (isFlush) &&
				checkIfRoyalFlush(flushCards);
			const isNoPair = (
				(!isRoyalFlush) &&
				(!isStraightFlush) &&
				(!isFourOfAKind) &&
				(!isFullHouse) &&
				(!isFlush) &&
				(!isStraight) &&
				(!isThreeOfAKind) &&
				(!isTwoPair) &&
				(!isPair));

			// create a hierarchy to rank hand strength
			const handHierarchy = [{
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

			// use hand hierarchy to determine Ai action
			const highRank = handHierarchy[handHierarchy.findIndex(el => el.match === true)].name
			const { callLimit, raiseChance, raiseRange } = createGeneralizedDeterminant(descendingSortHand, highRank, frequencyHistogramMetaData)
			const callBool = (betting_hierarchy[stakes] <= betting_hierarchy[callLimit])
			const callValue = (activePlayer.chips + activePlayer.bet >= highBet) ? highBet : activePlayer.chips + activePlayer.bet
			if (callBool) {
				if (raiseBool(raiseChance)) {
					const determinedRaiseRange = raiseRange[Math.floor(Math.random() * (raiseRange.length - 0)) + 0];
					const wantRaise = (betting_hierarchy[stakes] <= betting_hierarchy[determinedRaiseRange])
					if (wantRaise) {
						let betValue = Math.floor(chooseBetProportion(determinedRaiseRange) * activePlayer.chips)
						if (betValue < highBet) {
							betValue = highBet;
						}
						activePlayer.canRaise = false
						moveAnimationState(state.activePlayerIndex, `${makeActionButtonText(highBet, betValue, activePlayer)} ${betValue}`);
						return manageBet(state, betValue, min, max);
					} else {
						moveAnimationState(state.activePlayerIndex, `${makeActionButtonText(highBet, callValue, activePlayer)} ${(callValue > activePlayer.bet) ? (callValue) : ""}`);
						return manageBet(state, callValue, min, max);
					}
				} else {
					moveAnimationState(state.activePlayerIndex, `${makeActionButtonText(highBet, callValue, activePlayer)} ${(callValue > activePlayer.bet) ? (callValue) : ""}`);
					return manageBet(state, callValue, min, max);
				}
			} else {
				moveAnimationState(state.activePlayerIndex, `FOLD`);
				return managePlayerFold(state)
			}
		default: throw Error("Handle AI Running during incorrect phase");
	}
}

/* 
This function determines Ai behavior based 
on the rank of its card hand.
*/
const createGeneralizedDeterminant = (hand, highRank, frequencyHistogramMetaData) => {
	if (highRank === 'Royal Flush') {
		return {
			callLimit: 'beware',
			raiseChance: 1,
			raiseRange: ['beware']
		}
	} else if (highRank === 'Straight Flush') {
		return {
			callLimit: 'beware',
			raiseChance: 1,
			raiseRange: ['strong', 'aggro', 'beware']
		}
	} else if (highRank === 'Four Of A Kind') {
		return {
			callLimit: 'beware',
			raiseChance: 1,
			raiseRange: ['strong', 'aggro', 'beware']
		}
	} else if (highRank === 'Full House') {
		return {
			callLimit: 'beware',
			raiseChance: 1,
			raiseRange: ['hidraw', 'strong', 'aggro', 'beware']
		}
	} else if (highRank === 'Flush') {
		return {
			callLimit: 'beware',
			raiseChange: 1,
			raiseRange: ['strong', 'aggro', 'beware'],
		}
	} else if (highRank === 'Straight') {
		return {
			callLimit: 'beware',
			raiseChange: 1,
			raiseRange: ['lowdraw', 'meddraw', 'hidraw, strong'],
		}
	} else if (highRank === 'Three Of A Kind') {
		return {
			callLimit: 'beware',
			raiseChange: 1,
			raiseRange: ['lowdraw', 'meddraw', 'hidraw, strong'],
		}
	} else if (highRank === 'Two Pair') {
		return {
			callLimit: 'beware',
			raiseChange: 0.7,
			raiseRange: ['lowdraw', 'meddraw', 'hidraw, strong'],
		}
	} else if (highRank === 'Pair') {
		return {
			callLimit: 'hidraw',
			raiseChange: 0.5,
			raiseRange: ['lowdraw', 'meddraw', 'hidraw, strong'],
		}
	} else if (highRank === 'No Pair') {
		return {
			callLimit: 'meddraw',
			raiseChange: 0.2,
			raiseRange: ['lowdraw', 'meddraw', 'hidraw, strong'],
		}
	}
}

const raiseBool = (chance) => {
	return Math.random() < chance
}

/* 
A function to determine Ai behavior based on the flop
and its results. 
*/
const createPreFlopDeterminant = (highCard, lowCard, suited, straightGap) => {
	if (highCard === lowCard) {
		switch (highCard) {
			case (highCard > 8): {
				return {
					callLimit: 'beware',
					raiseChance: 0.9,
					raiseRange: ['lowdraw', 'meddraw', 'hidraw', 'strong'], // randomly determine bet based on this
				}
			}
			case (highCard > 5): {
				return {
					callLimit: 'aggro',
					raiseChance: 0.75, // if Math.random() is < than this, select a random raiseTarget 
					raiseRange: ['insignificant', 'lowdraw', 'meddraw'],
				}
			}
			case (highCard < 5):
			default: {
				return {
					callLimit: 'aggro',
					raiseChance: 0.5,
					raiseRange: ['insignificant', 'lowdraw', 'meddraw'],
				}
			}
		}
	} else if (highCard > 9 && lowCard > 9) {
		// two high cards
		if (suited) {
			return {
				callLimit: 'beware',
				raiseChance: 1,
				raiseRange: ['insignificant', 'lowdraw', 'meddraw', 'hidraw'],
			}
		} else {
			return {
				callLimit: 'beware',
				raiseChance: 0.75,
				raiseRange: ['insignificant', 'lowdraw', 'meddraw', 'hidraw'],
			}
		}
	} else if (highCard > 8 && lowCard > 6) {
		// one high card
		if (suited) {
			return {
				callLimit: 'beware',
				raiseChance: 0.65,
				raiseRange: ['insignificant', 'lowdraw', 'meddraw', 'hidraw'],
			}
		} else {
			return {
				callLimit: 'beware',
				raiseChance: 0.45,
				raiseRange: ['insignificant', 'lowdraw', 'meddraw', 'hidraw'],
			}
		}
	} else if (highCard > 8 && lowCard < 6) {
		if (suited) {
			return {
				callLimit: 'major',
				raiseChance: 0.45,
				raiseRange: ['insignificant', 'lowdraw'],
			}
		} else {
			return {
				callLimit: 'aggro',
				raiseChance: 0.35,
				raiseRange: ['insignificant', 'lowdraw'],
			}
		}
	} else if (highCard > 5 && lowCard > 3) {
		if (suited) {
			return {
				callLimit: 'strong',
				raiseChance: 0.1,
				raiseRange: ['insignificant', 'lowdraw'],
			}
		} else if (straightGap) {
			return {
				callLimit: 'aggro',
				raiseChance: 0,
			}
		} else {
			return {
				callLimit: 'strong',
				raiseChance: 0,
			}
		}
	} else {
		if (suited) {
			return {
				callLimit: 'strong',
				raiseChance: 0.1,
				raiseRange: ['insignificant'],
			}
		} else if (straightGap) {
			return {
				callLimit: 'strong',
				raiseChance: 0,
			}
		} else {
			return {
				callLimit: 'insignificant',
				raiseChance: 0,
			}
		}
	}
}

const makeHistogram = (hand) => {
	const histogram = hand.reduce((acc, cur) => {
		acc.frequencyHistogram[cur.cardFace] = (acc.frequencyHistogram[cur.cardFace] || 0) + 1;
		acc.suitHistogram[cur.suit] = (acc.suitHistogram[cur.suit] || 0) + 1;
		return acc
	}, { frequencyHistogram: {}, suitHistogram: {} })
	return histogram
}

/* 
This function determines the amount an Ai
will bet based on the betting hierarchy value.
*/
const chooseBetProportion = (stakes) => {
	if (stakes === 'blind') {
		return Math.random() * (0.1 - 0) + 0
	} else if (stakes === 'insignificant') {
		return Math.random() * (0.03 - 0.01) + 0.01
	} else if (stakes === 'lowdraw') {
		return Math.random() * (0.10 - 0.03) + 0.03
	} else if (stakes === 'meddraw') {
		return Math.random() * (0.15 - 0.10) + 0.10
	} else if (stakes === 'hidraw') {
		return Math.random() * (0.25 - 0.15) + 0.15
	} else if (stakes === 'strong') {
		return Math.random() * (0.35 - 0.25) + 0.25
	} else if (stakes === 'major') {
		return Math.random() * (0.40 - 0.35) + 0.35
	} else if (stakes === 'aggro') {
		return Math.random() * (0.75 - 0.40) + 0.40
	} else if (stakes === 'beware') {
		return Math.random() * (1 - 0.75) + 0.75
	}
}

/* 
A list to set the degree of an Ai bet.
*/
const betting_hierarchy = {
	blind: 0,
	insignificant: 1,
	lowdraw: 2,
	meddraw: 3,
	hidraw: 4,
	strong: 5,
	major: 6,
	aggro: 7,
	beware: 8,
}

/* 
A function to group stakes into terms for betting.
*/
const groupStakes = (percentage) => {
	switch (true) {
		case (percentage > 75):
			return 'beware'
		case (percentage > 40):
			return 'aggro'
		case (percentage > 35):
			return 'major'
		case (percentage > 25):
			return 'strong'
		case (percentage > 15):
			return 'hidraw'
		case (percentage > 10):
			return 'meddraw'
		case (percentage > 3):
			return 'lowdraw'
		case (percentage >= 1):
			return 'insignificant'
		case (percentage < 1):
		default:
			return 'blind'
	}
}





export { aiHandler };

