#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Data normalization script for pools-v2.json
 * Fixes common issues:
 * - Tag capitalization inconsistencies
 * - Normalizes link URLs (trailing slashes, http vs https)
 * - Removes duplicate tags
 * - Validates and reports on data quality
 * - Generates a normalized output file
 */

const POOLS_FILE = path.join(__dirname, 'pools-v2.json');
const OUTPUT_FILE = path.join(__dirname, 'pools-v2-normalized.json');
const REPORT_FILE = path.join(__dirname, 'normalization-report.txt');

// Load the pools data
let pools = [];
try {
  const raw = fs.readFileSync(POOLS_FILE, 'utf-8');
  pools = JSON.parse(raw);
  console.log(`✓ Loaded ${pools.length} pools from ${POOLS_FILE}`);
} catch (error) {
  console.error(`✗ Error loading pools file: ${error.message}`);
  process.exit(1);
}

const report = {
  totalPools: pools.length,
  issues: [],
  changes: [],
  warnings: [],
  stats: {
    poolsWithoutAddresses: 0,
    poolsWithoutTags: 0,
    poolsWithoutLinks: 0,
    emptyLinks: 0,
    duplicateTags: 0,
    tagNormalizations: 0,
    linkNormalizations: 0,
  }
};

/**
 * Normalize a tag by standardizing capitalization and format
 */
function normalizeTag(tag) {
  if (!tag || typeof tag !== 'string') return tag;
  
  // Preserve special characters and Unicode, only normalize text portions
  let normalized = tag;
  
  // Common tag patterns to normalize
  const patterns = [
    { regex: /mined\s+by/gi, replacement: 'Mined By' },
    { regex: /mined\s+from/gi, replacement: 'Mined From' },
    { regex: /pool/gi, replacement: 'Pool' },
  ];
  
  patterns.forEach(({ regex, replacement }) => {
    if (regex.test(normalized)) {
      const before = normalized;
      normalized = normalized.replace(regex, replacement);
      if (before !== normalized) {
        report.stats.tagNormalizations++;
      }
    }
  });
  
  return normalized;
}

/**
 * Normalize links - ensure https, remove trailing slashes, validate format
 */
function normalizeLink(link) {
  if (!link || typeof link !== 'string') return link;
  
  let normalized = link.trim();
  const before = normalized;
  
  // Convert http to https
  if (normalized.startsWith('http://')) {
    normalized = normalized.replace('http://', 'https://');
    report.stats.linkNormalizations++;
  }
  
  // Remove trailing slash (except for root domain)
  if (normalized.length > 10 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
    report.stats.linkNormalizations++;
  }
  
  if (before !== normalized) {
    report.changes.push(`Link normalized: "${before}" → "${normalized}"`);
  }
  
  return normalized;
}

/**
 * Remove duplicate tags while preserving order
 */
function deduplicateTags(tags) {
  if (!Array.isArray(tags)) return tags;
  
  const seen = new Set();
  const deduplicated = [];
  
  tags.forEach(tag => {
    if (!seen.has(tag)) {
      seen.has(tag) || deduplicated.push(tag);
      seen.add(tag);
    }
  });
  
  if (deduplicated.length < tags.length) {
    report.stats.duplicateTags += (tags.length - deduplicated.length);
  }
  
  return deduplicated;
}

/**
 * Validate pool data and collect issues
 */
function validatePool(pool) {
  const poolIssues = [];
  
  if (!pool.id) poolIssues.push(`Missing ID`);
  if (!pool.name) poolIssues.push(`Missing name`);
  if (!Array.isArray(pool.addresses)) poolIssues.push(`Addresses not an array`);
  if (!Array.isArray(pool.tags)) poolIssues.push(`Tags not an array`);
  if (!pool.link && pool.link !== '') poolIssues.push(`Missing link property`);
  
  if (pool.addresses && pool.addresses.length === 0) {
    report.stats.poolsWithoutAddresses++;
  }
  if (pool.tags && pool.tags.length === 0) {
    report.stats.poolsWithoutTags++;
  }
  if (!pool.link || pool.link.trim() === '') {
    report.stats.poolsWithoutLinks++;
    if (pool.link === '') report.stats.emptyLinks++;
  }
  
  return poolIssues;
}

