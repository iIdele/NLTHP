
from random import shuffle

from .card import Card
from .evaluator.evaluator import Evaluator
from .player import Player
from .tablestate import TableState


class Table(object):
    """
    A class to represent a Poker Game Table. 

    Contains main Poker Game logic, specifically No-Limit Texas Hold'em. 
    ...

    Attributes
    ----------
    players : list
        all poker players that start game
    active_players : list
        poker players that are still part of game (in game)
    eliminated_players : list
        players that have been eliminated from game (have no more chips)
    dealer : int
        position of dealer chip (decided who pays blinds)
    eval : Evaluator
        hand evaluator (used by AI Agents to decide best action - through features/labels)
    small_bind : int
        small blind to pay
    big_blind : int
        big blind to pay
    max_buy_in : int
        maxium amount of chips allowed for buy in
    """

    def __init__(self, small_bind, big_blind, max_buy_in):
        """ 
        Constructor for all the necessary attributes of the Table object.
        Takes in and sets blinds and max buy in.
        """

        self.players = []
        self.active_players = []
        self.eliminated_players = []
        self.dealer = 0
        self.eval = Evaluator()
        self.small_bind = small_bind
        self.big_blind = big_blind
        self.max_buy_in = max_buy_in

    def generate_deck(self):
        ''' Generate the deck of 52 cards.  '''

        # get every combination of suit and value
        self.deck = []
        for s in ['c', 'd', 'h', 's']:
            for i in range(2, 15):
                self.deck.append(Card(i, s))
        shuffle(self.deck)

    def deal_private_cards(self):
        """ Deals players private cards at the start of each hand. """

        # deal cards until every player at table has 2
        for player in self.active_players:
            player.take_hole_cards((self.deck[0], self.deck[1]))
            if self.narrate_hands:
                print(player.get_name(
                ) + '(' + str(player.get_stack()) + ')', 'dealt', self.deck[0], 'and', self.deck[1])
            self.deck = self.deck[2:]
        if self.narrate_hands:
            print()

    def start_hand(self, narrate_hands=False):
        """ 
        Initialises hand by entering blinds for designated Players
        and then allows hand to begin.
        """

        # get small blind position
        sb_position = (self.dealer + 1) % self.state.num_active_players
        # get big blind position
        bb_position = (self.dealer + 2) % self.state.num_active_players

        # get position of first player to perform action
        self.state.currently_active = (
            self.dealer + 3) % self.state.num_active_players

        # set minimum allowed raise amount (is twice the amount of the big blind)
        self.state.min_raise_amount = 2 * self.big_blind

        # if only 2 players left in table rules of blinds are different
        if self.state.num_active_players == 2:
            # dealer is small blind
            sb_position = self.dealer
            # other player is big blind
            bb_position = (self.dealer + 1) % self.state.num_active_players
            # the dealer player is first to play
            self.state.currently_active = self.dealer

        # enter small blind and big blind
        self.state.current_bets[sb_position] += self.small_bind
        self.active_players[sb_position].remove_chips(self.small_bind)
        if self.narrate_hands:
            print(
                self.active_players[sb_position].get_name(), 'posts small blind of', self.small_bind)
        self.state.current_bets[bb_position] += self.big_blind
        self.active_players[bb_position].remove_chips(self.big_blind)
        if self.narrate_hands:
            print(
                self.active_players[bb_position].get_name(), 'posts big blind of', self.big_blind)

        self.start_betting(narrate_hands)

        # new line for better output layout
        if self.narrate_hands:
            print()

    def add_player(self, player):
        """ Add Player (Agent or User) to table. """

        self.eliminated_players.append(player)
        self.players.append(player)

    def deal_community_cards(self, num_cards, narrate_hands=False):
        """  
        Deals the entered amount of community cards that will be seen by all players.

        First called with num_cards = 3 -> Flop
        Then called with num_cards = 1 -> Turn 
        Finally called with num_cards = 1 -> River

        """

        # if only one player still active (all others have folded)
        if len(self.state.folded) + 1 == self.state.num_active_players:
            # hand is over
            return

        # minimum allowed raise after the flop is Big Blind
        self.state.min_raise_amount = self.big_blind

        # deal community cards
        self.state.cards += self.deck[:num_cards]
        if self.narrate_hands:
            # print to standard output for CLI play
            print([str(c) for c in self.state.cards])
        self.deck = self.deck[num_cards:]

        # first player to select action is player following dealer
        self.state.currently_active = (
            self.dealer + 1) % self.state.num_active_players

        # let betting begin
        self.start_betting(narrate_hands)
        if self.narrate_hands:
            # new line for better output layout
            print()

    def pay_winners(self):
        """ Assignes/Splits the pot to the winner(s). """

        # get hand evaluation of each player still in hand
        board = [card.to_evaluation_int() for card in self.state.cards]
        ranks = {}
        for player in self.active_players:
            if not board:
                rank = -1
            else:
                rank = self.eval.evaluate(board, [player.show(
                )[0].to_evaluation_int(), player.show()[1].to_evaluation_int()])
            ranks[player] = rank

        n = 0
        # if there is more than one winner split pot
        while sum(self.state.bets) > 0:

            # get rank of best hand and bet of each player who is eligible to win sub pot
            min_live_bet = None
            min_rank = None
            eligible_winners = []
            for i in range(self.state.num_active_players):
                # check hands of players only still active
                if not i in self.state.folded and self.state.bets[i] != 0:
                    # assign best hand and associated sub pots
                    if min_live_bet == None:
                        min_live_bet = self.state.bets[i]
                    else:
                        min_live_bet = min(min_live_bet, self.state.bets[i])
                    player = self.active_players[i]
                    eligible_winners.append(player)
                    if min_rank == None:
                        min_rank = ranks[player]
                    else:
                        min_rank = min(min_rank, ranks[player])

            winners = [
                player for player in eligible_winners if ranks[player] == min_rank]
            sub_pot = 0
            # subtract from main pot amount designated to smaller pots being divided
            for i in range(self.state.num_active_players):
                contribution = min(min_live_bet, self.state.bets[i])
                self.state.bets[i] -= contribution
                sub_pot += contribution

            # divide pot amongst winners
            winnings = int(float(sub_pot) / len(winners))
            for winner in winners:
                winner.add_chips(winnings)
                sub_pot -= winnings
                if self.narrate_hands:
                    # if only one winner
                    if min_rank == -1:
                        print(winner.get_name(), 'wins', winnings)
                    # when more than one winner
                    else:
                        # winnings are split
                        if n == 0:
                            print(winner.get_name(),
                                  'wins', winnings, 'from main pot')
                        if n > 0:
                            print(winner.get_name(), 'wins',
                                  winnings, 'from side pot')

            # if pot is odd value
            if sub_pot > 0:
                # first winning player gets the extra chips (usually 1)
                current_active_player = (self.dealer + 1) % self.state.num_active_players
                while sub_pot > 0:
                    player = self.active_players[current_active_player]
                    if player in winners:
                        player.add_chips(sub_pot)
                        if self.narrate_hands:
                            print(
                                player.get_name(), 'wins', sub_pot, 'odd chips')
                        sub_pot = 0
                    current_active_player = (current_active_player + 1) % self.state.num_active_players

            n += 1

    def start_betting(self, narrate_hands=False):
        """ 
        Allows round of betting to start and continues until no further bets
        are allowed to be placed (all active players have called same amount).
        """

        # get last player to bet/call for betting to stop
        last_to_play = self.state.currently_active

        # continue betting until all active players have called same amount
        betting_round = 0
        while True:
            betting_round += 1
            current_active_player = self.state.currently_active

            # stop betting if last player to bet has been reached
            if current_active_player == last_to_play and betting_round > 1:
                break

            # stop betting if last player to call has been reached
            not_allin_or_fold = []
            for i in range(self.state.num_active_players):
                if i not in self.state.folded and i not in self.state.all_in:
                    not_allin_or_fold.append(
                        i)
            # stop betting if all players have folded or are all-in
            if len(not_allin_or_fold) == 0:
                break
            if len(not_allin_or_fold) == 1 and self.state.current_bets[not_allin_or_fold[0]] == max(self.state.current_bets):
                break

            # skip player if player folded or player is all-in already
            if current_active_player in self.state.folded or current_active_player in self.state.all_in:
                self.state.currently_active = (
                    current_active_player + 1) % self.state.num_active_players
                continue

            # caluclate amount player must call to continue hand
            self.state.to_call = max(
                self.state.current_bets) - self.state.current_bets[current_active_player]

            # player takes action
            action = self.active_players[current_active_player].perform_action(
                self.state, narrate_hands)
            self.handle_action(action)

            # if player raises the betting round ends when they are reached again (unless more raises occur)
            if action[0] == 'raise':
                last_to_play = current_active_player

            # next player is next to take action
            self.state.currently_active = (
                current_active_player + 1) % self.state.num_active_players  

        # assign unmatched chips raise to owner 
        unique_bets = sorted(set(self.state.current_bets))
        max_bet = unique_bets[-1]
        if len(unique_bets) >= 2:
            below_max = unique_bets[-2]
        if len([bet for bet in self.state.current_bets if bet == max_bet]) == 1:
            for i in range(self.state.num_active_players):
                if self.state.current_bets[i] == max_bet:
                    self.state.current_bets[i] = below_max
                    player = self.active_players[i]
                    player.add_chips(max_bet - below_max)
                    if self.narrate_hands:
                        print(
                            max_bet - below_max, 'uncalled chips return to', player.get_name())

        # no players to perform actions left
        self.state.currently_active = None 

        for i in range(len(self.state.current_bets)):
            # add bets of current round to record of bets
            self.state.bets[i] += self.state.current_bets[i]
            # initialise current bet to 0 for next round of betting
            self.state.current_bets[i] = 0
            # initialise raises to 0 for next round of betting
            self.state.num_raises[i] = 0

    def handle_action(self, action):
        """
        Takes in a tuple in the format of (action, amount) and updates the
        TableState object accordingly.
        """

        # current active player
        actor = self.state.currently_active

        # current players still in hand
        player = self.active_players[actor]

        # maximum bet placed in current betting round
        maximum = max(self.state.current_bets)

        # latest bet amount places by current active player
        current_bet = self.state.current_bets[actor]

        # player check (no amount entered)
        if action[0] == 'check':
            if current_bet < maximum:
                raise Exception(
                    'Player must call to remain in active in current hand.')
            if self.narrate_hands:
                print(player.get_name(), 'checks.')

        # player fold (player exits hand)
        elif action[0] == 'fold':
            self.state.folded.append(actor)
            if self.narrate_hands:
                print(player.get_name(), 'folds.')

        # player call (player matches largest amount bet)
        elif action[0] == 'call':
            to_call = self.state.to_call
            stack = player.get_stack()
            if stack <= to_call: 
                self.state.current_bets[actor] += stack
                player.remove_chips(stack)
                if self.narrate_hands:
                    print(
                        player.get_name(), 'all-in calls with', stack)
                self.state.all_in.append(actor)
            else:
                self.state.current_bets[actor] = maximum
                player.remove_chips(maximum - current_bet)
                if self.narrate_hands:
                    print(
                        player.get_name(), 'calls', maximum - current_bet)

        # player raises or bets (player increases largest amount bet)
        elif action[0] == 'raise' or action[0] == 'bet':
            raise_to = action[1]  # new total bet of player
            raise_by = raise_to - maximum  # change in maximum bet in pot
            if raise_to < self.state.min_raise_amount:
                raise Exception(
                    'Raise amount is less than minimum raise.')
            # get minimum amount raise must be
            self.state.min_raise_amount = raise_to + raise_by
            self.state.current_bets[actor] = raise_to
            # remove amount bet from player stack and add to pot
            player.remove_chips(raise_to - current_bet)
            self.state.num_raises[actor] += 1

            # check if player is all-in
            all_in = player.get_stack() == 0
            if all_in:
                self.state.all_in.append(actor)
            if self.narrate_hands:
                if not all_in:
                    print(
                        player.get_name(), 'raises', raise_by, 'to', raise_to)
                else:
                    print(player.get_name(), 'raises all-in',
                          raise_by, 'to', raise_to)

        else:
            raise Exception('Invalid player action.')

    def play_hand(self, narrate_hands=False):
        """ 
        Simulates/plays hand between players that are part of table.

        Narrates the hand and actions according to narrate_hands value.
        """

        # set if hand should be narrated
        self.narrate_hands = narrate_hands

        # check players that have enough chips to take part in hand
        # (checks eliminated players in case any player has bought in again)
        for player in self.eliminated_players[:]:
            # check if stack of player is enough to play hand
            if player.get_stack() >= self.big_blind:
                if player.get_stack() > self.max_buy_in:
                    raise Exception(
                        'Player\'s stack is greater than maximum buy in.')
                # add players that match requirement
                self.active_players.append(player)
                self.eliminated_players.remove(player)

        # if not enoguh players hand can't go ahead
        if len(self.active_players) <= 1:
            return False

        # reset table game state before hand
        self.state = TableState(self.active_players)

        # simulate hand after all necessary prep
        self.generate_deck()
        self.deal_private_cards()
        self.start_hand(narrate_hands)
        # deal flop
        self.deal_community_cards(3, narrate_hands)
        # deal turn
        self.deal_community_cards(1, narrate_hands)
        # deal river
        self.deal_community_cards(1, narrate_hands)
        self.pay_winners()

        # discard older (not as effective) strategies for each agent 
        for player in self.active_players:
            player.forget_old_strategies()

        # determine next dealer at table (for blinds and first active player)
        dealer_position = (self.dealer + 1) % self.state.num_active_players
        while self.active_players[dealer_position].get_stack() < self.big_blind:
            dealer_position = (dealer_position +
                               1) % self.state.num_active_players
        dealer = self.active_players[dealer_position]

        # remove players who do not have any chips left in stack
        for player in self.active_players[:]:
            if player.get_stack() < self.big_blind:
                self.active_players.remove(player)
                self.eliminated_players.append(player)

        # move dealer chip to determined next dealer position
        self.dealer = 0
        while self.active_players[self.dealer] != dealer:
            self.dealer = (self.dealer + 1) % self.state.num_active_players

        # print new line for better output formatting
        if narrate_hands:
            print()
        return True

    # Getters

    def get_active_players(self): return self.active_players[:]

    def get_blinds_and_buyin(self): return (
        self.small_bind, self.big_blind, self.max_buy_in)

    def get_eliminated_players(self): return self.eliminated_players[:]

    def get_players(self): return self.players[:]
