module sender::PredictionPool {
    use std::vector;
    use std::string::{Self, String};
    use std::signer;
    use aptos_framework::timestamp;
    use aptos_framework::coin;
    use aptos_framework::account;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_std::table::{Self, Table};
    use std::error;
    use sender::MyOracleContractTest::{Self, PriceData};
    use move_stdlib::option;
    
    // Import AIToken module
    use aitoken::ai_token::AIToken;
    
    // Error codes
    const E_NOT_AUTHORIZED: u64 = 1;
    const E_INSUFFICIENT_BALANCE: u64 = 2;
    const E_POOL_NOT_FOUND: u64 = 3;
    const E_INVALID_BET_OPTION: u64 = 4;
    const E_POOL_NOT_ACTIVE: u64 = 5;
    const E_ALREADY_BET: u64 = 6;
    const E_POOL_NOT_CLOSED: u64 = 7;
    const E_POOL_ALREADY_SETTLED: u64 = 8;
    const E_ORACLE_ERROR: u64 = 9;
    const E_ZERO_WINNING_BETS: u64 = 10;
    
    // Constants
    const BET_OPTION_A: u8 = 1;
    const BET_OPTION_B: u8 = 2;
    
    const POOL_STATUS_ACTIVE: u8 = 1;
    const POOL_STATUS_LOCKED: u8 = 2;
    const POOL_STATUS_CLOSED: u8 = 3;
    const POOL_STATUS_SETTLED: u8 = 4;
    
    const FEE_PERCENTAGE: u64 = 100; // 1% fee, basis points
    const INITIAL_LIQUIDITY: u64 = 10000000000000; // 10000 tokens with 8 decimals (10000 * 10^8)

    // Prediction pool data structure
    struct Pool has store, drop {
        id: u64,
        asset_type: String,
        start_time: u64,
        lock_time: u64,
        end_time: u64,
        target_price: u64, // Target price in cents
        status: u8,
        title: String,
        option_a: String,
        option_b: String,
        reason: String,
        option_a_total: u64, // Total bet amount for option A
        option_b_total: u64, // Total bet amount for option B
        is_settled: bool,
        winning_option: u8,  // Winning option
        final_price: u64,    // Final price
        created_at: u64
    }
    
    // User bet record
    struct Bet has store, drop {
        user: address,
        pool_id: u64,
        option: u8,
        amount: u64,
        odds: u64,    // Odds at the time of betting, scaled by 10000
        reward_amount: u64,
        created_at: u64
    }
    
    // User bet info for returns from view functions
    struct BetInfo has copy, drop {
        pool_id: u64,
        option: u8,
        amount: u64,
        odds: u64
    }
    
    // Prediction pool state - stored in the contract account
    struct PredictionPoolState has key {
        owner: address,                    // Contract owner
        next_pool_id: u64,                 // Next pool ID
        pools: Table<u64, Pool>,           // Pool ID -> Pool information
        bets: Table<address, vector<Bet>>, // User address -> Bet records
        pool_bettors: Table<u64, vector<address>>, // Pool ID -> List of bettors
        
        // Event handling
        pool_creation_events: EventHandle<PoolCreationEvent>,
        bet_events: EventHandle<BetEvent>,
        pool_settlement_events: EventHandle<PoolSettlementEvent>,
        reward_events: EventHandle<RewardEvent>
    }
    
    // Event structures
    struct PoolCreationEvent has drop, store {
        pool_id: u64,
        asset_type: String,
        start_time: u64,
        lock_time: u64,
        end_time: u64,
        target_price: u64,
        title: String,
        creator: address
    }
    
    struct BetEvent has drop, store {
        user: address,
        pool_id: u64,
        option: u8,
        amount: u64,
        odds: u64,
        timestamp: u64
    }
    
    struct PoolSettlementEvent has drop, store {
        pool_id: u64,
        asset_type: String,
        final_price: u64,
        target_price: u64,
        winning_option: u8,
        option_a_total: u64,
        option_b_total: u64,
        timestamp: u64
    }
    
