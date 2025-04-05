module aitoken::ai_token {
    use std::signer;
    use std::string::{Self, String};
    use aptos_framework::coin::{Self, BurnCapability, FreezeCapability, MintCapability};
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_std::type_info;
    use std::option;
    use std::vector;
    use aptos_framework::account;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::timestamp;


    struct AIToken has key {}

    struct Capabilities has key {
        burn_cap: BurnCapability<AIToken>,
        freeze_cap: FreezeCapability<AIToken>,
        mint_cap: MintCapability<AIToken>
    }

    // Structure to mark whether the token metadata has been initialized
    struct TokenMetadata has key {
        initialized: bool
    }

    struct TokenIconURI has key {
        uri: String
    }

    struct AirdropEvent has drop, store {
        user: address,
        amount: u64,
        timestamp: u64
    }

    struct ClaimRecord has copy, drop, store {
        user: address,
        last_claim_time: u64
    }

    // Record which addresses have claimed the airdrop
    struct AirdropRecords has key {
        claimed: vector<address>,
        airdrop_events: EventHandle<AirdropEvent>
    }

    // last claim times
    struct AirdropLastRecords has key {
        last_claim_times: vector<ClaimRecord>,
        airdrop_events: EventHandle<AirdropEvent>
    }

    const DECIMALS: u8 = 8;
    const TOTAL_SUPPLY: u64 = 20000000000000000; // 200 million, 8 decimal places
    const DEFAULT_AIRDROP_AMOUNT: u64 = 50000000000; // 500 tokens (500 * 10^8)
    const SECONDS_PER_DAY: u64 = 86400;
    const ENO_CAPABILITIES: u64 = 1;
    const ENO_PERMISSIONS: u64 = 2;
    const E_ALREADY_CLAIMED: u64 = 3;


    fun init_module(sender: &signer) {
        let (burn_cap, freeze_cap, mint_cap) = coin::initialize<AIToken>(
            sender,
            string::utf8(b"AI.APT"),
            string::utf8(b"AIAPT"),
            DECIMALS,
            true
        );

        // Set the token icon and metadata URI
        move_to(sender, TokenIconURI {
          uri: string::utf8(b"https://github.com/AIAPT/aitoken/blob/main/logo.png")
        });
        
        // Initialize airdrop records
        move_to(sender, AirdropRecords {
            claimed: vector::empty<address>(),
            airdrop_events: account::new_event_handle<AirdropEvent>(sender)
        });

        // Initialize last claim airdrop records
        move_to(sender, AirdropLastRecords {
            last_claim_times: vector::empty<ClaimRecord>(),
            airdrop_events: account::new_event_handle<AirdropEvent>(sender)
        });

        move_to(sender, Capabilities {
            burn_cap,
            freeze_cap,
            mint_cap
        });
    }

    // mint - Only the contract owner can mint tokens
    public entry fun mint(
        admin: &signer,
        amount: u64,
        recipient: address
    ) acquires Capabilities {
        let admin_addr = signer::address_of(admin);
        assert!(exists<Capabilities>(admin_addr), ENO_CAPABILITIES);

        // Ensure the recipient is registered for the token
        if (!coin::is_account_registered<AIToken>(recipient)) {
            if (admin_addr == recipient) {
                coin::register<AIToken>(admin);
            };
        };

        if (coin::is_account_registered<AIToken>(recipient)) {
            let caps = borrow_global<Capabilities>(admin_addr);
            let coins = coin::mint(amount, &caps.mint_cap);
            coin::deposit(recipient, coins);
        };
    }

    

    // transfer - Users transfer tokens to other users
    public entry fun transfer(
        from: &signer,
        to: address,
        amount: u64
    ) {
        // Ensure the recipient is registered for the token
        assert!(coin::is_account_registered<AIToken>(to), ENO_PERMISSIONS);
        coin::transfer<AIToken>(from, to, amount);
    }

    // Users claim token airdrop (500 AIAPT)
    public entry fun claim_airdrop(
        user: &signer,
        owner_addr: address
    ) acquires Capabilities, AirdropRecords {
        let user_addr = signer::address_of(user);
        
        // Ensure the user is registered for the token
        if (!coin::is_account_registered<AIToken>(user_addr)) {
            coin::register<AIToken>(user);
        };

        // Check if the user has already claimed
        let airdrop_records = borrow_global_mut<AirdropRecords>(owner_addr);
        let claimed = &airdrop_records.claimed;

        let already_claimed = false;
        let i = 0;
        let len = vector::length(claimed);
        while (i < len) {
            if (vector::borrow(claimed, i) == &user_addr) {
                already_claimed = true;
                break;
            };
            i = i + 1;
        };

        assert!(!already_claimed, E_ALREADY_CLAIMED);

        // owner_addr Capabilities 
        assert!(exists<Capabilities>(owner_addr), ENO_CAPABILITIES);
        let caps = borrow_global<Capabilities>(owner_addr);
        let coins = coin::mint(DEFAULT_AIRDROP_AMOUNT, &caps.mint_cap);
        coin::deposit(user_addr, coins);
        
        vector::push_back(&mut airdrop_records.claimed, user_addr);
        
        event::emit_event(
            &mut airdrop_records.airdrop_events,
            AirdropEvent {
                user: user_addr,
                amount: DEFAULT_AIRDROP_AMOUNT,
                timestamp: aptos_framework::timestamp::now_seconds()
            }
        );
    }

    // Users claim token airdrop (500 AIAPT)
    public entry fun everyday_claim_airdrop(
        user: &signer,
        owner_addr: address
    ) acquires Capabilities, AirdropRecords, AirdropLastRecords {
        let user_addr = signer::address_of(user);
        
        // Ensure the user is registered for the token
        if (!coin::is_account_registered<AIToken>(user_addr)) {
            coin::register<AIToken>(user);
        };

        // Check if the user has already claimed
        let airdrop_records = borrow_global_mut<AirdropRecords>(owner_addr);
        let airdrop_last_records = borrow_global_mut<AirdropLastRecords>(owner_addr);
        let now = timestamp::now_seconds();
        let current_utc_zero = now - (now % SECONDS_PER_DAY);
        let claimed = &airdrop_records.claimed;

        let already_claimed = false;
        let len = vector::length(claimed);


        // Check if the user has claimed within the last 24 hours
        let last_claim_record = vector::length(&airdrop_last_records.last_claim_times);
        let i = 0;
        let found = false;
        while (i < last_claim_record) {
            let claim_record = *vector::borrow(&airdrop_last_records.last_claim_times, i);
            let last_utc_zero = claim_record.last_claim_time - (claim_record.last_claim_time % SECONDS_PER_DAY);
            if (claim_record.user == user_addr) {
                assert!(last_utc_zero < current_utc_zero, E_ALREADY_CLAIMED);
                claim_record.last_claim_time = now;
                found = true;
                break;
            };
            i = i + 1;
        };

        // If the user hasn't claimed before, add a new record
        if (!found) {
            vector::push_back(&mut airdrop_last_records.last_claim_times, ClaimRecord {
                user: user_addr,
                last_claim_time: now,
            });
        };


        // owner_addr Capabilities 
        assert!(exists<Capabilities>(owner_addr), ENO_CAPABILITIES);
        let caps = borrow_global<Capabilities>(owner_addr);
        let coins = coin::mint(DEFAULT_AIRDROP_AMOUNT, &caps.mint_cap);
        coin::deposit(user_addr, coins);
        
        vector::push_back(&mut airdrop_records.claimed, user_addr);
        
        event::emit_event(
            &mut airdrop_records.airdrop_events,
            AirdropEvent {
                user: user_addr,
                amount: DEFAULT_AIRDROP_AMOUNT,
                timestamp: aptos_framework::timestamp::now_seconds()
            }
        );

        event::emit_event(
            &mut airdrop_last_records.airdrop_events,
            AirdropEvent {
                user: user_addr,
                amount: DEFAULT_AIRDROP_AMOUNT,
                timestamp: now
            }
        );
    }

    // balance - Query user balance
    #[view]
    public fun balance(owner: address): u64 {
        coin::balance<AIToken>(owner)
    }

    // register - Users register for the token themselves
    public entry fun register(account: &signer) {
        coin::register<AIToken>(account);
    }
    
    // has_claimed - Check if the user has claimed the airdrop
    #[view]
    public fun has_claimed(user: address, admin_addr: address): bool acquires AirdropRecords {
        let airdrop_records = borrow_global<AirdropRecords>(admin_addr);
        let claimed = &airdrop_records.claimed;
        
        let i = 0;
        let len = vector::length(claimed);
        while (i < len) {
            if (vector::borrow(claimed, i) == &user) {
                return true
            };
            i = i + 1;
        };
        
        false
    }
    
    // is_registered - Check if the account is registered for the token
    #[view]
    public fun is_registered(addr: address): bool {
        coin::is_account_registered<AIToken>(addr)
    }
    
    // get_decimals - Get the number of decimal places for the token
    #[view]
    public fun get_decimals(): u8 {
        DECIMALS
    }
    
    // get_airdrop_amount - Get the default airdrop amount
    #[view]
    public fun get_airdrop_amount(): u64 {
        DEFAULT_AIRDROP_AMOUNT
    }

    // get_token_icon_uri
    #[view]
    public fun get_token_icon_uri(owner_addr: address): String acquires TokenIconURI {
        let icon_uri = borrow_global<TokenIconURI>(owner_addr);
        icon_uri.uri
    }


    #[view]
    public fun get_last_claim_time(user: address, owner_addr: address): u64 acquires AirdropLastRecords {
        if (!exists<AirdropLastRecords>(owner_addr)) {
            return 0;
        };
        let airdrop_last_records = borrow_global<AirdropLastRecords>(owner_addr);
        let length = vector::length(&airdrop_last_records.last_claim_times);
        let i = 0;
        while (i < length) {
            let claim_record = *vector::borrow(&airdrop_last_records.last_claim_times, i);
            if (claim_record.user == user) {
                return claim_record.last_claim_time;
            };
        };
        0
    }
}