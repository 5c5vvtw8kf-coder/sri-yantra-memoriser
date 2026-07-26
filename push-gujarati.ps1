$repo   = "https://github.com/5c5vvtw8kf-coder/sri-yantra-memoriser.git"
$gitDir = $PSScriptRoot

# Remove stale locks if present
foreach ($f in @(".git\index.lock", ".git\HEAD.lock", ".git\refs\heads\dev.lock", ".git\refs\heads\dev-clean.lock")) {
    $p = Join-Path $gitDir $f
    if (Test-Path $p) { Remove-Item $p -Force; Write-Host "Removed $f" }
}

# Stage and commit all changes on the current (dev) branch
git -C $gitDir add -A
if ($LASTEXITCODE -ne 0) { Write-Error "git add failed"; exit 1 }

git -C $gitDir commit -m "feat: add Gujarati (gu) locale — IntroView, TourGuide, translations"
if ($LASTEXITCODE -ne 0) { Write-Error "git commit failed (nothing to commit?)"; exit 1 }

# Merge dev into dev-clean so the bundle mechanism keeps working
git -C $gitDir checkout dev-clean
if ($LASTEXITCODE -ne 0) { Write-Error "checkout dev-clean failed"; exit 1 }

git -C $gitDir merge dev --no-edit
if ($LASTEXITCODE -ne 0) { Write-Error "merge failed"; exit 1 }

# Push dev-clean directly to the remote dev branch
git -C $gitDir push $repo refs/heads/dev-clean:refs/heads/dev --force
if ($LASTEXITCODE -ne 0) { Write-Error "push failed"; exit 1 }

# Return to dev for continued work
git -C $gitDir checkout dev

Write-Host "Pushed Gujarati locale to dev." -ForegroundColor Green
Write-Host "Verify at https://app-one-sigma-31.vercel.app then run .\push-to-main.ps1 to promote." -ForegroundColor Yellow
