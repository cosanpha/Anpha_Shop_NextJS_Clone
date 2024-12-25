'use client'

import { ICategory } from '@/models/CategoryModel'
import { IProduct } from '@/models/ProductModel'
import { getBestSellerProductsApi } from '@/requests'
import AspectRatio from '@mui/joy/AspectRatio'
import Card from '@mui/joy/Card'
import CardContent from '@mui/joy/CardContent'
import Divider from '@mui/joy/Divider'
import { signOut } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { memo, useEffect, useState } from 'react'
import { FaCheck, FaChevronRight } from 'react-icons/fa6'
import { PiSignOutBold } from 'react-icons/pi'

function Footer() {
  // states
  const [bestSellerProducts, setBestSellerProducts] = useState<IProduct[]>([])

  // get best seller products
  useEffect(() => {
    const getBestSellerProducts = async () => {
      try {
        // send request to server to get best seller products
        const { products } = await getBestSellerProductsApi() // revalidate every 1 hour

        // set best seller products to state
        setBestSellerProducts(products)
      } catch (err: any) {
        console.log(err)
      }
    }
    getBestSellerProducts()
  }, [])

  return (
    <div className="mb-10 mt-36 px-21">
      <div className="mx-auto max-w-1200 rounded-medium bg-dark-100 text-white shadow-medium">
        <div className="p-21">
          {/* MARK: Top */}
          <div className="group -mx-4 flex flex-col items-center justify-between gap-3 px-4 sm:flex-row">
            {/* Logo */}
            <Link
              href="/"
              prefetch={false}
              className="flex items-center"
            >
              <div className="spin rounded-full">
                <Image
                  className="aspect-square rounded-full"
                  src="/images/logo.jpg"
                  width={40}
                  height={40}
                  alt="logo"
                />
              </div>
              <span className="text-2xl font-bold transition-all duration-300 group-hover:tracking-wide">
                .AnphaShop
              </span>
            </Link>

            {/* Social Contacts */}
            <div className="flex gap-5 sm:gap-3">
              <Link
                href="https://www.messenger.com/t/170660996137305"
                target="_blank"
                rel="noreferrer"
                className="wiggle-1"
              >
                <Image
                  src="/images/messenger.jpg"
                  width={30}
                  height={30}
                  alt="messenger"
                />
              </Link>
              <Link
                href={`mailto:${process.env.NEXT_PUBLIC_MAIL}`}
                target="_blank"
                rel="noreferrer"
                className="wiggle-1"
              >
                <Image
                  src="/images/gmail.jpg"
                  width={30}
                  height={30}
                  alt="gmail"
                />
              </Link>
              {/* <Link href='https://anhkhoa.info' target='_blank' rel='noreferrer' className='wiggle-1'>
                <Image
                  className='rounded-full'
                  src='/images/anhkhoa.jpg'
                  width={30}
                  height={30}
                  alt='gmail'
                />
              </Link> */}
            </div>
          </div>

          <Divider sx={{ my: 2 }} />

          {/* MARK: Center */}
          <div className="flex flex-col flex-wrap justify-start overflow-hidden md:flex-row md:justify-between">
            {/* Slider */}
            <div className="no-scrollbar md:show-scrollbar relative -mx-1 flex w-full flex-1 cursor-pointer select-none snap-mandatory overflow-x-scroll md:mr-5">
              {bestSellerProducts.map((product, index) => (
                <Link
                  href={`/${product.slug}`}
                  prefetch={false}
                  className="group block w-[230px] shrink-0 snap-start px-2"
                  key={index}
                >
                  <Card
                    className="text-dark"
                    variant="soft"
                  >
                    <AspectRatio ratio="16/9">
                      <Image
                        className="transition duration-500 ease-in-out group-hover:scale-105"
                        src={product.images[0]}
                        width={235}
                        height={(235 * 9) / 16}
                        alt="account"
                      />
                    </AspectRatio>
                    <CardContent>
                      <p
                        className="text-xs"
                        title={product.title}
                      >
                        {product.title}
                      </p>
                      <span className="font-body text-xs font-semibold text-gray-500">
                        {(product.category as ICategory).title}
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Links & Features*/}
            <ul className="mt-21 flex w-full flex-col justify-between gap-21 text-gray-300 md:mt-0 md:w-auto md:flex-row">
              <div>
                <div className="text-[12px] font-semibold text-gray-500">TÀI KHOẢN</div>
                <ul className="text-sm tracking-wide">
                  <Link
                    href="/user"
                    className="flex items-center gap-1 text-nowrap transition-all duration-300 hover:tracking-wider"
                  >
                    <FaChevronRight
                      size={14}
                      className="text-primary"
                    />
                    <p className="">Thông tin tài khoản</p>
                  </Link>
                  <Link
                    href="/recharge"
                    className="flex items-center gap-1 text-nowrap transition-all duration-300 hover:tracking-wider"
                  >
                    <FaChevronRight
                      size={14}
                      className="text-primary"
                    />
                    <p className="">Nạp tiền</p>
                  </Link>
                  <Link
                    href="/cart"
                    prefetch={false}
                    className="flex items-center gap-1 text-nowrap transition-all duration-300 hover:tracking-wider"
                  >
                    <FaChevronRight
                      size={14}
                      className="text-primary"
                    />
                    <p className="">Giỏ hàng</p>
                  </Link>
                  <Link
                    href="/user/order-history"
                    className="flex items-center gap-1 text-nowrap transition-all duration-300 hover:tracking-wider"
                  >
                    <FaChevronRight
                      size={14}
                      className="text-primary"
                    />
                    <p className="">Lịch sử mua hàng</p>
                  </Link>
                  <button
                    className="flex items-center gap-1 text-nowrap transition-all duration-300 hover:tracking-wider"
                    onClick={() => signOut()}
                  >
                    <PiSignOutBold
                      size={15}
                      className="ml-1 text-yellow-400"
                    />
                    <p className="">Đăng xuất</p>
                  </button>
                </ul>
              </div>

              <div>
                <div className="text-[12px] font-semibold text-gray-500">NỔI BẬT</div>
                <ul className="text-sm tracking-wide">
                  <div className="flex items-center gap-1 text-nowrap transition-all duration-300 hover:tracking-wider">
                    <FaCheck
                      size={14}
                      className="text-green-400"
                    />
                    <p className="">Đầy đủ tính năng</p>
                  </div>
                  <div className="flex items-center gap-1 text-nowrap transition-all duration-300 hover:tracking-wider">
                    <FaCheck
                      size={14}
                      className="text-green-400"
                    />
                    <p className="">Rẻ nhất thị trường</p>
                  </div>
                  <div className="flex items-center gap-1 text-nowrap transition-all duration-300 hover:tracking-wider">
                    <FaCheck
                      size={14}
                      className="text-green-400"
                    />
                    <p className="">Thanh toán lập tức</p>
                  </div>
                  <div className="flex items-center gap-1 text-nowrap transition-all duration-300 hover:tracking-wider">
                    <FaCheck
                      size={14}
                      className="text-green-400"
                    />
                    <p className="">Bảo hành uy tín</p>
                  </div>
                </ul>
              </div>
            </ul>
          </div>

          <Divider sx={{ my: 2 }} />

          {/* MARK: Bottom */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-center md:justify-between">
            <p className="text-[14px] transition-all duration-300 hover:tracking-wide">
              © <span className="font-semibold text-primary">Anpha.shop</span>. All rights reserved
            </p>
            <div className="text-[14px] transition-all duration-300 hover:tracking-wide">
              <span className="font-semibold text-primary">Developed by</span> Nguyen Anh Khoa
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(Footer)
