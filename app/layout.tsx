import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pilates Member Dashboard',
  description: 'Manage Pilates members',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
