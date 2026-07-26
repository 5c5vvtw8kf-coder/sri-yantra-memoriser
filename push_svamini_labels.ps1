$repo   = "C:\Users\ChrisHughes\PTS AUS\PTS Australia - Management\Claude\Workspace\projects\Sri Yantra\Sri Yantra Memoriser"

$bundle = "$repo\push-svamini-labels.bundle"
git -C $repo fetch $bundle 'refs/heads/dev:refs/remotes/bundle/dev-svamini'
git -C $repo push origin '+refs/remotes/bundle/dev-svamini:refs/heads/dev'
Write-Host "Pushed: Svamini/Yogini label and italic fixes to dev"
