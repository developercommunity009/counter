import { Buffer } from "buffer"; // Importing the polyfill for Buffer
import { IdlAccounts, Program } from "@coral-xyz/anchor";
import { IDL, Counter } from "./idl";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";

const programId = new PublicKey("8tJT3LSSpMXg1urHU5LpJh868eg7h5W4nLCGVessUdBz");
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
// Initialize the program interface with the IDL, program ID, and connection.
export const program = new Program<Counter>(IDL, programId, {
  connection,
});
console.log(program);

export const [counterPDA] = PublicKey.findProgramAddressSync(
  [Buffer.from("counter")], // Using the polyfill Buffer
  program.programId
);


// This is just a TypeScript type for the Counter data structure based on the IDL
export type CounterData = IdlAccounts<Counter>["counter"];
