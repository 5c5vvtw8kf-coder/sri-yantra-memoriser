$repo   = "C:\Users\ChrisHughes\PTS AUS\PTS Australia - Management\Claude\Workspace\projects\Sri Yantra\Sri Yantra Memoriser"

$bundle = "$repo\push-garland-dev.bundle"
git -C $repo fetch $bundle 'refs/heads/dev:refs/remotes/bundle/dev-garland'
git -C $repo push origin '+refs/remotes/bundle/dev-garland:refs/heads/dev'
Write-Host "Pushed: Garland of Swords phrasing fix to dev"