    // RewardEvent
    struct RewardEvent has drop, store {
        pool_id: u64,
        user: address,
        amount: u64,
        option: u8,
        timestamp: u64
    }

    struct PoolInfo has copy, drop {
        id: u64,
        asset_type: String,
        start_time: u64,
        lock_time: u64,
        end_time: u64,
        status: u8,
        target_price: u64,
        option_a_total: u64,
        option_b_total: u64,
        title: String,
        option_a: String,
        option_b: String,
        is_settled: bool,
        winning_option: u8,
        created_at: u64,
    }
    
    // Initialize contract
    public entry fun initialize(owner: &signer) {
        let owner_addr = signer::address_of(owner);
        
        // Create state
        let state = PredictionPoolState {
            owner: owner_addr,
            next_pool_id: 1,
            pools: table::new(),
            bets: table::new(),
            pool_bettors: table::new(),
            pool_creation_events: account::new_event_handle<PoolCreationEvent>(owner),
            bet_events: account::new_event_handle<BetEvent>(owner),
            pool_settlement_events: account::new_event_handle<PoolSettlementEvent>(owner),
            reward_events: account::new_event_handle<RewardEvent>(owner)
        };
        
        move_to(owner, state);
    }
    
    // Create a new prediction pool
    public entry fun create_pool(
        creator: &signer,
        asset_type: vector<u8>,
        start_time: u64,
        bet_duration: u64,
        lock_duration: u64,
        target_price: u64,
        title: vector<u8>,
        option_a: vector<u8>,
        option_b: vector<u8>,
        reason: vector<u8>
    ) acquires PredictionPoolState {
        let creator_addr = signer::address_of(creator);
        let state = borrow_global_mut<PredictionPoolState>(creator_addr);
        
        // Verify that the creator is the contract owner
        assert!(creator_addr == state.owner, error::permission_denied(E_NOT_AUTHORIZED));
        
        // Calculate lock time and end time
        let lock_time = start_time + bet_duration;
        let end_time = lock_time + lock_duration;
        
        // Create a new prediction pool
        let pool_id = state.next_pool_id;
        let pool = Pool {
            id: pool_id,
            asset_type: string::utf8(asset_type),
            start_time,
            lock_time,
            end_time,
            target_price,
            status: POOL_STATUS_ACTIVE,
            title: string::utf8(title),
            option_a: string::utf8(option_a),
            option_b: string::utf8(option_b),
            reason: string::utf8(reason),
            option_a_total: INITIAL_LIQUIDITY, // 10000 AIAPT
            option_b_total: INITIAL_LIQUIDITY, // 10000 AIAPT
            is_settled: false,
            winning_option: 0,
            final_price: 0,
            created_at: timestamp::now_seconds()
        };
        
        assert!(coin::balance<AIToken>(creator_addr) >= INITIAL_LIQUIDITY * 2, error::invalid_state(E_INSUFFICIENT_BALANCE));
        
        table::add(&mut state.pools, pool_id, pool);
        
        table::add(&mut state.pool_bettors, pool_id, vector::empty<address>());
        
        state.next_pool_id = pool_id + 1;
        
        event::emit_event(
            &mut state.pool_creation_events,
            PoolCreationEvent {
                pool_id,
                asset_type: string::utf8(asset_type),
                start_time,
                lock_time,
                end_time,
                target_price,
                title: string::utf8(title),
                creator: creator_addr
            }
        );
    }
    
