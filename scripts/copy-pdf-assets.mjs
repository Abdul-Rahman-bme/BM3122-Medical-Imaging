import { copyFileSync, cpSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
const source = path.resolve('node_modules/pdfjs-dist');
if (existsSync(source)) {
  mkdirSync('public/pdfjs', {recursive:true});
  copyFileSync(path.join(source,'build/pdf.worker.min.mjs'),'public/pdfjs/pdf.worker.min.mjs');
  for (const dir of ['cmaps','standard_fonts','wasm']) if(existsSync(path.join(source,dir))) cpSync(path.join(source,dir),path.join('public/pdfjs',dir),{recursive:true});
}
