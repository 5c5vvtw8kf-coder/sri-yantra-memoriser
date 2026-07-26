$repo   = "C:\Users\ChrisHughes\PTS AUS\PTS Australia - Management\Claude\Workspace\projects\Sri Yantra\Sri Yantra Memoriser"

$bundle = "$repo\push-svamini-v2.bundle"
git -C $repo fetch $bundle 'refs/heads/dev:refs/remotes/bundle/dev-svamini-v2'
git -C $repo push origin '+refs/remotes/bundle/dev-svamini-v2:refs/heads/dev'
Write-Host "Pushed: Garland fix + Svamini/Yogini label and italic fixes to dev"
