import {dataDir} from '@/lib/db';import {readFileSync,existsSync} from 'node:fs';import path from 'node:path';
export const runtime='nodejs';
export async function GET(_:Request,{params}:{params:Promise<{name:string}>}){const {name}=await params;if(!/^[a-zA-Z0-9_-]+\.png$/.test(name))return new Response('Invalid drawing',{status:400});const file=path.join(dataDir,'uploads',name);if(!existsSync(file))return new Response('Drawing not found',{status:404});return new Response(readFileSync(file),{headers:{'Content-Type':'image/png','Cache-Control':'no-store'}});}
