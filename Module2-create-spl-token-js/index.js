import { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { createMint, getOrCreateAssociatedTokenAccount, mintTo, transfer } from '@solana/spl-token';

(async () => {
    // Step 1: Connect to cluster and generate a new Keypair
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

    const fromWallet = Keypair.generate();
    const toWallet = Keypair.generate();

    // Step 2: Airdrop SOL into your from wallet (SOL is still needed to fund tx)
    const fromAirdropSignature = await connection.requestAirdrop(fromWallet.publicKey, LAMPORTS_PER_SOL);
    // Wait for airdrop confirmation
    await connection.confirmTransaction(fromAirdropSignature, { commitment: "confirmed" });

    // Step 3: Create new token mint and get the token account of the fromWallet address
    //If the token account does not exist, create it
    const mint = await createMint( // returns public key MINT acct!!!!!!!!!!
      connection, 
      fromWallet, // Payer
      fromWallet.publicKey, // Mint Auth 
      null, // Freeze Auth
      9 // Decimal Precision 1 Token = 1 000 000 000
      );

    const fromTokenAccount = await getOrCreateAssociatedTokenAccount( // returns public key of TOKEN acct!!!!!!! from the FROM account
            connection,
            fromWallet,
            mint,
            fromWallet.publicKey // owner of this token account
    )
    
    //Step 4: Mint a new token to the from account this means minting of 1 Token
    let signature = await mintTo(
      connection,
      fromWallet, // payer
      mint,
      fromTokenAccount.address, // who we've minting to
      fromWallet.publicKey, // authority
      1000000000, // ammount we want to send
      []
    );
    console.log('mint tx:', signature);

    //Step 5: Get the token account of the to-wallet address and if it does not exist, create it
    const toTokenAccount = await getOrCreateAssociatedTokenAccount(connection, fromWallet, mint, toWallet.publicKey);

    //Step 6: Transfer the new token to the to-wallet's token account that was just created
    // Transfer the new token to the "toTokenAccount" we just created
    signature = await transfer(
        connection,
        fromWallet,
        fromTokenAccount.address,
        toTokenAccount.address,
        fromWallet.publicKey,
        1000000000,
        []
    );
    console.log('transfer tx:', signature); 
 
})();