#!/usr/bin/env python3

import unittest
import sys
sys.path.append("..")											# allows imports from parent directories
from ai_poker.evaluator.card_service import CardService


class TestCardService(unittest.TestCase):
	''' Class for running unittests on functionalities of evaluator_card.py '''

	def test_get_rank_bit(self):
		''' Test the get_rank_bit functionality used for hand Evaluator '''
		self.assertEqual(CardService.get_rank_bit(2), 2 >> 8 & 0xF)

		# check for 10, J, Q, K and A
		self.assertEqual(CardService.get_rank_bit(10), 10 >> 8 & 0xF)
		self.assertEqual(CardService.get_rank_bit(11), 11 >> 8 & 0xF)
		self.assertEqual(CardService.get_rank_bit(12), 12 >> 8 & 0xF)
		self.assertEqual(CardService.get_rank_bit(13), 13 >> 8 & 0xF)
		self.assertEqual(CardService.get_rank_bit(14), 14 >> 8 & 0xF)
		self.assertEqual(CardService.get_rank_bit(15), 15 >> 8 & 0xF)

	def test_get_suit_bit(self):
		''' Test the get_suit_int functionality used for hand Evaluator '''
		self.assertEqual(CardService.get_suit_bit(2), 2 >> 8 & 0xF)

		# check for 10, J, Q, K and A
		self.assertEqual(CardService.get_suit_bit(10), 10 >> 12 & 0xF)
		self.assertEqual(CardService.get_suit_bit(11), 11 >> 12 & 0xF)
		self.assertEqual(CardService.get_suit_bit(12), 12 >> 12 & 0xF)
		self.assertEqual(CardService.get_suit_bit(13), 13 >> 12 & 0xF)
		self.assertEqual(CardService.get_suit_bit(14), 14 >> 12 & 0xF)
		self.assertEqual(CardService.get_suit_bit(15), 15 >> 12 & 0xF)



def main():
	test = TestCardService()
	test.test_get_rank_bit()
	test.test_get_suit_bit()

if __name__ == "__main__":
	main()
