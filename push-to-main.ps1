$repo   = "https://github.com/5c5vvtw8kf-coder/sri-yantra-memoriser.git"
$bundle = "$PSScriptRoot\push-canvas.bundle"
$gitDir = $PSScriptRoot

git -C $gitDir fetch $bundle refs/heads/dev-clean:refs/heads/dev-clean
if ($LASTEXITCODE -ne 0) { Write-Error "fetch failed"; exit 1 }

git -C $gitDir push $repo refs/heads/dev-clean:refs/heads/dev --force
if ($LASTEXITCODE -ne 0) { Write-Error "push to dev failed"; exit 1 }

git -C $gitDir push $repo refs/heads/dev-clean:refs/heads/main --force
if ($LASTEXITCODE -ne 0) { Write-Error "push to main failed"; exit 1 }

Write-Host "Pushed to dev + main." -ForegroundColor Green
