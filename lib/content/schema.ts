import { z } from 'zod';
export const topics=['Introduction','X-ray','CT','MRI','Ultrasound','Nuclear medicine','OCT','Thermal'] as const;
const rubricSchema=z.object({label:z.string().min(1),marks:z.number().positive()});
export const questionSchema=z.object({
 id:z.string().regex(/^[a-zA-Z0-9_-]+$/),paperId:z.string(),mainQuestion:z.number().int().positive(),label:z.string(),
 topic:z.enum(topics),subtopic:z.string(),marks:z.number().positive().max(100),difficulty:z.enum(['Easy','Medium','Hard']),
 type:z.enum(['theory','numerical','diagram','derivation','mcq']),statement:z.string().min(3),
 solution:z.string().nullable(),solutionSteps:z.array(z.string()).default([]),rubric:z.array(rubricSchema).default([]),
 hints:z.array(z.string()).default([]),sourceDocument:z.string(),sourcePage:z.number().int().positive(),
 lectureRefs:z.array(z.object({documentId:z.string(),page:z.number().int().positive(),label:z.string()})).default([]),
 figures:z.array(z.string()).default([]),referenceDiagram:z.string().nullable().optional(),
 provenance:z.enum(['generated-practice','past-paper']),reviewNote:z.string().nullable().optional(),
 numerical:z.object({value:z.number().finite(),unit:z.string(),absoluteTolerance:z.number().nonnegative(),relativeTolerance:z.number().nonnegative(),autoMarks:z.number().nonnegative().optional()}).nullable().optional(),
 choices:z.array(z.object({id:z.string(),text:z.string()})).optional(),correctChoices:z.array(z.string()).optional(),
 priority:z.enum(['High','Medium','Coverage']).optional(),priorityReason:z.string().optional(),
}).superRefine((q,ctx)=>{
 if(q.rubric.length && Math.abs(q.rubric.reduce((s,r)=>s+r.marks,0)-q.marks)>1e-6)ctx.addIssue({code:'custom',message:'Rubric marks must equal question marks',path:['rubric']});
 if(q.numerical?.autoMarks && q.numerical.autoMarks>q.marks)ctx.addIssue({code:'custom',message:'Automatic marks exceed part marks'});
 if(q.type==='mcq'&&(!q.choices?.length||!q.correctChoices?.length))ctx.addIssue({code:'custom',message:'MCQ requires choices and answer keys'});
 if(q.type==='mcq'&&q.correctChoices?.some(id=>!q.choices?.some(c=>c.id===id)))ctx.addIssue({code:'custom',message:'MCQ answer key refers to a missing choice'});
});
export const paperSchema=z.object({id:z.string(),title:z.string(),year:z.number().optional().nullable(),model:z.number().optional().nullable(),durationMinutes:z.number().positive(),totalMarks:z.number().positive(),instructions:z.union([z.string(),z.array(z.string())]),sourceDocument:z.string().optional(),sourcePage:z.number().optional(),informationSheetDocument:z.string().optional(),informationSheetPage:z.number().optional()});
export const documentSchema=z.object({id:z.string(),title:z.string(),path:z.string().refine(s=>!s.includes('..')&&!s.includes('\\')&&!s.startsWith('/'),'Use a relative asset filename'),category:z.string(),available:z.boolean().optional()});
export const bankSchema=z.object({version:z.literal(1),questions:z.array(questionSchema).min(1),papers:z.array(paperSchema),documents:z.array(documentSchema)}).superRefine((bank,ctx)=>{
 for(const field of ['questions','papers','documents'] as const){const ids=new Set<string>();bank[field].forEach(x=>{if(ids.has(x.id))ctx.addIssue({code:'custom',message:`Duplicate ${field} id: ${x.id}`});ids.add(x.id);});}
 const pids=new Set(bank.papers.map(p=>p.id));const dids=new Set(bank.documents.map(d=>d.id));
 bank.questions.forEach(q=>{if(!pids.has(q.paperId))ctx.addIssue({code:'custom',message:`Missing paper for ${q.id}`});if(!dids.has(q.sourceDocument))ctx.addIssue({code:'custom',message:`Missing source document for ${q.id}`});});
 bank.papers.forEach(p=>{const qs=bank.questions.filter(q=>q.paperId===p.id);if(qs.length&&Math.abs(qs.reduce((s,q)=>s+q.marks,0)-p.totalMarks)>1e-6)ctx.addIssue({code:'custom',message:`Paper ${p.id} question marks do not total ${p.totalMarks}`});});
});
export type Question=z.infer<typeof questionSchema>;
export type Paper=z.infer<typeof paperSchema>;
export type DocumentAsset=z.infer<typeof documentSchema>;
export type Bank=z.infer<typeof bankSchema>;
export type Answer={text:string;final:string;unit:string;sketch?:string;choices?:string[];savedAt?:number};
export type Assessment={score:number;method:'self'|'automatic'|'skipped';criteria:number[];feedback?:string;at:number};
export type Session={id:string;kind:'practice'|'exam';mode:string;paperId:string|null;questionIds:string[];snapshot:Question[];status:'active'|'submitted';startedAt:number;deadline:number|null;submittedAt:number|null;elapsedSeconds:number;answers:Record<string,Answer>;assessments:Record<string,Assessment>;flags:string[];currentIndex:number;lastSeenAt:number};
export type Progress={bookmarked:boolean;revision:boolean;difficult:boolean;notes:string;confidence:number;dueAt:number|null;intervalDays:number;reviews:number;lastRating?:string};
export type Attempt={id:string;questionId:string;sessionId:string;topic:string;marks:number;answer:Answer;assessment:Assessment|null;seconds:number;at:number;attempted:boolean};
export const emptyAnswer:Answer={text:'',final:'',unit:''};
export const defaultProgress:Progress={bookmarked:false,revision:false,difficult:false,notes:'',confidence:0,dueAt:null,intervalDays:0,reviews:0};
export function answered(a:Answer|undefined){return !!a&&(!!a.text.trim()||!!a.final.trim()||!!a.sketch||!!a.choices?.length);}
