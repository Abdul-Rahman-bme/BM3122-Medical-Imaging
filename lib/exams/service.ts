import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import * as store from '../db';
import { answered,emptyAnswer,type Session,type Assessment,type Question } from '../content/schema';
import { expired } from './logic';
import { mkdirSync,writeFileSync } from 'node:fs';
import path from 'node:path';
export const answerSchema=z.object({text:z.string().max(100000),final:z.string().max(300),unit:z.string().max(100),sketch:z.string().max(10000000).optional(),choices:z.array(z.string()).optional(),savedAt:z.number().optional()});
export function createSession(input:{kind:'exam'|'practice';mode?:string;paperId?:string;questionIds?:string[]}){
 const now=Date.now();const paper=store.papers().find(p=>p.id===input.paperId);
 const selected=input.questionIds?input.questionIds.map(id=>store.question(id)).filter((q):q is Question=>!!q):store.questions().filter(q=>q.paperId===input.paperId);
 if(!selected.length)throw new Error('No questions selected');
 if(input.kind==='exam'&&!paper)throw new Error('Select an available paper');
 const active=store.sessions().find(s=>s.kind==='exam'&&s.status==='active');
 if(input.kind==='exam'&&active&&!expired(active))throw new Error('An examination is already active. Resume or submit it first.');
 if(active&&expired(active))submit(active.id);
 const s:Session={id:randomUUID(),kind:input.kind,mode:input.mode||'Topic practice',paperId:paper?.id||null,questionIds:selected.map(q=>q.id),snapshot:selected,status:'active',startedAt:now,deadline:input.kind==='exam'?now+paper!.durationMinutes*60000:null,submittedAt:null,elapsedSeconds:0,answers:{},assessments:{},flags:[],currentIndex:0,lastSeenAt:now};
 store.saveSession(s);return s;
}
export function current(id:string){let s=store.session(id);if(!s)throw new Error('Session not found');if(expired(s))s=submit(id);return s;}
export function visible(s:Session):Session{
 if(s.kind==='exam'&&s.status==='active')return {...s,snapshot:s.snapshot.map(q=>({...q,solution:null,solutionSteps:[],hints:[],rubric:[],numerical:null,correctChoices:undefined}))};
 return s;
}
export function saveAnswer(id:string,qid:string,raw:unknown,index?:number,flag?:boolean){
 const s=current(id);if(s.status!=='active')throw new Error('Submitted sessions are locked');
 if(!s.questionIds.includes(qid))throw new Error('Question does not belong to session');
 const a=answerSchema.parse(raw);const now=Date.now();
 const old=s.answers[qid];const changed=JSON.stringify([old?.text||'',old?.final||'',old?.unit||'',old?.sketch||'',old?.choices||[]])!==JSON.stringify([a.text,a.final,a.unit,a.sketch||'',a.choices||[]]);
 if(a.sketch?.startsWith('data:image/png;base64,')){
  const bytes=Buffer.from(a.sketch.slice('data:image/png;base64,'.length),'base64');
  if(bytes.length>8e6||bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw new Error('Invalid PNG drawing');
  const name=`${s.id}_${qid}`.replace(/[^a-zA-Z0-9_-]/g,'')+'.png';mkdirSync(path.join(store.dataDir,'uploads'),{recursive:true});writeFileSync(path.join(store.dataDir,'uploads',name),bytes);a.sketch=`/api/drawings/${name}?v=${now}`;
 }
 s.answers[qid]={...a,savedAt:now};
 if(changed&&s.kind==='practice')delete s.assessments[qid];
 if(index!==undefined)s.currentIndex=Math.max(0,Math.min(s.questionIds.length-1,index));
 if(flag!==undefined)s.flags=flag?[...new Set([...s.flags,qid])]:s.flags.filter(v=>v!==qid);
 if(s.kind==='practice')s.elapsedSeconds+=Math.min(60,Math.max(0,(now-s.lastSeenAt)/1000));
 s.lastSeenAt=now;store.saveSession(s);
 if(s.kind==='practice')store.saveAttempt({id:`${s.id}_${qid}`,questionId:qid,sessionId:s.id,topic:s.snapshot.find(q=>q.id===qid)!.topic,marks:s.snapshot.find(q=>q.id===qid)!.marks,answer:a,assessment:s.assessments[qid]||null,seconds:s.elapsedSeconds/s.snapshot.length,at:now,attempted:answered(a)});
 return s;
}
export function submit(id:string){
 return store.transaction(()=>{
  const s=store.session(id);if(!s)throw new Error('Session not found');if(s.status==='submitted')return s;
  const now=Date.now();s.status='submitted';s.submittedAt=Math.min(now,s.deadline||now);
  if(s.kind==='exam')s.elapsedSeconds=Math.max(0,(s.submittedAt-s.startedAt)/1000);
  else s.elapsedSeconds+=Math.min(60,Math.max(0,(now-s.lastSeenAt)/1000));
  for(const q of s.snapshot){
   const a=s.answers[q.id]||emptyAnswer;
   if(!answered(a))s.assessments[q.id]={score:0,method:'skipped',criteria:[],at:now};
   else if(q.type==='mcq'&&q.correctChoices){const ok=[...(a.choices||[])].sort().join('|')===[...q.correctChoices].sort().join('|');s.assessments[q.id]={score:ok?q.marks:0,method:'automatic',criteria:[],at:now,feedback:ok?'Correct choice set':'Incorrect choice set'};}
   store.saveAttempt({id:`${s.id}_${q.id}`,questionId:q.id,sessionId:s.id,topic:q.topic,marks:q.marks,answer:a,assessment:s.assessments[q.id]||null,seconds:s.elapsedSeconds/s.snapshot.length,at:now,attempted:answered(a)});
  }
  store.saveSession(s);return s;
 });
}
export function assess(id:string,qid:string,score:number,criteria:number[]){
 current(id); // resolve an expired examination before opening the assessment transaction
 return store.transaction(()=>{
  const s=store.session(id)!;if(s.kind==='exam'&&s.status!=='submitted')throw new Error('Assessment is available after examination submission');
  const q=s.snapshot.find(q=>q.id===qid);if(!q)throw new Error('Unknown question');
  if(!answered(s.answers[qid]))throw new Error('An unanswered question cannot be marked correct');
  if(!Number.isFinite(score)||score<0||score>q.marks)throw new Error('Score must be between zero and allocated marks');
  const a:Assessment={score,criteria,method:'self',at:Date.now()};s.assessments[qid]=a;
  store.saveSession(s);store.saveAttempt({id:`${s.id}_${qid}`,questionId:qid,sessionId:id,topic:q.topic,marks:q.marks,answer:s.answers[qid],assessment:a,seconds:s.elapsedSeconds/s.snapshot.length,at:Date.now(),attempted:true});
  return s;
 });
}
