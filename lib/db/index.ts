import { DatabaseSync } from 'node:sqlite';
import { mkdirSync,readFileSync,existsSync } from 'node:fs';
import path from 'node:path';
import { bankSchema,type Bank,type Question,type Paper,type DocumentAsset,type Progress,type Session,type Attempt,defaultProgress } from '../content/schema';
export const dataDir=path.resolve(process.env.BM3122_DATA_DIR||path.join(process.cwd(),'data'));
let cached:DatabaseSync|undefined;
export function db(){
 if(cached)return cached;
 mkdirSync(dataDir,{recursive:true});const d=new DatabaseSync(path.join(dataDir,'study.db'));
 d.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;');
 d.exec(readFileSync(path.join(process.cwd(),'lib/db/migrations/001_initial.sql'),'utf8'));cached=d;
 if((d.prepare('SELECT count(*) AS n FROM questions').get() as {n:number}).n===0){const src=path.join(process.cwd(),'data/content.json');if(existsSync(src))importBank(JSON.parse(readFileSync(src,'utf8')));}
 return d;
}
export function transaction<T>(fn:()=>T):T{const d=db();d.exec('BEGIN IMMEDIATE');try{const v=fn();d.exec('COMMIT');return v;}catch(e){d.exec('ROLLBACK');throw e;}}
function all<T>(table:string):T[]{return (db().prepare(`SELECT data FROM ${table}`).all() as {data:string}[]).map(r=>JSON.parse(r.data) as T);}
export const questions=()=>all<Question>('questions');
export const papers=()=>all<Paper>('papers');
export const documents=()=>all<DocumentAsset>('documents');
export function question(id:string){const r=db().prepare('SELECT data FROM questions WHERE id=?').get(id) as {data:string}|undefined;return r?JSON.parse(r.data) as Question:undefined;}
export function progress():Record<string,Progress>{return Object.fromEntries((db().prepare('SELECT question_id,data FROM progress').all() as {question_id:string;data:string}[]).map(r=>[r.question_id,JSON.parse(r.data)]));}
export function saveProgress(id:string,value:Partial<Progress>){if(!question(id))throw new Error('Unknown question');const p={...defaultProgress,...progress()[id],...value};db().prepare('INSERT INTO progress(question_id,data) VALUES (?,?) ON CONFLICT(question_id) DO UPDATE SET data=excluded.data').run(id,JSON.stringify(p));return p;}
export const sessions=()=>all<Session>('sessions').sort((a,b)=>b.startedAt-a.startedAt);
export function session(id:string){const r=db().prepare('SELECT data FROM sessions WHERE id=?').get(id) as {data:string}|undefined;return r?JSON.parse(r.data) as Session:undefined;}
export function saveSession(s:Session){db().prepare('INSERT INTO sessions(id,kind,status,data) VALUES (?,?,?,?) ON CONFLICT(id) DO UPDATE SET kind=excluded.kind,status=excluded.status,data=excluded.data').run(s.id,s.kind,s.status,JSON.stringify(s));}
export const attempts=()=>all<Attempt>('attempts').sort((a,b)=>b.at-a.at);
export function saveAttempt(a:Attempt){db().prepare('INSERT INTO attempts(id,question_id,session_id,at,data) VALUES (?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data').run(a.id,a.questionId,a.sessionId,a.at,JSON.stringify(a));}
export function importBank(raw:unknown){
 const b=bankSchema.parse(raw);const previous=new Set(questions().map(q=>q.id));
 transaction(()=>{
  const d=db();for(const asset of b.documents)d.prepare('INSERT INTO documents(id,data) VALUES (?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data').run(asset.id,JSON.stringify(asset));
  for(const paper of b.papers)d.prepare('INSERT INTO papers(id,data) VALUES (?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data').run(paper.id,JSON.stringify(paper));
  for(const q of b.questions)d.prepare('INSERT INTO questions(id,paper_id,main_question,data) VALUES (?,?,?,?) ON CONFLICT(id) DO UPDATE SET paper_id=excluded.paper_id,main_question=excluded.main_question,data=excluded.data').run(q.id,q.paperId,q.mainQuestion,JSON.stringify(q));
 });return {inserted:b.questions.filter(q=>!previous.has(q.id)).length,updated:b.questions.filter(q=>previous.has(q.id)).length,total:b.questions.length};
}
export function exportBank():Bank{return {version:1,questions:questions(),papers:papers(),documents:documents()};}
export function exportState(){return {version:1,bank:exportBank(),progress:progress(),sessions:sessions(),attempts:attempts(),preferences:preferences()};}
export function preferences(){const r=db().prepare("SELECT data FROM preferences WHERE id='local'").get() as {data:string}|undefined;return r?JSON.parse(r.data):{examDate:''};}
