export const ABI = {
    "address": "0xfe2e4fc00ec0bb98e4c774bbefc382a28f176c4af976bd41333741d7ca015fd4",
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
            "name": "continue_game",
            "visibility": "public",
            "is_entry": true,
            "generic_type_params": [],
            "params": ["&signer", "address"],
            "return": []
        },
        {
            "name": "quit_game",
            "visibility": "public",
            "is_entry": true,
            "generic_type_params": [],
            "params": ["&signer", "address"],
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
        },
        {
            "name": "get_first_number",
            "visibility": "public",
            "is_entry": false,
            "is_view": true,
            "generic_type_params": [],
            "params": ["address", "address"],
            "return": ["u8"]
        }
    ]
};