    // User places a bet
    public entry fun place_bet(
        user: &signer,
        owner_addr: address,
        pool_id: u64,
        option: u8,
        amount: u64
    ) acquires PredictionPoolState {
        let user_addr = signer::address_of(user);
        let state = borrow_global_mut<PredictionPoolState>(owner_addr);
        
        // Verify that the pool exists
        assert!(table::contains(&state.pools, pool_id), error::not_found(E_POOL_NOT_FOUND));
        
        // Verify that the option is valid
        assert!(option == BET_OPTION_A || option == BET_OPTION_B, error::invalid_argument(E_INVALID_BET_OPTION));
        
        // Get pool information
        let pool = table::borrow_mut(&mut state.pools, pool_id);
        
        // Verify that the pool is active
        assert!(pool.status == POOL_STATUS_ACTIVE, error::invalid_state(E_POOL_NOT_ACTIVE));
        
        // Verify that the current time is within the betting period
        let now = timestamp::now_seconds();
        assert!(now >= pool.start_time && now < pool.lock_time, error::invalid_state(E_POOL_NOT_ACTIVE));
        
        // Check user's AIToken balance
        assert!(coin::balance<AIToken>(user_addr) >= amount, error::invalid_state(E_INSUFFICIENT_BALANCE));
        
        // Check if the user has already placed a bet on this pool
        if (table::contains(&state.bets, user_addr)) {
            let user_bets = table::borrow(&state.bets, user_addr);
            let len = vector::length(user_bets);
            
            let i = 0;
            while (i < len) {
                let bet = vector::borrow(user_bets, i);
                assert!(bet.pool_id != pool_id, error::already_exists(E_ALREADY_BET));
                i = i + 1;
            };
        } else {
            // If the user has no betting record, create an empty vector
            table::add(&mut state.bets, user_addr, vector::empty<Bet>());
        };
        
        // Update the pool's betting amount
        if (option == BET_OPTION_A) {
            pool.option_a_total = pool.option_a_total + amount;
        } else {
            pool.option_b_total = pool.option_b_total + amount;
        };
        
        // Calculate current odds and reward_amount
        let odds = calculate_odds(pool.option_a_total, pool.option_b_total, option);
        let reward_amount = amount * odds / 10000;
        
        // Create a bet record
        let bet = Bet {
            user: user_addr,
            pool_id,
            option,
            amount,
            odds,
            reward_amount,
            created_at: now
        };
        
        // Add to user's betting records
        let user_bets = table::borrow_mut(&mut state.bets, user_addr);
        vector::push_back(user_bets, bet);
        
        // Add user to the pool's bettor list
        let bettors = table::borrow_mut(&mut state.pool_bettors, pool_id);
        vector::push_back(bettors, user_addr);
        
        // Transfer AIToken directly to contract owner
        coin::transfer<AIToken>(user, owner_addr, amount);
        
        // Emit betting event
        event::emit_event(
            &mut state.bet_events,
            BetEvent {
                user: user_addr,
                pool_id,
                option,
                amount,
                odds,
                timestamp: now
            }
        );
    }
    
    // Update pool status - only owner can update pool status
    public entry fun update_pool_status(
        caller: &signer,
        owner_addr: address,
        pool_id: u64
    ) acquires PredictionPoolState {
        let caller_addr = signer::address_of(caller);
        let state = borrow_global_mut<PredictionPoolState>(owner_addr);
        
        // owner
        assert!(caller_addr == state.owner, error::permission_denied(E_NOT_AUTHORIZED));
        
        // Verify that the pool exists
        assert!(table::contains(&state.pools, pool_id), error::not_found(E_POOL_NOT_FOUND));
        
        let pool = table::borrow_mut(&mut state.pools, pool_id);
        let now = timestamp::now_seconds();
        
        // Update pool status based on current time
        if (pool.status == POOL_STATUS_ACTIVE && now >= pool.lock_time && now < pool.end_time) {
            // Change from active to locked
            pool.status = POOL_STATUS_LOCKED;
        } else if (pool.status == POOL_STATUS_LOCKED && now >= pool.end_time) {
            // Change from locked to closed
            pool.status = POOL_STATUS_CLOSED;
        };
        
        // Note: Removed automatic settlement - now settlement only happens when settle_pool is explicitly called
    }
    
