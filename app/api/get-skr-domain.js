// api/get-skr-domain.js
// Vercel Serverless Function to resolve .skr domains

import { TldParser } from '@onsol/tldparser';
import { Connection, PublicKey } from '@solana/web3.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Get wallet address from query parameter
  const { wallet } = req.query;
  
  if (!wallet) {
    return res.status(400).json({ 
      success: false,
      error: 'Wallet address is required',
      usage: '/api/get-skr-domain?wallet=YOUR_WALLET_ADDRESS'
    });
  }
  
  try {
    console.log('[API] Looking up .skr domain for:', wallet);
    
    // Use QuickNode endpoint if available, otherwise use mainnet
    const QUICKNODE_ENDPOINT = process.env.QUICKNODE_ENDPOINT || 'https://bold-boldest-knowledge.solana-mainnet.quiknode.pro/d31ebc9ab7a456235231f62ce1b43c447712538f/';
    const rpcEndpoint = QUICKNODE_ENDPOINT || 'https://api.mainnet-beta.solana.com';
    
    // Create Solana connection
    const connection = new Connection(rpcEndpoint, 'confirmed');
    
    // Initialize TldParser
    const parser = new TldParser(connection);
    
    // Create PublicKey from wallet address
    const ownerPublicKey = new PublicKey(wallet);
    
    // Query .skr domains for this wallet
    const skrDomains = await parser.getParsedAllUserDomainsFromTld(
      ownerPublicKey,
      'skr' // TLD without the dot
    );
    
    console.log('[API] Query result:', skrDomains);
    
    // Check if any .skr domains were found
    if (skrDomains && skrDomains.length > 0) {
      const domainName = `${skrDomains[0]}.skr`;
      
      console.log('[API] ✅ Found .skr domain:', domainName);
      
      return res.status(200).json({
        success: true,
        wallet: wallet,
        domain: domainName,
        isSeeker: true,
        allDomains: skrDomains.map(d => `${d}.skr`)
      });
    }
    
    // No .skr domain found
    console.log('[API] No .skr domain found');
    
    return res.status(200).json({
      success: true,
      wallet: wallet,
      domain: null,
      isSeeker: false,
      message: 'No .skr domain found for this wallet'
    });
    
  } catch (error) {
    console.error('[API] Error:', error);
    
    return res.status(500).json({
      success: false,
      wallet: wallet,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
