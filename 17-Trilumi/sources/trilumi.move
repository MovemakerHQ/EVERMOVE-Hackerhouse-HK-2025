module trilumiaddr::arc {
    use std::signer;
    use trilumiaddr::arc_coin;
    use aptos_framework::managed_coin;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::timestamp;

    const MODULE_ADMIN: address = @trilumiaddr;

    const NOT_ADMIN_PEM: u64 = 0;
    const COIN_NOT_EXIST: u64 = 1;
    const TICKET_NOT_EXIST: u64 = 2;
    const INSUFFICIENT_TOKEN_SUPPLY: u64 = 3;
    const AMOUNT_ZERO: u64 = 4;
    const NO_CLAIMABLE_REWARD: u64 = 5;
    const TIME_ERROR_FOR_CLAIM: u64 = 6;

    const ROI: u64 = 100;
    const INCENTIVE_REWARD: u64 = 50;

    struct Ticket has key {
        borrow_amount : u64,
        lend_amount: u64,
        claim_amount: u64,
        last_interact_time: u64
    }

    struct Pool<phantom CoinType> has key {
        borrowed_amount : u64,
        deposited_amount: u64,
        token: coin::Coin<CoinType>,
    }

    #[test_only]
    public fun init_protocol(sender: &signer) {
        let account_addr = signer::address_of(sender);

        //Deposite Pool Token 8000 at the startup
        managed_coin::register<arc_coin::ARC_Coin>(sender);

        managed_coin::mint<arc_coin::ARC_Coin>(sender,account_addr,100000000 * 1000000);

        let coin1 = coin::withdraw<arc_coin::ARC_Coin>(sender, 40000000 * 1000000);        
        let pool_1 = Pool<arc_coin::ARC_Coin> {borrowed_amount: 0, deposited_amount: 0, token: coin1};
        move_to(sender, pool_1);

        let native_coin = coin::withdraw<AptosCoin>(sender, 10000000);
        let pool_3 = Pool<AptosCoin> {borrowed_amount: 0, deposited_amount: 0, token: native_coin};
        move_to(sender, pool_3);
    }

    fun init_module(sender: &signer) {
        let account_addr = signer::address_of(sender);

        //Deposite Pool Token 8000 at the startup
        managed_coin::register<arc_coin::ARC_Coin>(sender);

        managed_coin::mint<arc_coin::ARC_Coin>(sender,account_addr,100000000 * 1000000);

        let coin1 = coin::withdraw<arc_coin::ARC_Coin>(sender, 40000000 * 1000000);        
        let pool_1 = Pool<arc_coin::ARC_Coin> {borrowed_amount: 0, deposited_amount: 0, token: coin1};
        move_to(sender, pool_1);

        let native_coin = coin::withdraw<AptosCoin>(sender, 10000000);
        let pool_3 = Pool<AptosCoin> {borrowed_amount: 0, deposited_amount: 0, token: native_coin};
        move_to(sender, pool_3);
    }

    public entry fun manage_pool<CoinType> (
        admin: &signer,
        _amount: u64
    ) acquires Pool {
        let signer_addr = signer::address_of(admin);
        let coin = coin::withdraw<CoinType>(admin, _amount);

        assert!(MODULE_ADMIN == signer_addr, NOT_ADMIN_PEM); // only admin could manage pool

        if(!exists<Pool<CoinType>>(signer_addr)){
            let pool = Pool<CoinType> {borrowed_amount: 0, deposited_amount: 0, token: coin};
            move_to(admin, pool);
        }
        else{
            let pool_data = borrow_global_mut<Pool<CoinType>>(signer_addr);
            let origin_coin = &mut pool_data.token;
            coin::merge(origin_coin, coin);
        }
    }
    public entry fun lend<CoinType> (
        admin: &signer,
        _amount: u64
    ) acquires Pool, Ticket{
        let signer_addr = signer::address_of(admin);
        let coin = coin::withdraw<CoinType>(admin, _amount);                

        assert!(exists<Pool<CoinType>>(MODULE_ADMIN), COIN_NOT_EXIST);
        assert!(_amount > 0, AMOUNT_ZERO);

        let pool_data = borrow_global_mut<Pool<CoinType>>(MODULE_ADMIN);        
        let origin_deposit = pool_data.deposited_amount;
        let origin_coin = &mut pool_data.token;
        coin::merge(origin_coin, coin);
        pool_data.deposited_amount = origin_deposit + _amount;

        if(!exists<Ticket>(signer_addr)){
            let ticket = Ticket {
                borrow_amount: 0,
                lend_amount: 0,
                claim_amount: 0,
                last_interact_time: timestamp::now_seconds()
            };
            move_to(admin, ticket);
            let ticket_data = borrow_global_mut<Ticket>(signer_addr);
            let origin_lend = ticket_data.lend_amount;
            ticket_data.lend_amount = origin_lend + _amount;
        }
        else{
            let ticket_data = borrow_global_mut<Ticket>(signer_addr);
            let origin_lend = ticket_data.lend_amount;
            ticket_data.lend_amount = origin_lend + _amount;
        }
    }

    public entry fun borrow<CoinType> (
        admin: &signer,
        _amount: u64
    ) acquires Pool, Ticket {
        let signer_addr = signer::address_of(admin);

        assert!(exists<Pool<CoinType>>(MODULE_ADMIN), COIN_NOT_EXIST);
        assert!(exists<Ticket>(signer_addr), TICKET_NOT_EXIST);
        assert!(_amount > 0, AMOUNT_ZERO);

        let ticket_data = borrow_global_mut<Ticket>(signer_addr);

        //When Supplying Multiple Tokens should sum up ticket_data's lend_amount
        assert!(ticket_data.lend_amount * 80 / 100 >= _amount + ticket_data.borrow_amount, INSUFFICIENT_TOKEN_SUPPLY);
        ticket_data.borrow_amount = _amount + ticket_data.borrow_amount;

        let pool_data = borrow_global_mut<Pool<CoinType>>(MODULE_ADMIN);                        
        let origin_coin = &mut pool_data.token;        
        let extract_coin = coin::extract(origin_coin, _amount);

        pool_data.borrowed_amount = pool_data.borrowed_amount + _amount;
        if(!coin::is_account_registered<CoinType>(signer_addr))
            coin::register<CoinType>(admin);
        coin::deposit(signer_addr, extract_coin);
    }

    public entry fun isClaimable<CoinType>(
        admin: &signer
    ) : bool acquires Ticket {
        let signer_addr = signer::address_of(admin);

        assert!(exists<Pool<CoinType>>(MODULE_ADMIN), COIN_NOT_EXIST);
        assert!(exists<Ticket>(signer_addr), TICKET_NOT_EXIST);

        let ticket_data = borrow_global_mut<Ticket>(signer_addr);

        timestamp::now_seconds() - ticket_data.last_interact_time >= 60
    }

    public entry fun claim(
        admin: &signer
    ) acquires Ticket, Pool {
        let signer_addr = signer::address_of(admin);
        
        assert!(exists<Ticket>(signer_addr), TICKET_NOT_EXIST);

        let ticket_data = borrow_global_mut<Ticket>(signer_addr);
        let reward_amount = (ticket_data.lend_amount - ticket_data.borrow_amount) * (ROI + INCENTIVE_REWARD) / 100;
        //assert!((ticket_data.lend_amount - ticket_data.borrow_amount) * ROI / 100 - ticket_data.claim_amount > 0, NO_CLAIMABLE_REWARD);
        assert!(timestamp::now_seconds() - ticket_data.last_interact_time >= 60, TIME_ERROR_FOR_CLAIM);
        
        *&mut ticket_data.last_interact_time = timestamp::now_seconds();
        *&mut ticket_data.claim_amount = ticket_data.claim_amount + reward_amount;

        let pool_data = borrow_global_mut<Pool<arc_coin::ARC_Coin>>(MODULE_ADMIN);                        
        let origin_coin = &mut pool_data.token;
        let extract_coin = coin::extract(origin_coin, reward_amount);

        if(!coin::is_account_registered<arc_coin::ARC_Coin>(signer_addr))
            coin::register<arc_coin::ARC_Coin>(admin);
        coin::deposit(signer_addr, extract_coin);
    }

    // public entry fun repay<CoinType>(
    //     admin: &signer,
    //     _amount: u64
    // ){

    // }
}
