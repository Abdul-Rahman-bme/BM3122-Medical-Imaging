import type {AppState} from '@/components/provider';import {topics,type Attempt} from './content/schema';
export function stats(data:AppState){
 const latest=new Map<string,Attempt>();for(const a of [...data.attempts].sort((a,b)=>a.at-b.at))if(a.attempted)latest.set(a.questionId,a);
 const assessed=[...latest.values()].filter(a=>a.assessment);const attempted=latest.size;const complete=assessed.length;
 const score=assessed.reduce((n,a)=>n+(a.assessment?.score||0),0),max=assessed.reduce((n,a)=>n+a.marks,0);
 const topicStats=topics.map(topic=>{const qs=data.questions.filter(q=>q.topic===topic);const all=[...latest.values()].filter(a=>a.topic===topic);const marked=all.filter(a=>a.assessment);const earned=marked.reduce((n,a)=>n+a.assessment!.score,0),possible=marked.reduce((n,a)=>n+a.marks,0);return {topic,total:qs.length,attempted:all.length,completed:marked.length,mastery:possible?Math.round(earned/possible*100):0,correct:marked.filter(a=>a.assessment!.score===a.marks).length,seconds:data.attempts.filter(a=>a.topic===topic).reduce((n,a)=>n+a.seconds,0),assessed:possible>0};});
 return {attempted,complete,correct:assessed.filter(a=>a.assessment!.score===a.marks).length,average:max?Math.round(score/max*100):null,seconds:data.sessions.reduce((n,s)=>n+s.elapsedSeconds,0),remaining:data.questions.length-complete,coverage:Math.round(topicStats.filter(t=>t.completed>0).length/topics.length*100),topicStats,latest,incorrect:assessed.filter(a=>a.assessment!.score<a.marks)};
}
export function duration(seconds:number){return seconds>=3600?`${(seconds/3600).toFixed(1)} h`:seconds>=60?`${Math.round(seconds/60)} min`:`${Math.round(seconds)} sec`;}
