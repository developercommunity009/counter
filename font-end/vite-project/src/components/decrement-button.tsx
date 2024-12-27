import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { program, counterPDA } from "../anchor/setup"; // Ensure counterPDA is imported

export default function DecrementButton() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    if (!publicKey) return;

    setIsLoading(true);

    try {
      // Include the counter account as required by the program
      const transaction = await program.methods
        .decrement() // Call the increment method
        .accounts({
          counter: counterPDA, // Pass the counter PDA here
          // authority: publicKey, // Ensure the wallet's publicKey is passed as the authority if required
        })
        .transaction();

      const transactionSignature = await sendTransaction(transaction, connection);

      console.log(`View on explorer: https://solana.fm/tx/${transactionSignature}?cluster=devnet-alpha`);
    } catch (error) {
      console.error("Error in transaction:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        className="w-24"
        onClick={onClick}
        disabled={!publicKey || isLoading}
      >
        {isLoading ? "Loading" : "Decrement"}
      </button>
    </>
  );
}