// Process each pool
const normalizedPools = pools.map((pool, index) => {
  const poolValidationIssues = validatePool(pool);
  
  if (poolValidationIssues.length > 0) {
    report.issues.push({
      poolId: pool.id,
      poolName: pool.name,
      issues: poolValidationIssues
    });
  }
  
  // Normalize tags
  if (Array.isArray(pool.tags)) {
    pool.tags = deduplicateTags(
      pool.tags.map(normalizeTag)
    );
  }
  
  // Normalize link
  if (typeof pool.link === 'string') {
    pool.link = normalizeLink(pool.link);
  }
  
  return pool;
});

// Generate statistics
report.stats.normalizedPools = normalizedPools.length;

// Write normalized file
try {
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(normalizedPools, null, 2));
  console.log(`✓ Normalized pools written to ${OUTPUT_FILE}`);
} catch (error) {
  console.error(`✗ Error writing normalized file: ${error.message}`);
}

// Generate human-readable report
const reportText = `
MINING POOLS DATA NORMALIZATION REPORT
======================================
Generated: ${new Date().toISOString()}

SUMMARY
-------
Total pools processed: ${report.totalPools}
Pools without addresses: ${report.stats.poolsWithoutAddresses}
Pools without tags: ${report.stats.poolsWithoutTags}
Pools without links: ${report.stats.poolsWithoutLinks}
  - Empty link strings: ${report.stats.emptyLinks}

CHANGES MADE
------------
Link normalizations: ${report.stats.linkNormalizations}
Tag normalizations: ${report.stats.tagNormalizations}
Duplicate tags removed: ${report.stats.duplicateTags}

${report.changes.length > 0 ? `DETAILED CHANGES\n` + report.changes.slice(0, 20).join('\n') + (report.changes.length > 20 ? `\n... and ${report.changes.length - 20} more` : '') : ''}

ISSUES FOUND
------------
${report.issues.length === 0 ? 'No structural issues found.' : `Found ${report.issues.length} pools with issues:\n`}
${report.issues.map(issue => 
  `Pool #${issue.poolId} (${issue.poolName}):\n` + 
  issue.issues.map(i => `  - ${i}`).join('\n')
).join('\n\n')}

RECOMMENDATIONS
---------------
1. Review pools with empty links (ID: ${pools
  .filter(p => p.link === '')
  .map(p => p.id)
  .join(', ')})
  
2. Verify pools without addresses - these may need investigation:
   ${pools.filter(p => p.addresses.length === 0).map(p => `   - #${p.id}: ${p.name}`).join('\n   ')}

3. Consider adding verification tags for inactive/legacy pools

4. Standardize tag prefixes (use "/" or similar consistently)

NEXT STEPS
----------
1. Review the normalized file: ${OUTPUT_FILE}
2. Compare against original to verify changes
3. If satisfied, replace original: cp ${OUTPUT_FILE} ${POOLS_FILE}
4. Commit changes with detailed message
`;

try {
  fs.writeFileSync(REPORT_FILE, reportText);
  console.log(`✓ Report written to ${REPORT_FILE}\n`);
  console.log(reportText);
} catch (error) {
  console.error(`✗ Error writing report: ${error.message}`);
}

// Summary output
console.log('\n' + '='.repeat(50));
console.log('NORMALIZATION COMPLETE');
console.log('='.repeat(50));
console.log(`Issues found: ${report.issues.length}`);
console.log(`Changes made: ${report.stats.linkNormalizations + report.stats.tagNormalizations}`);
console.log(`Output files ready for review.`);
