import AdminMenu from '@/components/admin/AdminMenu'
import Header from '@/components/Header'

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      {/* Header */}
      <Header isStatic />

      {/* Menu */}
      <AdminMenu />

      {/* Main */}
      <main className="px-21 py-20">{children}</main>
    </>
  )
}
