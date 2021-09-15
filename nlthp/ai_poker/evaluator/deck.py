
from random import shuffle
from ai_poker.evaluator.card_service import CardService

class Deck(object):
    """
    A class to represent a Poker Game Deck (of bitwise evaluations). 

    The Deck of bitwise evaluations allows to perform bitwise arithmetic in order
    for the Agents to evaluate their hands efficiently.
    ...

    Attributes
    ----------
    cards : list
        list of Poker Card bitwise Evaluations
    """

    complete_deck = []

    def __init__(self):
        ''' Initialise deck of cards and then shuffle them. '''
        self.cards = Deck.get_deck_of_cards()
        self.shuffle()

    def shuffle(self):
        ''' Shuffles deck of cards. '''
        shuffle(self.cards)

    def take_card(self, n=1):
        ''' Returns card from top of deck (enter number of cards to return). '''

        # take top card
        if n == 1:
            return self.cards.pop(0)

        # take number of cards specified 
        cards = []
        for i in range(n):
            cards.append(self.take_card())
        return cards

    def __str__(self):
        ''' Pretty prints deck of cards through unicode values. '''
        return CardService.print_cards(self.cards)

    @staticmethod
    def get_deck_of_cards():
        ''' Generate deck of cards with bitwise evaluations. '''
        if Deck.complete_deck:
            return list(Deck.complete_deck)

        # create list of 52 card deck (with bit values)
        for rank in CardService.card_values:
            for suit,val in CardService.suit_to_rank.items():
                # create Evaluation for each rank - suit combo
                Deck.complete_deck.append(CardService.create_evaluation(rank + suit))

        return list(Deck.complete_deck)