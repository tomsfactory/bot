#!/bin/bash

# This script is used to add pre-commit hook to the git repository.
script_content="#!/bin/bash

deno fmt --check
deno lint
deno test -A

"

echo "$script_content" > .git/hooks/pre-commit

chmod +x .git/hooks/pre-commit
