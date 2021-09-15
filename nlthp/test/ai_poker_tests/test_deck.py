#!/usr/bin/env python3

from random import shuffle
import unittest
import sys
sys.path.append("..")											# allows imports from parent directories
from ai_poker.player import Player
from ai_poker.evaluator.evaluator import Evaluator
from ai_poker.evaluator.deck import Deck 


class TestDeck(unittest.TestCase):
	''' Class for running unittests on functionalities of deck.py '''

	def setUp(self):
		''' SetUp Deck object '''

		self.ranks = {}
		self.cards = Deck.get_deck_of_cards()
		self.board = [card for card in self.cards]

	def test_shuffle(self):
		''' Test the shuffle functionality used for Evaluator ''' 

		
		otherCards = Deck.get_deck_of_cards()
		# shuffle second copy of deck of cards
		shuffle(otherCards)

		# check that order is different from original
		self.assertNotEqual(self.cards, otherCards)

	def test_pick(self):
		''' Test the pick functionality used for Evaluator ''' 

		# test for single card
		n = 1
		self.assertEqual(self.cards[0], self.cards.pop(0))

		# test for multiple cards
		n = 10
		for i in range(n):
			self.assertEqual(self.cards[0], self.cards.pop(0))

	def test_get_complete_deck(self):
		''' Test the get_deck_of_cards functionality used for Evaluator '''

		cards = Deck.get_deck_of_cards()
		self.assertEqual(len(cards), 52)

def main():
	test = TestDeck()
	test.setUp()
	test.test_shuffle()
	test.test_pick()
	test.test_get_complete_deck()


if __name__ == "__main__":
	main()
