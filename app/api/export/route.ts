import { NextResponse } from 'next/server';
import { exportBank,exportState,db,dataDir } from '@/lib/db';
import { zipSync,strToU8 } from 'fflate';
import { readFileSync,readdirSync,statSync,mkdirSync,unlinkSync } from 'node:fs';
import path from 'node:path';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(req:Request){
 const kind=new URL(req.url).searchParams.get('kind');
 if(kind!=='backup')return NextResponse.json(exportBank(),{headers:{'Content-Disposition':'attachment; filename="bm3122-question-bank.json"'}});
 const files:Record<string,Uint8Array>={'state.json':strToU8(JSON.stringify(exportState())),'README.txt':strToU8('BM3122 complete local backup. Restore using Settings. study.db is an independent SQLite snapshot. Asset files include source PDFs and saved drawings. Keep private: contains personal study data.')};
 mkdirSync(path.join(dataDir,'backups'),{recursive:true});const snap=path.join(dataDir,'backups',`snapshot-${Date.now()}.db`);
 db().exec(`VACUUM INTO '${snap.replaceAll("'","''")}'`);files['study.db']=readFileSync(snap);unlinkSync(snap);
 for(const sub of ['assets','uploads']){
  const base=path.join(dataDir,sub);if(!statSafe(base))continue;
  const walk=(dir:string)=>{for(const name of readdirSync(dir)){const full=path.join(dir,name);if(statSync(full).isDirectory())walk(full);else files[`${sub}/${path.relative(base,full).replaceAll('\\','/')}`]=readFileSync(full);}};walk(base);
 }
 return new Response(new Uint8Array(zipSync(files,{level:1})),{headers:{'Content-Type':'application/zip','Content-Disposition':'attachment; filename="bm3122-complete-backup.zip"'}});
}
function statSafe(p:string){try{return statSync(p).isDirectory();}catch{return false;}}
