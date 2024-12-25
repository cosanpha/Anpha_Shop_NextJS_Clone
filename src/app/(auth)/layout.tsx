export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      {/* Main */}
      <main className="px-21">
        <div className="mx-auto max-w-1200">{children}</div>
      </main>
    </>
  )
}
