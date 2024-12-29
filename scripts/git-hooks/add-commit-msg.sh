#!/bin/bash

# This script is used to add pre-commit hook to the git repository.
script_content="#!/bin/bash

# Taken from https://github.com/joaobsjunior/sh-conventional-commits/blob/main/commit-msg

# Regex to validate the type pattern
REGEX=\"^((Merge[ a-z-]* branch.*)|(Revert*)|((build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test)(\(.*\))?!?: .*))\"

FILE=\`cat \$1\` # File containing the commit message

echo \"Commit Message: \${FILE}\"

if ! [[ \$FILE =~ \$REGEX ]]; then
  echo >&2 \"ERROR: Commit aborted for not following the Conventional Commit standard.\"
  exit 1
else
  echo >&2 \"Valid commit message.\"
fi

"

echo "$script_content" > .git/hooks/commit-msg

chmod +x .git/hooks/commit-msg

echo "Commit-msg hook added successfully."
