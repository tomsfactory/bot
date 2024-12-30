# @tomsfactory/bot

Uses Deno 2 (canary).

This needs canary because otherwise we get the error
`Warning: Not implemented: ClientRequest.options.createConnection`. See
[this issue](https://github.com/denoland/deno/pull/25470#issuecomment-2520292171).
You can update deno by:

```bash
deno upgrade canary
```

It uses [rebrowser-puppeteer](https://www.npmjs.com/package/rebrowser-puppeteer)
as the default browser to avoid bot detection.

## Getting started using this package

1. Install the package with `deno add jsr:@tomsfactory/bot`
2. Import the symbol you want in to your repository and use:

```ts
import { forceOpenAllShadowDoms } from '@tomsfactory/bot/shadow-root';
import { BrowserLauncher } from '@tomsfactory/bot/puppeteer';
import type { Browser, Page } from 'npm:rebrowser-puppeteer-core';

const launcher = new BrowserLauncher();
const browser: Browser = await launcher.launch();
const page: Page = await browser.page();
await forceOpenAllShadowDoms(page);
```

## Development workflow

1. If it's the first time you're working in this repo on your current machine,
   install the git hooks with `./scripts/add-git-hooks.sh`. You will also need
   to create a .env file like so `cp .env.template .env`.
2. Create a branch
3. Make changes on branch
4. Commit using
   [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/#summary)
   syntax
5. Once reviewed, increase package version with
   `deno task version:<minor|major|patch|autosemver>` accordingly
6. Merge in to master, and the package will be deployed to
   [jsr](https://jsr.io/@tomsfactory/bot) via a
   [github workflow](.github/workflows/publish.yml)
