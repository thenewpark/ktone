import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Link from "next/link"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Korean Tone Analyzer",
  description: "Analyze and modify Korean text tone.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <header className="border-b sticky top-0 bg-background z-10">
            <nav className="container mx-auto p-4 flex items-center gap-6">
              <Link href="/analyze" className="text-lg font-semibold hover:text-primary transition-colors">
                톤 진단
              </Link>
              <Link href="/modify" className="text-lg font-semibold hover:text-primary transition-colors">
                톤 수정
              </Link>
            </nav>
          </header>
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}
