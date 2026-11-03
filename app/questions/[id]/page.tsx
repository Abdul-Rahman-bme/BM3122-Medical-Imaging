import {SingleQuestion} from '@/components/sessions';
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;return <SingleQuestion key={id} id={id}/>}
