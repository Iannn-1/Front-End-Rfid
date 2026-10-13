import { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Mobile RFID Scanner',
  description: 'Scan RFID cards for attendance using your phone',
  manifest: '/manifest.json',
  themeColor: '#667eea',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'RFID Scanner',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#667eea',
}

export default function MobileRFIDLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
