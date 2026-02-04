/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/snake_game.json`.
 */
export type SnakeGame = {
  "address": "SnakE11111111111111111111111111111111111111",
  "metadata": {
    "name": "snakeGame",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Snake Game on Solana"
  },
  "instructions": [
    {
      "name": "initializeLeaderboard",
      "discriminator": [
        47,
        23,
        34,
        39,
        46,
        108,
        91,
        176
      ],
      "accounts": [
        {
          "name": "leaderboard",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  101,
                  97,
                  100,
                  101,
                  114,
                  98,
                  111,
                  97,
                  114,
                  100
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initializePlayer",
      "discriminator": [
        79,
        249,
        88,
        177,
        220,
        62,
        56,
        128
      ],
      "accounts": [
        {
          "name": "playerAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  121,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "playerName",
          "type": "string"
        }
      ]
    },
    {
      "name": "submitScore",
      "discriminator": [
        212,
        128,
        45,
        22,
        112,
        82,
        85,
        235
      ],
      "accounts": [
        {
          "name": "playerAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  121,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true,
          "relations": [
            "playerAccount"
          ]
        }
      ],
      "args": [
        {
          "name": "score",
          "type": "u32"
        }
      ]
    },
    {
      "name": "updateLeaderboard",
      "discriminator": [
        72,
        95,
        102,
        32,
        118,
        158,
        247,
        34
      ],
      "accounts": [
        {
          "name": "leaderboard",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  101,
                  97,
                  100,
                  101,
                  114,
                  98,
                  111,
                  97,
                  114,
                  100
                ]
              }
            ]
          }
        },
        {
          "name": "playerAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  121,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "player_account.authority",
                "account": "playerAccount"
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "leaderboard",
      "discriminator": [
        247,
        186,
        238,
        243,
        194,
        30,
        9,
        36
      ]
    },
    {
      "name": "playerAccount",
      "discriminator": [
        224,
        184,
        224,
        50,
        98,
        72,
        48,
        236
      ]
    }
  ],
  "types": [
    {
      "name": "leaderboard",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "topScores",
            "type": {
              "vec": {
                "defined": {
                  "name": "leaderboardEntry"
                }
              }
            }
          }
        ]
      }
    },
    {
      "name": "leaderboardEntry",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "player",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "score",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "playerAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "highScore",
            "type": "u32"
          },
          {
            "name": "gamesPlayed",
            "type": "u32"
          }
        ]
      }
    }
  ]
};