    // Settle pool - only owner can settle pools
    public entry fun settle_pool(
        caller: &signer,
        owner_addr: address,
        pool_id: u64
    ) acquires PredictionPoolState {
        let caller_addr = signer::address_of(caller);
        let state = borrow_global<PredictionPoolState>(owner_addr);
        
        // only owner can settle pools
        assert!(caller_addr == state.owner, error::permission_denied(E_NOT_AUTHORIZED));
        
        // Verify pool exists and can be settled
        assert!(table::contains(&state.pools, pool_id), error::not_found(E_POOL_NOT_FOUND));
        let pool = table::borrow(&state.pools, pool_id);
        
        // Pool must be closed to be settled
        assert!(pool.status == POOL_STATUS_CLOSED, error::invalid_state(E_POOL_NOT_CLOSED));
        
        // Pool must not already be settled
        // assert!(!pool.is_settled, error::invalid_state(E_POOL_ALREADY_SETTLED));
        
        // Execute settlement with the owner
        settle_pool_internal(caller, owner_addr, pool_id);
    }
    
    // Internal settlement function
    fun settle_pool_internal(
        owner: &signer,
        owner_addr: address,
        pool_id: u64
    ) acquires PredictionPoolState {
        let state = borrow_global_mut<PredictionPoolState>(owner_addr);
        
        // Verify that the pool exists
        assert!(table::contains(&state.pools, pool_id), error::not_found(E_POOL_NOT_FOUND));
        
        let pool = table::borrow_mut(&mut state.pools, pool_id);
        
        // Verify that the pool is not settled
        assert!(!pool.is_settled, error::invalid_state(E_POOL_ALREADY_SETTLED));
        
        // Get oracle feed ID for the asset type
        let feed_id = get_feed_id_for_asset(&pool.asset_type);
        
        // Call the oracle to fetch price data
        MyOracleContractTest::fetch_price(owner, feed_id);
        
        // Get the price data returned by the oracle
        let price_data_opt = MyOracleContractTest::get_price_data(owner_addr);
        
        // Extract the price data
        let price_data = option::extract(&mut price_data_opt);
        let price_u256 = price_data.price;
        // Convert u256 price to u64 cents (assuming the original price unit is in dollars, multiply by 100 to get cents)
        let price_in_cents = ((price_u256 / 10000000000000000) as u64); // Divide by 10^16 to get cents
        
        // Set the final price
        pool.final_price = price_in_cents;
        
        // Determine the winning option
        if (price_in_cents > pool.target_price) {
            pool.winning_option = BET_OPTION_A;  // Price is above target, option A wins
        } else if (price_in_cents < pool.target_price) {
            pool.winning_option = BET_OPTION_B;  // Price is below target, option B wins
        } else {
            pool.winning_option = 0;  // Price equals target, draw
        };
        
        // Distribute rewards
        if (pool.winning_option != 0) {
            // If there is a clear winner, distribute rewards
            // distribute_rewards(owner, state, pool);
            // Get all bettors for this pool
            let bettors = table::borrow(&state.pool_bettors, pool.id);
            let bettors_count = vector::length(bettors);
            
            // Calculate platform fee rate
            let fee_percentage = FEE_PERCENTAGE; // Assume FEE_PERCENTAGE is expressed in basis points, e.g., 200 means 2%
            
            // Iterate through all bettors, find winners and distribute rewards
            let i = 0;
            while (i < bettors_count) {
                let bettor_address = *vector::borrow(bettors, i);
                
                if (table::contains(&state.bets, bettor_address)) {
                    let user_bets = table::borrow(&state.bets, bettor_address);
                    let bet_count = vector::length(user_bets);
                    
                    let j = 0;
                    while (j < bet_count) {
                        let bet = vector::borrow(user_bets, j);
                        
                        // If this is a bet for this pool and the bettor bet on the winning option
                        if (bet.pool_id == pool.id && bet.option == pool.winning_option) {
                            // Use the stored reward amount
                            let reward_amount = bet.reward_amount; 
                            
                            // Calculate the fee
                            let fee_amount = (reward_amount * fee_percentage) / 10000; // Calculate the fee
                            reward_amount = reward_amount - fee_amount; // Deduct the fee
                            
                            // Ensure the transfer amount is greater than zero
                            if (reward_amount > 0) {
                                coin::transfer<AIToken>(owner, bettor_address, reward_amount);
                                
                                // Emit reward distribution event
                                event::emit_event(
                                    &mut state.reward_events,
                                    RewardEvent {
                                        pool_id: pool.id,
                                        user: bettor_address,
                                        amount: reward_amount,
                                        option: pool.winning_option,
                                        timestamp: timestamp::now_seconds()
                                    }
                                );
                            };
                        };
                        
                        j = j + 1;
                    };
                };
                
                i = i + 1;
            };
        } else {
            // If it's a draw, refund all bets
            // refund_all_bets(owner, state, pool);
            let bettors = table::borrow(&state.pool_bettors, pool.id);
            let bettors_count = vector::length(bettors);
            
            let i = 0;
            while (i < bettors_count) {
                let bettor_address = *vector::borrow(bettors, i);
                
                if (table::contains(&state.bets, bettor_address)) {
                    let user_bets = table::borrow(&state.bets, bettor_address);
                    let bet_count = vector::length(user_bets);
                    
                    let j = 0;
                    while (j < bet_count) {
                        let bet = vector::borrow(user_bets, j);
                        
                        if (bet.pool_id == pool.id) {
                            coin::transfer<AIToken>(owner, bettor_address, bet.amount);
                            
                            event::emit_event(
                                &mut state.reward_events,
                                RewardEvent {
                                    pool_id: pool.id,
                                    user: bettor_address,
                                    amount: bet.amount,
                                    option: 0, // 0 it's a draw, refund all bets
                                    timestamp: timestamp::now_seconds()
                                }
                            );
                        };
                        
                        j = j + 1;
                    };
                };
                
                i = i + 1;
            };
        };
        
        // Update pool status
        pool.status = POOL_STATUS_SETTLED;
        pool.is_settled = true;
        
        // Emit settlement event
        event::emit_event(
            &mut state.pool_settlement_events,
            PoolSettlementEvent {
                pool_id: pool.id,
                asset_type: pool.asset_type,
                final_price: pool.final_price,
                target_price: pool.target_price,
                winning_option: pool.winning_option,
                option_a_total: pool.option_a_total,
                option_b_total: pool.option_b_total,
                timestamp: timestamp::now_seconds()
            }
        );
    }
    

