module EmotionApt::coin {
    use aptos_framework::fungible_asset::{Self, MintRef, TransferRef, BurnRef, Metadata, FungibleAsset};
    use aptos_framework::object::{Self, Object};
    use aptos_framework::primary_fungible_store;
    use std::error;
    use std::signer;
    use std::string::utf8;
    use std::option;

    const ASSET_SYMBOL: vector<u8> = b"Emotion";

    // Make sure the `signer` you pass in is an address you own.
    // Otherwise you will lose access to the Fungible Asset after creation.
    entry fun init_module(admin: &signer) {
        // Creates a non-deletable object with a named address based on our ASSET_SYMBOL
        let constructor_ref = &object::create_named_object(admin, ASSET_SYMBOL);

        // Create the FA's Metadata with your name, symbol, icon, etc.
        primary_fungible_store::create_primary_store_enabled_fungible_asset(
            constructor_ref,
            option::none(),
            utf8(b"Emotion"), /* name */
            utf8(ASSET_SYMBOL), /* symbol */
            8, /* decimals */
            utf8(b"http://example.com/favicon.ico"), /* icon */
            utf8(b"http://example.com"), /* project */
        );

        // Generate the MintRef for this object
        // Used by fungible_asset::mint() and fungible_asset::mint_to()
        let mint_ref = fungible_asset::generate_mint_ref(constructor_ref);

        // Generate the TransferRef for this object
        // Used by fungible_asset::set_frozen_flag(), fungible_asset::withdraw_with_ref(),
        // fungible_asset::deposit_with_ref(), and fungible_asset::transfer_with_ref().
        let transfer_ref = fungible_asset::generate_transfer_ref(constructor_ref);

        // Generate the BurnRef for this object
        // Used by fungible_asset::burn() and fungible_asset::burn_from()
        let burn_ref = fungible_asset::generate_burn_ref(constructor_ref);

    }
}