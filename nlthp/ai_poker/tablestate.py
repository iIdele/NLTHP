
class TableState(object):
    """
    A class to represent a the current state of the Poker Game Table.

    ...

    Attributes
    ----------
    num_active_players : int
        number of players still in hand
    to_call : int
        amount of chips necessary to call to continue hand
    min_raise_amount : int
        minimum raise amount player must bet to perform raise action
    bets : list
        total amount of chips entered by each player in current hand (excluded current betting round)
    current_bets : list
        total amount of chips entered by each player in current betting round 
    folded : list
        indexes of players which have folded current hand
    cards : list
       community cards dealt 
    all_in : list
       indexes of players which are all-in in current hand
    currently_active: int
        index of player performing next move
    num_raises : list
        total number of raises performed by each player
    """

    def __init__(self, players):

        # get number of players still in hand
        self.num_active_players = len(players)

        # initialise each player contribution to hand to 0
        self.bets = [0 for p in players]

        # initialise each player contribution to current betting round to 0
        self.current_bets = [0 for p in players]

        # initialise each player to have raised by 0 when hand starts
        self.num_raises = [0 for p in players]

        self.to_call = None

        self.min_raise_amount = None

        self.folded = []

        self.cards = []

        self.all_in = []

        self.currently_active = None
