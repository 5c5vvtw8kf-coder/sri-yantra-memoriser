#!/usr/bin/env python3
"""
Kana patch script for Sri Yantra Memoriser JSX components.
Fetches originals from embedded content, applies kana/furigana patches,
writes patched files to the components directory.
"""
import os, sys

COMP_DIR = os.path.join(os.path.dirname(__file__), 'app', 'src', 'components')

# ─── Shared patch helpers ────────────────────────────────────────────────────

def patch_tooltip_signature_simple(src):
    """Tooltip({ x, y, label, script }) → add kana"""
    return src.replace(
        'function Tooltip({ x, y, label, script }) {',
        'function Tooltip({ x, y, label, script, kana }) {'
    )

def patch_tooltip_signature_seq(src):
    """Tooltip({ x, y, label, script, seq, isMobile }) → add kana"""
    return src.replace(
        'function Tooltip({ x, y, label, script, seq, isMobile }) {',
        'function Tooltip({ x, y, label, script, seq, isMobile, kana }) {'
    )

def patch_tooltip_signature_fill(src):
    """Tooltip({ x, y, label, fill, script }) → add kana"""
    return src.replace(
        'function Tooltip({ x, y, label, fill, script }) {',
        'function Tooltip({ x, y, label, fill, script, kana }) {'
    )

def patch_tooltip_signature_fill_below(src):
    """Tooltip({ x, y, label, fill, script, below = false }) → add kana"""
    return src.replace(
        'function Tooltip({ x, y, label, fill, script, below = false }) {',
        'function Tooltip({ x, y, label, fill, script, below = false, kana }) {'
    )

def patch_rect_multiline(src):
    """Patch rect y and height for kana offset — multiline form (C2/C3/C8/C9/Bhupura)"""
    src = src.replace(
        'x={(tx - w / 2).toFixed(1)} y={(ty - h / 2).toFixed(1)}\n        width={w.toFixed(1)} height={h} rx={3}',
        'x={(tx - w / 2).toFixed(1)} y={(ty - h / 2 - (kana ? 18 : 0)).toFixed(1)}\n        width={w.toFixed(1)} height={h + (kana ? 18 : 0)} rx={3}'
    )
    return src

def patch_rect_inline(src):
    """Patch rect y and height for kana offset — inline form (C4-C7)"""
    src = src.replace(
        'x={(tx - w / 2).toFixed(1)} y={(ty - h / 2).toFixed(1)}\n            width={w.toFixed(1)} height={h} rx={3}',
        'x={(tx - w / 2).toFixed(1)} y={(ty - h / 2 - (kana ? 18 : 0)).toFixed(1)}\n            width={w.toFixed(1)} height={h + (kana ? 18 : 0)} rx={3}'
    )
    return src

KANA_TEXT_BEFORE_LABEL = '''\
      {kana && (
        <text
          x={tx.toFixed(1)} y={(ty - h / 2 - 9).toFixed(1)}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={13} fill="rgba(201,168,76,0.75)" fontFamily="sans-serif"
        >
          {kana}
        </text>
      )}
'''

def patch_add_kana_text_before_label(src, indent='      '):
    """Insert kana text element before the main <text> label element in Tooltip."""
    # The main <text> element rendering {label} always starts at some indentation
    # We look for the pattern: the <text ... > that contains {label}
    # Different files have different indentation
    markers = [
        '\n      <text\n        x={tx.toFixed(1)} y={ty.toFixed(1)}',
        '\n      <text x={tx.toFixed(1)} y={ty.toFixed(1)}'
    ]
    for marker in markers:
        if marker in src:
            src = src.replace(marker, '\n' + KANA_TEXT_BEFORE_LABEL + marker[1:])
            return src
    print("  WARNING: could not find label <text> marker", file=sys.stderr)
    return src

def patch_is_japanese(src, fn_name):
    """Add isJapanese const as first line inside the export default function body."""
    # We look for the closing }) { of the export default props
    # and add the isJapanese line right after
    import re
    # Match the closing }) { followed by optional whitespace and a newline
    pattern = r'(}) \{\n)'
    replacement = r'\1  const isJapanese = uiLang === \'ja\' || script === \'ja\' || script === \'kana\'\n'
    # We want to patch only the LAST occurrence (the export default closing)
    # Actually for all these files there's typically only one `}) {` at the top level
    # Let's find the export default function and patch the }) { within it
    idx = src.rfind('\n}) {\n')
    if idx == -1:
        # Try multiline prop list variant
        idx = src.rfind('\n}) {\n')
    if idx == -1:
        print(f"  WARNING: could not find export default closing braces in {fn_name}", file=sys.stderr)
        return src
    insert_pos = idx + len('\n}) {\n')
    src = src[:insert_pos] + '  const isJapanese = uiLang === \'ja\' || script === \'ja\' || script === \'kana\'\n' + src[insert_pos:]
    return src

