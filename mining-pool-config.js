#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Mining Pool Configuration Guide
 * Step-by-step setup for your wallet: 19eSTG1UUERsotpUt3kDCadzw6efNdpkFJ
 * 
 * This guide covers popular pools and their official configuration steps
 */

const WALLET = '19eSTG1UUERsotpUt3kDCadzw6efNdpkFJ';

const POOL_CONFIGS = {
  'Braiins Pool': {
    website: 'https://braiins.com/pool',
    stratum: 'stratum+tcp://stratum.braiins.com:3333',
    difficulty: 'auto',
    setup: [
      '1. Visit: https://braiins.com/pool',
      '2. Click "Sign up" or "Log in"',
      '3. Create account with email/2FA',
      '4. Go to Settings → Wallet',
      '5. Enter payout address: ' + WALLET,
      '6. Set minimum payout threshold (e.g., 0.001 BTC)',
      '7. Save and verify email if prompted'
    ],
    minerConfig: {
      pool: 'stratum+tcp://stratum.braiins.com:3333',
      user: WALLET,
      pass: 'x',
      note: 'Optionally add worker name: ' + WALLET + '.worker1'
    }
  },
  
  'Foundry USA': {
    website: 'https://foundrydigital.com/',
    stratum: 'stratum+tcp://mining.foundrydigital.com:3333',
    difficulty: 'variable',
    setup: [
      '1. Visit: https://foundrydigital.com/',
      '2. Navigate to "Mining Pool" section',
      '3. Click "Get Started" or login if existing',
      '4. Create account with corporate email',
      '5. Go to Account → Mining Settings',
      '6. Add payout wallet: ' + WALLET,
      '7. Configure payout frequency (daily/weekly)',
      '8. Enable notifications for low hashrate alerts'
    ],
    minerConfig: {
      pool: 'stratum+tcp://mining.foundrydigital.com:3333',
      user: WALLET,
      pass: 'x',
      note: 'Supports variable difficulty, ideal for large farms'
    }
  },
  
  'ViaBTC': {
    website: 'https://viabtc.com/',
    stratum: 'stratum+tcp://btc.viabtc.com:3333',
    difficulty: 'auto',
    setup: [
      '1. Visit: https://viabtc.com/',
      '2. Click "Sign Up" (top right)',
      '3. Verify email address',
      '4. Go to "My Account" → "Bitcoin Mining"',
      '5. Navigate to "Wallet Address"',
      '6. Add address: ' + WALLET,
      '7. Select payout method (on-chain or USDT)',
      '8. Set withdrawal threshold and confirm'
    ],
    minerConfig: {
      pool: 'stratum+tcp://btc.viabtc.com:3333',
      user: WALLET,
      pass: 'x',
      note: 'Offers PPS+ and PPLNS modes'
    }
  },
  
  'F2Pool': {
    website: 'https://www.f2pool.com/',
    stratum: 'stratum+tcp://btc.f2pool.com:3333',
    difficulty: 'auto',
    setup: [
      '1. Visit: https://www.f2pool.com/',
      '2. Click "Register" or use WeChat/phone login',
      '3. Verify identity via SMS or email',
      '4. Dashboard → Bitcoin → Settings',
      '5. Go to "Wallet Settings"',
      '6. Add Bitcoin address: ' + WALLET,
      '7. Verify with on-chain transaction (~0.00001 BTC)',
      '8. Enable 2FA for security'
    ],
    minerConfig: {
      pool: 'stratum+tcp://btc.f2pool.com:3333',
      user: WALLET + '.worker1',
      pass: 'x',
      note: 'Requires address verification, popular in Asia'
    }
  },
  
  'Luxor': {
    website: 'https://mining.luxor.tech',
    stratum: 'stratum+tcp://mining.luxor.tech:3333',
    difficulty: 'variable',
    setup: [
      '1. Visit: https://mining.luxor.tech',
      '2. Sign up with email and password',
      '3. Create unique "Account ID" for tracking',
      '4. Settings → Wallet Configuration',
      '5. Paste address: ' + WALLET,
      '6. Choose payout frequency',
      '7. Set fee preference (standard/advanced)',
      '8. Confirm and enable email alerts'
    ],
    minerConfig: {
      pool: 'stratum+tcp://mining.luxor.tech:3333',
      user: WALLET,
      pass: 'x',
      note: 'Supports vardiff and fixed difficulty pools'
    }
  },

  'AntPool': {
    website: 'https://www.antpool.com/',
    stratum: 'stratum+tcp://stratum.antpool.com:3333',
    difficulty: 'auto',
    setup: [
      '1. Visit: https://www.antpool.com/',
      '2. Click "Register" (top right)',
      '3. Use email or Bitmain account',
      '4. Go to "Mining" → "Bitcoin" in dashboard',
      '5. Click "Wallet"',
      '6. Add payout address: ' + WALLET,
      '7. Set minimum withdrawal (usually 0.001 BTC)',
      '8. Enable Google Authenticator for 2FA'
    ],
    minerConfig: {
      pool: 'stratum+tcp://stratum.antpool.com:3333',
      user: WALLET + '.worker1',
      pass: 'x',
      note: 'Owned by Bitmain, very stable'
    }
  },

  'Binance Pool': {
    website: 'https://pool.binance.com/',
    stratum: 'stratum+tcp://mining.binance.com:3333',
    difficulty: 'auto',
    setup: [
      '1. Visit: https://pool.binance.com/',
      '2. Log in with your Binance account',
      '3. If no account, create at binance.com first',
      '4. Go to "BTC Mining" section',
      '5. Settings → Payout Address',
      '6. Add Bitcoin address: ' + WALLET,
      '7. Confirm with email verification',
      '8. Set auto-conversion to BUSD if desired'
    ],
    minerConfig: {
      pool: 'stratum+tcp://mining.binance.com:3333',
      user: WALLET,
      pass: 'x',
      note: 'Requires Binance account, payouts via Binance'
    }
  }
};

