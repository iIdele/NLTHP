#!/usr/bin/env python3

from random import shuffle
import unittest
import sys
sys.path.append("..")											# allows imports from parent directories
from ai_poker.evaluator.evaluator import Evaluator
from ai_poker.evaluator.lookup import LookupTable
from ai_poker.evaluator.card_service import CardService



class TestLookUp(unittest.TestCase):
	''' Class for running unittests on functionalities of lookup.py '''

	def test_rank_strings(self):
		''' Test the rank_strings mappings used for Evaluator ''' 
		rank_to_hand_value_name = {
		1 : "Straight Flush",
		2 : "Four of a Kind",
		3 : "Full House",
		4 : "Flush",
		5 : "Straight",
		6 : "Three of a Kind",
		7 : "Two Pair",
		8 : "Pair",
		9 : "High Card"
		}

		for rank in rank_to_hand_value_name:
			self.assertEqual(rank_to_hand_value_name[rank], LookupTable.rank_to_hand_value_name[rank])

	def test_hand_rank(self):
		''' Test the hand_rank mappings used for Evaluator ''' 

		possible_straight_flush = 10
		possible_four_kind		= 166
		possible_full_house     = 322 
		possible_flush          = 1599
		possible_straight       = 1609
		possible_three_kind     = 2467
		possible_two_pair       = 3325
		possible_pair           = 6185
		possible_high_card      = 7462

		hand_value_to_rank = {
			possible_straight_flush: 1,
			possible_four_kind: 2,
			possible_full_house: 3,
			possible_flush: 4,
			possible_straight: 5,
			possible_three_kind: 6,
			possible_two_pair: 7,
			possible_pair: 8,
			possible_high_card: 9
		}

		hand_value = 1
		for rank in hand_value_to_rank:
			self.assertEqual(hand_value_to_rank[rank], hand_value)
			hand_value += 1


	def test_flushes_lookup(self):
		''' Test the flushes lookup used for Evaluator ''' 
		possible_straight_flush = [
			7936,
			3968,
			1984,
			992,
			496,
			248, 
			124, 
			62, 
			31, 
			4111 
		]

		expectedFlushRank = 323

		flushes = []

		# reverse to have highest ranking flushes at start of list
		flushes.reverse()
		
		# add hands to LookupTable and
		# start from best ranking because highest ranking hand is straight flush
		rank = 1
		for straight_flush in possible_straight_flush:
			prime_product = CardService.prime_product_from_rankings(straight_flush)
			rank += 1
			
		# check for flushes that are found in hands that are also full houses         
		rank = LookupTable.possible_full_house + 1
		for flush in flushes:
			prime_product = CardService.prime_product_from_rankings(flush)
			rank += 1

		self.assertEqual(rank, expectedFlushRank)
		

def main():
	test = TestLookUp()
	test.setUp()
	test.test_rank_strings()
	test.test_hand_rank()
	test.test_flushes_lookup()


if __name__ == "__main__":
	main()
