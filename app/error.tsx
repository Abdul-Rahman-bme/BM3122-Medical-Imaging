'use client';
import {Button} from '@/components/ui/button';
export default function ErrorPage({error,reset}:{error:Error;reset:()=>void}){return <div className="empty"><h2>This page could not load</h2><p className="my-4">{error.message}</p><Button onClick={reset}>Try again</Button></div>}
