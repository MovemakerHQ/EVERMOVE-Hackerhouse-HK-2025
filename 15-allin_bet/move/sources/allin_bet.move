module allin_addr::allin_bet {
    use std::signer;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::randomness;
    use std::event;
    use std::vector;
    use std::option::{Self, Option};

    struct GamePool has key {
        pool: Coin<AptosCoin>,
        target_number1: u8,
        target_number2: u8,
        min_entry: u64
    }
    
   
    struct GameRegistry has key {
        games: vector<address>
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
            min_entry
        });

        
        assert!(exists<GameRegistry>(@allin_addr), EREGISTRY_NOT_INITIALIZED);

        let registry = &mut GameRegistry[@allin_addr];
        registry.games.push_back(owner_address);
    }

    fun generate_random_number(): u8 {
        let random_number = randomness::u64_range(0, 14);
        (random_number as u8)
    }

    // Participates in a game (requires specifying the game owner's address)
    #[randomness]
    entry fun join_game(
        player: &signer,
        game_owner: address,
        entry_fee: u64
    ) acquires GamePool {
        // Make sure the game exists
        assert!(exists<GamePool>(game_owner), EGAME_NOT_EXISTS);
        
        let game = borrow_global_mut<GamePool>(game_owner);
        
        // Validate entry fee
        assert!(entry_fee >= game.min_entry, EINVALID_ENTRY);
        
        // Deduct the player's fee
        let player_coin = coin::withdraw<AptosCoin>(player, entry_fee);
        coin::merge(&mut game.pool, player_coin);

        // Generate two random numbers
        let number_drawn1 = generate_random_number();
        let number_drawn2 = generate_random_number();
        
        // Calculate products
        let player_product = (number_drawn1 as u64) * (number_drawn2 as u64);
        let target_product = (game.target_number1 as u64) * (game.target_number2 as u64);
        
        // Emit event with game result
        let is_win = player_product > target_product;
        event::emit(GameResult {
            player: signer::address_of(player),
            number1: number_drawn1,
            number2: number_drawn2,
            player_product,
            target_product,
            is_win
        });
        
        // Draw logic - player wins if their product is larger
        if (is_win) {
            let pool_balance = coin::value(&game.pool);
            let prize = pool_balance * 20 / 100; // 20% reward
            
            assert!(prize <= pool_balance, EINSUFFICIENT_BALANCE);
            
            let prize_coins = coin::extract(&mut game.pool, prize);
            coin::deposit(signer::address_of(player), prize_coins);
        }
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
}

