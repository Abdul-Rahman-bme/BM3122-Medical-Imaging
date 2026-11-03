import { NextResponse } from 'next/server';
import { current,visible } from '@/lib/exams/service';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){try{const {id}=await params;return NextResponse.json(visible(current(id)),{headers:{'Cache-Control':'no-store'}});}catch(e){return NextResponse.json({error:String(e)},{status:404});}}
