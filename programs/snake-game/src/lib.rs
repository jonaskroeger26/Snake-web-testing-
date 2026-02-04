use anchor_lang::prelude::*;

declare_id!("86KbYQVcxA2DDj3VGXwfPA65GZNoGKqoQB8KwKsA8zCH");

#[program]
pub mod snake_game {
    use super::*;

    pub fn initialize_player(ctx: Context<InitializePlayer>, player_name: String) -> Result<()> {
        let player_account = &mut ctx.accounts.player_account;
        player_account.authority = ctx.accounts.authority.key();
        player_account.name = player_name;
        player_account.high_score = 0;
        player_account.games_played = 0;
        Ok(())
    }

    pub fn submit_score(ctx: Context<SubmitScore>, score: u32) -> Result<()> {
        let player_account = &mut ctx.accounts.player_account;
        
        player_account.games_played += 1;
        
        if score > player_account.high_score {
            player_account.high_score = score;
        }
        
        Ok(())
    }

    pub fn initialize_leaderboard(ctx: Context<InitializeLeaderboard>) -> Result<()> {
        let leaderboard = &mut ctx.accounts.leaderboard;
        leaderboard.authority = ctx.accounts.authority.key();
        leaderboard.top_scores = vec![];
        Ok(())
    }

    pub fn update_leaderboard(ctx: Context<UpdateLeaderboard>) -> Result<()> {
        let leaderboard = &mut ctx.accounts.leaderboard;
        let player_account = &ctx.accounts.player_account;
        
        let entry = LeaderboardEntry {
            player: player_account.authority,
            name: player_account.name.clone(),
            score: player_account.high_score,
        };
        
        // Add to leaderboard and sort
        leaderboard.top_scores.push(entry);
        leaderboard.top_scores.sort_by(|a, b| b.score.cmp(&a.score));
        
        // Keep only top 10
        if leaderboard.top_scores.len() > 10 {
            leaderboard.top_scores.truncate(10);
        }
        
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(player_name: String)]
pub struct InitializePlayer<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 4 + 32 + 4 + 4,
        seeds = [b"player", authority.key().as_ref()],
        bump
    )]
    pub player_account: Account<'info, PlayerAccount>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SubmitScore<'info> {
    #[account(
        mut,
        seeds = [b"player", authority.key().as_ref()],
        bump,
        has_one = authority
    )]
    pub player_account: Account<'info, PlayerAccount>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct InitializeLeaderboard<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 4 + (10 * (32 + 4 + 32 + 4)),
        seeds = [b"leaderboard"],
        bump
    )]
    pub leaderboard: Account<'info, Leaderboard>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateLeaderboard<'info> {
    #[account(
        mut,
        seeds = [b"leaderboard"],
        bump
    )]
    pub leaderboard: Account<'info, Leaderboard>,
    #[account(
        seeds = [b"player", player_account.authority.as_ref()],
        bump
    )]
    pub player_account: Account<'info, PlayerAccount>,
    pub authority: Signer<'info>,
}

#[account]
pub struct PlayerAccount {
    pub authority: Pubkey,      // 32
    pub name: String,            // 4 + 32 (max length)
    pub high_score: u32,         // 4
    pub games_played: u32,       // 4
}

#[account]
pub struct Leaderboard {
    pub authority: Pubkey,               // 32
    pub top_scores: Vec<LeaderboardEntry>, // 4 + (10 * entry_size)
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct LeaderboardEntry {
    pub player: Pubkey,    // 32
    pub name: String,      // 4 + 32
    pub score: u32,        // 4
}
