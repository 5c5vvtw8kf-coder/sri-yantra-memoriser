#!/usr/bin/env node
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REPO = 'C:\\Users\\ChrisHughes\\PTS AUS\\PTS Australia - Management\\Claude\\Workspace\\projects\\Sri Yantra\\Sri Yantra Memoriser';

function git() {
  var args = Array.from(arguments);
  var r = spawnSync('git', args, { cwd: REPO, encoding: 'buffer' });
  if (r.status !== 0) {
    console.error('ERROR: git ' + args.join(' ') + '\n' + r.stderr.toString());
    process.exit(1);
  }
  return r.stdout;
}

function gitStr() {
  return git.apply(null, arguments).toString('utf8').trim();
}

function readBlob(sha) {
  var buf = git('cat-file', '-p', sha);
  var clean = Buffer.from(buf.filter(function(b) { return b !== 0; }));
  return clean.toString('utf8');
}

function hashObject(content) {
  var tmp = path.join(REPO, '.git', '_patch_tmp.jsx');
  fs.writeFileSync(tmp, content, 'utf8');
  var sha = gitStr('hash-object', '-w', tmp);
  fs.unlinkSync(tmp);
  return sha;
}

var ARROWS = {
  'C4View': { blobSha: 'ac1ca928c69c4153a0bd60b361af7c424263416c', id: 'c4-arrow-green', x1: 135, y1: 152, x2: 168, y2: 152, tx: 174, ty: 156, fontSize: 11 },
  'C5View': { blobSha: '400fe519fba586e9567b9ad191d4302de8a00a73', id: 'c5-arrow-green', x1: 153, y1: 170, x2: 186, y2: 170, tx: 192, ty: 174, fontSize: 10 },
  'C6View': { blobSha: '117cfa08821a8784724f6f1b45ce1f8689dc5c15', id: 'c6-arrow-green', x1: 178, y1: 196, x2: 211, y2: 196, tx: 217, ty: 200, fontSize: 9 },
  'C7View': { blobSha: '2e33400585b1827d629de05b68543381b10e06dc', id: 'c7-arrow-green', x1: 198, y1: 216, x2: 228, y2: 216, tx: 234, ty: 220, fontSize: 8 }
};

var results = {};

Object.keys(ARROWS).forEach(function(name) {
  var spec = ARROWS[name];
  console.log('\nPatching ' + name + '...');
  var content = readBlob(spec.blobSha);

  // 1. Remove the text badge - find <p className="text-center text-xs mt-2" ...> block
  // and its enclosing {!memorise && (...)}
  var pStart = content.indexOf('<p className="text-center text-xs mt-2"');
  if (pStart === -1) {
    console.log('  WARNING: badge <p> not found');
  } else {
    // Find the opening {!memorise before it
    var blockStart = content.lastIndexOf('{!memorise', pStart);
    // Find closing )} after </p>
    var closeP = content.indexOf('</p>', pStart);
    var blockEnd = content.indexOf(')}', closeP);
    if (blockStart !== -1 && blockEnd !== -1) {
      // Also consume leading newline/spaces
      var trimStart = blockStart;
      if (trimStart > 0 && content[trimStart-1] === '\n') trimStart--;
      while (trimStart > 0 && (content[trimStart] === ' ' || content[trimStart] === '\n')) trimStart--;
      trimStart++;
      content = content.slice(0, trimStart) + content.slice(blockEnd + 2);
      console.log('  Removed text badge');
    } else {
      console.log('  WARNING: could not find badge block boundaries');
    }
  }

  // 2. Build defs block
  var defs = '\n            {/* Arrow marker */}\n            <defs>\n              <marker id="' + spec.id + '" markerWidth="7" markerHeight="5"\n                refX="0" refY="2.5" orient="auto">\n                <polygon points="0 0, 7 2.5, 0 5" fill={GREEN} />\n              </marker>\n            </defs>';

  // 3. Build arrow block
  var arrow = '\n                {/* Direction arrow - clockwise */}\n                <line x1="' + spec.x1 + '" y1="' + spec.y1 + '" x2="' + spec.x2 + '" y2="' + spec.y2 + '"\n                  stroke={GREEN} strokeWidth="2.5" opacity="0.70"\n                  markerEnd="url(#' + spec.id + ')" />\n                <text x="' + spec.tx + '" y="' + spec.ty + '" fontSize="' + spec.fontSize + '" fill={GREEN} opacity="0.70"\n                  fontFamily="\'Gentium Plus\', Georgia, serif" fontStyle="italic">\n                  Clockwise\n                </text>';

  // 4. Insert defs after overlay SVG opening (after aria-label="...">)
  var svgRe = /(aria-label="Circuit \d[^"]*">)/;
  if (svgRe.test(content)) {
    content = content.replace(svgRe, '$1' + defs);
    console.log('  Inserted <defs>');
  } else {
    console.log('  WARNING: SVG aria-label not found');
  }

  // 5. Insert arrow right after the first <> in Explore mode block
  var exploreIdx = content.indexOf('Explore mode');
  if (exploreIdx !== -1) {
    var fragIdx = content.indexOf('<>', exploreIdx);
    if (fragIdx !== -1) {
      content = content.slice(0, fragIdx + 2) + arrow + content.slice(fragIdx + 2);
      console.log('  Inserted arrow');
    } else {
      console.log('  WARNING: <> fragment not found');
    }
  } else {
    console.log('  WARNING: Explore mode not found');
  }

  var newSha = hashObject(content);
  results[name] = newSha;
  console.log('  New blob: ' + newSha);
});

console.log('\n=== Results ===');
Object.keys(results).forEach(function(name) {
  console.log('  ' + name + ': ' + results[name]);
});

fs.writeFileSync(path.join(REPO, '.git', '_arrow_blobs.json'), JSON.stringify(results, null, 2));
console.log('\nWrote .git/_arrow_blobs.json');
