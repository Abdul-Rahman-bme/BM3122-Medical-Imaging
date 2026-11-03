'use client';
import Link from 'next/link';import {usePathname} from 'next/navigation';import {useEffect,useState,type ReactNode} from 'react';
import {Activity,LayoutDashboard,Library,BookOpen,ChartNoAxesCombined,CalendarClock,Bookmark,FolderOpen,Settings,Sun,Moon,Menu,ArrowUpRight,WifiOff,X} from 'lucide-react';
import {useApp} from './provider';
const nav=[['/','Overview',LayoutDashboard],['/questions','Question bank',Library],['/practice','Practice studio',BookOpen],['/papers','Examination papers',FolderOpen],['/analytics','Learning analytics',ChartNoAxesCombined],['/revision','Due for revision',CalendarClock],['/bookmarks','Bookmarks',Bookmark],['/resources','Source library',FolderOpen],['/settings','Settings & data',Settings]] as const;
export function Shell({children}:{children:ReactNode}){
 const path=usePathname();const {data,refresh}=useApp();const [dark,setDark]=useState(false),[open,setOpen]=useState(false);
 useEffect(()=>{const v=localStorage.getItem('bm-theme')==='dark';setDark(v);document.documentElement.dataset.theme=v?'dark':'light';},[]);
 useEffect(()=>{setOpen(false);void refresh();},[path,refresh]);
 function theme(){setDark(!dark);document.documentElement.dataset.theme=!dark?'dark':'light';localStorage.setItem('bm-theme',!dark?'dark':'light');}
 if(path.startsWith('/exam/session/'))return <div className="exam-full">{children}</div>;
 const current=[...nav].reverse().find(([href])=>href==='/'?path==='/':path.startsWith(href));
 const due=Object.values(data.progress).filter(p=>p.dueAt&&p.dueAt<=Date.now()).length;
 return <div className="app-layout">
 {open&&<button className="backdrop" aria-label="Close navigation" onClick={()=>setOpen(false)}/>}
 <aside className={`sidebar ${open?'is-open':''}`}>
  <Link href="/" className="brand"><span className="brand-icon"><Activity size={23}/></span><span>Imaging<span className="brand-sub">BM3122 · STUDY WORKSPACE</span></span></Link>
  <div className="nav-caption">YOUR PREPARATION</div>
  <nav aria-label="Main navigation">{nav.map(([href,label,Icon])=><Link key={href} href={href} className={`nav-link ${(href==='/'?path==='/':path.startsWith(href))?'active':''}`}><Icon size={18}/><span>{label}</span>{href==='/revision'&&due>0&&<b className="nav-badge">{due}</b>}</Link>)}</nav>
  <div className="sidebar-bottom"><div className="offline-dot"/><div><strong>Local & private</strong><span>Progress saved on this PC</span></div><WifiOff size={16}/></div>
 </aside>
 <div className="main-shell"><header className="topbar"><div className="flex items-center gap-3"><button className="mobile-toggle icon-button" aria-label="Open navigation" onClick={()=>setOpen(!open)}>{open?<X size={20}/>:<Menu size={20}/>}</button><span className="breadcrumb">Workspace <span>/</span> <strong>{current?.[1]||'Study session'}</strong></span></div><div className="header-right"><span className="module-label">University of Moratuwa <ArrowUpRight size={13}/></span><button className="icon-button" onClick={theme} aria-label={dark?'Switch to light theme':'Switch to dark theme'}>{dark?<Sun size={18}/>:<Moon size={18}/>}</button><span className="avatar">AR</span></div></header><main className="page-content">{children}</main><footer className="app-footer">BM3122 Medical Imaging · Independent examination preparation <span>Evidence-led practice. Your own pace.</span></footer></div>
 </div>;
}
