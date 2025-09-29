import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'QuizApp - Interactive Learning Platform',
  description: 'A comprehensive quiz application with detailed statistics and smart analytics',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans" suppressHydrationWarning={true}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}