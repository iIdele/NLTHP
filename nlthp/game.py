#!/usr/bin/env python3

from sklearn.ensemble import GradientBoostingRegressor

from ai_poker.player import Player
from ai_poker.simulation import simulate
from ai_poker.table import Table


def main():
    """
    This is the main script used for training AI Poker Agents.

    In this script AI Poker Agents are initialized and trained
    according to the different difficulties allowed in the game:
    Beginner - Intermediate - Expert - Ultimate Poker Pro.
    Depending on the difficulty, a certain amount of hands are 
    simulated to train the AI Agents.
    """

    # set number of agent players at table
    NUM_AGENT_PLAYERS = 5

    # create GradientBoostingRegressor for machine learning model for each player
    regressor = GradientBoostingRegressor()

    players = []

    # create Agent players
    for i in range(NUM_AGENT_PLAYERS):

        # create Agent that uses GradientBoostingRegressor to be trained
        name = 'Agent ' + str(i + 1)
        player = Player(name=name, regressor=regressor, chips_amount=10**5,
                        raise_choices=20000, raise_increase=0.5, memory=10**5)
        players.append(player)

    # add player that will represent user
    userPlayer = Player(name="User", regressor=regressor, chips_amount=10**5,
                        raise_choices=20000, raise_increase=0.5, memory=10**5)
    players.append(userPlayer)

    # setup table with blinds and max buy-in
    pokerTable = Table(small_bind=10, big_blind=20, max_buy_in=200)

    # add all players to table
    for player in players:
        pokerTable.add_player(player)

    # display difficulties to select (only for training purposes)
    print("Select table level of difficulty between:\n1.Beginner\n2.Intermediate\n3.Expert\n4.Ultimate Poker Star\n")
    ai_difficulty = int(input("Difficulty: "))

    # if difficulty "Beginner" train agents with 10000 simulated hands
    if ai_difficulty == 1:
        simulate(pokerTable, num_hands=10000,
                 hands_before_training=2000, hands_between_training=1000, hands_between_buyin=10)
    # if difficulty "Intermediate" train agents with 50000 simulated hands
    elif ai_difficulty == 2:
        simulate(pokerTable, num_hands=50000,
                 hands_before_training=2000, hands_between_training=1000, hands_between_buyin=10)
    # if difficulty "Expert" train agents with 100000 simulated hands
    elif ai_difficulty == 3:
        simulate(pokerTable, num_hands=100000,
                 hands_before_training=2000, hands_between_training=1000, hands_between_buyin=10)
    # if difficulty "Ultimate Poker Pro" train agents with 250000 simulated hands
    elif ai_difficulty == 4:
        simulate(pokerTable, num_hands=250000, hands_before_training=2000,
                 hands_between_training=1000, hands_between_buyin=10)
    else:
        simulate(pokerTable, num_hands=100000, hands_before_training=2000,
                 hands_between_training=1000, hands_between_buyin=10)

    # narrate 10000 simulated training hands
    simulate(pokerTable, num_hands=10000,
             hands_between_buyin=10000000, narrate_hands=True)


if __name__ == '__main__':
    main()
