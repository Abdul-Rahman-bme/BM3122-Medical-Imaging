'use client';
import Link from 'next/link';import {ArrowRight,FileText,Search} from 'lucide-react';import type {ReactNode} from 'react';
export function PageHead({eyebrow,title,description,children}:{eyebrow?:string;title:string;description:string;children?:ReactNode}){return <div className="page-head"><div>{eyebrow&&<div className="eyebrow">{eyebrow}</div>}<h1>{title}</h1><p>{description}</p></div>{children}</div>}
export function Panel({title,description,children,className='',action}:{title?:string;description?:string;children:ReactNode;className?:string;action?:ReactNode}){return <section className={`panel ${className}`}>{title&&<div className="panel-head"><div><h2>{title}</h2>{description&&<p>{description}</p>}</div>{action}</div>}{children}</section>}
export function Empty({title,children}:{title:string;children?:ReactNode}){return <div className="empty"><span className="empty-icon"><FileText size={24}/></span><h3>{title}</h3><p>{children}</p></div>}
export function Badge({children,tone='neutral'}:{children:ReactNode;tone?:'neutral'|'indigo'|'green'|'amber'|'red'}){return <span className={`badge badge-${tone}`}>{children}</span>}
export function ArrowLink({href,children}:{href:string;children:ReactNode}){return <Link className="arrow-link" href={href}>{children}<ArrowRight size={15}/></Link>}
export function Loading(){return <div className="loading" role="status"><span className="spinner"/>Loading your local workspace…</div>}
