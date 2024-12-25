'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { memo } from 'react'
import { FaHistory, FaUser, FaUserLock } from 'react-icons/fa'

const data = [
  {
    title: 'Thông tin tài khoản',
    href: '/user',
    Icon: FaUser,
  },
  {
    title: 'Lịch sử mua hàng',
    href: '/user/order-history',
    subHref: '/user/order/',
    Icon: FaHistory,
  },
  {
    title: 'Mật khẩu - Bảo mật',
    href: '/user/security',
    Icon: FaUserLock,
  },
]

function UserMenu() {
  // hooks
  const pathname = usePathname()

  return (
    <ul className="flex h-full w-full flex-shrink-0 flex-row justify-evenly gap-2 rounded-medium bg-white p-21 shadow-medium md:min-w-[265px] lg:w-1/4 lg:flex-col">
      {data.map(({ title, href, subHref, Icon }) => (
        <li key={href}>
          <Link
            className={`trans-200 group flex items-center gap-2 px-4 py-4 hover:rounded-lg hover:bg-secondary hover:text-white ${
              pathname === href || (subHref && pathname.startsWith(subHref))
                ? 'rounded-lg bg-primary text-white'
                : ''
            }`}
            href={href}
          >
            <Icon
              size={21}
              className="wiggle"
            />
            <span className="hidden font-body text-[18px] font-semibold md:block">{title}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default memo(UserMenu)
