import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Counter } from "../target/types/counter";
import { assert } from "chai";

describe("counter", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Counter as Program<Counter>;

  // Find the PDA for the counter account
  const [counterPda, counterBump] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("counter")],
    program.programId
  );

  it("Is initialized!", async () => {
    const tx = await program.methods
      .initialize()
      .accounts({
        counter: counterPda,
        user: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("Transaction signature:", tx);

    // Fetch the counter account data
    const counterAccount = await program.account.counter.fetch(counterPda);

    assert.strictEqual(counterAccount.count.toNumber(), 0, "Count should be 0");
    assert.strictEqual(counterAccount.bump, counterBump, "Bump should match PDA bump");
  });

  it("Increment", async () => {
    const tx = await program.methods
      .increment()
      .accounts({
        counter: counterPda,
      })
      .rpc();

    console.log("Transaction signature:", tx);
    
    const counterAccount = await program.account.counter.fetch(counterPda);
    console.log(`After Decrement: Count: ${counterAccount.count.toNumber()}, Bump: ${counterAccount.bump}`);
    assert.strictEqual(counterAccount.count.toNumber(), 1, "Count should be incremented to 1");
  });

  it("Decrement", async () => {
    const tx = await program.methods
      .decrement()
      .accounts({
        counter: counterPda,
      })
      .rpc();

    console.log("Transaction signature:", tx);

    const counterAccount = await program.account.counter.fetch(counterPda);
    console.log(`After Decrement: Count: ${counterAccount.count.toNumber()}, Bump: ${counterAccount.bump}`);
    assert.strictEqual(counterAccount.count.toNumber(), 0, "Count should be decremented to 0");
  });

  it("Cannot decrement below zero", async () => {
    try {
      await program.methods
        .decrement()
        .accounts({
          counter: counterPda,
        })
        .rpc();
      assert.fail("Expected error but none was thrown");
    } catch (err) {
      assert.include(err.message, "Counter underflow: cannot decrement below 0.", "Error message should match");
    }
  });
});
