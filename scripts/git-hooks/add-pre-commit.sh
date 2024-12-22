#!/bin/bash

# This script is used to add pre-commit hook to the git repository.
script_content="#!/bin/bash

# If any command fails, exit immediately with that command's exit status
set -eo pipefail

deno fmt --check
deno lint
deno test -A
deno publish --dry-run --allow-dirty
deno doc --lint ./lib

"

echo "$script_content" > .git/hooks/pre-commit

chmod +x .git/hooks/pre-commit

echo "Pre-commit hook added successfully."
