module allin_addr::allin_bet {
    use std::signer;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::randomness;
    use std::event;
    use std::vector;
    use std::option::{Self, Option};

    struct PendingGame has store {
        player_address: address,
        entry_fee: u64,
        first_number: u8
    }

    struct GamePool has key {
        pool: Coin<AptosCoin>,
        target_number1: u8,
        target_number2: u8,
        min_entry: u64,
        pending_games: vector<PendingGame>
    }
    
    struct GameRegistry has key {
        games: vector<address>
    }

    // Event to emit when first number is drawn
    #[event]  
    struct FirstNumberDrawn has drop, store {
        player: address,
        first_number: u8
    }

    // Event to emit game results
    #[event]  
    struct GameResult has drop, store {
        player: address,
        number1: u8,
        number2: u8,
        player_product: u64,
        target_product: u64,
        is_win: bool
    }

    // Error codes
    const ENOT_OWNER: u64 = 1;
    const EINSUFFICIENT_BALANCE: u64 = 2;
    const EINVALID_TARGET: u64 = 3;
    const EINVALID_ENTRY: u64 = 4;
    const EGAME_NOT_EXISTS: u64 = 5;
    const EREGISTRY_NOT_INITIALIZED: u64 = 6;
    const EGAME_NOT_PENDING: u64 = 7;

    fun init_module(contract: &signer){
        let creator_addr = signer::address_of(contract);
        assert!(creator_addr == @allin_addr, ENOT_OWNER);
        
        if (!exists<GameRegistry>(creator_addr)) {
            move_to(contract, GameRegistry {
                games: vector::empty<address>()
            });
        }
    }


    /// Creates a game pool (owner only)
    public entry fun create_game_pool(
        owner: &signer,
        initial_deposit: u64,
        target_number1: u8,
        target_number2: u8,
        min_entry: u64
    ) acquires GameRegistry { 
        assert!(target_number1 < 14, EINVALID_TARGET);
        assert!(target_number2 < 14, EINVALID_TARGET);
        assert!(min_entry > 0, EINVALID_ENTRY);

        let owner_address = signer::address_of(owner);
        let pool = coin::withdraw<AptosCoin>(owner, initial_deposit);
        
        move_to(owner, GamePool {
            pool,
            target_number1,
            target_number2,
            min_entry,
            pending_games: vector::empty<PendingGame>() 
        });

        assert!(exists<GameRegistry>(@allin_addr), EREGISTRY_NOT_INITIALIZED);
        let registry = &mut GameRegistry[@allin_addr];
        registry.games.push_back(owner_address);
    }

    fun generate_random_number(): u8 {
        let random_number = randomness::u64_range(0, 14);
        (random_number as u8)
    }

    fun find_pending_game(player_address: address, pending_games: &vector<PendingGame>): (bool, u64) {
        let i = 0;
        let len = vector::length(pending_games);
        while (i < len) {
            let game = vector::borrow(pending_games, i);
            if (game.player_address == player_address) {
                return (true, i)
            };
            i = i + 1;
        };
        (false, 0)
    }

    /// first step: player joins the game
    #[randomness]
    entry fun join_game(
        player: &signer,
        game_owner: address,
        entry_fee: u64
    ) acquires GamePool {
        
        assert!(exists<GamePool>(game_owner), EGAME_NOT_EXISTS);
        
        let game = borrow_global_mut<GamePool>(game_owner);
        assert!(entry_fee >= game.min_entry, EINVALID_ENTRY);
        
        
        let player_coin = coin::withdraw<AptosCoin>(player, entry_fee);
        coin::merge(&mut game.pool, player_coin);

        // Draw the first random number
        let number_drawn1 = generate_random_number();
        let player_address = signer::address_of(player);
        
        // Emit event to notify user about the first random number
        event::emit(FirstNumberDrawn {
            player: player_address,
            first_number: number_drawn1
        });
        
        // Save game state, waiting for player to decide whether to continue or exit
        vector::push_back(&mut game.pending_games, PendingGame {
            player_address: player_address,
            entry_fee,
            first_number: number_drawn1
        });
    }

