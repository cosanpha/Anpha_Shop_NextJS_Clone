import Background from '@/components/Background'
import Header from '@/components/Header'
import PageLoading from '@/components/PageLoading'
import StoreProvider from '@/libs/StoreProvider'
import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import Script from 'next/script'
import { Toaster } from 'react-hot-toast'
import authOptions from './api/auth/[...nextauth]/authOptions'
import './globals.scss'

export const metadata: Metadata = {
  title: 'Anpha Shop | Shop Tài Khoản Cao Cấp và Tiện Lợi',
  description:
    'Chào mừng bạn đến với Anpha Shop, địa chỉ tin cậy cho những người đang tìm kiếm Account Cao Cấp. Tại Anpha Shop, chúng tôi tự hào mang đến cho bạn những tài khoản chất lượng và đẳng cấp, đáp ứng mọi nhu cầu của bạn. Khám phá bộ sưu tập Account Cao Cấp tại cửa hàng của chúng tôi ngay hôm nay và trải nghiệm sự khác biệt với Anpha Shop - Nơi đáng tin cậy cho sự đẳng cấp!',
  keywords:
    'shop, tài khoản, account, cao cấp, uy tín, chất lượng, đẳng cấp, anpha shop, account, mua acc, account gia re, shop account, shop acc gia re',
  icons: {
    icon: ['/favicon.ico?v=4'],
    apple: ['/apple-touch-icon.png?v=4'],
    shortcut: ['/apple-touch-icon.png'],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'Anpha Shop',
    description:
      'Chào mừng bạn đến với Anpha Shop, địa chỉ tin cậy cho những người đang tìm kiếm Account Cao Cấp. Tại Anpha Shop, chúng tôi tự hào mang đến cho bạn những tài khoản chất lượng và đẳng cấp, đáp ứng mọi nhu cầu của bạn. Khám phá bộ sưu tập Account Cao Cấp tại cửa hàng của chúng tôi ngay hôm nay và trải nghiệm sự khác biệt với Anpha Shop - Nơi đáng tin cậy cho sự đẳng cấp!',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'Anpha Shop',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL}/images/logo.png`,
        width: 1200,
        height: 630,
        alt: 'Anpha Shop Logo',
      },
    ],
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Anpha Shop',
    description:
      'Chào mừng bạn đến với Anpha Shop, địa chỉ tin cậy cho những người đang tìm kiếm Account Cao Cấp. Tại Anpha Shop, chúng tôi tự hào mang đến cho bạn những tài khoản chất lượng và đẳng cấp, đáp ứng mọi nhu cầu của bạn. Khám phá bộ sưu tập Account Cao Cấp tại cửa hàng của chúng tôi ngay hôm nay và trải nghiệm sự khác biệt với Anpha Shop - Nơi đáng tin cậy cho sự đẳng cấp!',
    images: [`${process.env.NEXT_PUBLIC_APP_URL}/images/logo.png`],
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="vi">
      <body
        className="text-dark"
        suppressHydrationWarning={true}
      >
        {/* Google Analytics Script */}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=G-XHR0P5M0ZT`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
        >
          {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', 'G-XHR0P5M0ZT');
            `}
        </Script>

        <StoreProvider session={session}>
          {/* Background */}
          <Background />

          {/* Toast */}
          <Toaster
            toastOptions={{
              style: {
                background: '#333',
                color: '#fff',
              },
            }}
          />

          {/* Header */}
          <Header />

          {/* Utils */}
          <PageLoading />

          {/* Main */}
          {children}
        </StoreProvider>
      </body>
    </html>
  )
}
