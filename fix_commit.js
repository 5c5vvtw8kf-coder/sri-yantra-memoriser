#!/usr/bin/env node
/**
 * Builds a clean commit:
 *  - app/src tree base: 8918cbb (has C4-C7/C8/Nava badge changes)
 *  - app/src/main.jsx replaced with clean blob from 2f9c818
 *  - app/src/App.jsx  replaced with complete blob 3bf875f8
 *  - root vercel.json updated for Root Dir = app
 */
const { spawnSync } = require('child_process');
const fs   = require('fs');
const path = require('path');

const REPO = __dirname;

function git(...args) {
  const r = spawnSync('git', args, { cwd: REPO, encoding: 'utf8' });
  if (r.status !== 0) { console.error(`ERROR: git ${args.join(' ')}\n${r.stderr}`); process.exit(1); }
  return r.stdout.trim();
}

const TMP = path.join(REPO, '.git', '_mktree_input.txt');
function mktree(rows) {
  const input = rows.map(r => `${r.mode} ${r.type} ${r.sha}\t${r.name}`).join('\n') + '\n';
  fs.writeFileSync(TMP, input, 'utf8');
  const fd = fs.openSync(TMP, 'r');
  const r = spawnSync('git', ['mktree'], { cwd: REPO, encoding: 'utf8', stdio: [fd, 'pipe', 'pipe'] });
  fs.closeSync(fd);
  if (r.status !== 0) { console.error(`mktree failed:\n${r.stderr}\nInput:\n${input}`); process.exit(1); }
  return r.stdout.trim();
}

function lsTree(sha) {
  return git('ls-tree', sha).split('\n').filter(Boolean).map(line => {
    const tab  = line.indexOf('\t');
    const name = line.slice(tab + 1);
    const [mode, type, blobSha] = line.slice(0, tab).split(' ');
    return { mode, type, sha: blobSha, name };
  });
}

// ── Known-clean blobs (src/ level) ────────────────────────────────────────
const CLEAN_SRC = {
  'main.jsx': '6603ddb0bbb07476fdb2d02044d9436f37d7df9e', // complete, from 2f9c818
  'App.jsx':  '3bf875f808dfefb4ac4e3f7d0c7785b3d1e599a0', // complete, ends with </aside>
};

// ── Known-clean blobs (src/components/ level) ─────────────────────────────
const CLEAN_COMP = {
  // C4-C7: SVG inline arrows restored (text badges removed)
  'C4View.jsx': 'd974cceffc172e36a84816a18b2b0d10545d8170',
  'C5View.jsx': '7d46560311bfcdb3fdd898a97ff8843a9483a88e',
  'C6View.jsx': '2e71969767ad1f84cd4afc2f625b6582f1a0ac79',
  'C7View.jsx': '420894fd9b6a7550896c2eb15d41476fe655d05e',
  // C8View: complete pre-badge blob + ↻ clockwise badge patched in sandbox
  'C8View.jsx': 'b778b122fcddbbd72e6f19edf847f215f3fb6e16',
  // NavaChakreshvariView: complete + mobile explore instruction patched in sandbox
  'NavaChakreshvariView.jsx': '57337b122c1f32e4c6c4d9b1903fda0dae929b75',
};

// Root vercel.json for Root Dir = ./ : cd app && npm install && npm run build
const ROOT_VERCEL = '7849c518f3239591506a7167ccacf877d3fa77ed';

// src tree from 8918cbb (has all intended C4-C7/C8/Nava badge changes)
const BASE_SRC_TREE = 'f0b94b0d4ae4d3869dfc9e64efd5e096bcb07dd8';

// ── Verify ─────────────────────────────────────────────────────────────────
for (const [name, sha] of [...Object.entries(CLEAN_SRC), ...Object.entries(CLEAN_COMP)]) {
  const t = git('cat-file', '-t', sha);
  if (t !== 'blob') { console.error(`MISSING ${sha} (${name})`); process.exit(1); }
  console.log(`  ok  ${sha}  ${name}`);
}
if (git('cat-file', '-t', BASE_SRC_TREE) !== 'tree') { console.error('Missing base src tree'); process.exit(1); }
console.log(`  ok  ${BASE_SRC_TREE}  base src tree (8918cbb)`);
if (git('cat-file', '-t', ROOT_VERCEL) !== 'blob') { console.error('Missing root vercel.json blob'); process.exit(1); }
console.log(`  ok  ${ROOT_VERCEL}  root vercel.json`);