    /// Step two (Option 1): After seeing the first random number, player decides to continue and draw the second random number
    #[randomness]
    entry fun continue_game(
        player: &signer,
        game_owner: address
    ) acquires GamePool {
        let player_address = signer::address_of(player);
        
        assert!(exists<GamePool>(game_owner), EGAME_NOT_EXISTS);
        let game = borrow_global_mut<GamePool>(game_owner);
        
        // Find player's pending game
        let (found, index) = find_pending_game(player_address, &game.pending_games);
        assert!(found, EGAME_NOT_PENDING);
        
        // Get the first random number and remove pending game
        let PendingGame { player_address: _, entry_fee: _, first_number } = vector::remove(&mut game.pending_games, index);
        
        // Draw the second random number
        let number_drawn2 = generate_random_number();
        
        // Calculate the result
        let player_product = (first_number as u64) * (number_drawn2 as u64);
        let target_product = (game.target_number1 as u64) * (game.target_number2 as u64);
        
        // Determine win or loss
        let is_win = player_product > target_product;
        event::emit(GameResult {
            player: player_address,
            number1: first_number,
            number2: number_drawn2,
            player_product,
            target_product,
            is_win
        });
        
        // If player wins, distribute the reward
        if (is_win) {
            let pool_balance = coin::value(&game.pool);
            let prize = pool_balance * 20 / 100;
            
            assert!(prize <= pool_balance, EINSUFFICIENT_BALANCE);
            
           
            let owner_share = prize * 10 / 100;
            
            let player_share = prize - owner_share;
            
            
            let owner_coins = coin::extract(&mut game.pool, owner_share);
            coin::deposit(game_owner, owner_coins);
            
           
            let player_coins = coin::extract(&mut game.pool, player_share);
            coin::deposit(player_address, player_coins);
        }
    }

    /// Step two (Option 2): After seeing the first random number, player decides to quit the game
    public entry fun quit_game(
        player: &signer,
        game_owner: address
    ) acquires GamePool {
        let player_address = signer::address_of(player);
        
        assert!(exists<GamePool>(game_owner), EGAME_NOT_EXISTS);
        let game = borrow_global_mut<GamePool>(game_owner);
        
        // Find player's pending game
        let (found, index) = find_pending_game(player_address, &game.pending_games);
        assert!(found, EGAME_NOT_PENDING);
        
        // Remove pending game and refund part of the entry fee
        let PendingGame { player_address: _, entry_fee, first_number: _ } = vector::remove(&mut game.pending_games, index);
        
        // Refund 40% of the entry fee
        let refund_amount = entry_fee * 40 / 100;
        let refund_coins = coin::extract(&mut game.pool, refund_amount);
        coin::deposit(player_address, refund_coins);
    }

    /// Withdraw funds from the pool (owner only)
    public entry fun withdraw_pool(
        owner: &signer,
        amount: u64
    ) acquires GamePool {
        let owner_address = signer::address_of(owner);
        assert!(exists<GamePool>(owner_address), ENOT_OWNER);
        
        let game = borrow_global_mut<GamePool>(owner_address);
        let coins = coin::extract(&mut game.pool, amount);
        coin::deposit(owner_address, coins);
    }

    // Query game information
    #[view]
    public fun get_game_info(game_owner: address): (u8, u8, u64, u64) acquires GamePool {
        let game = borrow_global<GamePool>(game_owner);
        (
            game.target_number1,
            game.target_number2,
            game.min_entry,
            coin::value(&game.pool)
        )
    }

    // Query the balance of the game pool
    #[view]
    public fun get_all_game_pools(): vector<address> acquires GameRegistry {
        assert!(exists<GameRegistry>(@allin_addr), EREGISTRY_NOT_INITIALIZED);
        
        GameRegistry[@allin_addr].games
    }

    // Query if player has a pending game (waiting to continue or exit)
    #[view]
    public fun has_pending_game(player: address, game_owner: address): bool acquires GamePool {
        assert!(exists<GamePool>(game_owner), EGAME_NOT_EXISTS);
        
        let game = borrow_global<GamePool>(game_owner);
        let (found, _) = find_pending_game(player, &game.pending_games);
        found
    }

    #[view]
    public fun get_first_number(player: address, game_owner: address): u8 acquires GamePool {
        assert!(exists<GamePool>(game_owner), EGAME_NOT_EXISTS);
        
        let game = borrow_global<GamePool>(game_owner);
        
        let i = 0;
        let len = vector::length(&game.pending_games);
        
        
        while (i < len) {
            let pending_game = vector::borrow(&game.pending_games, i);
            if (pending_game.player_address == player) {
                return pending_game.first_number
            };
            i = i + 1;
        };
    
        255
    }
}

