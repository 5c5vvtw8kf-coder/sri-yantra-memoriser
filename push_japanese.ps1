$repo   = "C:\Users\ChrisHughes\PTS AUS\PTS Australia - Management\Claude\Workspace\projects\Sri Yantra\Sri Yantra Memoriser"

$bundle = "$repo\push-japanese-dev.bundle"
git -C $repo fetch $bundle 'refs/heads/dev:refs/remotes/bundle/dev-japanese-v10'
git -C $repo push origin '+refs/remotes/bundle/dev-japanese-v10:refs/heads/dev'
Write-Host "Pushed: Japanese (ja) UI language to dev"
