"""
derive_triangles.py — Sri Yantra from Seed of Life geometry (corrected)

UFT1 and DFT1: equilateral triangles inscribed in the outer unit circle,
  forming the Star of David hexagram. Hardcoded from SOL confirmation.

UFT2–UFT4: apex at y = 3/4, 1/2, 1/4 on the y-axis.
  Base corners are on DFT1's two slanted sides.

DFT2–DFT5: apex at y = −3/4, −1/2, −1/4, 0 on the y-axis.
  Base corners are on UFT1's two slanted sides.

DFT5 apex at (0,0) = bindu — the innermost Śakti triangle's point
  aims directly at Circuit 9.

All inner triangles are equilateral (verified below).
"""
import math
S3 = math.sqrt(3)

# ── Outer triangles (hardcoded, confirmed from SOL photos) ───────────────────
UFT1 = {'apex': [0.0,  1.0], 'left': [-S3/2, -0.5], 'right': [S3/2, -0.5], 'label': 'UFT1'}
DFT1 = {'apex': [0.0, -1.0], 'left': [-S3/2,  0.5], 'right': [S3/2,  0.5], 'label': 'DFT1'}

# DFT1 sides:  y = -sqrt(3)*x - 1  (left),  y = sqrt(3)*x - 1  (right)
# UFT1 sides:  y =  sqrt(3)*x + 1  (left),  y = -sqrt(3)*x + 1 (right)

def inner_uft(apex_y):
    """UFT with apex on y-axis at apex_y; base corners on DFT1's sides."""
    a = apex_y
    xc = (a + 1) / (2 * S3)
    yc = (a - 1) / 2
    return {'apex': [0.0, a], 'left': [-xc, yc], 'right': [xc, yc]}

def inner_dft(apex_y):
    """DFT with apex on y-axis at apex_y (≤0); base corners on UFT1's sides."""
    d = -apex_y        # depth below centre, ≥ 0
    xc = (1 + d) / (2 * S3)
    yc = (1 - d) / 2
    return {'apex': [0.0, apex_y], 'left': [-xc, yc], 'right': [xc, yc]}

UFT_inner = [inner_uft(a) for a in [3/4, 1/2, 1/4]]
DFT_inner = [inner_dft(a) for a in [-3/4, -1/2, -1/4, 0.0]]

UFT = [UFT1] + [dict(t, label=f'UFT{i+2}') for i, t in enumerate(UFT_inner)]
DFT = [DFT1] + [dict(t, label=f'DFT{i+2}{"" if i<3 else " (C8)"}')
                for i, t in enumerate(DFT_inner)]
DFT[-1]['label'] = 'DFT5 (C8)'

# ── Print coordinates ────────────────────────────────────────────────────────
print("=" * 62)
print("9 TRIANGLE VERTICES — SOL-DERIVED, NORMALISED (outer r = 1.0)")
print("=" * 62)
for t in UFT + DFT:
    a, l, r = t['apex'], t['left'], t['right']
    side = math.dist(a, l)
    print(f"\n{t['label']}")
    print(f"  apex  ({a[0]:+.6f}, {a[1]:+.6f})")
    print(f"  left  ({l[0]:+.6f}, {l[1]:+.6f})")
    print(f"  right ({r[0]:+.6f}, {r[1]:+.6f})")
    print(f"  side = {side:.6f}")

# ── Verification ─────────────────────────────────────────────────────────────
print("\n" + "=" * 62)
print("VERIFICATION")
print("=" * 62)

def on_line(pt, m, c):
    return abs(pt[1] - (m * pt[0] + c)) < 1e-9

all_ok = True
print("\nUFT2–4 corners on DFT1 sides:")
for t in UFT[1:]:
    ok_l = on_line(t['left'],  -S3, -1)
    ok_r = on_line(t['right'],  S3, -1)
    sym  = 'by symmetry' if ok_r else '✗ asymmetric'
    status = '✓' if (ok_l and ok_r) else '✗ FAIL'
    print(f"  {t['label']}: {status}")
    if not (ok_l and ok_r): all_ok = False

print("DFT2–5 corners on UFT1 sides:")
for t in DFT[1:]:
    ok_l = on_line(t['left'],   S3,  1)
    ok_r = on_line(t['right'], -S3,  1)
    status = '✓' if (ok_l and ok_r) else '✗ FAIL'
    print(f"  {t['label']}: {status}")
    if not (ok_l and ok_r): all_ok = False

print("Equilateral check (base == side):")
for t in UFT + DFT:
    side = math.dist(t['apex'], t['left'])
    base = math.dist(t['left'], t['right'])
    ok = abs(side - base) < 1e-9
    if not ok: all_ok = False
    print(f"  {t['label']}: side={side:.6f} base={base:.6f} {'✓' if ok else '✗'}")

print(f"\nOverall: {'ALL PASS ✓' if all_ok else 'FAILURES DETECTED ✗'}")

# ── JSX output ───────────────────────────────────────────────────────────────
print("\n" + "=" * 62)
print("JSX — paste into SriYantraSVG.jsx")
print("=" * 62)

def fmt(v):
    if v == 0.0: return '0'
    s = f"{v:.6f}".rstrip('0').rstrip('.')
    return s

print("\nconst UFT = [")
for i, t in enumerate(UFT):
    a, l, r = t['apex'], t['left'], t['right']
    print(f"  {{ verts: [[{fmt(a[0])}, {fmt(a[1])}], [{fmt(l[0])}, {fmt(l[1])}], [{fmt(r[0])}, {fmt(r[1])}]], label: '{t['label']}' }}"
          + ("," if i < len(UFT)-1 else ""))
print("]")

print("\nconst DFT = [")
for i, t in enumerate(DFT):
    a, l, r = t['apex'], t['left'], t['right']
    print(f"  {{ verts: [[{fmt(a[0])}, {fmt(a[1])}], [{fmt(l[0])}, {fmt(l[1])}], [{fmt(r[0])}, {fmt(r[1])}]], label: '{t['label']}' }}"
          + ("," if i < len(DFT)-1 else ""))
print("]")

print("""
// Geometric properties:
// UFT1, DFT1 : equilateral inscribed in outer circle (r=1)
// UFT2, DFT2 : side = 7√3/12 ≈ 1.0104   apices at ±3/4
// UFT3, DFT3 : side = √3/2   ≈ 0.8660   apices at ±1/2
// UFT4, DFT4 : side = 5√3/12 ≈ 0.7217   apices at ±1/4
// DFT5 (C8)  : side = √3/3   ≈ 0.5774   apex  at  0 (bindu)
// UFT2-4 base corners lie exactly on DFT1's slanted sides
// DFT2-5 base corners lie exactly on UFT1's slanted sides
// All 9 triangles are equilateral""")
