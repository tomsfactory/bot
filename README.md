# @tomsfactory/bot

Uses Deno 2.

## Getting started using this package

1. Install the package with `deno add jsr:@tomsfactory/bot`
2. Import the symbol you want in to your repository and use:

```ts
import { forceOpenAllShadowDoms } from '@tomsfactory/bot/shadow-root';
import { chromium, Page } from 'npm:playwright';

const browser = await chromium.launch({
  headless: false,
  executablePath: '/usr/bin/google-chrome',
});
const page: Page = await browser.newPage();
await forceOpenAllShadowDoms(page);
```

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
