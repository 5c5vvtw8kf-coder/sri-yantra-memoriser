$repo   = "C:\Users\ChrisHughes\PTS AUS\PTS Australia - Management\Claude\Workspace\projects\Sri Yantra\Sri Yantra Memoriser"

$bundle = "$repo\push-tour7b-dev.bundle"
git -C $repo fetch $bundle 'refs/heads/dev-correct:refs/remotes/bundle/dev-correct'
git -C $repo push origin 'refs/remotes/bundle/dev-correct:refs/heads/dev'
Write-Host "Pushed to dev"

$bundle2 = "$repo\push-tour7b-main.bundle"
git -C $repo fetch $bundle2 'refs/heads/main-correct:refs/remotes/bundle/main-correct'
git -C $repo push origin 'refs/remotes/bundle/main-correct:refs/heads/main'
Write-Host "Pushed to main (prod)"
