#!/usr/bin/env python3

import unittest
from sklearn.ensemble import GradientBoostingRegressor
import sys
sys.path.append("..")                                   # allows imports from parent directories
from ai_poker.tablestate import TableState
from ai_poker.player import Player


class TestTableState(unittest.TestCase):
	''' Class for running unittests on functionalities of tablestate.py '''

	def setUp(self):
		''' SetUp TableState object '''
		
		# set number of agent players at table
		NUM_AGENT_PLAYERS = 5
		
		# add players to table
		players = []
		for i in range(NUM_AGENT_PLAYERS):
			regressor = GradientBoostingRegressor()
			name = 'Player ' + str(i+1)
			player = Player(name=name, regressor=regressor, chips_amount=10**6, raise_choices=1000, raise_increase=0.7, memory=10**5)
			players.append(player)

		regressor = GradientBoostingRegressor()
		name = 'Player ' + str(i+1)
		player = Player(name="User", regressor=regressor, chips_amount=10**6, raise_choices=1000, raise_increase=0.7, memory=10**5)
		players.append(player)

		self.players = players
		self.tablestate = TableState(players)

	def test_tablestate_set_up(self):
		''' Test that a TableState object is reset as expected (behaviour expected before each hand)'''

		self.assertEqual(self.tablestate.to_call, None)
		self.assertEqual(self.tablestate.min_raise_amount, None) 
		self.assertEqual(self.tablestate.num_active_players, len(self.players)) 
		self.assertFalse(self.tablestate.folded) 
		self.assertFalse(self.tablestate.all_in) 
		self.assertFalse(self.tablestate.cards) 
		self.assertFalse(self.tablestate.currently_active) 


def main():
	test = TestTableState()
	test.setUp()
	test.test_tablestate_set_up()

if __name__ == "__main__":
	main()
