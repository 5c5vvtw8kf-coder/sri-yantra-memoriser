<#
  publish-to-main.ps1

  Run this from your own machine to publish dev -> main (production,
  deployed by Vercel).

  Fast-forward only, deliberately no --force. If main has diverged
  from dev (someone pushed to main directly, or a bundle was applied
  out of order), this will refuse and tell you to reconcile by hand
  rather than silently overwriting whichever side loses.
#>

$ErrorActionPreference = "Stop"
$repoRoot = $PSScriptRoot

git -C $repoRoot fetch origin
if ($LASTEXITCODE -ne 0) { Write-Error "fetch failed"; exit 1 }

# main must fast-forward to origin/dev — if it can't, something has diverged.
git -C $repoRoot push origin origin/dev:main
if ($LASTEXITCODE -ne 0) {
    Write-Error "Publish to main rejected (not a fast-forward). main and dev have diverged — reconcile manually (merge, don't force-push) before retrying."
    exit 1
}

Write-Host "Published dev -> main." -ForegroundColor Green
