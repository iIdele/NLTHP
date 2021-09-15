
import random

import numpy


class Player(object):
    """
    A class to represent a Poker Game Player (Agent or User).

    ...

    Attributes
    ----------
    name : str
        poker player name at table
    chips_amount : int
        amount of chips/stack player has
    raise_choices : int
        number of different raise options player can pick from
    memory : int 
        first number of stored features/labels that player learns from (forgets anything before this).
        Allows player to continuously improve by forgetting 'weaker' strategies.
    raise_increase : float
        times raise must be larger than previous raise
    regressor : Regressor
        machine learning regressor which represents the model the agents will learn through.
        This allows Agents to predict the action with best return/gain
    features : list
        features associated with each table state from which Agents can learn
    fit : bool
        boolean value to indicate if Regression model has been fit
    labels : list
        stores results of each hand to allow Agents to learn from with the selected features used
    stack : int
        amount of chips/stack each player currently has
    stacks : list
        amount of chips/stack each player has after each hand (when features are recorded - used for 
        Agents to learn how they get highest gain)
    train : bool
        boolean value which indicates if Agents should update their regressor after each hand
    """

    """
    This class keeps a player's current stack size and chips_amount and is primarily responsible for
    receiving TableStates and returning actions.
    """

    def __init__(self, name, chips_amount, raise_choices, memory, regressor=None, raise_increase=None, ):
        """ 
        Constructor for all the necessary attributes of the Player object.
        """

        self.name = name
        self.memory = memory
        self.chips_amount = chips_amount
        self.regressor = regressor
        self.features = []
        self.fit = False
        self.labels = []
        self.stack = 0
        self.stacks = []
        self.train = True

        # calculate raise choices that players have (depend on blinds and previous raise)
        self.r_choices = [1]
        for i in range(raise_choices - 1):
            self.r_choices = [self.r_choices[0]
                              * raise_increase] + self.r_choices

    def gen_game_features(self, table_state):
        """ 
        Generates a list of game features for a player given the table_state.
        These are features from which the Agent Players learn (in combination with the labels).
        """

        # initialise the features with 0
        game_features = 43 * [0]

        # sort cards for feature generation (order is necessary for storing in features list)
        # sort player private cards
        hold_cards = sorted(self.cards)

        # sort table community card
        table_cards = sorted(table_state.cards)

        # add number and suit of each card to features
        cards = hold_cards + table_cards
        for i in range(len(cards)):
            game_features[6 * i] = 1
            game_features[6 * i + 1] = cards[i].get_card_num()
            suit = cards[i].get_card_suit()

            # create binary encoding for suit
            game_features[6 * i + 2] = suit == 'c'
            game_features[6 * i + 3] = suit == 'd'
            game_features[6 * i + 4] = suit == 's'
            game_features[6 * i + 5] = suit == 'h'

        # player stack size
        game_features[42] = self.stack

        print(game_features)
        return game_features

    def gen_action_features(self, action, table_state):
        """
        Generates a list of features from a given player action. 
        """

        # create binary encoding for action
        action_features = 7 * [0]

        # add action to binary encoded features
        if action[0] == 'check':
            action_features[0] = 1
        elif action[0] == 'fold':
            action_features[1] = 1
        elif action[0] == 'call':
            action_features[2] = 1
        elif action[0] == 'raise' or action[0] == 'bet':
            action_features[3] = 1
            action_features[4] = action[1]
            # raised amount
            action_features[5] = action[1] - \
                max(table_state.current_bets)
            # proportion of raise by to pot size
            action_features[6] = action_features[5] / \
                sum(table_state.bets + table_state.current_bets)
        else:
            raise Exception('Invalid action.')

        return action_features

    def buy_chips(self, new_stack):
        """ 
        Allows Players to buy-in to table and reinitialise their stack and set it 
        to the passed in amount new_stack.
        """

        # if new amount of stack is lower than current stack
        if new_stack > self.chips_amount + self.stack:
            # do not allow buy-in action
            return False

        # assign new stack
        move = new_stack - self.stack
        self.chips_amount -= move
        self.stack += move

        return True

    def cash_out(self):
        """ 
        Allows Players to cash out, set their stack to 0 and exit game.
        """
        self.chips_amount += self.stack
        self.stack = 0

    def perform_action(self, table_state, narrate_hands=False):
        """ 
        Returns a list of possible actions that a Player can perform
        depending on the current table state.
        """

        # generate game features for agent learning/action selection
        game_features = self.gen_game_features(table_state)
        all_actions = self.all_actions(table_state)

        # if agent has not been trained yet
        if not self.fit:
            # select random action
            selected_action = random.choice(all_actions)
        # otherwise if player has been trained
        else:
            # determine best action according to features/labels and table state
            all_features = []
            for action in all_actions:
                all_features.append(
                    game_features + self.gen_action_features(action, table_state))
            # calculate predicted gain on each action
            predicted_gain = self.regressor.predict(all_features)
            selected_action = all_actions[numpy.argmax(predicted_gain)]

        # store features of selected action
        action_features = self.gen_action_features(
            selected_action, table_state)

        # if agent is being trained
        if self.train:
            # learn from features/labels and predicted gains
            self.stacks.append(self.stack)
            self.features.append(game_features + action_features)

        # if player is user dispaly list of actions to choose from (allows player to play via CMD)
        if (narrate_hands and self.name == "User"):
            print("Possible moves: \n" + str(all_actions))
            pos_move = int(
                input("Enter number to select which move to play: "))
            selected_action = all_actions[pos_move]
            print("Action: " + str(selected_action))

        return selected_action

    def remove_chips(self, amount):
        """ 
        Subtract specified amount of chips from Player stack (used after hand loss).
        """
        if type(amount) != int:
            raise Exception('Must remove integer number of chips.')
        if amount > self.stack:
            raise Exception('Requested chips is greater than stack size.')
        self.stack -= amount

    def add_chips(self, amount):
        """ 
        Add specified amount of chips to Player stack (used after hand win).
        """
        if type(amount) != int:
            raise Exception('Must add integer number of chips.')
        self.stack += amount

    def forget_old_strategies(self):
        """
        Discards features/labels older than Player memory (self.memory) and updates features/labels with 
        the new updated strategies from end of hand.

        Allows Agents to adapt to human strategies but forbids them of learning too much in order
        to restrict lower level Agents from improving too much.
        """

        for i in range(len(self.labels), len(self.features)):
            self.labels.append(self.stack - self.stacks[i])

        # update features/labels
        self.features = self.features[-self.memory:]
        self.stacks = self.stacks[-self.memory:]
        self.labels = self.labels[-self.memory:]

    def train_player(self):
        """ 
        Trains the player agent's regressor using the obtained features/labels
        to predict the outcome of any given possible action.
        """

        if not self.train:
            return

        self.regressor.fit(self.features, self.labels)
        self.fit = True

    def all_actions(self, table_state):
        """ 
        Returns a list of all possible actions a player has given a Poker table state.
        """

        # amount necessary to call (if any)
        to_call = table_state.to_call

        # minimum amount to raise (if player wants to raise)
        min_raise_amount = table_state.min_raise_amount

        # record current bets of table
        current_bets = table_state.current_bets
        player_current_bet = current_bets[table_state.currently_active]

        # calculate maximum bet player can make
        max_bet = (self.stack + player_current_bet) // 5

        # list of actions player can perform
        actions = []

        # if player does not have enough chips to call full amount
        if to_call > self.stack:
            actions.append(('call',))
            actions.append(('fold',))
            return actions

        # if player has enough chips to call but not to raise by any amount
        if max_bet < min_raise_amount:
            if to_call == 0:
                actions.append(('check',))
            else:
                actions.append(('call',))
                actions.append(('fold',))
            return actions

        # add all possible raise choices of player (depend on min raise amount)
        for r in self.r_choices:
            amount = int(self.stack * r)
            if amount >= min_raise_amount and amount <= max_bet:
                actions.append(('raise', amount))

        if to_call == 0:
            actions.append(('check',))
        else:
            actions.append(('call',))
            actions.append(('fold',))

        return actions

    def take_hole_cards(self, cards): self.cards = cards

    def show(self): return self.cards

    def start_training(self): self.train = True

    def stop_training(self): self.train = False

    # Getters

    def get_stack(self): return self.stack

    def get_chips_amount(self): return self.chips_amount

    def get_name(self): return self.name

    def get_raise_choices(self): return self.r_choices[:]

    def get_features(self): return self.features[:]

    def get_labels(self): return self.labels[:]

    # Setters

    def set_chips_amount(self, amount): self.chips_amount = amount
