#!/usr/bin/env node
import { validateDeckFile } from './index.js';

const args = process.argv.slice(2);
let deckPath = null;
let assetsDir = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--assets-dir' && args[i + 1]) {
    assetsDir = args[++i];
  } else if (args[i] === '--help' || args[i] === '-h') {
    console.log('Usage: deck-preflight <deck.json> [--assets-dir <dir>]');
    process.exit(0);
  } else if (!args[i].startsWith('-')) {
    deckPath = args[i];
  }
}

if (!deckPath) {
  console.error('Error: deck JSON path required');
  console.error('Usage: deck-preflight <deck.json> [--assets-dir <dir>]');
  process.exit(1);
}

const result = validateDeckFile(deckPath, { assetsDir });
console.log(`Cards: ${result.cardCount}`);

if (result.errors.length > 0) {
  console.log(`\nErrors (${result.errors.length}):`);
  result.errors.forEach(e => console.log(`  ✗ ${e}`));
}
if (result.warnings.length > 0) {
  console.log(`\nWarnings (${result.warnings.length}):`);
  result.warnings.forEach(w => console.log(`  ⚠ ${w}`));
}

if (result.valid) {
  console.log('\n✓ Deck is valid');
} else {
  console.log('\n✗ Deck has errors');
  process.exit(1);
}
