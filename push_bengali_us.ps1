$repo = "https://github.com/5c5vvtw8kf-coder/sri-yantra-memoriser.git"
$bundle = "$PSScriptRoot\push-bengali-us-dev.bundle"

# Fetch both commits (Bengali + US English) from the bundle into the dev branch
git fetch $bundle refs/heads/dev-clean:refs/heads/dev-clean
if ($LASTEXITCODE -ne 0) { Write-Error "fetch failed"; exit 1 }

# Push dev-clean as dev on GitHub (covers Bengali + US English in one push)
git push $repo refs/heads/dev-clean:refs/heads/dev
if ($LASTEXITCODE -ne 0) { Write-Error "push failed"; exit 1 }

Write-Host "Pushed Bengali + US English variant to dev on GitHub." -ForegroundColor Green
