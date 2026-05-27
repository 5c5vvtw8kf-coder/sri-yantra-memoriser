#!/usr/bin/env python3
"""
add_scripts.py — Add Telugu, Tamil, Marathi, and Hindi scripts to
khadgamala-canonical.json.

Marathi and Hindi both use Devanagari script, so they are copied directly
from the existing 'devanagari' field (no conversion needed).

Telugu and Tamil are converted from IAST using the indic-transliteration
library, which encodes the standard Unicode character mappings for Sanskrit.

Setup (run once):
    pip install indic-transliteration

Run from the project root:
    python3 scripts/add_scripts.py

The JSON file is updated in place. Existing script fields are not
overwritten — run with --force to overwrite.
"""

import json
import sys
import argparse

DATA_FILE = 'app/src/data/khadgamala-canonical.json'

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--force', action='store_true',
                        help='Overwrite existing Telugu/Tamil fields if present')
    args = parser.parse_args()

    try:
        from indic_transliteration import sanscript
        from indic_transliteration.sanscript import transliterate
    except ImportError:
        print("ERROR: indic-transliteration not installed.")
        print("Run: pip install indic-transliteration")
        sys.exit(1)

    with open(DATA_FILE, encoding='utf-8') as f:
        data = json.load(f)

    updated = 0
    skipped = 0

    for deity in data['deities']:
        scripts = deity.get('scripts', {})
        iast       = scripts.get('iast')
        devanagari = scripts.get('devanagari')

        if not iast:
            skipped += 1
            continue

        changed = False

        # Marathi and Hindi — Devanagari script, copy existing field
        if 'marathi' not in scripts or args.force:
            scripts['marathi'] = devanagari
            changed = True
        if 'hindi' not in scripts or args.force:
            scripts['hindi'] = devanagari
            changed = True

        # Telugu — convert from IAST
        if 'telugu' not in scripts or args.force:
            scripts['telugu'] = transliterate(iast, sanscript.IAST, sanscript.TELUGU)
            changed = True

        # Tamil — convert from IAST
        # Note: Tamil script does not have all Sanskrit consonants. The library
        # uses standard Tamil-Grantha conventions for Sanskrit texts.
        if 'tamil' not in scripts or args.force:
            scripts['tamil'] = transliterate(iast, sanscript.IAST, sanscript.TAMIL)
            changed = True

        if changed:
            updated += 1

    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"Done. {updated} entries updated, {skipped} skipped (no IAST).")
    print(f"File written: {DATA_FILE}")

    # Spot-check: print first 3 entries
    print("\nSpot check — first 3 deity entries:")
    for deity in data['deities'][:3]:
        s = deity['scripts']
        print(f"\n  IAST:      {s.get('iast')}")
        print(f"  Devanagari:{s.get('devanagari')}")
        print(f"  Telugu:    {s.get('telugu')}")
        print(f"  Tamil:     {s.get('tamil')}")
        print(f"  Marathi:   {s.get('marathi')}")
        print(f"  Hindi:     {s.get('hindi')}")

if __name__ == '__main__':
    main()
