import ContactFloating from '@/components/ContactFloating'
import FloatingButtons from '@/components/FloatingButtons'
import Footer from '@/components/Footer'
import Header from '@/components/Header'

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      {/* Header */}
      <Header />

      <FloatingButtons />
      <ContactFloating />

      {/* Main */}
      <main className="px-21">
        <div className="mx-auto max-w-1200">{children}</div>
      </main>

      {/* Footer */}
      <Footer />
    </>
  )
}
