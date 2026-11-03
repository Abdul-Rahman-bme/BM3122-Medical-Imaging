import { NextResponse } from 'next/server';
import { z } from 'zod';
import * as store from '@/lib/db';
import * as service from '@/lib/exams/service';
import { defaultProgress } from '@/lib/content/schema';
import { schedule } from '@/lib/spaced-repetition';
import { gradeNumeric } from '@/lib/grading';
import { localMutationAllowed } from '@/lib/http';
export const runtime='nodejs';
export async function POST(req:Request){
 if(!localMutationAllowed(req))return NextResponse.json({error:'Cross-origin mutation denied'},{status:403});
 try{
 const body=z.object({action:z.string(),payload:z.unknown()}).parse(await req.json());const raw=body.payload;
 switch(body.action){
  case 'create-session':{const p=z.object({kind:z.enum(['exam','practice']),paperId:z.string().optional(),mode:z.string().optional(),questionIds:z.array(z.string()).max(400).optional()}).parse(raw);return NextResponse.json(service.visible(service.createSession(p)));}
  case 'save-answer':{const p=z.object({sessionId:z.string(),questionId:z.string(),answer:service.answerSchema,index:z.number().int().optional(),flag:z.boolean().optional()}).parse(raw);return NextResponse.json(service.visible(service.saveAnswer(p.sessionId,p.questionId,p.answer,p.index,p.flag)));}
  case 'submit':{const p=z.object({sessionId:z.string()}).parse(raw);return NextResponse.json(service.submit(p.sessionId));}
  case 'assess':{const p=z.object({sessionId:z.string(),questionId:z.string(),score:z.number(),criteria:z.array(z.number().int())}).parse(raw);return NextResponse.json(service.assess(p.sessionId,p.questionId,p.score,p.criteria));}
  case 'progress':{const p=z.object({questionId:z.string(),value:z.object({bookmarked:z.boolean().optional(),revision:z.boolean().optional(),difficult:z.boolean().optional(),notes:z.string().max(100000).optional(),confidence:z.number().int().min(0).max(5).optional()})}).parse(raw);return NextResponse.json(store.saveProgress(p.questionId,p.value));}
  case 'rate':{const p=z.object({questionId:z.string(),rating:z.enum(['Again','Hard','Good','Easy'])}).parse(raw);return NextResponse.json(store.saveProgress(p.questionId,schedule({...defaultProgress,...store.progress()[p.questionId]},p.rating)));}
  case 'check':{const p=z.object({questionId:z.string(),value:z.string(),unit:z.string(),sessionId:z.string().optional()}).parse(raw);if(p.sessionId){const s=service.current(p.sessionId);if(s.kind==='exam'&&s.status==='active')throw new Error('No feedback during an active exam');}const q=store.question(p.questionId);if(!q)throw new Error('Unknown question');return NextResponse.json(gradeNumeric(q,p.value,p.unit));}
  case 'check-choice':{const p=z.object({questionId:z.string(),choices:z.array(z.string()),sessionId:z.string()}).parse(raw);const s=service.current(p.sessionId);if(s.kind==='exam'&&s.status==='active')throw new Error('No feedback during an active exam');const q=s.snapshot.find(q=>q.id===p.questionId);if(!q?.correctChoices)throw new Error('No validated choice key for this question');const correct=[...p.choices].sort().join('|')===[...q.correctChoices].sort().join('|');return NextResponse.json({correct,message:correct?'Correct selection according to the imported key.':'This selection differs from the imported key. Review the provided reasoning.'});}
  case 'import':return NextResponse.json(store.importBank(raw));
  case 'preferences':{const p=z.object({examDate:z.string().max(30)}).parse(raw);store.db().prepare("INSERT INTO preferences(id,data) VALUES ('local',?) ON CONFLICT(id) DO UPDATE SET data=excluded.data").run(JSON.stringify(p));return NextResponse.json(p);}
  default:throw new Error('Unsupported action');
 }
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:String(e)},{status:400});}
}
