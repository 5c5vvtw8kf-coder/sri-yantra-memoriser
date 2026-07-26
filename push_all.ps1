$repo   = "https://github.com/5c5vvtw8kf-coder/sri-yantra-memoriser.git"
$bundle = "$PSScriptRoot\push-all-dev.bundle"

git fetch $bundle refs/heads/dev-clean:refs/heads/dev-clean
if ($LASTEXITCODE -ne 0) { Write-Error "fetch failed"; exit 1 }

git push $repo refs/heads/dev-clean:refs/heads/dev --force-with-lease
if ($LASTEXITCODE -ne 0) { Write-Error "push failed"; exit 1 }

Write-Host "Pushed to dev." -ForegroundColor Green