    fun distribute_rewards(
        owner: &signer,
        state: &mut PredictionPoolState,
        pool: &Pool
    ) {
        // Get all bettors for this pool
        let bettors = table::borrow(&state.pool_bettors, pool.id);
        let bettors_count = vector::length(bettors);
        
        // Calculate platform fee rate
        let fee_percentage = FEE_PERCENTAGE; // Assume FEE_PERCENTAGE is expressed in basis points, e.g., 200 means 2%
        
        // Iterate through all bettors, find winners and distribute rewards
        let i = 0;
        while (i < bettors_count) {
            let bettor_address = *vector::borrow(bettors, i);
            
            if (table::contains(&state.bets, bettor_address)) {
                let user_bets = table::borrow(&state.bets, bettor_address);
                let bet_count = vector::length(user_bets);
                
                let j = 0;
                while (j < bet_count) {
                    let bet = vector::borrow(user_bets, j);
                    
                    // If this is a bet for this pool and the bettor bet on the winning option
                    if (bet.pool_id == pool.id && bet.option == pool.winning_option) {
                        // Use the stored reward amount
                        let reward_amount = bet.reward_amount; 
                        
                        // Calculate the fee
                        let fee_amount = (reward_amount * fee_percentage) / 10000; // Calculate the fee
                        reward_amount = reward_amount - fee_amount; // Deduct the fee
                        
                        // Ensure the transfer amount is greater than zero
                        if (reward_amount > 0) {
                            coin::transfer<AIToken>(owner, bettor_address, reward_amount);
                            
                            // Emit reward distribution event
                            event::emit_event(
                                &mut state.reward_events,
                                RewardEvent {
                                    pool_id: pool.id,
                                    user: bettor_address,
                                    amount: reward_amount,
                                    option: pool.winning_option,
                                    timestamp: timestamp::now_seconds()
                                }
                            );
                        };
                    };
                    
                    j = j + 1;
                };
            };
            
            i = i + 1;
        };
    }
    
