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
      <body className="font-sans transition-colors duration-300" suppressHydrationWarning={true}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950 transition-all duration-500">
          <main className="container mx-auto px-4 py-8 relative z-10">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}