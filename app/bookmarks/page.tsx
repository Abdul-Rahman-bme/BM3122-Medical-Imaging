import {Suspense} from 'react';import {QuestionBank} from '@/components/question-bank';import {Loading} from '@/components/common';
export default function Page(){return <Suspense fallback={<Loading/>}><QuestionBank bookmarksOnly/></Suspense>}
