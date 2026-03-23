import { describe, it, expect } from 'vitest';
import { validateDeck } from '../src/index.js';

describe('validateDeck', () => {
  it('returns error for null deck', () => {
    const r = validateDeck(null);
    expect(r.valid).toBe(false);
    expect(r.errors[0]).toContain('non-null object');
  });

  it('returns error when no cards array', () => {
    const r = validateDeck({ name: 'test' });
    expect(r.valid).toBe(false);
    expect(r.errors[0]).toContain('cards');
  });

  it('warns on empty deck', () => {
    const r = validateDeck({ cards: [] });
    expect(r.valid).toBe(true);
    expect(r.warnings[0]).toContain('empty');
  });

  it('validates required fields', () => {
    const r = validateDeck({ cards: [{ id: 1 }] });
    expect(r.valid).toBe(false);
    expect(r.errors.some(e => e.includes('name'))).toBe(true);
  });

  it('passes valid deck', () => {
    const r = validateDeck({
      cards: [
        { id: 1, name: 'Ace of Cups' },
        { id: 2, name: 'Two of Cups' }
      ]
    });
    expect(r.valid).toBe(true);
    expect(r.errors).toHaveLength(0);
  });

  it('detects duplicate IDs', () => {
    const r = validateDeck({
      cards: [
        { id: 1, name: 'Card A' },
        { id: 1, name: 'Card B' }
      ]
    });
    expect(r.errors.some(e => e.includes('Duplicate'))).toBe(true);
  });

  it('warns on duplicate names', () => {
    const r = validateDeck({
      cards: [
        { id: 1, name: 'Same' },
        { id: 2, name: 'Same' }
      ]
    });
    expect(r.warnings.some(w => w.includes('Duplicate card names'))).toBe(true);
  });

  it('supports custom required fields', () => {
    const r = validateDeck(
      { cards: [{ id: 1, name: 'X' }] },
      { requiredFields: ['id', 'name', 'suit'] }
    );
    expect(r.valid).toBe(false);
    expect(r.errors.some(e => e.includes('suit'))).toBe(true);
  });

  it('accepts "deck" key as alternative to "cards"', () => {
    const r = validateDeck({
      deck: [{ id: 1, name: 'Card A' }]
    });
    expect(r.valid).toBe(true);
  });
});