    // refund_all_bets
    fun refund_all_bets(
        owner: &signer,
        state: &mut PredictionPoolState,
        pool: &Pool
    ) {
        let bettors = table::borrow(&state.pool_bettors, pool.id);
        let bettors_count = vector::length(bettors);
        
        let i = 0;
        while (i < bettors_count) {
            let bettor_address = *vector::borrow(bettors, i);
            
            if (table::contains(&state.bets, bettor_address)) {
                let user_bets = table::borrow(&state.bets, bettor_address);
                let bet_count = vector::length(user_bets);
                
                let j = 0;
                while (j < bet_count) {
                    let bet = vector::borrow(user_bets, j);
                    
                    if (bet.pool_id == pool.id) {
                        coin::transfer<AIToken>(owner, bettor_address, bet.amount);
                        
                        event::emit_event(
                            &mut state.reward_events,
                            RewardEvent {
                                pool_id: pool.id,
                                user: bettor_address,
                                amount: bet.amount,
                                option: 0, // 0 it's a draw, refund all bets
                                timestamp: timestamp::now_seconds()
                            }
                        );
                    };
                    
                    j = j + 1;
                };
            };
            
            i = i + 1;
        };
    }
    
    // Calculate current odds
    fun calculate_odds(option_a_amount: u64, option_b_amount: u64, selected_option: u8): u64 {
        // Initialize default odds to 1:1
        if (option_a_amount == 0 && option_b_amount == 0) {
            return 10000
        };
        
        // Ensure each option has at least 1 unit to avoid division by zero
        let a_amount = if (option_a_amount == 0) { 1 } else { option_a_amount };
        let b_amount = if (option_b_amount == 0) { 1 } else { option_b_amount };
        
        let total_amount = a_amount + b_amount;
        
        if (selected_option == BET_OPTION_A) {
            (total_amount * 10000) / a_amount
        } else {
            (total_amount * 10000) / b_amount
        }
    }
    
    // Get the corresponding Feed ID based on asset type
    fun get_feed_id_for_asset(asset_type: &String): vector<u8> {
        // Fixed Feed IDs for different assets
        if (string::internal_check_utf8(string::bytes(asset_type)) && string::length(asset_type) >= 7) {
            let prefix = string::sub_string(asset_type, 0, 7);
            
            if (prefix == string::utf8(b"BTC/USD")) {
                return b"0x01a0b4d920000332000000000000000000000000000000000000000000000000"
            } else if (prefix == string::utf8(b"ETH/USD")) {
                return b"0x01d585327c000332000000000000000000000000000000000000000000000000" 
            } else if (prefix == string::utf8(b"APT/USD")) {
                return b"0x011e22d6bf000332000000000000000000000000000000000000000000000000"
            } else if (prefix == string::utf8(b"LINK/USD")) {
                return b"0x0101199b3b000332000000000000000000000000000000000000000000000000"
            }
        };
        
        // Default to BTC/USD if no match
        b"0x01a0b4d920000332000000000000000000000000000000000000000000000000"
    }
    
    // View function - Get pool information
    #[view]
    public fun get_pool_info(
        owner_addr: address,
        pool_id: u64
    ): (String, u64, u64, u64, u8, u64, u64, u64, String, String, String, bool, u8, u64) 
        acquires PredictionPoolState
    {
        let state = borrow_global<PredictionPoolState>(owner_addr);
        assert!(table::contains(&state.pools, pool_id), error::not_found(E_POOL_NOT_FOUND));
        
        let pool = table::borrow(&state.pools, pool_id);
        
        (
            pool.asset_type,
            pool.start_time,
            pool.lock_time,
            pool.end_time,
            pool.status,
            pool.target_price,
            pool.option_a_total,
            pool.option_b_total,
            pool.title,
            pool.option_a,
            pool.option_b,
            pool.is_settled,
            pool.winning_option,
            pool.created_at
        )
    }
    