# ─── C2 / C3 call site patches ──────────────────────────────────────────────

def patch_c2_call_sites(src):
    # Call site 1: hoveredDot
    src = src.replace(
        "label={displayName(deityById[hoveredDot.id], script)} script={script} />",
        "label={isJapanese ? displayName(deityById[hoveredDot.id], 'iast') : displayName(deityById[hoveredDot.id], script)} kana={isJapanese ? deityById[hoveredDot.id]?.scripts?.kana : null} script={script} />"
    )
    # Call site 2: selected d
    src = src.replace(
        "return <Tooltip x={pos.x} y={pos.y} label={displayName(d, script)} script={script} />",
        "return <Tooltip x={pos.x} y={pos.y} label={isJapanese ? displayName(d, 'iast') : displayName(d, script)} kana={isJapanese ? d?.scripts?.kana : null} script={script} />"
    )
    return src

def patch_c3_call_sites(src):
    return patch_c2_call_sites(src)  # same pattern

def patch_c4_call_sites(src):
    # C4 has seq and isMobile props on Tooltip
    # hoveredDot call site
    src = src.replace(
        "label={displayName(hd, script)} script={script}\n                    seq={hd?.sequenceInSection} isMobile={isMobileView} />",
        "label={isJapanese ? displayName(hd, 'iast') : displayName(hd, script)} kana={isJapanese ? hd?.scripts?.kana : null} script={script}\n                    seq={hd?.sequenceInSection} isMobile={isMobileView} />"
    )
    # selected call site
    src = src.replace(
        "return <Tooltip x={pos.x} y={pos.y} label={displayName(d, script)} script={script}\n                         seq={d.sequenceInSection} isMobile={isMobileView} />",
        "return <Tooltip x={pos.x} y={pos.y} label={isJapanese ? displayName(d, 'iast') : displayName(d, script)} kana={isJapanese ? d?.scripts?.kana : null} script={script}\n                         seq={d.sequenceInSection} isMobile={isMobileView} />"
    )
    return src

def patch_c5_call_sites(src):
    # C5 call sites
    src = src.replace(
        "label={displayName(deityById[hoveredDot.id], script)} script={script}\n                  seq={deityById[hoveredDot.id]?.sequenceInSection} isMobile={isMobileView} />",
        "label={isJapanese ? displayName(deityById[hoveredDot.id], 'iast') : displayName(deityById[hoveredDot.id], script)} kana={isJapanese ? deityById[hoveredDot.id]?.scripts?.kana : null} script={script}\n                  seq={deityById[hoveredDot.id]?.sequenceInSection} isMobile={isMobileView} />"
    )
    src = src.replace(
        "return <Tooltip x={pos.x} y={pos.y} label={displayName(d, script)} script={script} seq={d.sequenceInSection} isMobile={isMobileView} />",
        "return <Tooltip x={pos.x} y={pos.y} label={isJapanese ? displayName(d, 'iast') : displayName(d, script)} kana={isJapanese ? d?.scripts?.kana : null} script={script} seq={d.sequenceInSection} isMobile={isMobileView} />"
    )
    return src

def patch_c6_call_sites(src):
    return patch_c5_call_sites(src)  # same pattern as C5

def patch_c7_call_sites(src):
    return patch_c5_call_sites(src)  # same pattern as C5/C6

def patch_c8_call_sites(src):
    # C8: hoveredDot and selectedId
    src = src.replace(
        "return <Tooltip x={hoveredDot.x} y={hoveredDot.y} label={displayName(d, script)} script={script} />",
        "return <Tooltip x={hoveredDot.x} y={hoveredDot.y} label={isJapanese ? displayName(d, 'iast') : displayName(d, script)} kana={isJapanese ? d?.scripts?.kana : null} script={script} />"
    )
    src = src.replace(
        "return <Tooltip x={pos[0]} y={pos[1]} label={displayName(d, script)} script={script} />",
        "return <Tooltip x={pos[0]} y={pos[1]} label={isJapanese ? displayName(d, 'iast') : displayName(d, script)} kana={isJapanese ? d?.scripts?.kana : null} script={script} />"
    )
    return src

