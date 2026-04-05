import './globals.css'
import ThemedBackground from '../../components/ThemedBackground'
import { ThemeProvider } from '../../components/ThemeContext'
import { SectionProvider } from '../../components/SectionContext'
export const metadata = {
  title: 'Brady Portfolio',
  description: 'Interactive Portfolio Website',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <ThemeProvider>
          <SectionProvider defaultSection="main">
            <ThemedBackground />
              {children}
          </SectionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}