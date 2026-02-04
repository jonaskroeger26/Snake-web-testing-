import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SnakeGame } from "../target/types/snake_game";
import { PublicKey, SystemProgram } from "@solana/web3.js";

/**
 * Example client for interacting with the Snake Game Solana program
 * This shows how to call each instruction from JavaScript/TypeScript
 */

// Initialize Anchor and get program
const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);
const program = anchor.workspace.SnakeGame as Program<SnakeGame>;

/**
 * Initialize a new player account
 */
export async function initializePlayer(playerName: string) {
  try {
    const [playerPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("player"), provider.wallet.publicKey.toBuffer()],
      program.programId
    );

    const tx = await program.methods
      .initializePlayer(playerName)
      .accounts({
        playerAccount: playerPDA,
        authority: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Player initialized! Transaction:", tx);
    return { playerPDA, tx };
  } catch (error) {
    console.error("Error initializing player:", error);
    throw error;
  }
}

/**
 * Submit a score for the current player
 */
export async function submitScore(score: number) {
  try {
    const [playerPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("player"), provider.wallet.publicKey.toBuffer()],
      program.programId
    );

    const tx = await program.methods
      .submitScore(score)
      .accounts({
        playerAccount: playerPDA,
        authority: provider.wallet.publicKey,
      })
      .rpc();

    console.log("Score submitted! Transaction:", tx);
    return tx;
  } catch (error) {
    console.error("Error submitting score:", error);
    throw error;
  }
}

/**
 * Initialize the global leaderboard (one-time setup)
 */
export async function initializeLeaderboard() {
  try {
    const [leaderboardPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("leaderboard")],
      program.programId
    );

    const tx = await program.methods
      .initializeLeaderboard()
      .accounts({
        leaderboard: leaderboardPDA,
        authority: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Leaderboard initialized! Transaction:", tx);
    return { leaderboardPDA, tx };
  } catch (error) {
    console.error("Error initializing leaderboard:", error);
    throw error;
  }
}

/**
 * Update the leaderboard with current player's high score
 */
export async function updateLeaderboard() {
  try {
    const [playerPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("player"), provider.wallet.publicKey.toBuffer()],
      program.programId
    );

    const [leaderboardPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("leaderboard")],
      program.programId
    );

    const tx = await program.methods
      .updateLeaderboard()
      .accounts({
        leaderboard: leaderboardPDA,
        playerAccount: playerPDA,
        authority: provider.wallet.publicKey,
      })
      .rpc();

    console.log("Leaderboard updated! Transaction:", tx);
    return tx;
  } catch (error) {
    console.error("Error updating leaderboard:", error);
    throw error;
  }
}

/**
 * Fetch player account data
 */
export async function getPlayerAccount(walletAddress?: PublicKey) {
  try {
    const wallet = walletAddress || provider.wallet.publicKey;
    const [playerPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("player"), wallet.toBuffer()],
      program.programId
    );

    const playerAccount = await program.account.playerAccount.fetch(playerPDA);
    return playerAccount;
  } catch (error) {
    console.error("Error fetching player account:", error);
    return null;
  }
}

/**
 * Fetch leaderboard data
 */
export async function getLeaderboard() {
  try {
    const [leaderboardPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("leaderboard")],
      program.programId
    );

    const leaderboard = await program.account.leaderboard.fetch(leaderboardPDA);
    return leaderboard.topScores;
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }
}

/**
 * Complete game flow example
 */
export async function completeGameFlow() {
  console.log("Starting Snake Game flow...");

  // 1. Initialize player
  console.log("\n1. Initializing player...");
  await initializePlayer("TestPlayer");

  // 2. Initialize leaderboard (only needs to be done once globally)
  console.log("\n2. Initializing leaderboard...");
  try {
    await initializeLeaderboard();
  } catch (e) {
    console.log("Leaderboard might already exist");
  }

  // 3. Play game and submit score
  console.log("\n3. Simulating game and submitting score...");
  const gameScore = Math.floor(Math.random() * 200) + 50; // Random score 50-250
  await submitScore(gameScore);

  // 4. Update leaderboard
  console.log("\n4. Updating leaderboard...");
  await updateLeaderboard();

  // 5. Fetch and display results
  console.log("\n5. Fetching results...");
  const playerData = await getPlayerAccount();
  console.log("Player Data:", playerData);

  const leaderboard = await getLeaderboard();
  console.log("\nLeaderboard:");
  leaderboard.forEach((entry, idx) => {
    console.log(`${idx + 1}. ${entry.name}: ${entry.score} points`);
  });
}

// Export all functions
export default {
  initializePlayer,
  submitScore,
  initializeLeaderboard,
  updateLeaderboard,
  getPlayerAccount,
  getLeaderboard,
  completeGameFlow,
};
