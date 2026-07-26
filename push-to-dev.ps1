$repo   = "https://github.com/5c5vvtw8kf-coder/sri-yantra-memoriser.git"
$bundle = "$PSScriptRoot\push-canvas.bundle"
$gitDir = $PSScriptRoot

git -C $gitDir fetch $bundle refs/heads/dev-clean:refs/heads/dev-clean
if ($LASTEXITCODE -ne 0) { Write-Error "fetch failed"; exit 1 }

git -C $gitDir push $repo refs/heads/dev-clean:refs/heads/dev --force
if ($LASTEXITCODE -ne 0) { Write-Error "push to dev failed"; exit 1 }

Write-Host "Pushed to dev." -ForegroundColor Green
Write-Host "Verify at https://app-one-sigma-31.vercel.app then run .\push-to-main.ps1 to promote." -ForegroundColor Yellow
