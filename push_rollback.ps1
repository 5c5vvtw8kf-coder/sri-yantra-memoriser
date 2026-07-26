$repo   = "C:\Users\ChrisHughes\PTS AUS\PTS Australia - Management\Claude\Workspace\projects\Sri Yantra\Sri Yantra Memoriser"

$bundle = "$repo\push-rollback-dev.bundle"
git -C $repo fetch $bundle 'refs/heads/rollback:refs/remotes/bundle/rollback'
git -C $repo push origin '+refs/remotes/bundle/rollback:refs/heads/dev'
Write-Host "Dev rolled back to last prod deployment"
