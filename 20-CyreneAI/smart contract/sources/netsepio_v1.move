module admin::netsepio_v1{
    //==============================================================================================
    // Dependencies
    //==============================================================================================
    use std::object;
    use std::signer;
    use aptos_token_objects::token;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::account::{Self, SignerCapability};
    use std::string;
    use aptos_token_objects::collection;
    use aptos_framework::timestamp;
    use aptos_framework::option;
    use std::string_utils;
    use std::vector;
    use aptos_std::simple_map::{Self, SimpleMap};
    use aptos_token_objects::royalty;
    use std::bcs;

    //==============================================================================================
    // Errors
    //==============================================================================================

    const ERROR_SIGNER_NOT_ADMIN: u64 = 0;
    const ERROR_SUPPLY_EXCEEDED: u64 = 1;
    const ERROR_SIGNER_NOT_OPERATOR: u64 = 2;
    const ERROR_USER_MINT_EXCEEDED: u64 = 3;
    const ERROR_OTHERS: u64 = 4;
    const ERROR_INSUFFICIENT_BALANCE: u64 = 5;
    const ERROR_ALREADY_OPERATOR: u64 = 6;
    const ERROR_NODE_NOT_FOUND: u64 = 7;
    const ERROR_NODE_NOT_ACTIVE: u64 = 8;
    const ERROR_UNAUTHORIZED: u64 = 9;

    //==============================================================================================
    // Constants
    //==============================================================================================

    // Contract Version
    const VERSION: u64 = 1;
    // Supply limit
    const SUPPLY: u64 = 55;

    // NFT collection information
    const COLLECTION_NAME: vector<u8> = b"NETSEPIO";
    const COLLECTION_DESCRIPTION: vector<u8> = b"Netsepio, by NetSepio. innovative utility NFT that offers you access to a blockchain backed protocol for nodes for the future.";
    const COLLECTION_URI: vector<u8> = b"ipfs://bafybeidvpe6xdwribm5qjywrvucqys34rte26uukp6hqq3lolefd7ddjoq/erebrus_collection_uri.gif";

    // Token information
    const TOKEN_DESCRIPTION: vector<u8> = b"Netsepio NFT";
    const TOKEN_URI: vector<u8> = b"ipfs://bafybeieocwztsh2aqhb4vuwlpduw2blamfgsegthyjb3kbbwatqnj6t4hy/";

    //==============================================================================================
    // Module Structs
    //==============================================================================================

    enum NodeStatus has store , drop  , copy {
        // Node is active and running
        ACTIVE,
        // Node is in maintenance mode
        MAINTENANCE,
        // Node is offline
        OFFLINE, 
        // Node is DEACTIVATED
        DEACTIVATED
    }

    struct ErebrusToken has key {
        // Used for editing the token data
        mutator_ref: token::MutatorRef,
        // Used for burning the token
        burn_ref: token::BurnRef,
        // Used for transferring the token
        transfer_ref: object::TransferRef
    }

    struct State has key {
        // signer cap of the module's resource account
        signer_cap: SignerCapability,
        // NFT count
        minted: u64,
        operator: vector<address>,
        //minter
        minter: vector<address>,
        // minted_nft_obj_add
        nft_list: vector<address>,
        // Events
        nft_minted_events: EventHandle<NftMintedEvent>,
        node_registered_events: EventHandle<NodeRegisteredEvent>,
        checkpoint_created_events: EventHandle<CheckpointCreatedEvent>,
        node_deactivated_events: EventHandle<NodeDeactivatedEvent>,
        //counter for nodes
        node_counter: u64,
        // Nodes
        nodes: SimpleMap<u64, NodeConfig>   
    }

    struct NodeConfig has store, drop, copy {
        // node address
        node_address: address,
        // Node status
        node_status: NodeStatus,
        // latest checkpoint
        latest_checkpoint: u64,
    }

    struct Node has key , drop {
        node_address: address,
        did: vector<u8>,
        name: vector<u8>,
        node_spec: vector<u8>,
        config: vector<u8>,
        ipAddress: vector<u8>,
        region: vector<u8>,
        location: vector<u8>,
        metadata: vector<u8>,
        owner: address,
    }
    //==============================================================================================
    // Event structs
    //==============================================================================================

    struct NftMintedEvent has store, drop {
        // minter
        user: address,
        // nft #
        nft_no: u64,
        // nft object address
        obj_add: address,
        // timestamp
        timestamp: u64
    }

    struct NodeRegisteredEvent has store, drop {
        // node address
        node_address: address,
        // node id
        node_id: u64,
        //node owner 
        owner: address,
        // timestamp
        timestamp: u64
    }

    struct CheckpointCreatedEvent has store, drop {
        // node id
        node_id: u64,
        // checkpoint
        checkpoint: u64,
        // timestamp
        timestamp: u64
    }

    struct NodeDeactivatedEvent has store, drop {
        // node id
        node_id: u64,
        // timestamp
        timestamp: u64
    }

    //==============================================================================================
    // Functions
    //==============================================================================================

    /*
        Initializes the module by creating a resource account, registering with AptosCoin, creating
        the token collectiions, and setting up the State resource.
        @param account - signer representing the module publisher
    */
    fun init_module(admin: &signer) {
        assert_admin(signer::address_of(admin));
        // Seed for resource account creation
        let seed = bcs::to_bytes(&@VSEED);
        let (resource_signer, resource_cap) = account::create_resource_account(admin, seed);

        let royalty = royalty::create(5,100,@wv1);

        let node_map = simple_map::create<u64,NodeConfig>();

        // Create an NFT collection with an unlimied supply and the following aspects:
        collection::create_fixed_collection(
            &resource_signer,
            string::utf8(COLLECTION_DESCRIPTION),
            SUPPLY,
            string::utf8(COLLECTION_NAME),
            option::some(royalty),
            string::utf8(COLLECTION_URI)
        );

        // Create the State global resource and move it to the admin account
        let state = State{
            signer_cap: resource_cap,
            minted: 0,
            operator: vector::empty(),
            minter: vector::empty(),
            nft_list: vector::empty(),
            nft_minted_events: account::new_event_handle<NftMintedEvent>(&resource_signer),
            node_registered_events: account::new_event_handle<NodeRegisteredEvent>(&resource_signer),
            checkpoint_created_events: account::new_event_handle<CheckpointCreatedEvent>(&resource_signer),
            node_deactivated_events: account::new_event_handle<NodeDeactivatedEvent>(&resource_signer),
            node_counter: 0,
            nodes: node_map
        };
        move_to<State>(admin, state);
    }

    public entry fun delegate_mint(operator: &signer, minter: address) acquires State{
        assert_operator(signer::address_of(operator));
        mint_internal(minter);
    }

    public entry fun register_node(
        user: &signer,
        node_address: address,
        did: vector<u8>,
        name: vector<u8>,
        node_spec: vector<u8>,
        config: vector<u8>,
        ipAddress: vector<u8>,
        region: vector<u8>,
        location: vector<u8>,
        metadata: vector<u8>,
    ) acquires State {

        mint_internal(signer::address_of(user));
        let state = borrow_global_mut<State>(@admin);
        let node_id = state.node_counter;
        let node = Node {
            node_address,
            did,
            name,
            node_spec,
            config,
            ipAddress,
            region,
            location,
            metadata,
            owner: signer::address_of(user)
        };
        move_to<Node>(user, node);
        state.node_counter = node_id + 1;
        
        let node_config = NodeConfig {
            node_address,
            node_status: NodeStatus::ACTIVE,
            latest_checkpoint: 0
        };
        simple_map::add(&mut state.nodes, node_id, node_config);

      
        event::emit_event<NodeRegisteredEvent>(
            &mut state.node_registered_events,
            NodeRegisteredEvent {
                node_address,
                node_id,
                owner: signer::address_of(user),
                timestamp: timestamp::now_seconds()
            }
        );
    }

    public entry fun update_node_status(
        user: &signer,
        node_id: u64,
        status: u8
    ) acquires State {
       assert_admin(signer::address_of(user));
       let state = borrow_global_mut<State>(@admin);
       let node_config = simple_map::borrow_mut(&mut state.nodes, &node_id);
       node_config.node_status = if (status == 0) NodeStatus::ACTIVE
           else if (status == 1) NodeStatus::MAINTENANCE
           else if (status == 2) NodeStatus::OFFLINE
           else NodeStatus::DEACTIVATED;
    }   

    public entry fun create_checkpoint(
        user: &signer,
        node_id: u64,
        checkpoint: u64
    ) acquires State {
        let state = borrow_global_mut<State>(@admin);
        assert!(node_id < state.node_counter, ERROR_NODE_NOT_FOUND);
        let node_config = simple_map::borrow(&state.nodes, &node_id);
        assert!(node_config.node_status == NodeStatus::ACTIVE, ERROR_NODE_NOT_ACTIVE);
        assert!(signer::address_of(user) == node_config.node_address, ERROR_UNAUTHORIZED);

        let node_config = simple_map::borrow_mut(&mut state.nodes, &node_id);
        node_config.latest_checkpoint = checkpoint;

        event::emit_event<CheckpointCreatedEvent>(
            &mut state.checkpoint_created_events,
            CheckpointCreatedEvent {
                node_id,
                checkpoint,
                timestamp: timestamp::now_seconds()
            }
        );
    }

    public entry fun deactivated_node(
        user: &signer,
        node_id: u64
    ) acquires State {
        let state = borrow_global_mut<State>(@admin);
        assert!(node_id < state.node_counter, ERROR_NODE_NOT_FOUND);
        assert_admin(signer::address_of(user));
        let node_config = simple_map::borrow_mut(&mut state.nodes, &node_id);
        node_config.node_status = NodeStatus::DEACTIVATED;

        event::emit_event<NodeDeactivatedEvent>(
            &mut state.node_deactivated_events,
            NodeDeactivatedEvent {
                node_id,
                timestamp: timestamp::now_seconds()
            }
        );
    }


    /*
        Grants operator roles
        @param admin - admin signer
        @param user - user address
    */
    public entry fun grant_role(
        admin: &signer,
        user: address
    ) acquires State {
        let state = borrow_global_mut<State>(@admin);
        vector::push_back(&mut state.operator, user);
    }

    /*
        Revoke operator roles
        @param admin - admin signer
        @param user - user address
    */
    public entry fun revoke_role(
        admin: &signer,
        user: address
    ) acquires State {
        assert_operator(user);
        assert_admin(signer::address_of(admin));
         let state = borrow_global_mut<State>(@admin);
        vector::remove_value(&mut state.operator, &user);
    }

    //==============================================================================================
    // Helper functions
    //==============================================================================================
    
    inline fun mint_internal(user: address){
        let state = borrow_global_mut<State>(@admin);
        assert_supply_not_exceeded(state.minted);


        let current_nft = state.minted + 1;
        let res_signer = account::create_signer_with_capability(&state.signer_cap);

        let royalty = royalty::create(5,100,@wv1);
        let uri = string::utf8(TOKEN_URI);
        string::append(&mut uri, string_utils::format1(&b"{}.json", current_nft));
        // Create a new named token:
        let token_const_ref = token::create_named_token(
            &res_signer,
            string::utf8(COLLECTION_NAME),
            string::utf8(TOKEN_DESCRIPTION),
            string_utils::format1(&b"Erebrus #{}", current_nft),
            option::some(royalty),
            uri
        );

        let obj_signer = object::generate_signer(&token_const_ref);
        let obj_add = object::address_from_constructor_ref(&token_const_ref);

        // Transfer the token to the user account
        object::transfer_raw(&res_signer, obj_add, user);

        // Create the ErebrusToken object and move it to the new token object signer
        let new_nft_token = ErebrusToken {
            mutator_ref: token::generate_mutator_ref(&token_const_ref),
            burn_ref: token::generate_burn_ref(&token_const_ref),
            transfer_ref: object::generate_transfer_ref(&token_const_ref),
        };

        move_to<ErebrusToken>(&obj_signer, new_nft_token);

        state.minted = current_nft;
        vector::push_back(&mut state.minter, user);
        vector::push_back(&mut state.nft_list, obj_add);

        // Emit a new NftMintedEvent
        event::emit_event<NftMintedEvent>(
            &mut state.nft_minted_events,
            NftMintedEvent {
                user,
                nft_no: current_nft,
                obj_add,
                timestamp: timestamp::now_seconds()
            });
    }

    //==============================================================================================
    // View functions
    //==============================================================================================

    #[view]
    public fun total_minted_NFTs(): u64 acquires State {
        let state = borrow_global<State>(@admin);
        state.minted
    }

    #[view]
    public fun owner_of(tokenId: u64): address acquires State {
        let state = borrow_global<State>(@admin);
        object::owner(object::address_to_object<ErebrusToken>(*vector::borrow(&state.nft_list, tokenId-1)))
    }

    //==============================================================================================
    // Validation functions
    //==============================================================================================

    inline fun assert_admin(admin: address) {
        assert!(admin == @admin, ERROR_SIGNER_NOT_ADMIN);
    }

    inline fun assert_operator(user: address) acquires State {
        let state = borrow_global<State>(@admin);
        assert!(vector::contains(&state.operator,&user), ERROR_SIGNER_NOT_OPERATOR);
    }


    inline fun assert_supply_not_exceeded(minted: u64) {
        assert!(minted <= SUPPLY, ERROR_SUPPLY_EXCEEDED);
    }

    inline fun assert_user_does_not_have_role(user: address) acquires State {
        let state = borrow_global<State>(@admin);
        assert!(!vector::contains(&state.operator,&user), ERROR_ALREADY_OPERATOR);
    }

    //==============================================================================================
    // Test functions
    //==============================================================================================

    #[test(admin = @admin)]
    fun test_init_module_success(
        admin: &signer
    ) acquires State {
        let admin_address = signer::address_of(admin);
        account::create_account_for_test(admin_address);

        let aptos_framework = account::create_account_for_test(@aptos_framework);
        timestamp::set_time_has_started_for_testing(&aptos_framework);

        init_module(admin);

        let seed = bcs::to_bytes(&@VSEED);
        let expected_resource_account_address = account::create_resource_address(&admin_address, seed);
        assert!(account::exists_at(expected_resource_account_address), 0);

        let state = borrow_global<State>(admin_address);
        assert!(
            account::get_signer_capability_address(&state.signer_cap) == expected_resource_account_address,
            0
        );

        let expected_collection_address = collection::create_collection_address(
            &expected_resource_account_address,
            &string::utf8(COLLECTION_NAME)
        );
        let collection_object = object::address_to_object<collection::Collection>(expected_collection_address);
        assert!(
            collection::creator<collection::Collection>(collection_object) == expected_resource_account_address,
            4
        );
        assert!(
            collection::name<collection::Collection>(collection_object) == string::utf8(COLLECTION_NAME),
            4
        );
        assert!(
            collection::description<collection::Collection>(collection_object) == string::utf8(COLLECTION_DESCRIPTION),
            4
        );
        assert!(
            collection::uri<collection::Collection>(collection_object) == string::utf8(COLLECTION_URI),
            4
        );

        assert!(event::counter(&state.nft_minted_events) == 0, 4);
    }

    #[test(admin = @admin, user = @0xA, bank = @wv1)]
    fun test_mint_success(
        admin: &signer,
        user: &signer,
        bank: &signer
    ) acquires State {
        let admin_address = signer::address_of(admin);
        let user_address = signer::address_of(user);
        let bank_address = signer::address_of(bank);
        account::create_account_for_test(admin_address);
        account::create_account_for_test(user_address);
        account::create_account_for_test(bank_address);

        let aptos_framework = account::create_account_for_test(@aptos_framework);
        timestamp::set_time_has_started_for_testing(&aptos_framework);
        let (burn_cap, mint_cap) =
            aptos_coin::initialize_for_test(&aptos_framework);
        coin::register<AptosCoin>(user);
        coin::register<AptosCoin>(bank);
        init_module(admin);
        aptos_coin::mint(&aptos_framework, user_address, MINT_PRICE);

        let image_uri = string::utf8(TOKEN_URI);
        string::append(&mut image_uri, string_utils::format1(&b"{}.json",1));

        let seed = bcs::to_bytes(&@VSEED);
        let resource_account_address = account::create_resource_address(&@admin, seed);

        user_mint(user);

        let state = borrow_global<State>(admin_address);

        let expected_nft_token_address = token::create_token_address(
            &resource_account_address,
            &string::utf8(COLLECTION_NAME),
            &string_utils::format1(&b"nft#{}", state.minted)
        );
        let nft_token_object = object::address_to_object<token::Token>(expected_nft_token_address);
        assert!(
            object::is_owner(nft_token_object, user_address) == true,
            1
        );
        assert!(
            token::creator(nft_token_object) == resource_account_address,
            4
        );
        assert!(
            token::name(nft_token_object) == string_utils::format1(&b"nft#{}", state.minted),
            4
        );
        assert!(
            token::description(nft_token_object) == string::utf8(TOKEN_DESCRIPTION),
            4
        );
        assert!(
            token::uri(nft_token_object) == image_uri,
            4
        );
        assert!(
            option::is_some<royalty::Royalty>(&token::royalty(nft_token_object)),
            4
        );
        assert!(
            vector::contains(&state.nft_list, &expected_nft_token_address),
            4
        );

        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);

        assert!(event::counter(&state.nft_minted_events) == 1, 4);

    }

    #[test(admin = @admin, user = @0xA, bank = @wv1)]
    #[expected_failure(abort_code = ERROR_SUPPLY_EXCEEDED)]
    fun test_mint_failed_supply_exceeded(
        admin: &signer,
        user: &signer,
        bank: &signer
    ) acquires State {
        let admin_address = signer::address_of(admin);
        let user_address = signer::address_of(user);
        let bank_address = signer::address_of(bank);
        account::create_account_for_test(admin_address);
        account::create_account_for_test(user_address);
        account::create_account_for_test(bank_address);

        let aptos_framework = account::create_account_for_test(@aptos_framework);
        timestamp::set_time_has_started_for_testing(&aptos_framework);

        let (burn_cap, mint_cap) =
            aptos_coin::initialize_for_test(&aptos_framework);
        coin::register<AptosCoin>(user);
        coin::register<AptosCoin>(bank);

        init_module(admin);
        aptos_coin::mint(&aptos_framework, user_address, MINT_PRICE);

        {
            let state = borrow_global_mut<State>(admin_address);
            state.minted = 500;
        };

        user_mint(user);

        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);
    }

    #[test(admin = @admin, user = @0xA, bank = @wv1)]
    #[expected_failure(abort_code = ERROR_USER_MINT_EXCEEDED)]
    fun test_mint_failed_minter_minted(
        admin: &signer,
        user: &signer,
        bank: &signer
    ) acquires State {
        let admin_address = signer::address_of(admin);
        let user_address = signer::address_of(user);
        let bank_address = signer::address_of(bank);
        account::create_account_for_test(admin_address);
        account::create_account_for_test(user_address);
        account::create_account_for_test(bank_address);

        let aptos_framework = account::create_account_for_test(@aptos_framework);
        timestamp::set_time_has_started_for_testing(&aptos_framework);

        let (burn_cap, mint_cap) =
            aptos_coin::initialize_for_test(&aptos_framework);
        coin::register<AptosCoin>(user);
        coin::register<AptosCoin>(bank);

        init_module(admin);
        aptos_coin::mint(&aptos_framework, user_address, MINT_PRICE);

        user_mint(user);
        user_mint(user);

        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);
    }

    #[test(admin = @admin, user = @0xA, operator = @0xB)]
    fun test_delegate_mint_success(
        admin: &signer,
        operator: &signer,
        user: &signer
    ) acquires State {
        let admin_address = signer::address_of(admin);
        let user_address = signer::address_of(user);
        account::create_account_for_test(admin_address);
        account::create_account_for_test(user_address);

        let aptos_framework = account::create_account_for_test(@aptos_framework);
        timestamp::set_time_has_started_for_testing(&aptos_framework);

        admin::reviews::init_module_for_test(admin);

        let (burn_cap, mint_cap) =
            aptos_coin::initialize_for_test(&aptos_framework);
        coin::register<AptosCoin>(user);
        init_module(admin);
        aptos_coin::mint(&aptos_framework, user_address, MINT_PRICE);

        admin::reviews::grant_role(
            admin,
            signer::address_of(operator),
            string::utf8(b"operator")
        );

        let image_uri = string::utf8(TOKEN_URI);
        string::append(&mut image_uri, string_utils::format1(&b"{}.json",1));

        let seed = bcs::to_bytes(&@VSEED);
        let resource_account_address = account::create_resource_address(&@admin, seed);

        delegate_mint(operator, user_address);

        let state = borrow_global<State>(admin_address);

        let expected_nft_token_address = token::create_token_address(
            &resource_account_address,
            &string::utf8(COLLECTION_NAME),
            &string_utils::format1(&b"nft#{}", state.minted)
        );
        let nft_token_object = object::address_to_object<token::Token>(expected_nft_token_address);
        assert!(
            object::is_owner(nft_token_object, user_address) == true,
            1
        );
        assert!(
            token::creator(nft_token_object) == resource_account_address,
            4
        );
        assert!(
            token::name(nft_token_object) == string_utils::format1(&b"nft#{}", state.minted),
            4
        );
        assert!(
            token::description(nft_token_object) == string::utf8(TOKEN_DESCRIPTION),
            4
        );
        assert!(
            token::uri(nft_token_object) == image_uri,
            4
        );
        assert!(
            option::is_some<royalty::Royalty>(&token::royalty(nft_token_object)),
            4
        );
        assert!(
            vector::contains(&state.nft_list, &expected_nft_token_address),
            4
        );

        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);

        assert!(event::counter(&state.nft_minted_events) == 1, 4);
    }

    #[test(admin = @admin, user = @0xA, operator = @0xB)]
    #[expected_failure(abort_code = ERROR_SIGNER_NOT_OPERATOR)]
    fun test_delegate_mint_failure_not_operator(
        admin: &signer,
        operator: &signer,
        user: &signer
    ) acquires State {
        let admin_address = signer::address_of(admin);
        let user_address = signer::address_of(user);
        account::create_account_for_test(admin_address);
        account::create_account_for_test(user_address);

        let aptos_framework = account::create_account_for_test(@aptos_framework);
        timestamp::set_time_has_started_for_testing(&aptos_framework);

        admin::reviews::init_module_for_test(admin);
        init_module(admin);

        delegate_mint(operator, user_address);
    }

}