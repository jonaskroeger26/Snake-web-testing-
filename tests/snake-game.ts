import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SnakeGame } from "../target/types/snake_game";
import { assert } from "chai";

describe("snake-game", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.SnakeGame as Program<SnakeGame>;
  
  let playerPDA: anchor.web3.PublicKey;
  let leaderboardPDA: anchor.web3.PublicKey;
  
  const playerName = "TestPlayer";

  before(async () => {
    // Derive PDAs
    [playerPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("player"), provider.wallet.publicKey.toBuffer()],
      program.programId
    );

    [leaderboardPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("leaderboard")],
      program.programId
    );
  });

  it("Initializes a player account", async () => {
    const tx = await program.methods
      .initializePlayer(playerName)
      .accounts({
        playerAccount: playerPDA,
        authority: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const playerAccount = await program.account.playerAccount.fetch(playerPDA);
    
    assert.equal(playerAccount.name, playerName);
    assert.equal(playerAccount.highScore, 0);
    assert.equal(playerAccount.gamesPlayed, 0);
    assert.ok(playerAccount.authority.equals(provider.wallet.publicKey));
    
    console.log("✅ Player initialized:", playerName);
  });

  it("Submits a score", async () => {
    const score = 100;
    
    const tx = await program.methods
      .submitScore(score)
      .accounts({
        playerAccount: playerPDA,
        authority: provider.wallet.publicKey,
      })
      .rpc();

    const playerAccount = await program.account.playerAccount.fetch(playerPDA);
    
    assert.equal(playerAccount.highScore, score);
    assert.equal(playerAccount.gamesPlayed, 1);
    
    console.log("✅ Score submitted:", score);
  });

  it("Updates high score when new score is higher", async () => {
    const newScore = 150;
    
    await program.methods
      .submitScore(newScore)
      .accounts({
        playerAccount: playerPDA,
        authority: provider.wallet.publicKey,
      })
      .rpc();

    const playerAccount = await program.account.playerAccount.fetch(playerPDA);
    
    assert.equal(playerAccount.highScore, newScore);
    assert.equal(playerAccount.gamesPlayed, 2);
    
    console.log("✅ High score updated:", newScore);
  });

  it("Keeps high score when new score is lower", async () => {
    const lowerScore = 50;
    
    await program.methods
      .submitScore(lowerScore)
      .accounts({
        playerAccount: playerPDA,
        authority: provider.wallet.publicKey,
      })
      .rpc();

    const playerAccount = await program.account.playerAccount.fetch(playerPDA);
    
    assert.equal(playerAccount.highScore, 150); // Should still be 150
    assert.equal(playerAccount.gamesPlayed, 3);
    
    console.log("✅ High score maintained");
  });

  it("Initializes leaderboard", async () => {
    const tx = await program.methods
      .initializeLeaderboard()
      .accounts({
        leaderboard: leaderboardPDA,
        authority: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const leaderboard = await program.account.leaderboard.fetch(leaderboardPDA);
    
    assert.ok(leaderboard.authority.equals(provider.wallet.publicKey));
    assert.equal(leaderboard.topScores.length, 0);
    
    console.log("✅ Leaderboard initialized");
  });

  it("Updates leaderboard with player score", async () => {
    await program.methods
      .updateLeaderboard()
      .accounts({
        leaderboard: leaderboardPDA,
        playerAccount: playerPDA,
        authority: provider.wallet.publicKey,
      })
      .rpc();

    const leaderboard = await program.account.leaderboard.fetch(leaderboardPDA);
    
    assert.equal(leaderboard.topScores.length, 1);
    assert.equal(leaderboard.topScores[0].name, playerName);
    assert.equal(leaderboard.topScores[0].score, 150);
    
    console.log("✅ Leaderboard updated with player");
    console.log("   Top Score:", leaderboard.topScores[0]);
  });

  it("Maintains sorted leaderboard", async () => {
    // Create a second player with a higher score
    const newPlayer = anchor.web3.Keypair.generate();
    
    // Airdrop SOL to new player
    const airdropTx = await provider.connection.requestAirdrop(
      newPlayer.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropTx);

    const [newPlayerPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("player"), newPlayer.publicKey.toBuffer()],
      program.programId
    );

    // Initialize new player
    await program.methods
      .initializePlayer("TopPlayer")
      .accounts({
        playerAccount: newPlayerPDA,
        authority: newPlayer.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([newPlayer])
      .rpc();

    // Submit higher score
    await program.methods
      .submitScore(200)
      .accounts({
        playerAccount: newPlayerPDA,
        authority: newPlayer.publicKey,
      })
      .signers([newPlayer])
      .rpc();

    // Update leaderboard
    await program.methods
      .updateLeaderboard()
      .accounts({
        leaderboard: leaderboardPDA,
        playerAccount: newPlayerPDA,
        authority: newPlayer.publicKey,
      })
      .signers([newPlayer])
      .rpc();

    const leaderboard = await program.account.leaderboard.fetch(leaderboardPDA);
    
    assert.equal(leaderboard.topScores.length, 2);
    assert.equal(leaderboard.topScores[0].score, 200); // Highest first
    assert.equal(leaderboard.topScores[1].score, 150);
    
    console.log("✅ Leaderboard sorted correctly");
    console.log("   Leaderboard:", leaderboard.topScores.map(s => `${s.name}: ${s.score}`));
  });
});
