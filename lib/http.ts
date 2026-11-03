export function localMutationAllowed(req:Request){
 const origin=req.headers.get('origin');if(!origin)return true;
 try{const a=new URL(origin),b=new URL('http://'+(req.headers.get('host')||new URL(req.url).host));const local=(host:string)=>['localhost','127.0.0.1','[::1]'].includes(host);const privateIp=(host:string)=>{const n=host.split('.').map(Number);return n.length===4&&n.every(x=>Number.isInteger(x)&&x>=0&&x<=255)&&(n[0]===10||n[0]===192&&n[1]===168||n[0]===172&&n[1]>=16&&n[1]<=31);};return a.protocol==='http:'&&a.port===b.port&&(local(a.hostname)&&local(b.hostname)||process.env.BM3122_ALLOW_LAN==='true'&&a.hostname===b.hostname&&privateIp(a.hostname));}catch{return false;}
}
