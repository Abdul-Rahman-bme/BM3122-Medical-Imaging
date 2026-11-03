import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { mkdirSync,writeFileSync } from 'node:fs';
import path from 'node:path';
import { dataDir,db } from '@/lib/db';
import {localMutationAllowed} from '@/lib/http';
export const runtime='nodejs';
export async function POST(req:Request){try{
 if(!localMutationAllowed(req))return NextResponse.json({error:'Cross-origin mutation denied'},{status:403});
 const data=await req.formData();const file=data.get('file');if(!(file instanceof File))throw new Error('Select a PDF');if(file.size>80e6)throw new Error('PDF exceeds 80 MB');
 const bytes=new Uint8Array(await file.arrayBuffer());if(new TextDecoder().decode(bytes.slice(0,5))!=='%PDF-')throw new Error('Only valid PDF headers accepted');
 const id='upload-'+randomUUID();const name=id+'.pdf';mkdirSync(path.join(dataDir,'assets'),{recursive:true});writeFileSync(path.join(dataDir,'assets',name),bytes);
 const doc={id,title:file.name,path:name,category:'Uploaded - extraction review required'};db().prepare('INSERT INTO documents(id,data) VALUES (?,?)').run(id,JSON.stringify(doc));return NextResponse.json({...doc,message:'PDF saved as a resource only. No questions imported. Use the documented preprocessing/review workflow, then import validated JSON.'});
 }catch(e){return NextResponse.json({error:String(e)},{status:400});}}
