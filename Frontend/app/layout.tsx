// Import CSS file
import './globals.css';
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
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}