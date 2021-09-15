  
from ai_poker.table import Table
from ai_poker.simulation import simulate
from ai_poker.player import Player
import numpy as np
import matplotlib.pyplot as plt

from sklearn.cross_validation import cross_val_score
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor

if __name__ == '__main__':

    # set number of agent players at table
    NUM_AGENT_PLAYERS = 6

    # setup table with blinds and max buy-in
    pokerTable = Table(small_bind=1, big_blind=2, max_buy_in=200)

    # create GradientBoostingRegressor for machine learning model for each player
    regressor = GradientBoostingRegressor()

    players = []
    # create Agent players
    for i in range(NUM_AGENT_PLAYERS):

        # create Agent that uses GradientBoostingRegressor to be trained
        if i == 0:
            name = "Ultimate Poker Pro Agent"
        elif i == 1:
            name = "Expert Agent"
        elif i == 2:
            name = "Intermediate Agent"
        elif i == 3:
            name = "Beginner Agent"
        else:
            name = 'Non-trained Agent ' + str(i+1)
        player = Player(name=name, regressor=regressor, chips_amount=10**5,
                        raise_choices=20000, raise_increase=0.5, memory=10**5)
        players.append(player)

    # add all players to table
    for player in players:
        pokerTable.add_player(player)

    #train Agent 1 for 100000 hands, training every 1000 hands
    players[0].start_training()
    simulate(pokerTable, num_hands=100000, hands_between_training=1000, hands_between_buyin=10)   
    players[0].stop_training()
    
    #train Agent 2 for 50000 hands, training every 1000 hands
    players[1].start_training()
    simulate(pokerTable, num_hands=50000, hands_between_training=1000, hands_between_buyin=10)   
    players[1].stop_training()

    #train Agent 3 for 25000 hands, training every 1000 hands
    players[2].start_training()
    simulate(pokerTable, num_hands=25000, hands_between_training=1000, hands_between_buyin=10)   
    players[2].stop_training()

    #train Agent 4 for 10000 hands, training every 1000 hands
    players[3].start_training()
    simulate(pokerTable, num_hands=10000, hands_between_training=1000, hands_between_buyin=10)   
    players[3].stop_training()

    for p in players: p.set_chips_amount(10**6)

    #simulate 20,000 hands and save bankroll history
    bankrolls = simulate(pokerTable, num_hands=20000, hands_between_training=0, hands_between_buyin=10)

    #plot bankroll history of each player
    for i in range(6):
        bankroll = bankrolls[i]
        plt.plot(range(len(bankroll)), bankroll, label=players[i].get_name())
    plt.title('Agent stack - Hands played')        
    plt.xlabel('Hands played')
    plt.ylabel('Agent stack')
    plt.legend(loc='upper left')
    plt.show()

    #simulate 20000 hands
    simulate(pokerTable, num_hands=20000, hands_between_buyin=100, hands_between_training=0, narrate_hands=False)

    features = []
    labels = []

    for p in players:
        features.extend(p.get_features())
        labels.extend(p.get_labels())

    features = np.array(features)
    labels = np.array(labels)

    #shuffle features/labels
    index = np.arange(len(labels))
    np.random.shuffle(index)
    features = features[index]
    labels = labels[index]

    #initialize regressors with default parameters
    regressors = {LinearRegression(): 'LinearRegression', 
                  Ridge(): 'Ridge',
                  Lasso(): 'Lasso',
                  RandomForestRegressor(): 'RandomForestRegressor',
                  GradientBoostingRegressor(): 'GradientBoostingRegressor'}
    
    for regressor in regressors:
        print('Cross-validating ' + regressors[regressor] + '...')
        print('R-squared(R^2):', np.mean(cross_val_score(regressor, features, labels)))
        print()
