import {Suspense} from 'react';import {Resources} from '@/components/resources';import {Loading} from '@/components/common';
export default function Page(){return <Suspense fallback={<Loading/>}><Resources/></Suspense>}
