use anchor_lang::prelude::*;

// Specify the program address
declare_id!("8tJT3LSSpMXg1urHU5LpJh868eg7h5W4nLCGVessUdBz");

#[program]
pub mod counter {
    use super::*;

    // Initialize the counter account with a PDA and store the bump
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;

        // Find and set bump seed for the PDA
        let (_, bump) = Pubkey::find_program_address(&[b"counter"], ctx.program_id);
        counter.bump = bump;
        counter.count = 0; // Initialize count to 0

        msg!("Counter account created! Current count: {}", counter.count);
        msg!("Counter bump: {}", counter.bump);
        Ok(())
    }

    // Increment the counter
    pub fn increment(ctx: Context<Increment>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        msg!("Previous counter: {}", counter.count);

        counter.count = counter.count.checked_add(5).unwrap();
        msg!("Counter incremented! Current count: {}", counter.count);
        Ok(())
    }

    // Decrement the counter
    pub fn decrement(ctx: Context<Decrement>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        msg!("Previous counter: {}", counter.count);

        if counter.count == 0 {
            return Err(ErrorCode::Underflow.into());
        }
        counter.count = counter.count.checked_sub(1).unwrap();
        msg!("Counter decremented! Current count: {}", counter.count);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub user: Signer<'info>, // The user who pays for the account creation

    // Create and initialize the counter account using a PDA
    #[account(
        init,
        seeds = [b"counter"], // Seed for deriving the PDA
        bump,                 // Bump seed for PDA
        payer = user,         // Account paying for creation
        space = 8 + 8 + 1     // Discriminator (8 bytes) + Counter fields
    )]
    pub counter: Account<'info, Counter>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Increment<'info> {
    #[account(
        mut,
        seeds = [b"counter"], // Seed for deriving the PDA
        bump = counter.bump,  // Bump seed stored in the counter account
    )]
    pub counter: Account<'info, Counter>,
}

#[derive(Accounts)]
pub struct Decrement<'info> {
    #[account(
        mut,
        seeds = [b"counter"], // Seed for deriving the PDA
        bump = counter.bump,  // Bump seed stored in the counter account
    )]
    pub counter: Account<'info, Counter>,
}

#[account]
pub struct Counter {
    pub count: u64, // 8 bytes for the counter value
    pub bump: u8,   // 1 byte for the bump seed
}

// Define custom errors
#[error_code]
pub enum ErrorCode {
    #[msg("Counter underflow: cannot decrement below 0.")]
    Underflow,
}