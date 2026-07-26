$repo   = "https://github.com/5c5vvtw8kf-coder/sri-yantra-memoriser.git"
$bundle = "$PSScriptRoot\push-bn-v2.bundle"

git fetch $bundle refs/heads/dev-clean:refs/heads/dev-clean
if ($LASTEXITCODE -ne 0) { Write-Error "fetch failed"; exit 1 }

git push $repo refs/heads/dev-clean:refs/heads/dev --force
if ($LASTEXITCODE -ne 0) { Write-Error "push failed"; exit 1 }

Write-Host "Pushed Bengali tooltip v2 fix to dev." -ForegroundColor Green