def patch_c9_call_sites(src):
    # C9: single bindu tooltip
    src = src.replace(
        "label={displayName(c9Deity, script)}\n              script={script}",
        "label={isJapanese ? displayName(c9Deity, 'iast') : displayName(c9Deity, script)}\n              kana={isJapanese ? c9Deity?.scripts?.kana : null}\n              script={script}"
    )
    return src

DOTKANA_FUNC = '''
  function dotKana(id) {
    const data = dotData[id]
    if (!data) return null
    if (data.length > 1) return data.map(g => g.scripts?.kana ?? '').join('\\u3001')
    return data[0]?.scripts?.kana ?? null
  }
'''

def patch_bhupura_call_sites(src):
    # Add dotKana function after dotLabel function
    src = src.replace(
        "\n// ── Colours ───────────────────────────────────────────",
        DOTKANA_FUNC + "\n// ── Colours ───────────────────────────────────────────"
    )
    # Update Tooltip call sites that use dotLabel
    src = src.replace(
        "label={dotLabel(hoveredDot.id, script)}\n                    fill={GOLD} script={script} />",
        "label={isJapanese ? dotLabel(hoveredDot.id, 'iast') : dotLabel(hoveredDot.id, script)} kana={isJapanese ? dotKana(hoveredDot.id) : null}\n                    fill={GOLD} script={script} />"
    )
    src = src.replace(
        "return <Tooltip x={pos.x} y={pos.y} label={dotLabel(tooltipId, script)} fill={GOLD} script={script} />",
        "return <Tooltip x={pos.x} y={pos.y} label={isJapanese ? dotLabel(tooltipId, 'iast') : dotLabel(tooltipId, script)} kana={isJapanese ? dotKana(tooltipId) : null} fill={GOLD} script={script} />"
    )
    # Memorise mode desktop hover
    src = src.replace(
        "return <Tooltip x={hoveredDot.x} y={hoveredDot.y}\n                  label={displayName(d, script)} fill={GOLD} script={script} />",
        "return <Tooltip x={hoveredDot.x} y={hoveredDot.y}\n                  label={isJapanese ? displayName(d, 'iast') : displayName(d, script)} kana={isJapanese ? d?.scripts?.kana : null} fill={GOLD} script={script} />"
    )
    # Memorise mode mobile reveal
    src = src.replace(
        "return <Tooltip x={hoveredDot.x} y={hoveredDot.y}\n                  label={displayName(d, script)} fill={GOLD} script={script} />\n              }",
        "return <Tooltip x={hoveredDot.x} y={hoveredDot.y}\n                  label={isJapanese ? displayName(d, 'iast') : displayName(d, script)} kana={isJapanese ? d?.scripts?.kana : null} fill={GOLD} script={script} />\n              }"
    )
    return src

def patch_inner_call_sites(src):
    # hoveredDot call site
    src = src.replace(
        "label={displayName(deityById[hoveredDot.id], script)}\n                  fill={GOLD} script={script}",
        "label={isJapanese ? displayName(deityById[hoveredDot.id], 'iast') : displayName(deityById[hoveredDot.id], script)}\n                  kana={isJapanese ? deityById[hoveredDot.id]?.scripts?.kana : null} fill={GOLD} script={script}"
    )
    # selected call site
    src = src.replace(
        "return <Tooltip x={pos[0]} y={pos[1]} label={displayName(d, script)} fill={GOLD} script={script} below={isBelow(idx)} />",
        "return <Tooltip x={pos[0]} y={pos[1]} label={isJapanese ? displayName(d, 'iast') : displayName(d, script)} kana={isJapanese ? d?.scripts?.kana : null} fill={GOLD} script={script} below={isBelow(idx)} />"
    )
    return src

def patch_inner_fontstyle(src):
    """Replace fontStyle condition to use isJapanese"""
    src = src.replace(
        "fontStyle={script === 'iast' || script === 'english' ? 'italic' : 'normal'}",
        "fontStyle={!isJapanese && (script === 'iast' || script === 'english') ? 'italic' : 'normal'}"
    )
    return src


# ─── Per-file patch pipelines ────────────────────────────────────────────────

