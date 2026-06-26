$repo   = "C:\Users\ChrisHughes\PTS AUS\PTS Australia - Management\Claude\Workspace\projects\Sri Yantra\Sri Yantra Memoriser"
$bundle = "$repo\push_ce0be43.bundle"
foreach ($lock in @("$repo\.git\refs\heads\dev.lock", "$repo\.git\HEAD.lock")) {
    if (Test-Path $lock) { Remove-Item $lock -Force; Write-Host "Removed $lock" }
}
git -C $repo bundle unbundle $bundle
git -C $repo update-ref refs/heads/dev ce0be43
Write-Host "dev now at: $(git -C $repo rev-parse dev)"
git -C $repo push origin dev
Remove-Item $bundle -Force
Write-Host "Done"
