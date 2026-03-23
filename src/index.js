/**
 * Deck Preflight Validator
 * Validates card/game asset deck JSON files.
 */
import fs from 'fs';
import path from 'path';

/**
 * Validate a deck JSON object.
 * @param {object} deck - Deck object with cards array
 * @param {object} [options]
 * @param {string} [options.assetsDir] - Directory to check for asset files
 * @param {string[]} [options.requiredFields] - Required fields per card (default: ['id', 'name'])
 * @returns {{ valid: boolean, errors: string[], warnings: string[] }}
 */
export function validateDeck(deck, options = {}) {
  const {
    assetsDir = null,
    requiredFields = ['id', 'name']
  } = options;

  const errors = [];
  const warnings = [];

  if (!deck || typeof deck !== 'object') {
    errors.push('Deck must be a non-null object');
    return { valid: false, errors, warnings };
  }

  const cards = deck.cards || deck.deck || [];
  if (!Array.isArray(cards)) {
    errors.push('Deck must contain a "cards" or "deck" array');
    return { valid: false, errors, warnings };
  }

  if (cards.length === 0) {
    warnings.push('Deck is empty (0 cards)');
    return { valid: true, errors, warnings };
  }

  // Check required fields
  cards.forEach((card, idx) => {
    for (const field of requiredFields) {
      if (!(field in card) || card[field] === null || card[field] === undefined || card[field] === '') {
        errors.push(`Card ${idx}: missing required field "${field}"`);
      }
    }
  });

  // Check for duplicate IDs
  const ids = cards.map(c => c.id).filter(Boolean);
  const duplicateIds = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (duplicateIds.length > 0) {
    const unique = [...new Set(duplicateIds)];
    errors.push(`Duplicate card IDs: ${unique.join(', ')}`);
  }

  // Check for duplicate names
  const names = cards.map(c => c.name).filter(Boolean);
  const duplicateNames = names.filter((name, i) => names.indexOf(name) !== i);
  if (duplicateNames.length > 0) {
    const unique = [...new Set(duplicateNames)];
    warnings.push(`Duplicate card names: ${unique.join(', ')}`);
  }

  // Check asset references
  if (assetsDir) {
    cards.forEach((card, idx) => {
      const imageField = card.image || card.imagePath || card.asset || card.file;
      if (imageField) {
        const assetPath = path.resolve(assetsDir, imageField);
        if (!fs.existsSync(assetPath)) {
          errors.push(`Card ${idx} ("${card.name || card.id}"): asset not found: ${imageField}`);
        }
      }
    });
  }

  // Check for recommended fields
  const recommendedFields = ['description', 'image', 'category'];
  const missingRecommended = [];
  for (const field of recommendedFields) {
    const missing = cards.filter(c => !(field in c)).length;
    if (missing > 0 && missing < cards.length) {
      missingRecommended.push(`${field} (missing in ${missing}/${cards.length} cards)`);
    }
  }
  if (missingRecommended.length > 0) {
    warnings.push(`Recommended fields partially missing: ${missingRecommended.join('; ')}`);
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Load and validate a deck from a JSON file.
 * @param {string} filePath - Path to deck JSON
 * @param {object} [options] - Validation options
 * @returns {{ valid: boolean, errors: string[], warnings: string[], cardCount: number }}
 */
export function validateDeckFile(filePath, options = {}) {
  if (!fs.existsSync(filePath)) {
    return { valid: false, errors: [`File not found: ${filePath}`], warnings: [], cardCount: 0 };
  }

  let deck;
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    deck = JSON.parse(content);
  } catch (err) {
    return { valid: false, errors: [`Invalid JSON: ${err.message}`], warnings: [], cardCount: 0 };
  }

  const result = validateDeck(deck, options);
  const cards = deck.cards || deck.deck || [];
  return { ...result, cardCount: cards.length };
}

export default { validateDeck, validateDeckFile };
