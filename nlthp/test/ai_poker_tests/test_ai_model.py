#!/usr/bin/env python3

import unittest
from sklearn.ensemble import GradientBoostingRegressor
import sys
sys.path.append("..")                                   # allows imports from parent directories
from ai_poker.table import Table
from ai_poker.simulation import simulate
from ai_poker.player import Player



class TestAIModel(unittest.TestCase):
    ''' Class for running unittests on functionalities of game.py '''

    def setUp(self):
        ''' SetUp Table object '''
        try:
            table = Table(small_bind=10, big_blind=20, max_buy_in=20000)
            self.table = table
        except IOError:
            print("Error: Cannot create Poker Table")

        # set number of agent players at table
        NUM_AGENT_PLAYERS = 5

        # add players to table
        players = []
        for i in range(NUM_AGENT_PLAYERS):
            regressor = GradientBoostingRegressor()
            name = 'Agent ' + str(i+1)
            player = Player(name=name, regressor=regressor, chips_amount=10**6, raise_choices=1000, raise_increase=0.7, memory=10**5)
            players.append(player)

        regressor = GradientBoostingRegressor()
        name = 'Player ' + str(i+1)
        p = Player(name="User", regressor=regressor, chips_amount=10**6, raise_choices=1000, raise_increase=0.7, memory=10**5)
        players.append(p)

        for p in players: self.table.add_player(p)

    def test_table_creation(self):
        ''' Test that the table object is created as expected'''

        # create table for comparison
        otherTable = Table(small_bind=10, big_blind=20, max_buy_in=20000)

        # check small blind assigned correctly
        self.assertEqual(self.table.small_bind, otherTable.small_bind)

        # check big blind assigned correctly
        self.assertEqual(self.table.big_blind, otherTable.big_blind)

        # check max buy in assigned correctly
        self.assertEqual(self.table.max_buy_in, otherTable.max_buy_in)


    def test_players_added(self):
        ''' Test that the players are added to the table as expected'''

        # set number of agent players at table
        NUM_AGENT_PLAYERS = 5

        # create table for comparison
        otherTable = Table(small_bind=10, big_blind=20, max_buy_in=20000)

        regressor = GradientBoostingRegressor()

        # add players to comparison table
        players = []
        for i in range(NUM_AGENT_PLAYERS):
            name = 'Agent ' + str(i+1)
            player = Player(name=name, regressor=regressor, chips_amount=10**6, raise_choices=1000, raise_increase=0.7, memory=10**5)
            players.append(player)

        name = 'Player ' + str(i+1)
        player = Player(name="User", regressor=regressor, chips_amount=10**6, raise_choices=1000, raise_increase=0.7, memory=10**5)
        players.append(player)

        for player in players: otherTable.add_player(player)

        # check that both lists have same numebr of players
        self.assertEqual(len(self.table.players), len(otherTable.players))

    def test_ai_game_simulation(self):
        ''' Test that AI game simulation executes as expected'''
        self.assertNotEqual(simulate(self.table, num_hands=5, hands_before_training=5, hands_between_training=5, hands_between_buyin=5), None)
    

def main():
    test = TestAIModel()
    test.setUp()
    test.test_table_creation()
    test.test_players_added()
    test.test_ai_game_simulation()

if __name__ == "__main__":
    main()
