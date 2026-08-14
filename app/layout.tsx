import { Geist_Mono, DM_Sans } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryProvider } from "@/components/providers/query-provider"
import { Toaster } from "@/components/ui/sonner"

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  // Exposed under its own var so the mono stack in globals.css can put the
  // ₦ "NairaFix" font ahead of it without dropping Geist Mono for digits.
  variable: "--font-geist-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        dmSans.variable
      )}
    >
      <body>
        <QueryProvider>
          <TooltipProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </TooltipProvider>
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  )
}
