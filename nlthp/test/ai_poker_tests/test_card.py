#!/usr/bin/env python3

import unittest
import sys
sys.path.append("..")                                   # allows imports from parent directories
from ai_poker.card import Card


class TestCard(unittest.TestCase):
	''' Class for running unittests on functionalities of card.py '''

	def setUp(self):
		''' SetUp Card object and a deck of Cards '''
		card = Card(10, 'c')
		self.card = card


		self.deck = []
		for suit in ['c', 'd', 'h', 's']:
			for value in range(2,15):
				self.deck.append(Card(value,suit))

	def test_deck_of_cards(self):
		''' Test that a deck made up of Card objects is constructed as expected'''
		otherDeck = []
		for suit in ['c', 'd', 'h', 's']:
			for value in range(2,15):
				otherDeck.append(Card(value,suit))

		# check card values and suits
		for i in range(len(otherDeck)):
			self.assertEqual(self.deck[i]._card_num, otherDeck[i]._card_num)
			self.assertEqual(self.deck[i]._suit, otherDeck[i]._suit)

	def test_card_num(self):
		''' Test that card values are assigned as expected'''

		# check 'T' because 10 is converted to 'T'
		self.assertEqual(self.card._card_num, 'T')

	def test_card_suit(self):
		''' Test that card suits are assigned as expected'''

		self.assertEqual(self.card._suit, 'c')


def main():
	test = TestCard()
	test.setUp()
	test.test_deck_of_cards()
	test.test_card_num()

if __name__ == "__main__":
	main()
