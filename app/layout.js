import './globals.css'
import { Big_Shoulders_Display, Public_Sans, Space_Mono } from 'next/font/google'
const display = Big_Shoulders_Display({ subsets: ['latin'], weight: ['700', '900'], variable: '--font-display' })
const body = Public_Sans({ subsets: ['latin'], variable: '--font-body' })
const mono = Space_Mono({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-mono' })
export const metadata = { title: 'Kshana Studio', description: 'Wedding, portrait, product and event photography in Kochi.' }
export const viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#2B1B4D' }
export default function RootLayout({ children }) {
  return (<html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}><body>{children}</body></html>)
}
