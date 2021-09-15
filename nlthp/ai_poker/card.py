
from ai_poker.evaluator.card_service import CardService


class Card(object):
    """
    A class to represent a Poker Game Card.

    ...

    Attributes
    ----------
    _card_num : int
        value of Poker Game card (can be value between 2 and 14 or value in ['T', 'J', 'Q', 'K', 'A'])
    _suit : str
        suit of Poker Game card (can be value in ['c', 'd', 's', 'h'])
    n_enumerator : dict
        mapping from card letter value to card number value
    suits : list
        suits possible for a card
    """

    # mapping from card letter value to card number value
    n_enumerator = {'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14}

    # suits possible for a card (Clubs, Diamonds, Spades, Hearts)
    suits = ['c', 'd', 's', 'h']

    def __init__(self, card_num, card_suit):
        """ 
        Constructor for all the necessary attributes of the Card object.
        """
        if type(card_num) == int:
            if card_num < 2 or card_num > 14:
                raise Exception(
                    'Card number must be between 2 and 14 (inclusive).')
            self._card_num = card_num
            for k in self.n_enumerator:
                if self.n_enumerator[k] == card_num:
                    self._card_num = k
        elif type(card_num) == str:
            if card_num.upper() not in self.n_enumerator:
                raise Exception(
                    "Card letter must be \'T\', \'J\', \'Q\', \'K\', or \'A\'.")
            self._card_num = card_num.upper()
        else:
            raise Exception('Card number/letter must be number or string.')

        if card_suit.lower() not in self.suits:
            raise Exception(
                "Invalid suit. Valid suits are \'c\', \'d\', \'s\', and \'h\'.")
        self._suit = card_suit.lower()

    def to_evaluation_int(self):
        """ Returns corresponding integer value of Card which is readable by hand Evaluator"""
        return CardService.create_evaluation(str(self))

    def get_card_num(self):
        """ Getter for card numeric value"""

        if self._card_num in self.n_enumerator:
            return self.n_enumerator[self._card_num]
        return self._card_num

    def get_card_suit(self):
        ''' Getter for card suit '''
        return self._suit

    def __lt__(self, other):
        ''' 
        Less than Comparator for card object.

        Compares card values.
        '''
        return self.get_card_num() < other.get_card_num()

    def __str__(self):
        '''
        String value of Card object.

        e.g. 7H (for 7 of Hearts)
        '''
        return str(self._card_num) + self._suit
