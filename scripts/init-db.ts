import { db,questions,papers,importBank } from '../lib/db';
import {readFileSync} from 'node:fs';
db();
if(process.argv.includes('--seed')){const result=importBank(JSON.parse(readFileSync('data/content.json','utf8')));console.log(`Reviewed seed upsert: ${result.inserted} inserted, ${result.updated} updated. Progress retained.`);}
console.log(`SQLite initialized. ${papers().length} papers, ${questions().length} questions. Existing learning progress retained.`);
