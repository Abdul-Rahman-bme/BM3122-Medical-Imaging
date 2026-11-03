import {Suspense} from 'react';import {Practice} from '@/components/practice';import {Loading} from '@/components/common';
export default function Page(){return <Suspense fallback={<Loading/>}><Practice/></Suspense>}
