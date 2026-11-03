import { NextResponse } from 'next/server';
import {existsSync} from 'node:fs';
import path from 'node:path';
import * as store from '@/lib/db';
import { current } from '@/lib/exams/service';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(){
 const sessions=store.sessions().map(s=>current(s.id));
 return NextResponse.json({questions:store.questions().map(q=>({...q,solution:null,solutionSteps:[],rubric:[],hints:[],numerical:q.numerical?{...q.numerical,value:undefined}:null,correctChoices:undefined})),papers:store.papers(),documents:store.documents().map(d=>({...d,available:existsSync(path.join(store.dataDir,'assets',d.path))})),progress:store.progress(),sessions:sessions.map(s=>({...s,snapshot:[],answers:{}})),attempts:store.attempts(),preferences:store.preferences()},{headers:{'Cache-Control':'no-store'}});
}
