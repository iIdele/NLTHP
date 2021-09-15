#!/usr/bin/env python3

import unittest
import sys
sys.path.append("..")											# allows imports from parent directories
from ai_poker.player import Player
from ai_poker.evaluator.evaluator import Evaluator
from ai_poker.evaluator.deck import Deck 
from sklearn.ensemble import GradientBoostingRegressor



class TestEvaluator(unittest.TestCase):
	''' Class for running unittests on functionalities of evaluator.py '''

	def setUp(self):
		''' SetUp Evaluator object '''

		self.eval = Evaluator()
		self.ranks = {}
		self.cards = Deck.get_deck_of_cards()
		self.board = [card for card in self.cards]


	def test_evaluate(self):
		''' Test the evaluate functionality used for Evaluator '''

		# set number of agent players at table
		NUM_AGENT_PLAYERS = 5

		players = []
		for i in range(NUM_AGENT_PLAYERS):
  
			regressor = GradientBoostingRegressor()
			name = 'Agent ' + str(i+1)
			player = Player(name=name, regressor=regressor, chips_amount=10**6, raise_choices=1000, raise_increase=0.7, memory=10**5)
			players.append(player)
		
		ranks = {}
		for player in players:
			if not self.board: 
				rank = -1   
				ranks[player] = rank

		self.assertEqual(self.ranks, ranks)


		
	def test_hand_summary(self):
		''' Test the hand_summary functionality used for hand Evaluator '''
		self.assertTrue(len(self.board))

		hands = []
		line_length = 10
		game_stages = ["FLOP", "TURN", "RIVER"]
		best_rank = 7463
		for i in range(len(game_stages)):
			line = ("=" * line_length) + " %s " + ("=" * line_length) 
			
			curr_best_rank = 7463 
			winners = []
			for player, h in enumerate(hands):
				rank = self.eval.evaluate(h, board[:(i + 3)])
				hand_rank = self.eval.get_hand_rank(rank)
				hand_value_name = self.eval.class_to_readable_hand(hand_rank)

				if rank == best_rank:
					winners.append(player)
					best_rank = rank
				elif rank < best_rank:
					winners = [player]
					best_rank = rank
		self.assertEqual(line_length, 10)
		self.assertEqual(best_rank, curr_best_rank)

def main():
	test = TestEvaluator()
	test.setUp()
	test.test_evaluate()
	test.test_hand_summary()


if __name__ == "__main__":
	main()
