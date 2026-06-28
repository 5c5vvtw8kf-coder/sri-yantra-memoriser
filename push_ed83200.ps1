$repo   = "C:\Users\ChrisHughes\PTS AUS\PTS Australia - Management\Claude\Workspace\projects\Sri Yantra\Sri Yantra Memoriser"
$bundle = "$repo\push-nav-font.bundle"
git -C $repo fetch $bundle 'refs/heads/dev:refs/remotes/bundle/dev'
git -C $repo push origin 'refs/remotes/bundle/dev:refs/heads/dev'
Write-Host "Pushed commit ed83200 — IAST nav menu font size increase"
