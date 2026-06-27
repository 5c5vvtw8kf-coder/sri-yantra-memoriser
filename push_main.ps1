$repo   = "C:\Users\ChrisHughes\PTS AUS\PTS Australia - Management\Claude\Workspace\projects\Sri Yantra\Sri Yantra Memoriser"
$bundle = "$repo\push-main.bundle"
git -C $repo fetch $bundle 'refs/heads/main-merge:refs/remotes/bundle/main-merge'
git -C $repo push origin 'refs/remotes/bundle/main-merge:refs/heads/main'
Write-Host "Pushed dev → main (prod)"
