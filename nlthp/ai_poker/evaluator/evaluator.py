
import itertools
from ai_poker.evaluator.card_service import CardService
from ai_poker.evaluator.deck import Deck
from ai_poker.evaluator.lookup import LookupTable

class Evaluator(object):
    ''' 
    Evaluates Poker hand values/strengths. 
    
    Performs very efficiently as all calculations are done with 
    bit arithmetic and instant table lookups. 

    Handles Lookups for:
    - 5 card hand (on flop)
    - 6 card hand (on turn)
    - 7 card hand (on river)
    ...

    Attributes
    ----------
    table : LookupTable
        dictionary for efficiently looking up Poker hand values/strengths
    '''

    def __init__(self):
        ''' 
        Initialises LookupTable attributes and generates LookupTable.
        
        Generates LookupTable mappings for 5 card hands, 6 card hands and 7
        card hands.
        '''

        self.table = LookupTable()
        
        self.hand_map = {
            5 : self.evaluate_five_cards,
            6 : self.evaluate_six_cards,
            7 : self.evaluate_seven_cards
        }

    def evaluate(self, cards, board):
        ''' Performs lookup of hand value/strenght in generated LookupTable. '''
        all_cards = cards + board
        return self.hand_map[len(all_cards)](all_cards)

    def evaluate_five_cards(self, cards):
        """
        Performs a hand evalution given a hand of 5 cards (after flop), mapping them to
        a rank in the range [1, 7462], with lower ranks being better evaluations.
        """
        if cards[0] & cards[1] & cards[2] & cards[3] & cards[4] & 0xF000:
            handOR = (cards[0] | cards[1] | cards[2] | cards[3] | cards[4]) >> 16
            prime = CardService.prime_product_from_rankings(handOR)
            return self.table.lookup_flush[prime]

        else:
            prime = CardService.prime_product_from_hand(cards)
            return self.table.lookup_unsuited[prime]

    def evaluate_six_cards(self, cards):
        """
        Performs a hand evalution given a hand of 6 cards (after turn), mapping them to
        a rank in the range [1, 7462], with lower ranks being better evaluations.
        """
        minimum = LookupTable.possible_high_card

        # generate combinations of five card hands
        five_card_combos = itertools.combinations(cards, 5)

        # calculate what best 5 card hand is (discards one card)
        for combo in five_card_combos:
            score = self.evaluate_five_cards(combo)
            if score < minimum:
                minimum = score

        return minimum

    def evaluate_seven_cards(self, cards):
        """
        Performs a hand evalution given a hand of 7 cards (after river), mapping them to
        a rank in the range [1, 7462], with lower ranks being better evaluations.
        """
        minimum = LookupTable.possible_high_card

        # generate combinations of five card hands
        five_card_combos = itertools.combinations(cards, 5)

        # calculate what best 5 card hand is (discards two cards)
        for combo in five_card_combos:
            score = self.evaluate_five_cards(combo)
            if score < minimum:
                minimum = score

        return minimum

    def get_hand_rank(self, hand_rank):
        '''
        Returns the level/class of hand given the hand_rank
        returned from the evaluator.
        '''
        if hand_rank >= 0 and hand_rank < LookupTable.possible_straight_flush:
            return LookupTable.hand_value_to_rank[LookupTable.possible_straight_flush]
        elif hand_rank <= LookupTable.possible_four_kind:
            return LookupTable.hand_value_to_rank[LookupTable.possible_four_kind]
        elif hand_rank <= LookupTable.possible_full_house:
            return LookupTable.hand_value_to_rank[LookupTable.possible_full_house]
        elif hand_rank <= LookupTable.possible_flush:
            return LookupTable.hand_value_to_rank[LookupTable.possible_flush]
        elif hand_rank <= LookupTable.possible_straight:
            return LookupTable.hand_value_to_rank[LookupTable.possible_straight]
        elif hand_rank <= LookupTable.possible_three_kind:
            return LookupTable.hand_value_to_rank[LookupTable.possible_three_kind]
        elif hand_rank <= LookupTable.possible_two_pair:
            return LookupTable.hand_value_to_rank[LookupTable.possible_two_pair]
        elif hand_rank <= LookupTable.possible_pair:
            return LookupTable.hand_value_to_rank[LookupTable.possible_pair]
        elif hand_rank <= LookupTable.possible_high_card:
            return LookupTable.hand_value_to_rank[LookupTable.possible_high_card]
        else:
            raise Exception("Inavlid hand rank, cannot return rank level")

    def class_to_readable_hand(self, class_int):
        """
        Converts the integer class hand score into a human-readable hand class string.
        """
        return LookupTable.rank_to_hand_value_name[class_int]