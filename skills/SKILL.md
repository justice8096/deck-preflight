---
name: deck-preflight
description: Validate card deck JSON files for completeness, duplicates, and asset references
version: 0.1.0
---

# Deck Preflight Validator Skill

Use this skill when the user has a deck.json (or similar card/game asset manifest) and wants to validate it before use.

## When to use
- User has a JSON file describing a deck of cards or game assets
- User wants to check for missing images, duplicate entries, or incomplete metadata
- User mentions "validate deck", "preflight check", or "card manifest"

## How to use

```bash
node preflight.js <deck.json> [--assets-dir ./images]
```

## Checks performed
- All required fields present for each card entry
- No duplicate card IDs or names
- Referenced image/asset files exist on disk
- Consistent metadata format across all entries
- Reports warnings for optional but recommended fields

## Output
Prints a summary of errors and warnings. Exits with code 1 if any errors found (useful in CI).
