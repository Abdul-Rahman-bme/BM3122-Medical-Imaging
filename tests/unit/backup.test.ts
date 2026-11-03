import {beforeAll,afterAll,it,expect} from 'vitest';import {mkdtempSync,mkdirSync,copyFileSync,rmSync} from 'node:fs';import path from 'node:path';import os from 'node:os';
let store:typeof import('../../lib/db'),dir:string;
beforeAll(async()=>{dir=mkdtempSync(path.join(os.tmpdir(),'bm3122-backup-'));process.env.BM3122_DATA_DIR=dir;store=await import('../../lib/db');store.db();mkdirSync(path.join(dir,'assets'));const doc=store.documents().find(d=>d.id==='report-papers')!;copyFileSync(path.join('data/assets',doc.path),path.join(dir,'assets',doc.path));});
afterAll(()=>{store.db().close();if(!path.resolve(dir).startsWith(path.join(os.tmpdir(),'bm3122-backup-')))throw new Error('Unexpected test cleanup path');rmSync(dir,{recursive:true,force:true});});
it('serves local PDF byte ranges without reading the whole PDF into a browser',async()=>{const {GET}=await import('../../app/api/assets/[...file]/route');const response=await GET(new Request('http://localhost:3000/api/assets/report-papers',{headers:{range:'bytes=0-127'}}),{params:Promise.resolve({file:['report-papers']})});expect(response.status).toBe(206);const bytes=new Uint8Array(await response.arrayBuffer());expect(bytes.length).toBe(128);expect(new TextDecoder().decode(bytes.slice(0,5))).toBe('%PDF-');});
it('backs up and restores content, learning progress, preferences and asset bytes',async()=>{
 const {GET}=await import('../../app/api/export/route');const {POST}=await import('../../app/api/restore/route');
 store.saveProgress('model-1-q1-a',{bookmarked:true,notes:'Before backup'});store.db().prepare("INSERT INTO preferences(id,data) VALUES ('local',?)").run(JSON.stringify({examDate:'2026-11-30'}));
 const response=await GET(new Request('http://localhost:3000/api/export?kind=backup'));expect(response.status).toBe(200);const zip=await response.arrayBuffer();expect(zip.byteLength).toBeGreaterThan(10000);
 store.saveProgress('model-1-q1-a',{bookmarked:false,notes:'After backup'});
 const restored=await POST(new Request('http://localhost:3000/api/restore',{method:'POST',body:zip}));expect(restored.status).toBe(200);expect(store.questions().length).toBe(96);expect(store.progress()['model-1-q1-a'].notes).toBe('Before backup');expect(store.preferences().examDate).toBe('2026-11-30');
});
