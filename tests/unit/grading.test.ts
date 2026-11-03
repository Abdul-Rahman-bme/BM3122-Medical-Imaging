import {describe,it,expect} from 'vitest';import {parseNumber,gradeNumeric} from '../../lib/grading';import {schedule} from '../../lib/spaced-repetition';import {defaultProgress,type Question} from '../../lib/content/schema';
describe('Numerical feedback with explicit units',()=>{
 const q={numerical:{value:3406.17043,unit:'Hz',absoluteTolerance:.1,relativeTolerance:.001}} as Question;
 it('parses scientific notation without evaluating arbitrary text',()=>{expect(parseNumber('3.406 × 10^3')).toBe(3406);expect(parseNumber('3.406e3')).toBe(3406);expect(parseNumber('Infinity')).toBeNull();expect(parseNumber('1+2')).toBeNull();expect(parseNumber('alert(1)')).toBeNull();});
 it('accepts equivalent frequency units and applies tolerances',()=>{expect(gradeNumeric(q,'3.40617','kHz').correct).toBe(true);expect(gradeNumeric(q,'3406.2','Hz').correct).toBe(true);expect(gradeNumeric(q,'3.8','kHz').correct).toBe(false);});
 it('rejects incompatible units and missing units',()=>{expect(gradeNumeric(q,'3406','mm').correct).toBe(false);expect(gradeNumeric(q,'3406','').correct).toBe(false);});
 it('does not pretend to grade unsupported numerical parts',()=>{expect(gradeNumeric({} as Question,'5','s').supported).toBe(false);});
});
describe('Deterministic spaced repetition',()=>{
 it('schedules Again for ten minutes without altering marks',()=>{const next=schedule(defaultProgress,'Again',1000);expect(next.dueAt).toBe(601000);expect(next.intervalDays).toBe(0);});
 it('uses documented first and subsequent intervals',()=>{const good=schedule(defaultProgress,'Good',0);expect(good.intervalDays).toBe(1);expect(schedule(good,'Good',0).intervalDays).toBe(2);expect(schedule(defaultProgress,'Easy',0).intervalDays).toBe(4);expect(schedule({...good,intervalDays:10},'Hard',0).intervalDays).toBe(12);});
});
