#!/usr/bin/env python3
"""
Builds a clean commit from known-good blob SHAs, bypassing disk reads.
Run from the repo root: python fix_commit.py
"""
import subprocess, sys, os

REPO = os.path.dirname(os.path.abspath(__file__))

def git(*args, input=None):
    result = subprocess.run(
        ["git"] + list(args),
        cwd=REPO,
        capture_output=True,
        text=True,
        input=input,
    )
    if result.returncode != 0:
        print(f"ERROR: git {' '.join(args)}\n{result.stderr}")
        sys.exit(1)
    return result.stdout.strip()

# ── 1. Verify clean blobs exist ──────────────────────────────────────────────
CLEAN_BLOBS = {
    "C4View.jsx":             "ac1ca928",
    "C5View.jsx":             "400fe519",
    "C6View.jsx":             "117cfa08",
    "C7View.jsx":             "2e334005",
    "C8View.jsx":             "c2295b51",
    "NavaChakreshvariView.jsx": "077abde2",
}

print("Verifying clean blobs...")
for name, sha in CLEAN_BLOBS.items():
    t = git("cat-file", "-t", sha)
    if t != "blob":
        print(f"MISSING blob {sha} for {name}. Aborting.")
        sys.exit(1)
    print(f"  ✓  {sha}  {name}")

# ── 2. Read current HEAD tree ────────────────────────────────────────────────
head_sha = git("rev-parse", "HEAD")
print(f"\nHEAD = {head_sha}")

def ls_tree(tree_sha):
    """Return list of (mode, type, sha, name) for a tree."""
    out = git("ls-tree", tree_sha)
    rows = []
    for line in out.splitlines():
        meta, name = line.split("\t", 1)
        mode, typ, sha = meta.split()
        rows.append((mode, typ, sha, name))
    return rows

# ── 3. Rebuild app/src/components tree ──────────────────────────────────────
def get_subtree(path_parts, tree_sha):
    """Walk down path_parts, returning the tree SHA at the leaf."""
    for part in path_parts:
        rows = ls_tree(tree_sha)
        for mode, typ, sha, name in rows:
            if name == part and typ == "tree":
                tree_sha = sha
                break
        else:
            print(f"Could not find subtree '{part}' in {tree_sha}")
            sys.exit(1)
    return tree_sha

root_tree = git("rev-parse", "HEAD^{tree}")
app_tree     = get_subtree(["app"], root_tree)
src_tree     = get_subtree(["src"], app_tree)
comp_tree    = get_subtree(["components"], src_tree)

print(f"\ncomponents tree = {comp_tree}")

# Build updated components tree
comp_rows = ls_tree(comp_tree)
new_comp_lines = []
for mode, typ, sha, name in comp_rows:
    if name in CLEAN_BLOBS:
        new_sha = CLEAN_BLOBS[name]
        print(f"  replacing {name}: {sha} → {new_sha}")
        new_comp_lines.append(f"{mode} {typ} {new_sha}\t{name}")
    else:
        new_comp_lines.append(f"{mode} {typ} {sha}\t{name}")

new_comp_tree = git("mktree", input="\n".join(new_comp_lines) + "\n")
print(f"new components tree = {new_comp_tree}")

# ── 4. Rebuild src tree ──────────────────────────────────────────────────────
src_rows = ls_tree(src_tree)
new_src_lines = []
for mode, typ, sha, name in src_rows:
    if name == "components":
        new_src_lines.append(f"{mode} {typ} {new_comp_tree}\t{name}")
    else:
        new_src_lines.append(f"{mode} {typ} {sha}\t{name}")

new_src_tree = git("mktree", input="\n".join(new_src_lines) + "\n")
print(f"new src tree = {new_src_tree}")

# ── 5. Rebuild app tree ──────────────────────────────────────────────────────
app_rows = ls_tree(app_tree)
new_app_lines = []
for mode, typ, sha, name in app_rows:
    if name == "src":
        new_app_lines.append(f"{mode} {typ} {new_src_tree}\t{name}")
    else:
        new_app_lines.append(f"{mode} {typ} {sha}\t{name}")

new_app_tree = git("mktree", input="\n".join(new_app_lines) + "\n")
print(f"new app tree = {new_app_tree}")

# ── 6. Rebuild root tree ─────────────────────────────────────────────────────
root_rows = ls_tree(root_tree)
new_root_lines = []
for mode, typ, sha, name in root_rows:
    if name == "app":
        new_root_lines.append(f"{mode} {typ} {new_app_tree}\t{name}")
    else:
        new_root_lines.append(f"{mode} {typ} {sha}\t{name}")

new_root_tree = git("mktree", input="\n".join(new_root_lines) + "\n")
print(f"new root tree = {new_root_tree}")

# ── 7. Create commit ─────────────────────────────────────────────────────────
new_commit = git(
    "commit-tree", new_root_tree,
    "-p", head_sha,
    "-m", "fix: clean C4-C7 C8 Nava blobs, replace SVG arrows with text badges",
)
print(f"\nnew commit = {new_commit}")

# ── 8. Update local refs ─────────────────────────────────────────────────────
# Update both main and master to point to new commit
current_branch = git("rev-parse", "--abbrev-ref", "HEAD")
print(f"current branch = {current_branch}")

# Write the ref for current branch
with open(os.path.join(REPO, ".git", "refs", "heads", current_branch), "w") as f:
    f.write(new_commit + "\n")
print(f"Updated refs/heads/{current_branch} → {new_commit}")

# Also update master if it's different
if current_branch != "master":
    master_ref = os.path.join(REPO, ".git", "refs", "heads", "master")
    if os.path.exists(master_ref):
        with open(master_ref, "w") as f:
            f.write(new_commit + "\n")
        print(f"Updated refs/heads/master → {new_commit}")

print("\nDone. Now run:")
print("  git push origin HEAD:master --force")
