// api/get-skr-domain.js
// FIXED VERSION - handles errors properly and uses correct Solana connection

import { TldParser } from '@onsol/tldparser';
import { Connection, PublicKey } from '@solana/web3.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const { wallet } = req.query;
  
  if (!wallet) {
    return res.status(400).json({ 
      success: false,
      error: 'Wallet address required',
      wallet: null,
      domain: null,
      isSeeker: false
    });
  }
  
  try {
    // Validate wallet address format
    let ownerPublicKey;
    try {
      ownerPublicKey = new PublicKey(wallet);
    } catch (e) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wallet address format',
        wallet: wallet,
        domain: null,
        isSeeker: false
      });
    }
    
    // Use a reliable RPC endpoint
    // You can replace this with your own RPC URL if you have one
    const RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    
    const connection = new Connection(RPC_URL, {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: 60000
    });
    
    // Initialize TldParser
    const parser = new TldParser(connection);
    
    // Fetch .skr domains for this wallet
    const skrDomains = await parser.getParsedAllUserDomainsFromTld(
      ownerPublicKey,
      'skr'
    );
    
    // Check if any domains were found
    if (skrDomains && skrDomains.length > 0) {
      const domainName = `${skrDomains[0]}.skr`;
      
      return res.status(200).json({
        success: true,
        wallet: wallet,
        domain: domainName,
        isSeeker: true,
        allDomains: skrDomains.map(d => `${d}.skr`)
      });
    }
    
    // No .skr domain found
    return res.status(200).json({
      success: true,
      wallet: wallet,
      domain: null,
      isSeeker: false,
      message: 'No .skr domain found for this wallet'
    });
    
  } catch (error) {
    console.error('Error resolving .skr domain:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to resolve .skr domain',
      wallet: wallet,
      domain: null,
      isSeeker: false,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
