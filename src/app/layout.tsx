import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"

const inter = Inter({
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Ragify",
}

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={cn("dark antialiased", inter.className)}>
      <body>
        {children}
        <Toaster richColors />
      </body>
    </html>
  )
}
