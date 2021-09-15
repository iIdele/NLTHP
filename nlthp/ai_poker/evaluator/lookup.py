
import itertools
from ai_poker.evaluator.card_service import CardService

class LookupTable(object):
    """
    A class to represent a Poker Game Deck (of bitwise evaluations). 

    The Deck of bitwise evaluations allows to perform bitwise arithmetic in order
    for the Agents to evaluate their hands efficiently.
    ...

    Attributes
    ----------
    lookup_flush : dict
        dictionary for efficiently looking up flush value hands
    lookup_unsuited : dict
        dictionary for efficiently looking up all other unsuited value hands
    ----------
    Number of Distinct Possible Hand Values:
    Straight Flush   10 
    Four of a Kind   156      [(13 choose 2) * (2 choose 1)]
    Full Houses      156      [(13 choose 2) * (2 choose 1)]
    Flush            1277     [(13 choose 5) - 10 straight flushes]
    Straight         10 
    Three of a Kind  858      [(13 choose 3) * (3 choose 1)]
    Two Pair         858      [(13 choose 3) * (3 choose 2)]
    One Pair         2860     [(13 choose 4) * (4 choose 1)]
    High Card        1277     [(13 choose 5) - 10 straights]
    -------------------------
    TOTAL            7462
    Here we create a lookup table which maps
        a each hand to its unique prime product value => rank in range [1, 7462]
    
    Examples:
        Royal flush (best hand possible)          => 1
        7-5-4-3-2 differetn suits (worst hand possible)  => 7462
    """

    # count of distinct possible hand values
    possible_straight_flush = 10
    possible_four_kind      = 166
    possible_full_house     = 322 
    possible_flush          = 1599
    possible_straight       = 1609
    possible_three_kind     = 2467
    possible_two_pair       = 3325
    possible_pair           = 6185
    possible_high_card      = 7462

    # map of hand value to its general hand ranking 1 (best) to 9 (worst)
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

    # map of hand ranking to hand value name
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

    def __init__(self):
        ''' Initialises LookupTable attributes and generates LookupTable. '''
        self.lookup_flush = {}
        self.lookup_unsuited = {}

        # generate LookupTable
        self.add_flushes()  
        self.add_other_hands()

    def add_flushes(self):
        '''Adds all distinct flushes hand rankings to LookupTable. '''

        # different rankings of flushes
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

        flushes = []

        # generate values for all flushes (including straight flushes)
        gen_bit = self.get_next_lex_bit(int('0b11111', 2))

         # 1277 is the number of high card hands
         # so for each high card hand value
        for i in range(1277 + len(possible_straight_flush) - 1): 
            # get next flush pattern
            flush = next(gen_bit)
            not_straight_flush = True
            # check if flush generated is straight flush
            for straight_flush in possible_straight_flush:
                if not flush ^ straight_flush:
                    not_straight_flush = False

            if not_straight_flush:
                flushes.append(flush)

        # reverse to have highest ranking flushes at start of list
        flushes.reverse()

        # add hands to LookupTable and
        # start from best ranking because highest ranking hand is straight flush
        rank = 1
        for straight_flush in possible_straight_flush:
            prime_product = CardService.prime_product_from_rankings(straight_flush)
            self.lookup_flush[prime_product] = rank
            rank += 1

        # check for flushes that are found in hands that are also full houses         
        rank = LookupTable.possible_full_house + 1
        for flush in flushes:
            prime_product = CardService.prime_product_from_rankings(flush)
            self.lookup_flush[prime_product] = rank
            rank += 1

        # add straights and high card hands in a similar manner (only hands with unique/distinct five cards)
        self.add_striaghts_and_high_cards(possible_straight_flush, flushes)

    def add_striaghts_and_high_cards(self, straights, high_cards):
        '''
        Handles adding all distinct straights and high card hand rankings to LookupTable.
        
        Straights and High card hands are handles together since they are they both have
        unique/distinct five cards in a hand.
        '''

        rank = LookupTable.possible_flush + 1
        # add straight hands to LookupTable 
        for straigth in straights:
            prime_product = CardService.prime_product_from_rankings(straigth)
            self.lookup_unsuited[prime_product] = rank
            rank += 1

        rank = LookupTable.possible_pair + 1
        # add high card hands to LookupTable 
        for high_card in high_cards:
            prime_product = CardService.prime_product_from_rankings(high_card)
            self.lookup_unsuited[prime_product] = rank
            rank += 1

    def add_other_hands(self):
        ''' 
        Handles adding all other hand values to the LookupTable.
        
        The hand values added are: 
        - Pair 
        - Two Pair
        - Three of a Kind
        - Full House
        - Four of a Kind.
        '''

        reverse_ranks = list(range(len(CardService.card_rankings) - 1, -1, -1))

        # start from higest Four of a Kind hand value (4 Aces + 1 King)
        rank = LookupTable.possible_straight_flush + 1

        # add Four of a Kind hands to LookupTable 
        for four_of_kind in reverse_ranks:
            kickers = reverse_ranks[:]
            kickers.remove(four_of_kind)
            # add all combinations of Four of a Kind (from 4 Aces + 1 King to 4 Aces + 1 Two)
            for kicker in kickers:
                product = CardService.primes[four_of_kind]**4 * CardService.primes[kicker]
                self.lookup_unsuited[product] = rank
                rank += 1
        
        # start from higest Full House hand value (3 Aces + 2 Kings)
        rank = LookupTable.possible_four_kind + 1

        # add Full House hands to LookupTable
        for full_house in reverse_ranks:

            pair_ranks = reverse_ranks[:]
            pair_ranks.remove(full_house)

            # add all combinations of Full House hands
            for pair_rank in pair_ranks:
                product = CardService.primes[full_house]**3 * CardService.primes[pair_rank]**2
                self.lookup_unsuited[product] = rank
                rank += 1

        # start from higest Three of a Kind hand value (3 Aces + 1 King + 1 Queen)
        rank = LookupTable.possible_straight + 1

        # add Three of a Kind hands to LookupTable
        for three_of_kind in reverse_ranks:

            kickers = reverse_ranks[:]
            kickers.remove(three_of_kind)
            gen_bit = itertools.combinations(kickers, 2)

            # add all combinations of Three of a Kind hands
            for kickers in gen_bit:
                first_kicker, second_kicker = kickers
                product = CardService.primes[three_of_kind]**3 * CardService.primes[first_kicker] * CardService.primes[second_kicker]
                self.lookup_unsuited[product] = rank
                rank += 1

        # start from highest Two Pair hand value (2 Aces + 2 Kings + 1 Queen )
        rank = LookupTable.possible_three_kind + 1

        # generate all combos of Two Pair hands
        two_pair_hands = itertools.combinations(reverse_ranks, 2)

        # add Two Pair hands to LookupTable
        for two_pair_hand in two_pair_hands:

            pair1, pair2 = two_pair_hand
            kickers = reverse_ranks[:]
            kickers.remove(pair1)
            kickers.remove(pair2)
            # add all combinations of Two Pair hands
            for kicker in kickers:
                product = CardService.primes[pair1]**2 * CardService.primes[pair2]**2 * CardService.primes[kicker]
                self.lookup_unsuited[product] = rank
                rank += 1

        # start from highest Pair hand value (2 Aces + 1 King + 1 Queen + 1 Jack)
        rank = LookupTable.possible_two_pair + 1

        for pair in reverse_ranks:

            kickers = reverse_ranks[:]
            kickers.remove(pair)

            # generate all combos of Pair hands
            pair_hands = itertools.combinations(kickers, 3)

            # add all combinations of Pair hands
            for kickers in pair_hands:

                first_kicker, second_kicker, third_kicker = kickers
                product = CardService.primes[pair]**2 * CardService.primes[first_kicker] \
                        * CardService.primes[second_kicker] * CardService.primes[third_kicker]
                self.lookup_unsuited[product] = rank
                rank += 1


    def get_next_lex_bit(self, bits):
        ''' 
        Computes the lexicographically next bit permutation.

        Performs computations in poker order rank.
        '''
        t = (bits | (bits - 1)) + 1 
        next = t | ((((t & -t) // (bits & -bits)) >> 1) - 1)  
        yield next
        while True:
            t = (next | (next - 1)) + 1 
            next = t | ((((t & -t) // (next & -next)) >> 1) - 1)
            yield next