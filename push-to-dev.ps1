<#
  push-to-dev.ps1

  Run this from your own machine after committing local changes.
  Pushes your current branch straight to origin/dev.

  Deliberately does NOT use --force. If this fails with a
  non-fast-forward error, dev has moved on since you last pulled —
  run `git pull --rebase origin dev` and resolve before retrying.
  Never bypass that with --force; that's exactly how dev and main
  diverged silently in the past.
#>

$ErrorActionPreference = "Stop"
$repoRoot = $PSScriptRoot

git -C $repoRoot fetch origin
if ($LASTEXITCODE -ne 0) { Write-Error "fetch failed"; exit 1 }

git -C $repoRoot push origin HEAD:dev
if ($LASTEXITCODE -ne 0) {
    Write-Error "Push to dev rejected (likely non-fast-forward). Pull/rebase onto origin/dev and resolve before retrying. Do not force-push."
    exit 1
}

Write-Host "Pushed to dev." -ForegroundColor Green
