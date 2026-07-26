# Push furigana bundle to GitHub dev branch
# Run from the Sri Yantra Memoriser folder in PowerShell

$ErrorActionPreference = "Stop"

$repoPath = "C:\Users\ChrisHughes\PTS AUS\PTS Australia - Management\Claude\Workspace\projects\Sri Yantra\Sri Yantra Memoriser"
$bundle   = Join-Path $repoPath "push-furigana-dev.bundle"

Set-Location $repoPath

# Fetch the bundle into local repo
git fetch $bundle refs/heads/dev:refs/remotes/bundle/furigana-dev
if ($LASTEXITCODE -ne 0) { throw "git fetch bundle failed" }

# Verify we're on dev
$branch = git rev-parse --abbrev-ref HEAD
if ($branch -ne "dev") {
    Write-Host "Switching to dev..."
    git checkout dev
}

# Merge the bundle commit (fast-forward)
git merge --ff-only refs/remotes/bundle/furigana-dev
if ($LASTEXITCODE -ne 0) { throw "Fast-forward merge failed" }

# Push to GitHub
git push origin dev
if ($LASTEXITCODE -ne 0) { throw "git push failed" }

Write-Host ""
Write-Host "Done. Furigana commit pushed to origin/dev."
Write-Host "Vercel will deploy automatically from dev."
