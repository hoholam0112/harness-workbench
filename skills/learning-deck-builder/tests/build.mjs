// 슬라이드 조각을 assets/deck.html 껍데기에 끼워 tests/out/<이름>.html 을 만든다.
// 껍데기(스타일·검사기·HUD)를 복사하지 않으므로 검사기가 갈라질 일이 없다.
//
//   node tests/build.mjs broken
//
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const OPEN = '<main class="stage" id="stage">';

const shell = await readFile(join(here, '..', 'assets', 'deck.html'), 'utf8');
const open = shell.indexOf(OPEN);
if (open < 0) throw new Error(`deck.html 에서 ${OPEN} 를 못 찾았다`);
const close = shell.indexOf('</main>', open);
if (close < 0) throw new Error('deck.html 에서 </main> 를 못 찾았다');

const head = shell.slice(0, open + OPEN.length);
const tail = shell.slice(close);

const names = process.argv.slice(2);
if (!names.length) throw new Error('조각 이름을 하나 이상 넘겨라 (예: broken)');

await mkdir(join(here, 'out'), { recursive: true });
for (const name of names) {
  const slides = await readFile(join(here, `slides-${name}.html`), 'utf8');
  const out = join(here, 'out', `${name}.html`);
  await writeFile(out, `${head}\n${slides}\n${tail}`);
  console.log(out);
}
