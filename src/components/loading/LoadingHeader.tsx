'use client'

import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { memo } from 'react'
import { FaBars, FaCartShopping } from 'react-icons/fa6'
import { HiLightningBolt } from 'react-icons/hi'
import { IoChevronDown } from 'react-icons/io5'

interface HeaderProps {
  isStatic?: boolean
  className?: string
}

function Header({ isStatic, className }: HeaderProps) {
  const { data: session } = useSession()
  const curUser: any = session?.user

  return (
    <header
      className={`${
        isStatic ? 'static' : 'fixed left-0 top-0 z-50'
      } top-0 w-full bg-dark-100 text-white shadow-medium-light transition-all duration-300 ${className}`}
    >
      {/* Main Header */}
      <div className="relative m-auto flex h-[72px] w-full max-w-1200 items-center justify-between px-21">
        {/* MARK: Brand */}
        <div className="no-scrollbar -ml-4 flex h-full w-[90%] max-w-[300px] items-center overflow-x-scroll pl-4">
          <Link
            href="/"
            prefetch={false}
            className="trans-200 spin hidden shrink-0 rounded-full sm:block"
          >
            <Image
              className="aspect-square rounded-full"
              src="/images/logo.jpg"
              width={40}
              height={40}
              alt="logo"
            />
          </Link>
          <Link
            href="/"
            prefetch={false}
            className="text-2xl font-bold"
          >
            .AnphaShop
          </Link>
          <Link
            href="/recharge"
            className="trans-200 group ml-3 flex items-center gap-1 rounded-lg bg-primary px-[10px] py-[6px] hover:bg-secondary"
          >
            <span className="trans-200 font-body text-[18px] font-bold tracking-[0.02em] group-hover:text-white">
              Nạp
            </span>
            <HiLightningBolt
              size={20}
              className="trans-200 animate-bounce group-hover:text-white"
            />
          </Link>
        </div>

        {/* MARK: Nav */}
        <div className="hidden items-center gap-4 md:flex">
          <Link
            href="/cart"
            prefetch={false}
          >
            <FaCartShopping size={24} />
          </Link>

          {curUser ? (
            !!curUser._id && (
              <div className="flex cursor-pointer items-center gap-2">
                <div className="loading h-10 w-10 rounded-full" />
                <div className="loading h-7 w-20 rounded-lg" />
                <IoChevronDown size={22} />
              </div>
            )
          ) : (
            <Link
              href="/auth/login"
              className="trans-200 cursor-pointer text-nowrap rounded-extra-small bg-secondary px-[10px] py-[6px] font-body font-semibold tracking-wider hover:bg-primary"
            >
              Đăng nhập
            </Link>
          )}
        </div>

        {/* Menu Button */}
        <div className="flex items-center md:hidden">
          <button className="flex h-[40px] w-[40px] items-center justify-center">
            <FaBars size={22} />
          </button>
        </div>
      </div>
    </header>
  )
}

export default memo(Header)
