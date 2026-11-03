import { NextResponse } from 'next/server';
import { unzipSync,strFromU8 } from 'fflate';
import { z } from 'zod';
import * as store from '@/lib/db';
import { bankSchema } from '@/lib/content/schema';
import { mkdirSync,writeFileSync } from 'node:fs';
import path from 'node:path';
import {localMutationAllowed} from '@/lib/http';
export const runtime='nodejs';
export async function POST(req:Request){
 if(!localMutationAllowed(req))return NextResponse.json({error:'Cross-origin mutation denied'},{status:403});
 try{
  const raw=new Uint8Array(await req.arrayBuffer());if(raw.length>200e6)throw new Error('Backup exceeds 200 MB');
  const files=unzipSync(raw);if(Object.values(files).reduce((s,b)=>s+b.length,0)>400e6)throw new Error('Expanded backup exceeds 400 MB');
  if(!files['state.json'])throw new Error('Not a BM3122 backup: state.json missing');
  const s=z.object({version:z.literal(1),bank:bankSchema,progress:z.record(z.string(),z.unknown()),sessions:z.array(z.unknown()),attempts:z.array(z.unknown()),preferences:z.object({examDate:z.string()}).optional()}).parse(JSON.parse(strFromU8(files['state.json'])));
  // Validate structured persistence before applying any data, including cross-file traversal.
  const stateSession=z.object({id:z.string(),kind:z.enum(['exam','practice']),status:z.enum(['active','submitted']),snapshot:z.array(z.unknown()),answers:z.record(z.string(),z.unknown()),questionIds:z.array(z.string()),startedAt:z.number()}).passthrough();
  const stateAttempt=z.object({id:z.string(),questionId:z.string(),sessionId:z.string(),at:z.number(),attempted:z.boolean()}).passthrough();
  s.sessions.forEach(v=>stateSession.parse(v));s.attempts.forEach(v=>stateAttempt.parse(v));
  for(const key of Object.keys(files)){if(key.startsWith('assets/')||key.startsWith('uploads/')){const dest=path.resolve(store.dataDir,key);if(!dest.startsWith(store.dataDir+path.sep)||key.includes('..')||key.includes('\\'))throw new Error('Unsafe backup filename');}}
  store.transaction(()=>{
   const db=store.db();for(const table of ['progress','sessions','attempts','questions','papers','documents','preferences'])db.exec(`DELETE FROM ${table}`);
   for(const doc of s.bank.documents)db.prepare('INSERT INTO documents(id,data) VALUES (?,?)').run(doc.id,JSON.stringify(doc));
   for(const paper of s.bank.papers)db.prepare('INSERT INTO papers(id,data) VALUES (?,?)').run(paper.id,JSON.stringify(paper));
   for(const q of s.bank.questions)db.prepare('INSERT INTO questions(id,paper_id,main_question,data) VALUES (?,?,?,?)').run(q.id,q.paperId,q.mainQuestion,JSON.stringify(q));
   if(s.preferences)db.prepare("INSERT INTO preferences(id,data) VALUES ('local',?)").run(JSON.stringify(s.preferences));
   for(const [id,v] of Object.entries(s.progress))db.prepare('INSERT INTO progress(question_id,data) VALUES (?,?)').run(id,JSON.stringify(v));
   for(const v of s.sessions){const a=stateSession.parse(v);db.prepare('INSERT INTO sessions(id,kind,status,data) VALUES (?,?,?,?)').run(a.id,a.kind,a.status,JSON.stringify(a));}
   for(const v of s.attempts){const a=stateAttempt.parse(v);db.prepare('INSERT INTO attempts(id,question_id,session_id,at,data) VALUES (?,?,?,?,?)').run(a.id,a.questionId,a.sessionId,a.at,JSON.stringify(a));}
  });
  for(const [key,value] of Object.entries(files))if(key.startsWith('assets/')||key.startsWith('uploads/')){const dest=path.resolve(store.dataDir,key);mkdirSync(path.dirname(dest),{recursive:true});writeFileSync(dest,value);}
  return NextResponse.json({restored:true,questions:s.bank.questions.length,sessions:s.sessions.length});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:String(e)},{status:400});}
}
