import './globals.css'
import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'

const poppins = Poppins({ 
  weight: ['400', '600'],
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Analytics Dashboard',
  description: 'A simple analytics dashboard showing key business metrics',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <main className="min-h-screen bg-gray-50 p-4 md:p-8">{children}</main>
      </body>
    </html>
  )
}
