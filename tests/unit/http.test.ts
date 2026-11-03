import {describe,it,expect,afterEach,vi} from 'vitest';import {localMutationAllowed} from '../../lib/http';
afterEach(()=>vi.unstubAllEnvs());
describe('Loopback-origin checks',()=>{
 it('accepts the actual host header and localhost/IPv4 loopback aliases on the same port',()=>{
  expect(localMutationAllowed(new Request('http://localhost:3100/api/action',{headers:{origin:'http://127.0.0.1:3100',host:'127.0.0.1:3100'}}))).toBe(true);
  expect(localMutationAllowed(new Request('http://localhost:3000/api/action',{headers:{origin:'http://localhost:3000',host:'localhost:3000'}}))).toBe(true);
 });
 it('rejects remote origins and different local ports',()=>{
  expect(localMutationAllowed(new Request('http://localhost:3000/api/action',{headers:{origin:'https://example.com',host:'localhost:3000'}}))).toBe(false);
  expect(localMutationAllowed(new Request('http://localhost:3000/api/action',{headers:{origin:'http://localhost:9999',host:'localhost:3000'}}))).toBe(false);
 });
 it('requires explicit LAN opt-in and an exact private IPv4 origin',()=>{
  const request=(origin:string,host='192.168.1.20:3000')=>new Request('http://localhost:3000/api/action',{headers:{origin,host}});
  vi.stubEnv('BM3122_ALLOW_LAN','false');expect(localMutationAllowed(request('http://192.168.1.20:3000'))).toBe(false);
  vi.stubEnv('BM3122_ALLOW_LAN','true');expect(localMutationAllowed(request('http://192.168.1.20:3000'))).toBe(true);
  expect(localMutationAllowed(request('http://192.168.1.21:3000'))).toBe(false);
  expect(localMutationAllowed(request('http://192.168.1.20:4000'))).toBe(false);
  expect(localMutationAllowed(request('http://8.8.8.8:3000','8.8.8.8:3000'))).toBe(false);
 });
});
