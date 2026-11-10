#!/usr/bin/env node
// Docusaurus copies static/ into every locale's output directory, so a 315 MB
// video library ends up duplicated under build/<locale>/videos for each
// translated locale. Those copies are dead weight: every reference in the
// translated HTML and JS is an absolute path that resolves to the root build
// directory's copy. This script removes the duplicated static trees from
// non-default locale output, but only after checking that nothing in that
// locale actually points at them.

import { readdirSync, readFileSync, rmSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const BUILD_DIR = 'build';
const DEFAULT_LOCALE = 'en';
// Directories under static/ whose copies are safe to drop when unreferenced.
// 'img' is deliberately absent: translated pages reference /ar/img/... directly.
const CANDIDATES = ['videos', 'diagrams', 'lib'];

function directorySize(dir) {
  if (!existsSync(dir)) return 0;
  let total = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) total += directorySize(path);
    else if (entry.isFile()) total += statSync(path).size;
  }
  return total;
}

function isReferenced(localeDir, locale, assetDir) {
  const needle = `/${locale}/${assetDir}/`;
  const stack = [localeDir];
  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const path = join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(path);
        continue;
      }
      if (!/\.(html|js|css|json)$/.test(entry.name)) continue;
      if (readFileSync(path, 'utf8').includes(needle)) return path;
    }
  }
  return null;
}

// A locale output directory is a full site: an index page plus a docs tree.
// Checking for both avoids mistaking build/search for a locale.
const locales = readdirSync(BUILD_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter(
    (name) =>
      existsSync(join(BUILD_DIR, name, 'index.html')) &&
      existsSync(join(BUILD_DIR, name, 'docs')),
  );

let reclaimed = 0;

for (const locale of locales) {
  if (locale === DEFAULT_LOCALE) continue;
  const localeDir = join(BUILD_DIR, locale);

  for (const assetDir of CANDIDATES) {
    const duplicate = join(localeDir, assetDir);
    if (!existsSync(duplicate)) continue;

    const referencedBy = isReferenced(localeDir, locale, assetDir);
    if (referencedBy) {
      console.warn(
        `keep ${relative(process.cwd(), duplicate)}: referenced by ${relative(process.cwd(), referencedBy)}`,
      );
      continue;
    }

    const freed = directorySize(duplicate);
    rmSync(duplicate, { recursive: true, force: true });
    reclaimed += freed;
    console.log(
      `pruned ${relative(process.cwd(), duplicate)} (${(freed / 1024 / 1024).toFixed(1)} MB)`,
    );
  }

  const localeBytes = directorySize(localeDir);
  console.log(`${locale}: ${(localeBytes / 1024 / 1024).toFixed(1)} MB remaining`);
}

console.log(
  reclaimed > 0
    ? `reclaimed ${(reclaimed / 1024 / 1024).toFixed(1)} MB of duplicated static files`
    : 'no duplicated static files to prune',
);
