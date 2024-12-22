#!/bin/bash

# This script is used to add pre-commit hook to the git repository.
script_content="#!/bin/bash

# If pushing to master assert that the version has been incremented from the latest version found here: https://jsr.io/@tomsfactory/bot/versions
set -eo pipefail

# Get the current version from the deno.json file
current_version=\$(jq -r '.version' deno.json)

# Get the latest version from the versions file
latest_version=\$(curl -s https://jsr.io/@tomsfactory/bot/meta.json | jq -r '.latest')

# Check if the current version is the same as the latest version
if [ \"\$current_version\" == \"\$latest_version\" ]; then
  echo \"The current version is the same as the latest version. Please increment the version before pushing to master.\"
  exit 1
fi


"

echo "$script_content" > .git/hooks/pre-push

chmod +x .git/hooks/pre-push

echo "Pre-push hook added successfully."