// ── Rebuild components tree ─────────────────────────────────────────────────
const compSha    = lsTree(BASE_SRC_TREE).find(r => r.name === 'components').sha;
const newCompTree = mktree(lsTree(compSha).map(r =>
  CLEAN_COMP[r.name] ? { ...r, sha: CLEAN_COMP[r.name] } : r
));
console.log(`new comp  = ${newCompTree}`);

// ── Rebuild src tree ────────────────────────────────────────────────────────
const newSrcTree = mktree(lsTree(BASE_SRC_TREE).map(r => {
  if (r.name === 'components') return { ...r, sha: newCompTree };
  if (CLEAN_SRC[r.name])       return { ...r, sha: CLEAN_SRC[r.name] };
  return r;
}));
console.log(`\nnew src   = ${newSrcTree}`);

// ── HEAD info ───────────────────────────────────────────────────────────────
const headSha   = git('rev-parse', 'HEAD');
const rootTree  = git('cat-file', '-p', 'HEAD').split('\n')[0].replace('tree ', '').trim();
console.log(`HEAD      = ${headSha}`);
console.log(`root tree = ${rootTree}`);

// ── Rebuild app tree ────────────────────────────────────────────────────────
const appSha    = lsTree(rootTree).find(r => r.name === 'app').sha;
// app/vercel.json must be present for Root Dir = app builds
const APP_VERCEL = '0654b16c1a6f399628e64041d9ce6d62737fefb7';
// index.html with build comment to force a real tree diff
const INDEX_HTML = 'cb77e0f1db4b21b8e99d34a91de3aafb7050345d'; // force-v5
const appRows = lsTree(appSha).map(r => {
  if (r.name === 'src')        return { ...r, sha: newSrcTree };
  if (r.name === 'index.html') return { ...r, sha: INDEX_HTML };
  return r;
});
// Add app/vercel.json if missing
if (!appRows.find(r => r.name === 'vercel.json')) {
  appRows.push({ mode: '100644', type: 'blob', sha: APP_VERCEL, name: 'vercel.json' });
  appRows.sort((a, b) => a.name.localeCompare(b.name));
}
const newAppTree = mktree(appRows);
console.log(`new app   = ${newAppTree}`);

// ── Rebuild root tree ───────────────────────────────────────────────────────
const newRootTree = mktree(lsTree(rootTree).map(r => {
  if (r.name === 'app') return { ...r, sha: newAppTree };
  if (r.name === 'vercel.json') return { ...r, sha: ROOT_VERCEL };
  return r;
}));
console.log(`new root  = ${newRootTree}`);

// ── Commit ──────────────────────────────────────────────────────────────────
const MSG = 'fix: clean src from 8918cbb + fixed main.jsx + complete App.jsx';
const cr  = spawnSync('git', ['commit-tree', newRootTree, '-p', headSha, '-F', '-'], {
  cwd: REPO, encoding: 'utf8', input: MSG + '\n'
});
if (cr.status !== 0) { console.error(cr.stderr); process.exit(1); }
const newCommit = cr.stdout.trim();
console.log(`new commit = ${newCommit}`);

// ── Update refs ─────────────────────────────────────────────────────────────
const branch  = git('rev-parse', '--abbrev-ref', 'HEAD');
const refsDir = path.join(REPO, '.git', 'refs', 'heads');
fs.writeFileSync(path.join(refsDir, branch), newCommit + '\n');
console.log(`refs/heads/${branch} -> ${newCommit}`);
if (branch !== 'master') {
  const mRef = path.join(refsDir, 'master');
  if (fs.existsSync(mRef)) { fs.writeFileSync(mRef, newCommit + '\n'); console.log(`refs/heads/master -> ${newCommit}`); }
}

console.log('\nDone. Run:\n  git push origin HEAD:master --force');
