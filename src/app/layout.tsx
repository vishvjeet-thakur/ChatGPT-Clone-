import type React from "react"
import type { Metadata } from "next"
import {
  ClerkProvider
} from '@clerk/nextjs'
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"


export const metadata: Metadata = {
  title: "ChatGPT Clone",
  description: "A pixel-perfect clone of ChatGPT built with Next.js and AI SDK",
}

export default function RootLayout({
  children,
}: {  
  children: React.ReactNode
}) {
  return (
    <ClerkProvider dynamic>
    <html lang="en" suppressHydrationWarning>

      <body >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
    </ClerkProvider>
  )
}
