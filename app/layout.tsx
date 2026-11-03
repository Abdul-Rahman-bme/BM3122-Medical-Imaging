import type {Metadata} from 'next';import {Provider} from '@/components/provider';import {Shell} from '@/components/shell';import './globals.css';import 'katex/dist/katex.min.css';
export const metadata:Metadata={title:{default:'Imaging · BM3122',template:'%s · BM3122 Imaging'},description:'Private offline medical imaging examination preparation. University of Moratuwa BM3122.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" suppressHydrationWarning><body><Provider><Shell>{children}</Shell></Provider></body></html>}
