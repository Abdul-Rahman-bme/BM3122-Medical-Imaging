'use client';
import katex from 'katex';import {useMemo} from 'react';
// Only KaTeX-generated HTML is inserted. Raw source/Markdown HTML is always rendered as text.
export function MathText({text,className=''}:{text:string;className?:string}){
 const parts=useMemo(()=>text.replaceAll('&lt;','<').replaceAll('&gt;','>').split(/(\$\$[\s\S]*?\$\$|\$[^$\n]+\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\))/g),[text]);
 return <div className={`math-text ${className}`}>{parts.map((s,i)=>{const display=s.startsWith('$$')||s.startsWith('\\['),inline=s.startsWith('$')||s.startsWith('\\(');if(!display&&!inline)return <span key={i}>{s}</span>;const raw=s.slice(display?2:s.startsWith('\\(')?2:1,display||s.endsWith('\\)')?-2:-1);try{return <span className={display?'math-display':''} key={i} dangerouslySetInnerHTML={{__html:katex.renderToString(raw,{displayMode:display,throwOnError:false,trust:false,strict:'ignore'})}}/>;}catch{return <code key={i}>{raw}</code>;}})}</div>;
}
