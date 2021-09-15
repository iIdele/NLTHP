
class CardService(object):
    """
    A class to for bitwise Card Evaluation services.

    This class allows Agents to make use of the hand Evaluator object and 
    classify their hands in an effective manner through bitwise operations.

    Cards are represented as 32-bit integers, so 
    there is no object instantiation. 
    
    The specific meaning of the bits is: 

                    -------------------------------------
                    |uuubbbbb bbbbbbbb ssssrrrr uupppppp|
                    -------------------------------------
                u = unused bit
                b = bit turned on depending on rank of card
                s = bit turned on depending on suit of card
                r = rank of card (deuce = 0, trey = 1, four = 2, …, ace = 12)
                p = prime number value of rank (deuce = 2, trey = 3, four = 5, …, ace = 41)
        
    """

    # list of rankings for all cards (from 0 to 12 inclusive)
    card_rankings = range(13)

    # card values (from 2 to A)
    card_values = '23456789TJQKA'

    # use prime numbers to efficiently generate card evaluations (in bits)
    # (each prime number represents a card value)
    primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41]

    # card value to card ranking map
    card_value_to_rank = {
        '2' : 0,
        '3' : 1,
        '4' : 2,
        '5' : 3,
        '6' : 4,
        '7' : 5,
        '8' : 6,
        '9' : 7,
        'T' : 8,
        'J' : 9,
        'Q' : 10,
        'K' : 11,
        'A' : 12,
    }


    suit_to_rank = {
        's' : 1, # spades
        'h' : 2, # hearts
        'd' : 4, # diamonds
        'c' : 8, # clubs
    }
    int_to_char_suit = 'xshxdxxxc'

    # for user friendly output in CLI
    unicode_suits = {
        1 : "♠", # spades 
        2 : "♥", # hearts
        4 : "♦", # diamonds
        8 : "♣"  # clubs
    }

    # unicodes for hearts and diamonds
    unicode_reds = [2, 4]

    @staticmethod
    def create_evaluation(card_value_suit_pair):
        ''' Creates bit evaluation given a card value-suit pair. '''

        # get string card value
        raw_card_value = card_value_suit_pair[0]
        # get string card suit
        raw_card_suit = card_value_suit_pair[1]
        # get rank of card value
        card_value_rank = CardService.card_value_to_rank[raw_card_value]
        # get rank of card suit
        card_suit_rank = CardService.suit_to_rank[raw_card_suit]

        # get correspomnding card prime value for bitwise evaluation
        card_prime_match = CardService.primes[card_value_rank]

        # get bitwise evaluations of rank, value and suit
        bitrank = 1 << card_value_rank << 16
        suit = card_suit_rank << 12
        value = card_value_rank << 8

        return bitrank | suit | value | card_prime_match

    @staticmethod
    def prime_product_from_hand(cards):
        ''' Return prime products bit evaluation of pair of cards. '''
        # to avoid getting 0 
        product = 1
        # calculate prime products bit evaluation for each card
        for card in cards:
            product *= (card & 0xFF)

        return product

    @staticmethod
    def prime_product_from_rankings(rbits):
        ''' Return prime products bit evaluation of hand ranking (in bit format). '''
        # to avoid getting 0 
        product = 1
        # calculate prime products bit evaluation for card ranking
        for card_ranking in CardService.card_rankings:
            # if ith bit is set
            if rbits & (1 << card_ranking):
                product *= CardService.primes[card_ranking]

        return product

    @staticmethod
    def get_card_unicode(card):
        ''' Returns unicode value of card for pretty printing to CLI. '''
        
        # get card suit and rank
        suit = CardService.get_suit_bit(card)
        rank = CardService.get_rank_bit(card)

        # default is black cards
        color = False

        # if can import include colors
        try:
            from termcolor import colored
            color = True
        except ImportError: 
            pass

        # if card has red suit
        suit_unicode = CardService.unicode_suits[suit]
        if color and suit in CardService.unicode_reds:
            s = colored(s, "red")

        rank = CardService.card_values[r_int]

        return " [ " + rank + " " + suit_unicode + " ] "

    @staticmethod
    def print_cards(card):
        ''' Prints cards through unicode values of rank and suit. '''
        output = " "
        # iterate through rank and suit of card
        for i in range(len(card)):
            value = card[i]

            # check if is rank or suit
            if i != len(card) - 1:
                output += CardService.get_card_unicode(c) + ","
            else:
                output += CardService.get_card_unicode(c) + " "
    
        # output card
        print(output)

    @staticmethod
    def get_rank_bit(card):
        ''' Returns bit value of card rank. '''
        return (card >> 8) & 0xF

    @staticmethod
    def get_suit_bit(card):
        ''' Returns bit value of card suit. '''
        return (card >> 12) & 0xF