    // View function - Get current odds
    #[view]
    public fun get_current_odds(
        owner_addr: address,
        pool_id: u64,
        option: u8
    ): u64 acquires PredictionPoolState {
        let state = borrow_global<PredictionPoolState>(owner_addr);
        assert!(table::contains(&state.pools, pool_id), error::not_found(E_POOL_NOT_FOUND));
        
        let pool = table::borrow(&state.pools, pool_id);
        assert!(option == BET_OPTION_A || option == BET_OPTION_B, error::invalid_argument(E_INVALID_BET_OPTION));
        
        calculate_odds(pool.option_a_total, pool.option_b_total, option)
    }
    
    // View function - Get all active pools
    #[view]
    public fun get_active_pools(owner_addr: address): vector<u64> acquires PredictionPoolState {
        let state = borrow_global<PredictionPoolState>(owner_addr);
        let active_pools = vector::empty<u64>();
        
        let i = 1;
        while (i < state.next_pool_id) {
            if (table::contains(&state.pools, i)) {
                let pool = table::borrow(&state.pools, i);
                
                if (pool.status == POOL_STATUS_ACTIVE) {
                    vector::push_back(&mut active_pools, i);
                };
            };
            
            i = i + 1;
        };
        
        active_pools
    }
    
    // View function - Get user betting records
    #[view]
    public fun get_user_bets(
        owner_addr: address,
        user_addr: address
    ): vector<BetInfo> acquires PredictionPoolState {
        let state = borrow_global<PredictionPoolState>(owner_addr);
        let result = vector::empty<BetInfo>();
        
        if (table::contains(&state.bets, user_addr)) {
            let user_bets = table::borrow(&state.bets, user_addr);
            let len = vector::length(user_bets);
            
            let i = 0;
            while (i < len) {
                let bet = vector::borrow(user_bets, i);
                
                let bet_info = BetInfo {
                    pool_id: bet.pool_id,
                    option: bet.option,
                    amount: bet.amount,
                    odds: bet.odds
                };
                
                vector::push_back(&mut result, bet_info);
                
                i = i + 1;
            };
        };
        
        result
    }
    
    // View function - Get pools by status
    #[view]
    public fun get_pools_by_status(owner_addr: address, status: u8): vector<u64> 
        acquires PredictionPoolState 
    {
        let state = borrow_global<PredictionPoolState>(owner_addr);
        let filtered_pools = vector::empty<u64>();
        
        let i = 1;
        while (i < state.next_pool_id) {
            if (table::contains(&state.pools, i)) {
                let pool = table::borrow(&state.pools, i);
                
                if (pool.status == status) {
                    vector::push_back(&mut filtered_pools, i);
                };
            };
            
            i = i + 1;
        };
        
        filtered_pools
    }
    
    // View function - Get contract owner address
    #[view]
    public fun get_owner(owner_addr: address): address acquires PredictionPoolState {
        let state = borrow_global<PredictionPoolState>(owner_addr);
        state.owner
    }

    #[view]
    public fun get_all_pools_info(owner_addr: address): vector<PoolInfo> 
        acquires PredictionPoolState {
        let state = borrow_global<PredictionPoolState>(owner_addr);
        let all_pools_info = vector::empty<PoolInfo>();
        
        let i = 1;
        while (i < state.next_pool_id) {
            if (table::contains(&state.pools, i)) {
                let pool = table::borrow(&state.pools, i);
                vector::push_back(&mut all_pools_info, PoolInfo {
                    id: pool.id,
                    asset_type: pool.asset_type,
                    start_time: pool.start_time,
                    lock_time: pool.lock_time,
                    end_time: pool.end_time,
                    status: pool.status,
                    target_price: pool.target_price,
                    option_a_total: pool.option_a_total,
                    option_b_total: pool.option_b_total,
                    title: pool.title,
                    option_a: pool.option_a,
                    option_b: pool.option_b,
                    is_settled: pool.is_settled,
                    winning_option: pool.winning_option,
                    created_at: pool.created_at
                });
            };
            
            i = i + 1;
        };
        
        all_pools_info
    }
}
