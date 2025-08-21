#!/usr/bin/env bun
import { $ } from 'bun';

const msg = process.argv.slice(2).join(' ') || 'update: commit via bun script';

await $`git add .`;
await $`git commit -m "${msg}"`;
await $`git push`;
