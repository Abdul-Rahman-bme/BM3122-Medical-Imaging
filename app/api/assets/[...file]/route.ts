import { NextResponse } from 'next/server';
import { existsSync,statSync,createReadStream } from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { dataDir,documents } from '@/lib/db';
export const runtime='nodejs';
export async function GET(req:Request,{params}:{params:Promise<{file:string[]}>}){
 const {file}=await params;const key=file.join('/');const asset=documents().find(d=>d.id===key);const name=asset?.path||key;
 const root=path.join(dataDir,'assets');const absolute=path.resolve(root,name);
 if(!absolute.startsWith(root+path.sep)||name.includes('..')||!existsSync(absolute))return NextResponse.json({error:'Asset not found'},{status:404});
 const size=statSync(absolute).size;const type=name.endsWith('.pdf')?'application/pdf':name.endsWith('.png')?'image/png':name.endsWith('.svg')?'image/svg+xml':'application/octet-stream';
 const range=req.headers.get('range');let start=0,end=size-1,status=200;
 if(range){const m=/^bytes=(\d+)-(\d*)$/.exec(range);if(!m)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${size}`}});start=Number(m[1]);end=m[2]?Math.min(Number(m[2]),size-1):size-1;if(start>end||start>=size)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${size}`}});status=206;}
 const stream=Readable.toWeb(createReadStream(absolute,{start,end})) as ReadableStream<Uint8Array>;
 return new Response(stream,{status,headers:{'Content-Type':type,'Content-Length':String(end-start+1),'Accept-Ranges':'bytes','Cache-Control':'private, max-age=0, must-revalidate',...(status===206?{'Content-Range':`bytes ${start}-${end}/${size}`}:{})}});
}
