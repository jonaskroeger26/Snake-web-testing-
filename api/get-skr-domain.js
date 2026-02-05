// api/get-skr-domain.js
// Based on https://gist.github.com/CryptoKix/8b8e6e574c92f6612bd447e3dae11fec

import { TldParser } from '@onsol/tldparser';
import { Connection, PublicKey } from '@solana/web3.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
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
    // Validate and create PublicKey
    let owner;
    try {
      owner = new PublicKey(wallet);
    } catch (e) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wallet address',
        wallet: wallet,
        domain: null,
        isSeeker: false
      });
    }
    
    // Create connection
    const connection = new Connection(
      process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
      { commitment: 'confirmed' }
    );
    
    // Create TldParser
    const parser = new TldParser(connection);
    
    // Method 1: Try getting the main domain first (fastest)
    try {
      const mainDomain = await Promise.race([
        parser.getMainDomain(owner),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 15000))
      ]);
      
      if (mainDomain && mainDomain.tld === 'skr') {
        const domainName = `${mainDomain.domain}.skr`;
        return res.status(200).json({
          success: true,
          wallet: wallet,
          domain: domainName,
          isSeeker: true,
          method: 'mainDomain'
        });
      }
    } catch (mainDomainError) {
      console.log('Main domain lookup failed, trying getAllDomains:', mainDomainError.message);
    }
    
    // Method 2: Get all .skr domains if main domain didn't work
    try {
      const skrDomains = await Promise.race([
        parser.getParsedAllUserDomainsFromTld(owner, 'skr'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 15000))
      ]);
      
      if (skrDomains && skrDomains.length > 0) {
        const domainName = `${skrDomains[0]}.skr`;
        return res.status(200).json({
          success: true,
          wallet: wallet,
          domain: domainName,
          isSeeker: true,
          allDomains: skrDomains.map(d => `${d}.skr`),
          method: 'getAllDomains'
        });
      }
    } catch (allDomainsError) {
      console.error('All domains lookup failed:', allDomainsError.message);
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
      isSeeker: false
    });
  }
}
