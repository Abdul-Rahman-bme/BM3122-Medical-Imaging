import type { Question } from '../content/schema';
const units:Record<string,{dimension:string;factor:number}>={
 '':{dimension:'scalar',factor:1},'%':{dimension:'percent',factor:1},
 's':{dimension:'time',factor:1},'sec':{dimension:'time',factor:1},'ms':{dimension:'time',factor:.001},'us':{dimension:'time',factor:.000001},'min':{dimension:'time',factor:60},'h':{dimension:'time',factor:3600},'hours':{dimension:'time',factor:3600},
 'hz':{dimension:'frequency',factor:1},'khz':{dimension:'frequency',factor:1e3},'mhz':{dimension:'frequency',factor:1e6},
 'm':{dimension:'length',factor:1},'cm':{dimension:'length',factor:.01},'mm':{dimension:'length',factor:.001},'um':{dimension:'length',factor:1e-6},'nm':{dimension:'length',factor:1e-9},
 'bq':{dimension:'activity',factor:1},'kbq':{dimension:'activity',factor:1e3},'mbq':{dimension:'activity',factor:1e6},'gbq':{dimension:'activity',factor:1e9},
 'gy':{dimension:'dose',factor:1},'mgy':{dimension:'dose',factor:1e-3},'sv':{dimension:'weighted-dose',factor:1},'msv':{dimension:'weighted-dose',factor:1e-3},
 'degrees':{dimension:'angle',factor:1},'deg':{dimension:'angle',factor:1},'°':{dimension:'angle',factor:1},'rad':{dimension:'angle',factor:180/Math.PI},
 'frames/s':{dimension:'frame-rate',factor:1},'fps':{dimension:'frame-rate',factor:1},'counts/s':{dimension:'count-rate',factor:1},'hu':{dimension:'hu',factor:1},'db':{dimension:'db',factor:1},'lines':{dimension:'lines',factor:1},'v':{dimension:'voltage',factor:1},'mv':{dimension:'voltage',factor:.001}
};
function unit(s:string){return s.trim().toLowerCase().replaceAll('μ','u').replaceAll('µ','u').replaceAll(' ','');}
export function parseNumber(input:string):number|null{
 const s=input.trim().replaceAll('−','-').replace(/\s/g,'').replace(/(?:×|\*|x)10\^?([+-]?\d+)$/i,'e$1');
 if(!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(s))return null;
 const n=Number(s);return Number.isFinite(n)?n:null;
}
export function gradeNumeric(q:Question,input:string,inputUnit:string){
 if(!q.numerical)return {supported:false,correct:false,message:'This part requires rubric-based review; no reliable numerical key is imported.'};
 const v=parseNumber(input);if(v===null)return {supported:true,correct:false,message:'Enter a finite number, such as 1.25e3 or 1.25 × 10^3.'};
 const expected=q.numerical;const a=units[unit(inputUnit)],b=units[unit(expected.unit)];
 let normalized=v;
 if(unit(inputUnit)!==unit(expected.unit)){
  if(!a||!b||a.dimension!==b.dimension)return {supported:true,correct:false,message:`Expected units: ${expected.unit||'dimensionless'}. Unit conversion is not supported for this combination.`};
  normalized=v*a.factor/b.factor;
 }
 const tolerance=Math.max(expected.absoluteTolerance,Math.abs(expected.value)*expected.relativeTolerance);
 const correct=Math.abs(normalized-expected.value)<=tolerance;
 return {supported:true,correct,message:correct?`Within tolerance (±${tolerance.toPrecision(3)} ${expected.unit}). Final value checked; working still needs rubric review.`:`Outside tolerance. Expected ${expected.value} ${expected.unit}, tolerance ±${tolerance.toPrecision(3)}. Review your working and units.`};
}
export interface LocalEvaluator{evaluate(question:Question,answer:string):Promise<{feedback:string;score?:number}>}
// An optional future local model can implement LocalEvaluator. No AI evaluator is used by the core app.
