#!/usr/bin/env python3

import unittest
from sklearn.ensemble import GradientBoostingRegressor
import sys
sys.path.append("..")                                   	# allows imports from parent directories
from ai_poker.simulation import simulate
from ai_poker.player import Player


class TestPlayer(unittest.TestCase):
	''' Class for running unittests on functionalities of player.py '''

	def setUp(self):
		''' SetUp Player object '''
		regressor = GradientBoostingRegressor()
		player = Player(name="Player", regressor=regressor, chips_amount=10**6, raise_choices=1000, raise_increase=0.7, memory=10**5)
		self.player = player

	def test_buy_chips(self):
		''' Test the player buy chips in game action'''
		self.player.buy_chips(25000)
		self.assertEqual(self.player.stack, 25000)

	def test_cash_out(self):
		''' Test the player cash out in game action'''
		self.player.cash_out()
		self.assertEqual(self.player.stack, 0)

	def test_remove_chips(self):
		''' Test the player remove chips in game action'''
		self.player.buy_chips(25000)
		oldStack = self.player.stack
		self.player.remove_chips(20000)
		self.assertEqual(self.player.stack, 5000)

	def test_add_chips(self):
		''' Test the player add chips in game action'''
		self.player.buy_chips(25000)
		oldStack = self.player.stack
		self.player.add_chips(5000)
		self.assertEqual(self.player.stack, 30000)

	def test_start_training(self):
		''' Test that player start training as expected'''
		self.player.start_training()
		self.assertTrue(self.player.train)

	def test_stop_training(self):
		''' Test that player stop training as expected'''
		self.player.stop_training()
		self.assertFalse(self.player.train)


def main():
	test = TestPlayer()
	test.setUp()
	test.test_buy_chips()
	test.test_cash_out()
	test.test_remove_chips()
	test.test_add_chips()
	test.test_start_training()
	test.test_stop_training()


if __name__ == "__main__":
	main()
