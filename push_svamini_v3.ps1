$repo   = "C:\Users\ChrisHughes\PTS AUS\PTS Australia - Management\Claude\Workspace\projects\Sri Yantra\Sri Yantra Memoriser"

$bundle = "$repo\push-svamini-v3.bundle"
git -C $repo fetch $bundle 'refs/heads/dev:refs/remotes/bundle/dev-svamini-v3'
git -C $repo push origin '+refs/remotes/bundle/dev-svamini-v3:refs/heads/dev'
Write-Host "Pushed: Svamini cream labels + C3 arrow fix to dev"
