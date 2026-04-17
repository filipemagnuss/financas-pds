import { ClerkProvider } from '@clerk/nextjs'
import { ptBR } from "@clerk/localizations"
import { dark } from "@clerk/themes"
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider 
      localization={ptBR} 
      appearance={{ baseTheme: dark }}
    >
      <html lang="pt-BR" className="h-full">
        <body className="h-full bg-gray-900 antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}