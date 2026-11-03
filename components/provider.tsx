'use client';
import {createContext,useContext,useState,useEffect,useCallback,type ReactNode} from 'react';
import type {Question,Paper,DocumentAsset,Progress,Session,Attempt} from '@/lib/content/schema';
export type AppState={questions:Question[];papers:Paper[];documents:DocumentAsset[];progress:Record<string,Progress>;sessions:Session[];attempts:Attempt[];preferences:{examDate:string}};
const initial:AppState={questions:[],papers:[],documents:[],progress:{},sessions:[],attempts:[],preferences:{examDate:''}};
const Context=createContext<{data:AppState;loading:boolean;refresh:()=>Promise<void>;notify:(s:string)=>void}>({data:initial,loading:true,refresh:async()=>{},notify:()=>{}});
export async function action<T=unknown>(action:string,payload:unknown):Promise<T>{const r=await fetch('/api/action',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,payload})});const d=await r.json();if(!r.ok)throw new Error(d.error||'Action failed');return d as T;}
export function Provider({children}:{children:ReactNode}){
 const [data,setData]=useState(initial),[loading,setLoading]=useState(true),[toast,setToast]=useState('');
 const notify=useCallback((s:string)=>{setToast(s);},[]);
 useEffect(()=>{if(toast){const t=setTimeout(()=>setToast(''),6000);return()=>clearTimeout(t);}},[toast]);
 const refresh=useCallback(async()=>{try{const r=await fetch('/api/state',{cache:'no-store'});if(!r.ok)throw new Error('Local database could not be loaded');setData(await r.json());}catch(e){notify(String(e));}finally{setLoading(false);}},[notify]);
 useEffect(()=>{void refresh();},[refresh]);
 return <Context.Provider value={{data,loading,refresh,notify}}>{children}{toast&&<div role="status" className="toast">{toast}<button onClick={()=>setToast('')} aria-label="Dismiss notification">×</button></div>}</Context.Provider>;
}
export const useApp=()=>useContext(Context);
