import Image from 'next/image'
import Link from 'next/link'

function NotFoundPage() {
  return (
    <div className="pt-20 text-center font-body tracking-wider text-white">
      <h1 className="mb-5 text-3xl font-semibold">Không tìm thấy sản phẩm.</h1>

      <Link
        href="/"
        className="flex justify-center"
      >
        <Image
          className="rounded-medium shadow-medium-light"
          src="/images/404-page.jpg"
          width={500}
          height={500}
          alt="page-not-found"
        />
      </Link>

      <div className="mt-21">
        <p className="text-xl">
          Quay lại trang chủ{' '}
          <Link
            href="/"
            prefetch={false}
            className="trans-200 text-sky-400 underline hover:text-sky-600"
          >
            Trang chủ
          </Link>
          .
        </p>
      </div>
    </div>
  )
}

export default NotFoundPage
