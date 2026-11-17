#!/bin/sh
# Publishes the release branch apps install: runs the checks, builds the compiled tree, force-pushes it to origin.
# RELEASE_BRANCH=release-test publishes a test build beside it, to try a change on real projects first.
set -e
branch="${RELEASE_BRANCH:-release}"
cd "$(dirname "$0")/.."
bun run ci
bun run registry:release   # every item in React and as web components
bun run parity             # and they render identically
out="$(mktemp -d)/release"
node scripts/make-release.mjs "$out"
sha="$(git rev-parse --short HEAD)"
remote="$(git remote get-url origin)"
cd "$out"
git init -q -b "$branch"
git add -A
git -c user.name="$(git -C "$OLDPWD" config user.name)" -c user.email="$(git -C "$OLDPWD" config user.email)" commit -qm "release from $sha"
git push -q -f "$remote" "$branch"
echo "$branch branch updated from $sha"
