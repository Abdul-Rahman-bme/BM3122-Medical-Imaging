import {defineConfig,devices} from '@playwright/test';
export default defineConfig({
 testDir:'./tests/e2e',fullyParallel:false,workers:1,timeout:60000,expect:{timeout:15000},
 reporter:[['list'],['html',{open:'never'}]],
 use:{baseURL:'http://127.0.0.1:3100',channel:process.env.PLAYWRIGHT_CHANNEL||(process.platform==='win32'?'msedge':undefined),viewport:{width:1440,height:1000},trace:'retain-on-failure',screenshot:'only-on-failure'},
 webServer:{command:'node scripts/e2e-server.mjs',url:'http://127.0.0.1:3100',reuseExistingServer:false,timeout:120000,env:{NEXT_TELEMETRY_DISABLED:'1'}},
});
