<#
  apply-sandbox-handoff.ps1

  Run this from your own machine after a Cowork/sandbox session hands
  off work (the sandbox has no GitHub credentials, so it can't push
  directly — it exports one fixed-name bundle file instead).

  Always looks for the SAME file: sandbox-handoff.bundle
  A Cowork session should always fetch+merge origin/dev BEFORE
  creating this bundle, so applying it here should always be a
  fast-forward. If it isn't, something diverged upstream in the
  sandbox session — don't force it through, go find out why.

  After this succeeds, run push-to-dev.ps1 to publish it, then
  publish-to-main.ps1 when ready to go live.
#>

$ErrorActionPreference = "Stop"
$repoRoot = $PSScriptRoot
$bundle = Join-Path $repoRoot "sandbox-handoff.bundle"

if (-not (Test-Path $bundle)) {
    Write-Error "No sandbox-handoff.bundle found in $repoRoot. Nothing to apply."
    exit 1
}

git -C $repoRoot fetch origin
if ($LASTEXITCODE -ne 0) { Write-Error "fetch failed"; exit 1 }

git -C $repoRoot fetch $bundle refs/heads/dev:refs/heads/sandbox-handoff
if ($LASTEXITCODE -ne 0) { Write-Error "Could not read bundle — it may be stale or malformed."; exit 1 }

# Fast-forward local dev to the handoff — if this isn't a clean
# fast-forward, the sandbox session didn't sync with origin/dev
# before bundling. Stop and reconcile by hand.
git -C $repoRoot checkout dev
git -C $repoRoot merge --ff-only sandbox-handoff
if ($LASTEXITCODE -ne 0) {
    Write-Error "Handoff does not fast-forward onto local dev. Do not force-merge — inspect 'git log dev..sandbox-handoff' and 'git log sandbox-handoff..dev' to see what diverged."
    exit 1
}

git -C $repoRoot branch -D sandbox-handoff
Remove-Item $bundle

Write-Host "Applied sandbox handoff to local dev. Run push-to-dev.ps1 next." -ForegroundColor Green
