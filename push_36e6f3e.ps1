$bundle = Join-Path $PSScriptRoot "push-script-labels.bundle"
$repo   = $PSScriptRoot
git -C $repo fetch $bundle 'refs/heads/dev:refs/remotes/bundle/dev'
git -C $repo push origin 'refs/remotes/bundle/dev:refs/heads/dev'
Write-Host "Pushed commit 36e6f3e — Script picker English names"
