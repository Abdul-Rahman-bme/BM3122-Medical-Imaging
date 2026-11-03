import {mkdirSync,mkdtempSync,cpSync} from 'node:fs';import {spawn} from 'node:child_process';import path from 'node:path';
mkdirSync('.test-data',{recursive:true});const testDir=mkdtempSync(path.resolve('.test-data/browser-'));cpSync('data/assets',path.join(testDir,'assets'),{recursive:true});
const child=spawn(process.execPath,['scripts/next-local.mjs','start','--hostname','127.0.0.1','--port','3100'],{stdio:'inherit',env:{...process.env,BM3122_DATA_DIR:testDir,NEXT_TELEMETRY_DISABLED:'1'}});
child.on('exit',code=>process.exit(code??0));for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>{child.kill(signal);});
