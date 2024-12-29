#!/bin/bash

set -eo pipefail

echo "Ensure you are running this script from the root of the project."

./scripts/git-hooks/add-pre-commit.sh
./scripts/git-hooks/add-pre-push.sh
./scripts/git-hooks/add-commit-msg.sh