// Generate config file
console.log('\n' + '═'.repeat(70));
console.log('  MINING POOL CONFIGURATION GUIDE');
console.log('═'.repeat(70));
console.log('\n  Wallet Address: ' + WALLET);
console.log('  Date Generated: ' + new Date().toISOString());
console.log('\n' + '═'.repeat(70) + '\n');

// Generate detailed setup for each pool
for (const [poolName, config] of Object.entries(POOL_CONFIGS)) {
  console.log(`\n╔═══════════════════════════════════════════════════════════════════╗`);
  console.log(`║ POOL: ${poolName.padEnd(65)} ║`);
  console.log(`╚══════════════════════════════════════════════════════════��════════╝\n`);
  
  console.log(`📍 Official Website:\n   ${config.website}\n`);
  
  console.log(`📋 SETUP STEPS (Dashboard Configuration):\n`);
  config.setup.forEach((step, idx) => {
    console.log(`   ${step}`);
  });
  
  console.log(`\n⛏️  MINER CONFIGURATION:\n`);
  console.log(`   Pool URL:  ${config.minerConfig.pool}`);
  console.log(`   User:      ${config.minerConfig.user}`);
  console.log(`   Password:  ${config.minerConfig.pass}`);
  if (config.minerConfig.note) {
    console.log(`   Note:      ${config.minerConfig.note}`);
  }
  
  console.log('\n' + '─'.repeat(70));
}

// Generic Stratum Configuration Template
console.log(`\n\n╔═══════════════════════════════════════════════════════════════════╗`);
console.log(`║ GENERIC STRATUM CONFIGURATION (For Any Pool)                     ║`);
console.log(`╚═══════════════════════════════════════════════════════════════════╝\n`);

console.log(`For mining software (cgminer, bfgminer, BMC, etc.):\n`);
console.log(`   stratum+tcp://[POOL_HOST]:[POOL_PORT]`);
console.log(`   Username: ${WALLET}`);
console.log(`   Password: x (or worker_name)\n`);

console.log(`\nCommon Ports by Difficulty:\n`);
console.log(`   Port 3333  = Standard difficulty (vardiff)`);
console.log(`   Port 25    = Low difficulty (testing)`);
console.log(`   Port 8888  = High difficulty (large farms)\n`);

// Security warnings
console.log(`\n╔═══════════════════════════════════════════════════════════════════╗`);
console.log(`║ ⚠️  SECURITY CHECKLIST                                            ║`);
console.log(`╚═══════════════════════════════════════════════════════════════════╝\n`);

const securityChecks = [
  '✓ Use HTTPS (stratum+tcp) connections only',
  '✓ Enable 2FA (Google Authenticator) on pool account',
  '✓ Verify pool website URL before logging in (watch for typos)',
  '✓ Do NOT share wallet seed phrase or private keys',
  '✓ Do NOT give pools access to other accounts/emails',
  '✓ Monitor payout addresses regularly in pool dashboard',
  '✓ Start with a small test transaction',
  '✓ Use a dedicated wallet address (not exchange deposit)',
  '✓ Keep mining software and drivers updated',
  '✓ Set up low hashrate alerts to detect disconnections'
];

securityChecks.forEach(check => console.log('   ' + check));

// Troubleshooting
console.log(`\n\n╔═══════════════════════════════════════════════════════════════════╗`);
console.log(`║ 🔧 TROUBLESHOOTING                                                ║`);
console.log(`╚═══════════════════════════════════════════════════════════════════╝\n`);

const troubleshooting = [
  {
    issue: 'Miner says "Connection refused"',
    fix: 'Check stratum URL and port are correct; verify firewall allows outbound TCP'
  },
  {
    issue: 'Getting "Invalid address" error',
    fix: 'Ensure wallet address is exactly: ' + WALLET + ' (copy/paste carefully)'
  },
  {
    issue: 'No shares being accepted',
    fix: 'Verify address was added to pool dashboard AND address is verified'
  },
  {
    issue: 'Low hashrate or frequent rejects',
    fix: 'Try different difficulty port; check cable connections; update drivers'
  },
  {
    issue: 'Not receiving payouts',
    fix: 'Check payout threshold in dashboard; verify minimum reached; check pool balance'
  }
];

troubleshooting.forEach(item => {
  console.log(`   Issue: ${item.issue}`);
  console.log(`   Fix:   ${item.fix}\n`);
});

// Save configuration to file
const configOutput = {
  wallet: WALLET,
  pools: POOL_CONFIGS,
  generatedAt: new Date().toISOString(),
  instructions: 'Select one pool above, follow SETUP STEPS on official website, then use MINER CONFIGURATION in your mining software'
};

const configPath = path.join(__dirname, 'mining-config.json');
try {
  fs.writeFileSync(configPath, JSON.stringify(configOutput, null, 2));
  console.log(`\n✓ Full configuration saved to: ${configPath}\n`);
} catch (error) {
  console.error('Error saving config:', error.message);
}

console.log('═'.repeat(70));
console.log('\n💡 NEXT STEPS:\n');
console.log('   1. Choose ONE pool from the list above');
console.log('   2. Go to its official website and create an account');
console.log('   3. Add your wallet address to the payout settings');
console.log('   4. Copy the Stratum URL and configure your miner');
console.log('   5. Start mining and monitor earnings in the pool dashboard\n');
console.log('═'.repeat(70) + '\n');
