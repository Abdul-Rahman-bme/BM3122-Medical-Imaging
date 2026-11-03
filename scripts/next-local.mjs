import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
for(const file of ['.env.local','.env']){try{process.loadEnvFile(file);}catch(error){if(error.code!=='ENOENT')throw error;}}
const args=process.argv.slice(2);
if(['dev','start'].includes(args[0])&&!args.includes('--hostname')&&!args.includes('-H'))args.push('--hostname',process.env.BM3122_HOST||'127.0.0.1');
const child=spawn(process.execPath,[require.resolve('next/dist/bin/next'),...args],{stdio:'inherit',env:{...process.env,NEXT_TELEMETRY_DISABLED:'1'}});
child.on('exit',code=>process.exit(code??1));
child.on('error',error=>{console.error(error.message);process.exit(1);});
