import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NCR ATM',
  description: 'An atm made for NCR',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
