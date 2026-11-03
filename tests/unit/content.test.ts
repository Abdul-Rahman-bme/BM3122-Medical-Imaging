import {readFileSync} from 'node:fs';import {describe,it,expect} from 'vitest';import {bankSchema} from '../../lib/content/schema';
const raw=JSON.parse(readFileSync('data/content.json','utf8'));
describe('Source-preserving import validation',()=>{
 it('imports four independently authored model papers with reconciled marks and references',()=>{const b=bankSchema.parse(raw);expect(b.questions).toHaveLength(96);expect(b.papers).toHaveLength(4);expect(b.questions.filter(q=>q.provenance==='past-paper')).toHaveLength(0);for(const paper of b.papers){for(let main=1;main<=4;main++)expect(b.questions.filter(q=>q.paperId===paper.id&&q.mainQuestion===main).reduce((n,q)=>n+q.marks,0)).toBe(25);}expect(b.papers[0].informationSheetPage).toBe(2);});
 it('ships proposed model solutions with explicit model provenance',()=>{const b=bankSchema.parse(raw);expect(b.questions.every(q=>q.provenance==='generated-practice'&&!!q.solution)).toBe(true);});
 it('rejects duplicate IDs, incorrect totals and unsafe document paths',()=>{expect(()=>bankSchema.parse({...raw,questions:[...raw.questions,raw.questions[0]]})).toThrow();const bad=structuredClone(raw);bad.questions[0].marks=100;expect(()=>bankSchema.parse(bad)).toThrow();const path=structuredClone(raw);path.documents[0].path='../secret.pdf';expect(()=>bankSchema.parse(path)).toThrow();});
 it('provides only final-value feedback for imported numeric keys',()=>{const b=bankSchema.parse(raw);const keys=b.questions.filter(q=>q.numerical);expect(keys).toHaveLength(10);expect(keys.every(q=>q.numerical?.autoMarks===0)).toBe(true);});
});
