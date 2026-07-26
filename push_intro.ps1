$repo   = "C:\Users\ChrisHughes\PTS AUS\PTS Australia - Management\Claude\Workspace\projects\Sri Yantra\Sri Yantra Memoriser"

$bundle = "$repo\push-intro-dev.bundle"
git -C $repo fetch $bundle 'refs/heads/dev-work:refs/remotes/bundle/dev-intro'
git -C $repo push origin '+refs/remotes/bundle/dev-intro:refs/heads/dev'
Write-Host "Pushed to dev"

$bundle2 = "$repo\push-intro-main.bundle"
git -C $repo fetch $bundle2 'refs/heads/main-work:refs/remotes/bundle/main-intro'
git -C $repo push origin '+refs/remotes/bundle/main-intro:refs/heads/main'
Write-Host "Pushed to main (prod)"
