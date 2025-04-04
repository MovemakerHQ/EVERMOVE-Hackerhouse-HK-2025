export const ABI = {
    "address": "0x00c8fb0e3ce86942c03e805675faaf00b631db504f3e4c99ab7e8bc457cae539",
    "name": "allin_bet",
    "exposed_functions": [
        {
            "name": "create_game_pool",
            "visibility": "public",
            "is_entry": true,
            "generic_type_params": [],
            "params": ["&signer", "u64", "u8", "u8", "u64"],
            "return": []
        },
        {
            "name": "join_game",
            "visibility": "public",
            "is_entry": true,
            "generic_type_params": [],
            "params": ["&signer", "address", "u64"],
            "return": []
        },
        {
            "name": "withdraw_pool",
            "visibility": "public",
            "is_entry": true,
            "generic_type_params": [],
            "params": ["&signer", "u64"],
            "return": []
        },
        {
            "name": "get_game_info",
            "visibility": "public",
            "is_entry": false,
            "is_view": true,
            "generic_type_params": [],
            "params": ["address"],
            "return": ["u8", "u8", "u64", "u64"]
        },
        {
            "name": "get_all_game_pools",
            "visibility": "public",
            "is_entry": false,
            "is_view": true,
            "generic_type_params": [],
            "params": [],
            "return": ["vector<address>"]
        }
    ]
};
