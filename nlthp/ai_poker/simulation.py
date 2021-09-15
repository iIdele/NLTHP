

from ai_poker.player import Player


def simulate(table, num_hands, hands_before_training=0, hands_between_training=0, hands_between_buyin=0, narrate_hands=False):
    """

    This is the helper function used for simulating Poker games
    for training AI Poker Agents.

    In this function AI Poker Agents that are part of a Poker Table are
    trained according to parameters entered.

    ...

    Parameters
    ----------
    table : Table
        Poker table used for game simulation
    num_hands : int
        total number of hands to simulate 
    hands_before_training : int
        number of hands simulated before Agents start learning,
        this is because initially they will perform random actions
        from which we do not want them to learn
    hands_between_training : int 
        number of hands between training players
    hands_between_buyin : int 
        number of hands between agent are allowed to buy in again.
        Buy ins are necessary to allow the simualtion to go on until
        the designated number of hands are simulated
    narrate_hands : bool
        comments of hands simulation are outputted to standard output
        according to this value
    """

    # hands simulated interval between outputting current number of hands simulated
    PRINT_HANDS_INTERVAL = 200

    print("Poker hands simulation starting...")
    print(num_hands, 'hands will be simulated between agents.\n')

    players = table.get_players()

    # holds chips_amount that players have had throughtout the entire game
    chips_amount = [[] for player in players]

    # get max amount of buy in for table
    max_buy_in = table.get_blinds_and_buyin()[-1]

    # limit player stack according to max_buy_in table parameter
    for player in players:
        # cash out to initialise stack from 0
        player.cash_out()
        if player.get_stack() < max_buy_in:
            player.buy_chips(max_buy_in)

    # next hand players will train
    next_train = hands_before_training  
    if hands_before_training == 0:
        next_train = hands_between_training

    # next hand players will buy-in    
    next_buy_in = hands_between_buyin  
   
    # simulate one hand at a time
    for hand in range(1, num_hands + 1):

        if hand % 200 == 0:
            print(hand, 'hands simulated.')

        # train agents
        if hand == next_train:
            print('Agents are training...')
            for player in players:
                player.train_player()
            next_train = hand + hands_between_training
            print('Complete.')

        # let eliminated agents buy-in again
        if hand == next_buy_in:
            if narrate_hands:
                print('Agents are buying in again...')
            for player in players:
                player.cash_out()
                if player.get_stack() < max_buy_in:
                    player.buy_chips(max_buy_in)
            next_buy_in = hand + hands_between_buyin

        if narrate_hands:
            print('Hand', hand)
        
        # simulate hand between agents
        played = table.play_hand(narrate_hands=narrate_hands)

        # if all agents but one are eliminated let them buy-in again
        if not played:
            if next_buy_in == hand + hands_between_buyin:
                print('All but one Agent have no chips left.')
                # agents buy-in and continue simulation
                break
                
            if narrate_hands:
                print('Poker Game over.')
                # find only agent with chips left (winner)
                for player in players:
                    if (player.get_stack() != 0):
                        print(player.get_name() + " is the winner.")
                break
            next_buy_in = hand

        else:
            # record chips amount of each player after each hand
            for i in range(len(players)):
                chips_amount[i].append(players[i].get_chips_amount())

    print('Simulation complete.\n')
    return chips_amount
