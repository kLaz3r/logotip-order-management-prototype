import type { Metadata } from "next"
import { Poppins, Geist_Mono } from "next/font/google"
import "./globals.css"

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "LOGOTIP - Management Comenzi",
  description: "Sistem de management pentru LOGOTIP Print & Graphics",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ro"
      className={`${poppins.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme:dark)").matches)){document.documentElement.classList.add("dark")}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
