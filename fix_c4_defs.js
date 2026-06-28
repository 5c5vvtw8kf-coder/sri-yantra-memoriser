#!/usr/bin/env node
// Patches C4View blob 2e9575d5 to insert missing <defs> marker block
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REPO = 'C:\\Users\\ChrisHughes\\PTS AUS\\PTS Australia - Management\\Claude\\Workspace\\projects\\Sri Yantra\\Sri Yantra Memoriser';

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
  var tmp = path.join(REPO, '.git', '_patch_tmp.jsx');
  fs.writeFileSync(tmp, content, 'utf8');
  var sha = gitStr('hash-object', '-w', tmp);
  fs.unlinkSync(tmp);
  return sha;
}

var content = readBlob('2e9575d5f9e8f6a440b3cfdf6ebf71b55aaab038');

// C4's SVG tag has > on its own line: aria-label="..."\n          >
// Insert defs after that >
var defs = '\n            {/* Arrow marker */}\n            <defs>\n              <marker id="c4-arrow-green" markerWidth="7" markerHeight="5"\n                refX="0" refY="2.5" orient="auto">\n                <polygon points="0 0, 7 2.5, 0 5" fill={GREEN} />\n              </marker>\n            </defs>';

// Find the pattern: aria-label="Circuit 4 ... positions"\n          >
var idx = content.indexOf('aria-label="Circuit 4');
if (idx === -1) { console.error('aria-label not found'); process.exit(1); }
// Find the > after it (could be same line or next line)
var gtIdx = content.indexOf('>', idx);
if (gtIdx === -1) { console.error('> not found'); process.exit(1); }
console.log('Found > at index ' + gtIdx + ', char before: ' + JSON.stringify(content.slice(gtIdx-5, gtIdx+3)));

content = content.slice(0, gtIdx + 1) + defs + content.slice(gtIdx + 1);
console.log('Inserted <defs>');

var newSha = hashObject(content);
console.log('New C4View blob: ' + newSha);

// Update the JSON
var jsonPath = path.join(REPO, '.git', '_arrow_blobs.json');
var blobs = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
blobs['C4View'] = newSha;
fs.writeFileSync(jsonPath, JSON.stringify(blobs, null, 2));
console.log('Updated _arrow_blobs.json');
console.log(JSON.stringify(blobs, null, 2));
