$repo   = "C:\Users\ChrisHughes\PTS AUS\PTS Australia - Management\Claude\Workspace\projects\Sri Yantra\Sri Yantra Memoriser"

$bundle = "$repo\restore-dev.bundle"
git -C $repo fetch $bundle 'refs/heads/dev:refs/remotes/bundle/dev-restore'
git -C $repo push origin '+refs/remotes/bundle/dev-restore:refs/heads/dev'
Write-Host "Dev restored to 12-language state (9b609087c)"
