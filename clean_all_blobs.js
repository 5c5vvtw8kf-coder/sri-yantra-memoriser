#!/usr/bin/env node
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REPO = __dirname;

function git() {
  var args = Array.from(arguments);
  var r = spawnSync('git', args, { cwd: REPO, encoding: 'buffer' });
  if (r.status !== 0) { console.error('ERROR: git ' + args.join(' ') + '\n' + r.stderr.toString()); process.exit(1); }
  return r.stdout;
}
function gitStr() { return git.apply(null, arguments).toString('utf8').trim(); }
function readBlob(sha) {
  var buf = git('cat-file', '-p', sha);
  return Buffer.from(buf.filter(function(b) { return b !== 0; })).toString('utf8');
}
function hashObject(content) {
  var tmp = path.join(REPO, '.git', '_clean_tmp.js');
  fs.writeFileSync(tmp, content, 'utf8');
  var sha = gitStr('hash-object', '-w', tmp);
  fs.unlinkSync(tmp);
  return sha;
}
function lsTree(sha) {
  return git('ls-tree', sha).toString('utf8').trim().split('\n').filter(Boolean).map(function(line) {
    var tab = line.indexOf('\t');
    var name = line.slice(tab + 1);
    var parts = line.slice(0, tab).split(' ');
    return { mode: parts[0], type: parts[1], sha: parts[2], name: name };
  });
}

var ALREADY_CLEAN = {
  'C4View.jsx':               'e5c40ca6b2f71b68110cecc2441d424ef37c793e',
  'C5View.jsx':               '2784bfe6f945d069b60ca3f1c8e732f9c32ad4dd',
  'C6View.jsx':               'f57bd51510fd90c2d54cc6afa156f7102d7dae28',
  'C7View.jsx':               'a4e18e1f10c51e5ceea2c974bd567bb1e2a936cc',
  'C8View.jsx':               'b778b122fcddbbd72e6f19edf847f215f3fb6e16',
  'NavaChakreshvariView.jsx': '57337b122c1f32e4c6c4d9b1903fda0dae929b75',
};

var BASE_SRC_TREE = 'f0b94b0d4ae4d3869dfc9e64efd5e096bcb07dd8';
var CLEAN_SRC = {
  'main.jsx': '6603ddb0bbb07476fdb2d02044d9436f37d7df9e',
  'App.jsx':  '3bf875f808dfefb4ac4e3f7d0c7785b3d1e599a0',
};

var results = { components: {}, src: {} };

var compSha = lsTree(BASE_SRC_TREE).filter(function(r) { return r.name === 'components'; })[0].sha;
var compFiles = lsTree(compSha);
console.log('Cleaning components/ (' + compFiles.length + ' files)...');
compFiles.forEach(function(f) {
  if (ALREADY_CLEAN[f.name]) {
    results.components[f.name] = ALREADY_CLEAN[f.name];
    console.log('  SKIP: ' + f.name);
    return;
  }
  var content = readBlob(f.sha);
  var newSha = hashObject(content);
  results.components[f.name] = newSha;
  console.log('  ' + (newSha !== f.sha ? 'CLEANED' : 'ok') + '  ' + f.name + '  ' + newSha.slice(0,8));
});

var srcFiles = lsTree(BASE_SRC_TREE).filter(function(r) { return r.type === 'blob'; });
console.log('\nCleaning src/ root...');
srcFiles.forEach(function(f) {
  if (CLEAN_SRC[f.name]) {
    results.src[f.name] = CLEAN_SRC[f.name];
    console.log('  SKIP: ' + f.name);
    return;
  }
  var content = readBlob(f.sha);
  var newSha = hashObject(content);
  results.src[f.name] = newSha;
  console.log('  ' + (newSha !== f.sha ? 'CLEANED' : 'ok') + '  ' + f.name);
});

fs.writeFileSync(path.join(REPO, '.git', '_clean_blobs.json'), JSON.stringify(results, null, 2));
console.log('\nDone. Wrote .git/_clean_blobs.json');
