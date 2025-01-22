// Import CSS file
import './globals.css';
import React from 'react'
// Define metadata for the app
export const metadata = {
  title: 'NCR ATM',
  description: 'Created by Group 1 for AC31007 - Agile Software Development',
}

// Export a function that returns the react layout of the app
// "children" is the content of the page, passed in as a prop
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`scroll-smooth`} >
      <body>
          <div className="relative min-h-screen bg-gradient-custom">
            <div className="relative z-10 flex flex-col min-h-screen">
              <main className="flex-grow container mx-auto px-4 py-8">
                {children}
              </main>
            </div>
          </div>
      </body>
    </html>
  )
}