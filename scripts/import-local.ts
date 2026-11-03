import {readFileSync,mkdirSync,copyFileSync,existsSync} from 'node:fs';
import path from 'node:path';
import {bankSchema} from '../lib/content/schema';
import {importBank,dataDir} from '../lib/db';
const [file,assets]=process.argv.slice(2);
if(!file){console.error('Usage: npx tsx scripts/import-local.ts path/to/bank.json [path/to/assets]');process.exit(1);}
const bank=bankSchema.parse(JSON.parse(readFileSync(file,'utf8')));
// Copy only document/figure names explicitly referenced by a validated bank.
const names=new Set([...bank.documents.map(d=>d.path),...bank.questions.flatMap(q=>q.figures),...bank.questions.filter(q=>q.referenceDiagram).map(q=>`diagram-${q.referenceDiagram}.png`)]);
if(assets){
 const root=path.resolve(assets);
 for(const name of names){
  if(!/^[a-zA-Z0-9_. -]+\.(pdf|png|jpg|jpeg|webp)$/i.test(name)||name.includes('..'))throw new Error(`Unsafe asset filename: ${name}`);
  const src=path.join(root,name);if(!existsSync(src)){console.warn(`Not supplied: ${name}`);continue;}
  const dest=path.join(dataDir,'assets',name);mkdirSync(path.dirname(dest),{recursive:true});copyFileSync(src,dest);
 }
}
console.log(importBank(bank));
console.log('Local bank imported; existing progress and session snapshots preserved. Do not commit private source material.');
