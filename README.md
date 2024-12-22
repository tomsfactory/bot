# @tomsfactory/bot

## Development workflow

1. If it's the first time you're working in this repo on your current machine,
   install the git hooks with `./scripts/add-git-hooks.sh`
2. Create a branch
3. Make changes on branch
4. Once reviewed, increase package version with
   `deno task version:<minor|major|patch>` accordingly
5. Merge in to master and the package will be deployed to
   [jsr](https://jsr.io/@tomsfactory/bot) via a
   [github workflow](.github/workflows/publish.yml)
