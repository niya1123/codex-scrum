import './globals.css'
import type { ReactNode } from 'react'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Travel Planner MVP</title>
      </head>
      <body>
        <main className="container">{children}</main>
      </body>
    </html>
  )
}

