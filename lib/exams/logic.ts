import { answered, type Session } from '../content/schema';
export function remainingSeconds(s:Session,now=Date.now()){return s.deadline===null?null:Math.max(0,Math.ceil((s.deadline-now)/1000));}
export function expired(s:Session,now=Date.now()){return s.kind==='exam'&&s.status==='active'&&s.deadline!==null&&now>=s.deadline;}
export function totals(s:Session){
 const max=s.snapshot.reduce((n,q)=>n+q.marks,0);let earned=0,automatic=0,self=0,pending=0,attempted=0;
 for(const q of s.snapshot){const a=s.assessments[q.id];if(answered(s.answers[q.id]))attempted++;if(a){earned+=a.score;if(a.method==='automatic')automatic+=a.score;if(a.method==='self')self+=a.score;}else if(answered(s.answers[q.id]))pending+=q.marks;}
 return {max,earned,automatic,self,pending,attempted,skipped:s.snapshot.length-attempted,final:pending===0};
}
