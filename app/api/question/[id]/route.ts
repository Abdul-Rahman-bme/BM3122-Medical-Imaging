import { NextResponse } from 'next/server';
import * as store from '@/lib/db';
import { questionSchema } from '@/lib/content/schema';
import {localMutationAllowed} from '@/lib/http';
export const runtime='nodejs';
export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){const {id}=await params;const q=store.question(id);return q?NextResponse.json(q):NextResponse.json({error:'Question not found'},{status:404});}
export async function PUT(req:Request,{params}:{params:Promise<{id:string}>}){
 if(!localMutationAllowed(req))return NextResponse.json({error:'Cross-origin mutation denied'},{status:403});
 try{const {id}=await params;const q=questionSchema.parse(await req.json());if(q.id!==id)throw new Error('Stable IDs cannot be changed');const old=store.question(id);if(!old)throw new Error('Unknown question');if(q.paperId!==old.paperId||q.marks!==old.marks)throw new Error('Change paper membership or marks through a complete validated JSON import so paper totals remain consistent');
 store.db().prepare('UPDATE questions SET data=? WHERE id=?').run(JSON.stringify(q),id);return NextResponse.json(q);}catch(e){return NextResponse.json({error:String(e)},{status:400});}
}