def patch_c2(src):
    src = patch_tooltip_signature_simple(src)
    src = patch_rect_multiline(src)
    src = patch_add_kana_text_before_label(src)
    src = patch_is_japanese(src, 'C2View')
    src = patch_c2_call_sites(src)
    return src

def patch_c3(src):
    src = patch_tooltip_signature_simple(src)
    src = patch_rect_multiline(src)
    src = patch_add_kana_text_before_label(src)
    src = patch_is_japanese(src, 'C3View')
    src = patch_c3_call_sites(src)
    return src

def patch_c4(src):
    src = patch_tooltip_signature_seq(src)
    src = patch_rect_inline(src)
    src = patch_add_kana_text_before_label(src)
    src = patch_is_japanese(src, 'C4View')
    src = patch_c4_call_sites(src)
    return src

def patch_c5(src):
    src = patch_tooltip_signature_seq(src)
    src = patch_rect_inline(src)
    src = patch_add_kana_text_before_label(src)
    src = patch_is_japanese(src, 'C5View')
    src = patch_c5_call_sites(src)
    return src

def patch_c6(src):
    src = patch_tooltip_signature_seq(src)
    src = patch_rect_inline(src)
    src = patch_add_kana_text_before_label(src)
    src = patch_is_japanese(src, 'C6View')
    src = patch_c6_call_sites(src)
    return src

def patch_c7(src):
    src = patch_tooltip_signature_seq(src)
    src = patch_rect_inline(src)
    src = patch_add_kana_text_before_label(src)
    src = patch_is_japanese(src, 'C7View')
    src = patch_c7_call_sites(src)
    return src

def patch_c8(src):
    src = patch_tooltip_signature_simple(src)
    src = patch_rect_multiline(src)
    src = patch_add_kana_text_before_label(src)
    src = patch_is_japanese(src, 'C8View')
    src = patch_c8_call_sites(src)
    return src

def patch_c9(src):
    src = patch_tooltip_signature_simple(src)
    src = patch_rect_multiline(src)
    src = patch_add_kana_text_before_label(src)
    src = patch_is_japanese(src, 'C9View')
    src = patch_c9_call_sites(src)
    return src

def patch_bhupura(src):
    src = patch_tooltip_signature_fill(src)
    src = patch_rect_multiline(src)
    src = patch_add_kana_text_before_label(src)
    src = patch_is_japanese(src, 'BhupuraView')
    src = patch_bhupura_call_sites(src)
    return src

def patch_inner(src):
    src = patch_tooltip_signature_fill_below(src)
    src = patch_rect_multiline(src)
    src = patch_add_kana_text_before_label(src)
    src = patch_is_japanese(src, 'InnerView')
    src = patch_inner_call_sites(src)
    src = patch_inner_fontstyle(src)
    return src


PATCHES = {
    'C2View.jsx':     patch_c2,
    'C3View.jsx':     patch_c3,
    'C4View.jsx':     patch_c4,
    'C5View.jsx':     patch_c5,
    'C6View.jsx':     patch_c6,
    'C7View.jsx':     patch_c7,
    'C8View.jsx':     patch_c8,
    'C9View.jsx':     patch_c9,
    'BhupuraView.jsx': patch_bhupura,
    'InnerView.jsx':  patch_inner,
}

def main():
    orig_dir = os.path.join(os.path.dirname(__file__), '_orig_jsx')
    if not os.path.isdir(orig_dir):
        print(f"ERROR: original files directory not found: {orig_dir}", file=sys.stderr)
        sys.exit(1)

    results = {}
    for fname, patch_fn in PATCHES.items():
        orig_path = os.path.join(orig_dir, fname)
        dest_path = os.path.join(COMP_DIR, fname)

        if not os.path.exists(orig_path):
            print(f"  SKIP {fname} — original not found at {orig_path}", file=sys.stderr)
            results[fname] = 'MISSING'
            continue

        with open(orig_path, 'r', encoding='utf-8') as f:
            src = f.read()

        patched = patch_fn(src)

        with open(dest_path, 'w', encoding='utf-8', newline='\n') as f:
            f.write(patched)

        last = patched.rstrip('\n').split('\n')[-1].strip()
        ok = last == '}'
        status = 'OK' if ok else f'BAD_LAST_LINE: {repr(last)}'
        results[fname] = status
        print(f"  {fname}: {status}")

    print("\nSummary:")
    for fname, status in results.items():
        print(f"  {'✓' if status == 'OK' else '✗'} {fname}: {status}")

if __name__ == '__main__':
    main()
