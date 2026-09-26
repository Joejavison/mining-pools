#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Wallet Connection Tool
 * Maps wallet addresses to mining pools from pools.json
 * Usage: node connect-wallet.js <wallet_address> [pool_name]
 */

const POOLS_FILE = path.join(__dirname, 'pools.json');
const WALLET_ADDRESS = '19eSTG1UUERsotpUt3kDCadzw6efNdpkFJ';

// Load pools data
let poolsData = {};
try {
  const raw = fs.readFileSync(POOLS_FILE, 'utf-8');
  poolsData = JSON.parse(raw);
  console.log('✓ Loaded pools database');
} catch (error) {
  console.error('✗ Error loading pools file:', error.message);
  process.exit(1);
}

/**
 * Find which pool(s) a wallet is connected to
 */
function findWalletPools(wallet) {
  const pools = poolsData.payout_addresses || {};
  const results = [];
  
  if (pools[wallet]) {
    results.push(pools[wallet]);
  }
  
  return results;
}

/**
 * List all available pools
 */
function listAllPools() {
  const pools = poolsData.coinbase_tags || {};
  return Object.entries(pools).map(([tag, data]) => ({
    tag,
    ...data
  }));
}

/**
 * Generate mining configuration for a specific pool
 */
function generateMiningConfig(wallet, poolName) {
  const coinbaseTags = poolsData.coinbase_tags || {};
  
  // Find matching pool
  let poolConfig = null;
  for (const [tag, config] of Object.entries(coinbaseTags)) {
    if (config.name.toLowerCase() === poolName.toLowerCase()) {
      poolConfig = config;
      break;
    }
  }
  
  if (!poolConfig) {
    return null;
  }
  
  return {
    pool: poolConfig.name,
    wallet: wallet,
    url: poolConfig.link,
    coinbaseTag: Object.keys(coinbaseTags).find(
      tag => coinbaseTags[tag].name === poolConfig.name
    )
  };
}

// Main execution
console.log('\n╔════════════════════════════════════════════════════════╗');
console.log('║        MINING POOL WALLET CONNECTION TOOL               ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

// Check current connections
console.log(`📍 Wallet Address: ${WALLET_ADDRESS}\n`);

const currentPools = findWalletPools(WALLET_ADDRESS);
if (currentPools.length > 0) {
  console.log('✓ Currently connected to:');
  currentPools.forEach((pool, idx) => {
    console.log(`  ${idx + 1}. ${pool.name}`);
    console.log(`     Link: ${pool.link}`);
  });
} else {
  console.log('⚠ Wallet not found in payout_addresses');
}

// Available pools
console.log('\n📊 Available Pools (sample):');
const allPools = listAllPools();
const sample = allPools.slice(0, 10);
sample.forEach((pool, idx) => {
  console.log(`  ${idx + 1}. ${pool.name}`);
  console.log(`     Tag: ${pool.tag}`);
  console.log(`     Site: ${pool.link}`);
});
console.log(`  ... and ${allPools.length - 10} more pools\n`);

// Example configuration
console.log('📝 Example Mining Configuration:\n');
const examplePool = generateMiningConfig(WALLET_ADDRESS, 'Braiins Pool');
if (examplePool) {
  console.log(`Pool Name:     ${examplePool.pool}`);
  console.log(`Wallet:        ${examplePool.wallet}`);
  console.log(`Pool URL:      ${examplePool.url}`);
  console.log(`Coinbase Tag:  ${examplePool.coinbaseTag}`);
}

// Instructions
console.log('\n\n🚀 HOW TO CONNECT YOUR WALLET:\n');
console.log('Option 1: Manual Setup');
console.log('  1. Go to your chosen pool\'s website');
console.log('  2. Create an account or log in');
console.log('  3. Add this wallet address: ' + WALLET_ADDRESS);
console.log('  4. Configure your miner with the pool\'s connection details\n');

console.log('Option 2: Stratum Protocol');
console.log('  Use this format in your miner:');
console.log('  stratum+tcp://[pool-host]:[port]');
console.log('  Username: ' + WALLET_ADDRESS);
console.log('  Password: x (or as specified by pool)\n');

console.log('Option 3: Update pools.json');
console.log('  1. Add your wallet to payout_addresses section:');
console.log(`  "${WALLET_ADDRESS}": {`);
console.log('      "name": "Your Pool Name",');
console.log('      "link": "https://pool-url.com/"');
console.log('  }\n');

// Export configuration
const config = {
  wallet: WALLET_ADDRESS,
  currentPools: currentPools,
  availablePools: allPools.slice(0, 20), // Top 20 pools
  timestamp: new Date().toISOString()
};

const configPath = path.join(__dirname, 'wallet-config.json');
try {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`✓ Configuration saved to: ${configPath}\n`);
} catch (error) {
  console.error('✗ Error saving configuration:', error.message);
}

console.log('═'.repeat(56) + '\n');
