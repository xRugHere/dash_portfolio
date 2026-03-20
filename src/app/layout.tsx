import './globals.css'
import ThemedBackground from '../../components/ThemedBackground'
import { ThemeProvider } from '../../components/ThemeContext'
import LayoutClient from '../../components/LayoutClient'
import SpaceAudioVisualizer from '../../components/SpaceAudioVisualizer'

export const metadata = {
  title: 'Brady Portfolio',
  description: 'Interactive Portfolio Website',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <ThemeProvider>
          <ThemedBackground />
          <SpaceAudioVisualizer />
          <LayoutClient>
            {children}
          </LayoutClient>
        </ThemeProvider>
      </body>
    </html>
  )
}