// GTA VI Trophy Guide & Tracker — hand-in program (Node 22, standard library only).
//
// What it does: it copies this repository's app/ (the static guide: index.html, its ES
// module, stylesheet and data/trophies.json) and screenshots/ (four real renders of the
// guide in a browser) into the output directory, then writes output/dossier.json with
// buildDossier from the vendored make.fun library. The dossier is what the judge reads:
// the screenshots, the first load's files and bytes, and the source files.
//
// The guide itself is plain static files — no build step, no network at run time. Serve
// it locally with `node serve.ts` and open http://localhost:8080 to try it.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// Leave vendor/makefun-frontend.ts untouched: the scorer rebuilds the dossier with its
// own copy of the library and requires the two to be byte for byte identical.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// The repository root is the directory this file lives in.
const here = fileURLToPath(new URL('.', import.meta.url));
// The grader gives us a writable /output; locally we use MAKEFUN_OUTPUT_DIR instead.
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps: text_max_bytes shapes the dossier bytes; the other limits
// refuse an entry the scorer would refuse anyway (more than 4 screenshots, one over
// 256 KiB, more than 993 files or 48 MiB under app/ — app/ shares /output's own
// 1000-entry cap with screenshots/ and dossier.json, so leave room).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
