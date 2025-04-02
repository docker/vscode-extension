#!/usr/bin/env bash

set -e

signoff_regex="^Signed-off-by: [A-Za-z .'-]+ <[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}>$"
commits=$(gh pr view "$1" --json commits -q ".commits[].oid")

missing=0

for sha in $commits; do
  echo "🔍 Checking commit $sha..."
  message=$(git log -1 --pretty=format:%B "$sha")

  if echo "$message" | grep -Eq "$signoff_regex"; then
    echo "✔ 'Signed-off-by' message found."
    continue
  fi

  is_verified=$(gh api repos/${GITHUB_REPOSITORY}/commits/$sha --jq '.commit.verification.verified')
  if [ "$is_verified" = "true" ]; then
    echo "✔ Verified signature found."
    continue
  fi

  echo "::error file=.git/COMMIT_EDITMSG::❌ Commit $sha is missing either a valid Signed-off-by message or a verified (GPG, SSH, or S/MIME) signature."
  missing=$((missing + 1))
done

if [ "$missing" -gt 0 ]; then
  echo "❌ Some commits are not properly signed."
  exit 1
fi

echo "✅ All commits are properly signed."