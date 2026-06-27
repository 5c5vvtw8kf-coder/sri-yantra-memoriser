$repo   = "C:\Users\ChrisHughes\PTS AUS\PTS Australia - Management\Claude\Workspace\projects\Sri Yantra\Sri Yantra Memoriser"

$bundle = "$repo\push-tour6-dev.bundle"
git -C $repo fetch $bundle 'refs/heads/dev:refs/remotes/bundle/dev'
git -C $repo push origin 'refs/remotes/bundle/dev:refs/heads/dev'
Write-Host "Pushed to dev"

$bundle2 = "$repo\push-tour6-main.bundle"
git -C $repo fetch $bundle2 'refs/heads/main-merge:refs/remotes/bundle/main-merge'
git -C $repo push origin 'refs/remotes/bundle/main-merge:refs/heads/main'
Write-Host "Pushed to main (prod)"
