import type { Progress } from '../content/schema';
export function schedule(progress:Progress,rating:'Again'|'Hard'|'Good'|'Easy',now=Date.now()):Progress{
 const old=Math.max(progress.intervalDays,1);
 const days=rating==='Again'?0:rating==='Hard'?Math.max(1,Math.round(old*1.2)):rating==='Good'?(progress.reviews===0?1:Math.max(2,Math.round(old*2))):(progress.reviews===0?4:Math.max(4,Math.round(old*3)));
 return {...progress,reviews:progress.reviews+1,intervalDays:days,dueAt:now+(rating==='Again'?10*60e3:days*864e5),lastRating:rating};
}
