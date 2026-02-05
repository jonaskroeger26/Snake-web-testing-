// api/get-skr-domain.js
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
    return res.status(400).json({ error: 'Wallet address required' });
  }
  
  try {
    console.log('[API] Looking up .skr domain for wallet:', wallet);
    
    // Use QuickNode endpoint if available, otherwise use mainnet
    const QUICKNODE_ENDPOINT = process.env.QUICKNODE_ENDPOINT || 'https://bold-boldest-knowledge.solana-mainnet.quiknode.pro/d31ebc9ab7a456235231f62ce1b43c447712538f/';
    const rpcEndpoint = QUICKNODE_ENDPOINT || 'https://api.mainnet-beta.solana.com';
    
    const connection = new Connection(rpcEndpoint, 'confirmed');
    const parser = new TldParser(connection);
    const ownerPublicKey = new PublicKey(wallet);
    
    console.log('[API] Querying blockchain for .skr domains...');
    
    const skrDomains = await parser.getParsedAllUserDomainsFromTld(
      ownerPublicKey,
      'skr'
    );
    
    console.log('[API] Query result:', skrDomains);
    
    if (skrDomains && skrDomains.length > 0) {
      const domainName = `${skrDomains[0]}.skr`;
      console.log('[API] ✅ Found .skr domain:', domainName);
      return res.status(200).json({
        success: true,
        domain: domainName,
        isSeeker: true
      });
    }
    
    console.log('[API] No .skr domain found');
    return res.status(200).json({
      success: true,
      domain: null,
      isSeeker: false
    });
    
  } catch (error) {
    console.error('[API] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
