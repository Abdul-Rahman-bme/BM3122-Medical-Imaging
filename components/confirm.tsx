'use client';
import {useRef,useEffect} from 'react';import {Button} from './ui/button';
export function Confirm({open,title,description,onCancel,onConfirm,busy=false}:{open:boolean;title:string;description:string;onCancel:()=>void;onConfirm:()=>void;busy?:boolean}){
 const ref=useRef<HTMLDialogElement>(null);useEffect(()=>{if(open&&!ref.current?.open)ref.current?.showModal();if(!open&&ref.current?.open)ref.current.close();},[open]);
 return <dialog ref={ref} onCancel={e=>{e.preventDefault();onCancel();}} aria-labelledby="confirm-title" style={{padding:0,border:0,background:'transparent',maxWidth:'95vw'}}><div className="modal"><h2 id="confirm-title">{title}</h2><p>{description}</p><div className="card-buttons"><Button variant="outline" disabled={busy} onClick={onCancel}>Keep working</Button><Button disabled={busy} onClick={onConfirm}>{busy?'Saving…':'Confirm submission'}</Button></div></div><style>{'dialog::backdrop{background:#111a35a0}'}</style></dialog>;
}
