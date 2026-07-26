$repo   = "C:\Users\ChrisHughes\PTS AUS\PTS Australia - Management\Claude\Workspace\projects\Sri Yantra\Sri Yantra Memoriser"

$bundle = "$repo\push-intro2-dev.bundle"
git -C $repo fetch $bundle 'refs/heads/dev-work:refs/remotes/bundle/dev-intro2'
git -C $repo push origin '+refs/remotes/bundle/dev-intro2:refs/heads/dev'
Write-Host "Pushed to dev"
