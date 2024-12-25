import ContactFloating from '@/components/ContactFloating'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import UserMenu from '@/components/UserMenu'

export default async function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      {/* Header */}
      <Header isStatic />

      {/* Contact Floating */}
      <ContactFloating />

      {/* Main */}
      <main className="px-21">
        <div className="mx-auto mt-12 flex max-w-1200 flex-wrap gap-21 lg:flex-nowrap">
          {/* Sidebar */}
          <UserMenu />

          {/* Content */}
          <div className="w-full rounded-medium bg-white p-8 shadow-medium">{children}</div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </>
  )
}
