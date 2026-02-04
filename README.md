# 🐍 Snake Game - Solana dApp

A fully functional Snake game built as a Solana dApp that stores player scores and leaderboard on-chain!

## 🎮 Features

- **Classic Snake Gameplay** - Control the snake with arrow keys, eat food, grow longer
- **Wallet Integration** - Connect with Phantom wallet to save scores
- **On-Chain Leaderboard** - High scores stored permanently on Solana blockchain
- **Player Profiles** - Each player has their own account tracking games played and high scores
- **Beautiful UI** - Modern, responsive design with smooth animations

## 🏗️ Project Structure

```
snake-dapp/
├── programs/
│   └── snake-game/
│       ├── src/
│       │   └── lib.rs          # Anchor program (smart contract)
│       └── Cargo.toml
├── app/
│   └── index.html              # Frontend game (React)
├── Anchor.toml                 # Anchor configuration
└── README.md
```

## 🚀 Quick Start

### Prerequisites

1. **Install Rust and Cargo**
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. **Install Solana CLI**
   ```bash
   sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
   ```

3. **Install Anchor**
   ```bash
   cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
   avm install latest
   avm use latest
   ```

4. **Install Phantom Wallet**
   - Download from: https://phantom.app/

### Setup

1. **Configure Solana for Devnet**
   ```bash
   solana config set --url devnet
   ```

2. **Create a Keypair (if you don't have one)**
   ```bash
   solana-keygen new
   ```

3. **Get Devnet SOL (for testing)**
   ```bash
   solana airdrop 2
   ```

### Build and Deploy

1. **Navigate to project directory**
   ```bash
   cd snake-dapp
   ```

2. **Build the program**
   ```bash
   anchor build
   ```

3. **Get your Program ID**
   ```bash
   anchor keys list
   ```

4. **Update Program ID**
   - Copy the program ID from previous command
   - Update `declare_id!()` in `programs/snake-game/src/lib.rs`
   - Update program ID in `Anchor.toml` under `[programs.devnet]`

5. **Rebuild after updating IDs**
   ```bash
   anchor build
   ```

6. **Deploy to Devnet**
   ```bash
   anchor deploy
   ```

7. **Initialize the Leaderboard** (one-time setup)
   ```bash
   # This can be done through the frontend or via a script
   # The first player to connect will initialize the global leaderboard
   ```

### Run the Game

1. **Open the game**
   - Simply open `app/index.html` in your web browser
   - Or use a local server:
   ```bash
   cd app
   python3 -m http.server 8000
   # Visit http://localhost:8000
   ```

2. **Play!**
   - Connect your Phantom wallet
   - Set your player name
   - Click "Start Game"
   - Use arrow keys to control the snake

## 🎯 How It Works

### On-Chain Program (Rust/Anchor)

The Solana program manages:

1. **Player Accounts** - PDA (Program Derived Address) for each player
   - Stores: wallet address, name, high score, games played
   
2. **Leaderboard** - Global PDA storing top 10 scores
   - Updates automatically when players beat their high scores

3. **Instructions**:
   - `initialize_player` - Creates a player account
   - `submit_score` - Records a game score
   - `initialize_leaderboard` - Sets up global leaderboard (one-time)
   - `update_leaderboard` - Adds player to top 10 if qualified

### Frontend (React)

The game client:
- Implements classic Snake game logic
- Connects to Phantom wallet using Solana web3.js
- Submits scores to the on-chain program after each game
- Fetches and displays the leaderboard from blockchain

## 💡 Game Instructions

1. **Connect Wallet** - Click "Connect Phantom Wallet"
2. **Set Name** - Enter your player name (saved on-chain)
3. **Start Game** - Click "Start Game" button
4. **Play** - Use arrow keys:
   - ⬆️ Move Up
   - ⬇️ Move Down
   - ⬅️ Move Left
   - ➡️ Move Right
5. **Score** - Eat red food to score 10 points and grow
6. **Avoid** - Don't hit walls or yourself!
7. **Submit** - Your score automatically saves to blockchain when game ends

## 🔧 Development

### Testing Locally

```bash
# Start local validator
solana-test-validator

# In another terminal, deploy locally
anchor deploy --provider.cluster localnet

# Run tests (if you add them)
anchor test
```

### Program Accounts

**Player Account Structure**:
```rust
pub struct PlayerAccount {
    pub authority: Pubkey,    // Player's wallet
    pub name: String,          // Max 32 chars
    pub high_score: u32,       // Best score
    pub games_played: u32,     // Total games
    pub bump: u8,              // PDA bump seed
}
```

**Leaderboard Structure**:
```rust
pub struct Leaderboard {
    pub authority: Pubkey,     // Leaderboard creator
    pub top_scores: Vec<LeaderboardEntry>, // Max 10
    pub bump: u8,
}

pub struct LeaderboardEntry {
    pub player: Pubkey,
    pub name: String,
    pub score: u32,
}
```

## 🌐 Deployment to dApp Store

To deploy to the Solana dApp Store:

1. **Test thoroughly on devnet**
2. **Deploy to mainnet**:
   ```bash
   solana config set --url mainnet-beta
   anchor deploy
   ```
3. **Get more SOL for mainnet deployment costs**
4. **Host frontend** on:
   - Vercel
   - Netlify
   - IPFS
   - Arweave

5. **Submit to dApp Store** with:
   - Program ID
   - Frontend URL
   - Description
   - Screenshots

## 🔐 Security Notes

- Program uses PDAs (Program Derived Addresses) for security
- Each player account is tied to their wallet
- Only the account owner can submit scores
- Leaderboard prevents manipulation through sorting logic

## 📝 Future Enhancements

- [ ] Add difficulty levels (faster speeds)
- [ ] Implement power-ups
- [ ] Add multiplayer mode
- [ ] Create NFT rewards for top players
- [ ] Add sound effects and music
- [ ] Mobile touch controls
- [ ] Tournament system with entry fees
- [ ] Seasonal leaderboards with token prizes

## 🤝 Contributing

Feel free to fork, improve, and submit PRs!

## 📜 License

MIT License - feel free to use this for learning or building your own dApp!

## 🎓 Learn More

- [Solana Docs](https://docs.solana.com/)
- [Anchor Framework](https://www.anchor-lang.com/)
- [Phantom Wallet](https://phantom.app/)
- [Solana Cookbook](https://solanacookbook.com/)

---

**Built with ❤️ on Solana**

Enjoy the game and happy coding! 🚀
